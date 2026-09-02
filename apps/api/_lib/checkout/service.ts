/**
 * Checkout Service
 *
 * Business logic layer for checkout operations.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 * Following DATABASE_SPECIFICATION.md §4.5.5
 *
 * This service handles:
 * - Checkout lifecycle (start, resume, validate, lock, complete, expire, recovery)
 * - Address management integration
 * - Coupon application and validation
 * - Tax calculation
 * - Shipping calculation
 * - Order snapshot generation
 * - Inventory validation
 * - Type transformation from repository to domain types
 */

import { logAuditEvent, AuditEventType } from '../audit/audit-log.ts';
import { CartRepository } from '../cart/repository';

import { CouponService } from './coupon-service';
import { CheckoutEventEmitter } from './events.ts';
import { OrderSnapshotService } from './order-snapshot-service';
import { CheckoutRepository } from './repository';
import { TaxService } from './tax-service';
import type {
  CheckoutSession,
  CheckoutTotals,
  StartCheckoutInput,
  UpdateCheckoutInput,
  ValidateCheckoutInput,
  CompleteCheckoutInput,
  ResumeCheckoutInput,
  CheckoutValidationResult,
  CheckoutValidationError,
  CheckoutValidationWarning,
  InventoryValidationResult,
  InventoryValidationItem,
  OrderSnapshot,
  CheckoutSessionResponse,
  CheckoutSummaryResponse,
} from './types';

const CHECKOUT_EXPIRY_MINUTES = 30;

export class CheckoutService {
  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get cart items for user or guest
   */
  private static async getCartItems(
    userId: string | null | undefined,
    guestId: string | null | undefined,
  ) {
    if (userId) {
      return await CartRepository.findByUserId(userId as any);
    }
    if (guestId) {
      return await CartRepository.findByGuestId(guestId);
    }
    return [];
  }

  // ============================================================================
  // CHECKOUT LIFECYCLE
  // ============================================================================

  /**
   * Start a new checkout session
   */
  static async startCheckout(
    input: StartCheckoutInput,
  ): Promise<CheckoutSession> {
    // Check if active checkout session already exists
    const existingSession = input.userId
      ? await CheckoutRepository.findCheckoutSessionByUserId(input.userId)
      : await CheckoutRepository.findCheckoutSessionByCartId(input.cartId);

    if (
      existingSession &&
      existingSession.status !== 'completed' &&
      existingSession.status !== 'abandoned'
    ) {
      // Resume existing session
      return existingSession;
    }

    // Validate cart exists and has items
    const cartItems = await this.getCartItems(input.userId, input.guestId);
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Create new checkout session
    const expiresAt = new Date(
      Date.now() + CHECKOUT_EXPIRY_MINUTES * 60 * 1000,
    );
    const session = await CheckoutRepository.createCheckoutSession(
      input.cartId,
      input.userId || null,
      expiresAt,
    );

    // Emit checkout started event
    await this.emitCheckoutEvent(
      'checkout_started',
      session.id,
      input.userId ?? null,
      input.guestId ?? null,
    );

    return session;
  }

  /**
   * Resume an existing checkout session
   */
  static async resumeCheckout(
    input: ResumeCheckoutInput,
  ): Promise<CheckoutSession> {
    const session = await CheckoutRepository.findCheckoutSessionById(
      input.checkoutSessionId,
    );

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await CheckoutRepository.updateCheckoutSessionStatus(
        session.id,
        'expired',
      );
      throw new Error('Checkout session has expired');
    }

    // Check if session is already completed
    if (session.status === 'completed') {
      throw new Error('Checkout session is already completed');
    }

    // Emit checkout resumed event
    await this.emitCheckoutEvent(
      'checkout_resumed',
      session.id,
      input.userId || null,
      input.guestId || null,
    );

