/**
 * Coupon Service
 *
 * Business logic layer for coupon operations.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 *
 * This service handles:
 * - Coupon validation
 * - Coupon application
 * - Coupon removal
 * - Discount calculation
 * - Usage limit enforcement
 */

import { CartRepository } from '../cart/repository';

import { CheckoutRepository } from './repository';
import type {
  Coupon,
  CouponValidationResult,
  CouponApplicationInput,
} from './types';

export class CouponService {
  static normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  /**
   * Validate coupon
   */
  static async validateCoupon(
    input: CouponApplicationInput,
  ): Promise<CouponValidationResult> {
    const normalizedCode = this.normalizeCode(String(input.code ?? ''));
    if (!normalizedCode) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'Coupon code required',
        errorCodes: ['coupon_invalid'],
      };
    }
    const coupon = await CheckoutRepository.findCouponByCode(
      normalizedCode as any,
    );

    if (!coupon) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'Invalid coupon code',
        errorCodes: ['coupon_not_found'],
      };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'Coupon is not active',
        errorCodes: ['coupon_inactive'],
      };
    }

    // Check validity dates
    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'Coupon is not yet valid',
        errorCodes: ['coupon_not_started'],
      };
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'Coupon has expired',
        errorCodes: ['coupon_expired'],
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'Coupon usage limit exceeded',
        errorCodes: ['coupon_limit_exceeded'],
      };
    }

    let cartItems: any[] = [];
    if (input.userId) {
      cartItems = await CartRepository.findByUserId(input.userId as any);
    } else {
      const sessionByCart =
        await CheckoutRepository.findCheckoutSessionByCartId(input.cartId);
      if (sessionByCart) {
        const guestCart = await (async () => {
          try {
            const { getPrisma } = await import('../prisma.ts');
            const prisma = getPrisma() as any;
            const checkout = await prisma.checkoutSession.findUnique({
              where: { id: sessionByCart.id },
            });
            return checkout
              ? await CartRepository.findByUserId(
                  checkout.userId ??
                    ('00000000-0000-0000-0000-000000000000' as any),
                )
              : [];
          } catch {
            return [];
          }
        })();
        cartItems = guestCart;
      }
    }
    if (!cartItems || cartItems.length === 0) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'Cart is empty',
        errorCodes: ['cart_empty'],
      };
    }

    if ((coupon as any).shopId) {
      try {
        const productIds = [
          ...new Set(cartItems.map((i: any) => i.productId).filter(Boolean)),
        ];
        if (productIds.length > 0) {
          const { getPrisma } = await import('../prisma.ts');
          const prisma = getPrisma() as any;
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, shopId: true },
          });
          const shopSet = new Set(products.map((p: any) => p.shopId));
          if (shopSet.size !== 1 || !shopSet.has((coupon as any).shopId)) {
            return {
              isValid: false,
              coupon: null,
              discountAmount: 0,
              appliedMessage: null,
              errorMessage: 'Coupon not valid for this shop',
              errorCodes: ['coupon_shop_mismatch'],
            };
          }
        }
      } catch {}
    }

    const cartTotalPaise = cartItems.reduce((sum: number, item: any) => {
      const paise = Math.round(
        Number(item.unitPrice ?? item.variant?.price ?? 0) * 100,
      );
      return sum + paise * item.quantity;
    }, 0);
    const cartTotal = cartTotalPaise / 100;

    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: `Minimum order value is ₹${coupon.minOrderValue}`,
        errorCodes: ['minimum_order_not_met'],
      };
    }

    let discountPaise = 0;
    if (coupon.discountType === 'percentage') {
      discountPaise = Math.round(cartTotalPaise * (coupon.discountValue / 100));
    } else if (coupon.discountType === 'fixed') {
      discountPaise = Math.round(coupon.discountValue * 100);
    } else if (coupon.discountType === 'free_shipping') {
      discountPaise = 0;
    }

    if (coupon.maxDiscountAmount) {
      const maxPaise = Math.round(coupon.maxDiscountAmount * 100);
      if (discountPaise > maxPaise) discountPaise = maxPaise;
    }

    if (discountPaise > cartTotalPaise) discountPaise = cartTotalPaise;
    const discountAmount = discountPaise / 100;

    return {
      isValid: true,
      coupon,
      discountAmount,
      appliedMessage: `Coupon applied successfully. You saved ₹${discountAmount.toFixed(2)}`,
      errorMessage: null,
      errorCodes: [],
    };
  }

  static async applyCoupon(
    checkoutSessionId: string,
    code: string,
  ): Promise<CouponValidationResult> {
    const session =
      await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);

    if (!session) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'Checkout session not found',
        errorCodes: ['session_not_found'],
      };
    }

    if (session.couponCode) {
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: 'A coupon is already applied to this checkout',
        errorCodes: ['coupon_already_applied'],
      };
    }

    const result = await this.validateCoupon({
      code,
      cartId: session.cartId,
      userId: session.userId || undefined,
    });

    if (!result.isValid || !result.coupon) return result;

    const { getPrisma } = await import('../prisma.ts');
    const prisma = getPrisma() as any;
    try {
      await prisma.$transaction(async (tx: any) => {
        const freshCoupon = await tx.coupon.findUnique({
          where: { code: result.coupon!.code },
        });
        if (!freshCoupon) throw new Error('Coupon not found');
        if (!freshCoupon.isActive) throw new Error('Coupon is not active');
        if (
          freshCoupon.validUntil &&
          new Date(freshCoupon.validUntil) < new Date()
        )
          throw new Error('Coupon has expired');
        if (freshCoupon.maxUses && freshCoupon.usedCount >= freshCoupon.maxUses)
          throw new Error('Coupon usage limit exceeded');
        const updated = await tx.coupon.updateMany({
          where: {
            id: freshCoupon.id,
            usedCount: freshCoupon.usedCount,
            ...(freshCoupon.maxUses
              ? { usedCount: { lt: freshCoupon.maxUses } }
              : {}),
          },
          data: { usedCount: { increment: 1 } },
        });
        if (updated.count === 0) throw new Error('Coupon usage limit exceeded');
        await tx.checkoutSession.update({
          where: { id: checkoutSessionId },
          data: {
            couponCode: result.coupon!.code,
            couponDiscount: result.discountAmount,
          },
        });
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Coupon application failed';
      if (msg.includes('limit exceeded')) {
        return {
          isValid: false,
          coupon: null,
          discountAmount: 0,
          appliedMessage: null,
          errorMessage: 'Coupon usage limit exceeded',
          errorCodes: ['coupon_limit_exceeded'],
        };
      }
      if (msg.includes('already applied')) {
        return {
          isValid: false,
          coupon: null,
          discountAmount: 0,
          appliedMessage: null,
          errorMessage: 'A coupon is already applied',
          errorCodes: ['coupon_already_applied'],
        };
      }
      return {
        isValid: false,
        coupon: null,
        discountAmount: 0,
        appliedMessage: null,
        errorMessage: msg,
        errorCodes: ['coupon_apply_failed'],
      };
    }

    return result;
  }

  /**
   * Remove coupon from checkout session
   */
  static async removeCoupon(checkoutSessionId: string): Promise<void> {
    const session =
      await CheckoutRepository.findCheckoutSessionById(checkoutSessionId);

    if (!session || !session.couponCode) {
      return;
    }

    const coupon = await CheckoutRepository.findCouponByCode(
      session.couponCode as any,
    );
    if (coupon) {
      await CheckoutRepository.decrementCouponUsage(coupon.id);
    }

    await CheckoutRepository.updateCheckoutSessionCoupon(
      checkoutSessionId,
      null,
      null,
    );
  }
}
