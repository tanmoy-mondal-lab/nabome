/**
 * Order Snapshot Service
 *
 * Business logic layer for order snapshot generation.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 *
 * This service handles:
 * - Order snapshot generation
 * - Immutable snapshot creation
 * - Customer data capture
 * - Product data capture
 * - Pricing data capture
 * - Address data capture
 * - Shipping data capture
 * - Discount data capture
 * - Tax data capture
 */

import { CartRepository } from '../cart/repository';

import { CheckoutRepository } from './repository';
import type {
  OrderSnapshot,
  CheckoutSession,
  CustomerSnapshot,
  OrderItemSnapshot,
  AddressSnapshot,
  PricingSnapshot,
  ShippingSnapshot,
  DiscountSnapshot,
  TaxSnapshot,
  CheckoutTotals,
  PackageSummary,
} from './types';

export class OrderSnapshotService {
  /**
   * Generate order snapshot from checkout session
   */
  static async generateSnapshot(
    session: CheckoutSession,
  ): Promise<OrderSnapshot> {
    // Fetch cart items with product and variant data
    const cartItems = await CartRepository.findByUserId(session.userId! as any);

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cannot generate snapshot: cart is empty');
    }

    // Generate customer snapshot
    const customer = await this.generateCustomerSnapshot(session);

    // Generate order items snapshot
    const items = await this.generateOrderItemsSnapshot(cartItems);

    // Generate address snapshot
    const addresses = await this.generateAddressSnapshot(session);

    // Generate pricing snapshot
    const pricing = await this.generatePricingSnapshot(items);

    // Generate shipping snapshot
    const shipping = await this.generateShippingSnapshot(session, items);

    // Generate discount snapshot
    const discount = await this.generateDiscountSnapshot(session);

    // Generate tax snapshot
    const tax = await this.generateTaxSnapshot(
      session,
      pricing.itemsSubtotal,
      discount.discountAmount,
    );

    // Calculate totals
    const totals = this.calculateTotals(pricing, shipping, discount, tax);

    return {
      checkoutSessionId: session.id,
      customer,
      items,
      addresses,
      pricing,
      shipping,
      discount,
      tax,
      totals,
      currency: 'INR',
      createdAt: new Date(),
      isImmutable: true,
    };
  }

  /**
   * Generate customer snapshot
   */
  private static async generateCustomerSnapshot(
    session: CheckoutSession,
  ): Promise<CustomerSnapshot> {
    // TODO: Fetch user details from User model when available
    return {
      userId: session.userId,
      email: null,
      phone: null,
      name: null,
      isGuest: !session.userId,
    };
  }

  /**
   * Generate order items snapshot
   */
  private static async generateOrderItemsSnapshot(
    cartItems: any[],
  ): Promise<OrderItemSnapshot[]> {
    return cartItems.map((item) => ({
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
  }

  /**
   * Generate address snapshot
   */
  private static async generateAddressSnapshot(
    session: CheckoutSession,
  ): Promise<AddressSnapshot> {
    const shippingAddress = session.shippingAddressId
      ? await CheckoutRepository.findAddressById(session.shippingAddressId)
      : null;
    const billingAddress = session.billingAddressId
      ? await CheckoutRepository.findAddressById(session.billingAddressId)
      : null;

    return {
      shipping: shippingAddress
        ? this.transformAddressToInput(shippingAddress)
        : null,
      billing: billingAddress
        ? this.transformAddressToInput(billingAddress)
        : null,
      useSameAddress: session.shippingAddressId === session.billingAddressId,
    };
  }

  /**
   * Generate pricing snapshot
   */
  private static async generatePricingSnapshot(
    items: OrderItemSnapshot[],
  ): Promise<PricingSnapshot> {
    const itemsSubtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      itemsSubtotal,
      baseCurrency: 'INR',
      exchangeRate: 1,
      pricingTimestamp: new Date(),
    };
  }

  /**
   * Generate shipping snapshot
   */
  private static async generateShippingSnapshot(
    session: CheckoutSession,
    items: OrderItemSnapshot[],
  ): Promise<ShippingSnapshot> {
    const shippingRate = session.shippingRateId
      ? await CheckoutRepository.findShippingRateById(session.shippingRateId)
      : null;

    // Calculate package summary
    const packageSummary = this.calculatePackageSummary(items);

    // Estimate delivery date
    const estimatedDelivery = shippingRate?.estimatedDays
      ? new Date(Date.now() + shippingRate.estimatedDays * 24 * 60 * 60 * 1000)
      : null;

    return {
      methodId: session.shippingRateId,
      methodName: shippingRate?.name || null,
      cost: session.shippingFee || 0,
      estimatedDelivery,
      packageSummary,
    };
  }

  /**
   * Generate discount snapshot
   */
  private static async generateDiscountSnapshot(
    session: CheckoutSession,
  ): Promise<DiscountSnapshot> {
    const coupon = session.couponCode
      ? await CheckoutRepository.findCouponByCode(session.couponCode! as any)
      : null;

    return {
      couponCode: session.couponCode,
      discountType: coupon?.discountType || null,
      discountValue: coupon?.discountValue || null,
      discountAmount: session.couponDiscount || 0,
      appliedAt: session.couponCode ? new Date() : null,
    };
  }

  /**
   * Generate tax snapshot
   */
  private static async generateTaxSnapshot(
    session: CheckoutSession,
    subtotal: number,
    discountAmount: number,
  ): Promise<TaxSnapshot> {
    // Calculate tax (simplified - should use TaxService)
    const taxableAmount = subtotal - discountAmount;
    const taxRate = 0.18; // 18% GST
    const taxAmount = taxableAmount * taxRate;

    return {
      taxAmount,
      taxRate,
      taxBreakdown: [
        {
          taxName: 'CGST',
          taxRate: 0.09,
          taxAmount: taxAmount / 2,
          isInclusive: false,
        },
        {
          taxName: 'SGST',
          taxRate: 0.09,
          taxAmount: taxAmount / 2,
          isInclusive: false,
        },
      ],
      isInclusive: false,
      taxRegion: 'IN',
    };
  }

  /**
   * Calculate totals
   */
  private static calculateTotals(
    pricing: PricingSnapshot,
    shipping: ShippingSnapshot,
    discount: DiscountSnapshot,
    tax: TaxSnapshot,
  ): CheckoutTotals {
    const itemsSubtotal = pricing.itemsSubtotal;
    const discountTotal = discount.discountAmount;
    const shippingTotal = shipping.cost;
    const taxTotal = tax.taxAmount;
    const grandTotal = itemsSubtotal - discountTotal + shippingTotal + taxTotal;

    return {
      itemsSubtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
      currency: 'INR',
    };
  }

  /**
   * Calculate package summary
   */
  private static calculatePackageSummary(
    items: OrderItemSnapshot[],
  ): PackageSummary {
    // Simplified calculation - should be based on actual product dimensions
    const weight = items.length * 0.5; // Assume 0.5kg per item
    const volume = items.length * 0.001; // Assume 0.001m³ per item
    const dimensions = {
      length: 20,
      width: 15,
      height: 10,
    };

    return {
      weight,
      volume,
      dimensions,
      itemCount: items.length,
    };
  }

  /**
   * Transform address to input format
   */
  private static transformAddressToInput(address: any): any {
    return {
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.postalCode,
      country: address.country,
    };
  }
}