    return session;
  }

  /**
   * Validate checkout session
   */
  static async validateCheckout(
    input: ValidateCheckoutInput,
  ): Promise<CheckoutValidationResult> {
    const session = await CheckoutRepository.findCheckoutSessionById(
      input.checkoutSessionId,
    );

    if (!session) {
      return {
        isValid: false,
        canProceed: false,
        errors: [
          {
            code: 'session_not_found',
            message: 'Checkout session not found',
            severity: 'error',
          },
        ],
        warnings: [],
        inventoryValidated: false,
        pricingValidated: false,
        addressValidated: false,
      };
    }

    const errors: CheckoutValidationError[] = [];
    const warnings: CheckoutValidationWarning[] = [];

    let inventoryValidated = false;
    let pricingValidated = false;
    let addressValidated = false;

    // Validate inventory if requested
    if (input.validateInventory !== false) {
      const inventoryResult = await this.validateInventory(session);
      inventoryValidated = true;

      if (!inventoryResult.isValid) {
        inventoryResult.items.forEach((item: any) => {
          if (item.issue) {
            errors.push({
              code: item.issue,
              message: item.message || 'Inventory validation failed',
              itemId: item.variantId,
              severity: 'error',
            });
          }
        });
      }
    }

    // Validate pricing if requested
    if (input.validatePricing !== false) {
      pricingValidated = await this.validatePricing(session);
      if (!pricingValidated) {
        errors.push({
          code: 'pricing_invalid',
          message: 'Pricing validation failed',
          severity: 'error',
        });
      }
    }

    // Validate address if requested
    if (input.validateAddress !== false) {
      addressValidated = await this.validateAddress(session);
      if (!addressValidated) {
        errors.push({
          code: 'address_invalid',
          message: 'Address validation failed',
          severity: 'error',
        });
      }
    }

    // Determine if checkout can proceed
    const canProceed =
      errors.length === 0 &&
      session.status !== 'completed' &&
      session.status !== 'abandoned';

    // Update session status if validated
    if (canProceed && session.status === 'started') {
      await CheckoutRepository.updateCheckoutSessionStatus(
        session.id,
        'address_entered',
      );
    }

    // Emit checkout validated event
    await this.emitCheckoutEvent(
      'checkout_validated',
      session.id,
      session.userId,
      null,
    );

    return {
      isValid: errors.length === 0,
      canProceed,
      errors,
      warnings,
      inventoryValidated,
      pricingValidated,
      addressValidated,
    };
  }

  /**
   * Update checkout session
   */
  private static assertCheckoutAccess(session: CheckoutSession, caller: { userId?: string | null; guestId?: string | null }) {
    if (caller.userId) {
      if (session.userId !== caller.userId) throw new Error('Forbidden');
    } else if (caller.guestId) {
      const cartItems = null;
      void cartItems;
      if ((session as any).guestId && (session as any).guestId !== caller.guestId) throw new Error('Forbidden');
      if (session.userId) throw new Error('Forbidden');
    } else {
      throw new Error('Forbidden');
    }
  }

  static async updateCheckout(
    input: UpdateCheckoutInput,
    caller?: { userId?: string | null; guestId?: string | null },
  ): Promise<CheckoutSession> {
    const session = await CheckoutRepository.findCheckoutSessionById(
      input.checkoutSessionId,
    );

    if (!session) {
      throw new Error('Checkout session not found');
    }
    if (caller && (caller.userId || caller.guestId)) {
      this.assertCheckoutAccess(session, caller);
    }
    if ((input as any).shippingAddressId) {
      const addr = await CheckoutRepository.findAddressById((input as any).shippingAddressId);
      const callerUserId = caller?.userId ?? session.userId;
      if (!addr || (callerUserId && addr.userId !== callerUserId)) throw new Error('Forbidden');
    }
    if ((input as any).billingAddressId) {
      const addr = await CheckoutRepository.findAddressById((input as any).billingAddressId);
      const callerUserId = caller?.userId ?? session.userId;
      if (!addr || (callerUserId && addr.userId !== callerUserId)) throw new Error('Forbidden');
    }

    // Check if session is locked (payment in progress)
    if (
      session.status === 'payment_processing' ||
      session.status === 'completed'
    ) {
      throw new Error('Checkout session is locked');
    }

    // Update addresses if provided
    if (
      input.shippingAddressId !== undefined ||
      input.billingAddressId !== undefined
    ) {
      await CheckoutRepository.updateCheckoutSessionAddresses(
        input.checkoutSessionId,
        input.shippingAddressId || session.shippingAddressId,
        input.billingAddressId || session.billingAddressId,
      );

      // Emit address updated event
      await this.emitCheckoutEvent(
        'address_updated',
        session.id,
        session.userId,
        null,
      );
    }

    // Update shipping if provided
    if (input.shippingRateId !== undefined) {
      const shippingRate = await CheckoutRepository.findShippingRateById(
        input.shippingRateId,
      );
      if (!shippingRate) {
        throw new Error('Shipping rate not found');
      }

      await CheckoutRepository.updateCheckoutSessionShipping(
        input.checkoutSessionId,
        input.shippingRateId,
        shippingRate.baseRate,
      );

      // Emit shipping selected event
      await this.emitCheckoutEvent(
        'shipping_selected',
        session.id,
        session.userId,
        null,
      );
    }

    // Update coupon if provided
    if (input.couponCode !== undefined) {
      if (input.couponCode === null) {
        // Remove coupon
        await CheckoutRepository.updateCheckoutSessionCoupon(
          input.checkoutSessionId,
          null,
          null,
        );
        await this.emitCheckoutEvent(
          'coupon_removed',
          session.id,
          session.userId,
          null,
        );
      } else {
        // Apply coupon
        const couponResult = await CouponService.validateCoupon({
          code: input.couponCode,
          cartId: session.cartId,
          userId: session.userId || undefined,
        });

        if (couponResult.isValid && couponResult.coupon) {
          await CheckoutRepository.updateCheckoutSessionCoupon(
            input.checkoutSessionId,
            couponResult.coupon.code,
            couponResult.discountAmount,
          );
          await CheckoutRepository.incrementCouponUsage(couponResult.coupon.id);
          await this.emitCheckoutEvent(
            'coupon_applied',
            session.id,
            session.userId,
            null,
          );
        } else {
          throw new Error(
            couponResult.errorMessage || 'Coupon validation failed',
          );
        }
      }
    }

    // Recalculate totals
    await this.calculateCheckoutTotals(input.checkoutSessionId);

    // Fetch updated session
    const updatedSession = await CheckoutRepository.findCheckoutSessionById(
      input.checkoutSessionId,
    );
    if (!updatedSession) {
      throw new Error('Failed to retrieve updated checkout session');
    }

    // Emit checkout updated event
    await this.emitCheckoutEvent(
      'checkout_updated',
      session.id,
      session.userId,
      null,
    );

    return updatedSession;
  }

  /**
   * Lock checkout for payment
   */
  static async lockCheckout(
    checkoutSessionId: string,
  ): Promise<CheckoutSession> {
    const session =
      await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Final validation before locking
    const validation = await this.validateCheckout({
      checkoutSessionId,
      validateInventory: true,
      validatePricing: true,
      validateAddress: true,
    });

    if (!validation.canProceed) {
      throw new Error(
        'Checkout cannot proceed: ' +
          validation.errors.map((e) => e.message).join(', '),
      );
    }

    // Lock the session
    const lockedSession = await CheckoutRepository.updateCheckoutSessionStatus(
      checkoutSessionId,
      'payment_pending',
    );

    // Emit checkout locked event
    await this.emitCheckoutEvent(
      'checkout_locked',
      checkoutSessionId,
      session.userId,
      null,
    );

    return lockedSession;
  }

  /**
   * Complete checkout
   */
  static async completeCheckout(
    input: CompleteCheckoutInput,
  ): Promise<OrderSnapshot> {
    const session = await CheckoutRepository.findCheckoutSessionById(
      input.checkoutSessionId,
    );

    if (!session) {
      throw new Error('Checkout session not found');
    }

    if (
      session.status !== 'payment_pending' &&
      session.status !== 'payment_processing'
    ) {
      throw new Error('Checkout is not ready for completion');
    }

    // Update status to payment processing
    await CheckoutRepository.updateCheckoutSessionStatus(
      input.checkoutSessionId,
      'payment_processing',
    );

    // Generate final order snapshot
    const snapshot = await OrderSnapshotService.generateSnapshot(session);

    // Mark session as completed
    await CheckoutRepository.updateCheckoutSessionStatus(
      input.checkoutSessionId,
      'completed',
    );

    // Emit checkout completed event
    await this.emitCheckoutEvent(
      'checkout_completed',
      input.checkoutSessionId,
      session.userId,
      null,
    );

    return snapshot;
  }

  /**
   * Mark checkout as abandoned
   */
  static async markCheckoutAsAbandoned(
    checkoutSessionId: string,
  ): Promise<void> {
    const session =
      await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);

    if (!session) {
      return;
    }

    if (session.status === 'completed') {
      return;
    }

    await CheckoutRepository.updateCheckoutSessionStatus(
      checkoutSessionId,
      'abandoned',
    );

    // Emit checkout abandoned event
    await this.emitCheckoutEvent(
      'checkout_abandoned',
      checkoutSessionId,
      session.userId,
      null,
    );
  }

  /**
   * Expire checkout sessions
   */
  static async expireCheckoutSessions(): Promise<number> {
    const count = await CheckoutRepository.markExpiredSessionsAsAbandoned();
    return count;
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate inventory for checkout
   */
  private static async validateInventory(
    session: CheckoutSession,
  ): Promise<InventoryValidationResult> {
    const cartItems = await this.getCartItems(session.userId ?? null, null);

    if (!cartItems || cartItems.length === 0) {
      return {
        isValid: false,
        items: [],
        hasIssues: true,
      };
    }

    const items = await Promise.all(
      cartItems.map(async (item: any) => {
        const variant = item.variant;
        const product = item.product;

        const requestedQuantity = item.quantity;
        const availableStock = variant.availableStock - variant.reservedStock;

        let canFulfill = true;
        let issue: InventoryValidationItem['issue'] | undefined;
        let message: string | undefined;

        // Check product status
        if (product.status !== 'published') {
          canFulfill = false;
          issue = 'product_inactive';
          message = 'Product is not available';
        }

        // Check variant status
        if (variant.inventoryStatus === 'out_of_stock') {
          canFulfill = false;
          issue = 'out_of_stock';
          message = 'Variant is out of stock';
        }

        // Check stock availability
        if (availableStock < requestedQuantity) {
          canFulfill = false;
          issue = 'insufficient_stock';
          message = `Only ${availableStock} items available`;
        }

        // Check purchase limit (assuming max 10 per variant)
        if (requestedQuantity > 10) {
          canFulfill = false;
          issue = 'purchase_limit_exceeded';
          message = 'Maximum 10 items per variant';
        }

        return {
          variantId: item.variantId,
          productId: item.productId,
          requestedQuantity,
          availableStock,
          reservedStock: variant.reservedStock,
          canFulfill,
          issue,
          message,
        };
      }),
    );

    const hasIssues = items.some((item: any) => !item.canFulfill);

    return {
      isValid: !hasIssues,
      items,
      hasIssues,
    };
  }

  /**
   * Validate pricing for checkout
   */
  private static async validatePricing(
    session: CheckoutSession,
  ): Promise<boolean> {
    // Fetch cart items
    const cartItems = await this.getCartItems(session.userId ?? null, null);

    if (!cartItems || cartItems.length === 0) {
      return false;
    }

    // Validate each item's price against current variant price
    for (const item of cartItems as any[]) {
      const currentPrice = Number(item.variant.price);
      const cartPrice = Number(item.unitPrice);

      // Allow small price differences due to rounding
      if (Math.abs(currentPrice - cartPrice) > 0.01) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate address for checkout
   */
  private static async validateAddress(
    session: CheckoutSession,
  ): Promise<boolean> {
    // Check if shipping address is set
    if (!session.shippingAddressId) {
      return false;
    }

    // Verify address exists and belongs to user
    if (session.userId) {
      const address = await CheckoutRepository.findAddressById(
        session.shippingAddressId,
      );
      if (!address || address.userId !== session.userId) {
        return false;
      }
    }

    return true;
  }

  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate checkout totals
   */
  private static async calculateCheckoutTotals(
    checkoutSessionId: string,
  ): Promise<void> {
    const session =
      await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Fetch cart items
    const cartItems = await this.getCartItems(session.userId ?? null, null);

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate items subtotal
    const itemsSubtotal = cartItems.reduce((sum: number, item: any) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    // Calculate discount
    const discountTotal = session.couponDiscount || 0;

    // Calculate shipping
    const shippingTotal = session.shippingFee || 0;

    // Calculate tax
    const taxResult = await TaxService.calculateTax({
      subtotal: itemsSubtotal - discountTotal,
      region: 'IN', // Default to India
    });
    const taxTotal = taxResult.taxAmount;

    // Calculate grand total
    const grandTotal = itemsSubtotal - discountTotal + shippingTotal + taxTotal;

    const totals: CheckoutTotals = {
      itemsSubtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
      currency: 'INR',
    };

    await CheckoutRepository.updateCheckoutSessionTotals(
      checkoutSessionId,
      totals,
    );
  }

  // ============================================================================
  // RESPONSE METHODS
  // ============================================================================

  /**
   * Get checkout session response
   */
  static async getCheckoutSessionResponse(
    checkoutSessionId: string,
  ): Promise<CheckoutSessionResponse> {
    const session =
      await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Fetch cart items
    const cartItems = await this.getCartItems(session.userId ?? null, null);

    const cart = {
      items: cartItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        variantId: item.variantId,
        variantName: item.variant.name,
        quantity: item.quantity,
        unitPrice: Number(item.variant.price),
        lineTotal: Number(item.variant.price) * item.quantity,
      })),
      itemCount: cartItems.length,
      itemsSubtotal: cartItems.reduce(
        (sum: number, item: any) =>
          sum + Number(item.variant.price) * item.quantity,
        0,
      ),
    };

    // Validate checkout
    const validation = await this.validateCheckout({
      checkoutSessionId,
      validateInventory: true,
      validatePricing: true,
      validateAddress: false,
    });

    return {
      checkoutSession: session,
      cart,
      validation,
      canProceed: validation.canProceed,
    };
  }

  /**
   * Get checkout summary response
   */
  static async getCheckoutSummaryResponse(
    checkoutSessionId: string,
  ): Promise<CheckoutSummaryResponse> {
    const session =
      await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Fetch cart items
    const cartItems = await this.getCartItems(session.userId ?? null, null);

    const items = cartItems.map((item: any) => ({
      productId: item.productId,
      productName: item.product.name,
      variantId: item.variantId,
      variantName: item.variant.name,
      sku: item.variant.sku,
      quantity: item.quantity,
      unitPrice: Number(item.variant.price),
      lineTotal: Number(item.variant.price) * item.quantity,
      attributes: (item.variant.attributes as Record<string, string>) || {},
      imageUrl: null,
      stockValidated: true,
      reservedStockId: item.reservationId,
    }));

    // Fetch addresses
    const shippingAddress = session.shippingAddressId
      ? await CheckoutRepository.findAddressById(session.shippingAddressId)
      : null;
    const billingAddress = session.billingAddressId
      ? await CheckoutRepository.findAddressById(session.billingAddressId)
      : null;

    // Fetch shipping rate
    const shippingRate = session.shippingRateId
      ? await CheckoutRepository.findShippingRateById(session.shippingRateId)
      : null;

    // Fetch coupon
    const coupon = session.couponCode
      ? await CheckoutRepository.findCouponByCode(session.couponCode as any)
      : null;

    // Get totals
    const totals = session.totals || {
      itemsSubtotal: 0,
      discountTotal: 0,
      shippingTotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      currency: 'INR',
    };

    // Validate checkout
    const validation = await this.validateCheckout({
      checkoutSessionId,
      validateInventory: true,
      validatePricing: true,
      validateAddress: true,
    });

    return {
      checkoutSession: session,
      items,
      shippingAddress,
      billingAddress,
      shippingRate,
      coupon,
      totals,
      validation,
    };
  }

  // ============================================================================
  // EVENT METHODS
  // ============================================================================

  private static async emitCheckoutEvent(
    eventType: string,
    checkoutSessionId: string,
    userId: string | null,
    guestId: string | null,
  ): Promise<void> {
    const event = {
      eventType: eventType as any,
      checkoutSessionId,
      userId,
      guestId,
      timestamp: new Date(),
      data: { eventType },
    };
    try {
      CheckoutEventEmitter.emit(event as any);
    } catch {}
    try {
      await logAuditEvent({
        eventType: AuditEventType.RESOURCE_ACCESS_GRANTED as any,
        userId: userId ?? undefined,
        metadata: { checkoutEvent: eventType, checkoutSessionId, guestId },
        severity: 'info',
        category: 'system',
      });
    } catch {}
    console.log(`Checkout Event: ${eventType}`, {
      checkoutSessionId,
      userId,
      guestId,
    });
  }
}
