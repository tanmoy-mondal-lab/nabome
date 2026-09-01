import { CheckoutRepository } from '../checkout/repository.ts';
import { getAppSetting } from '../settings/app-settings.ts';

export interface CommerceContext {
  shopId: string | null;
  items: any[];
  subtotal: number;
  subtotalPaise: number;
  couponCode: string | null;
  location?: string;
  currency: string;
}

export interface PricingResult {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  freeShipping: boolean;
  appliedCoupon: any | null;
}

function normalizeCode(code: string | null): string | null {
  if (!code) return null;
  const n = code.trim().toUpperCase();
  return n || null;
}

export class CommerceEngine {
  static async buildContext(
    items: any[],
    couponCode: string | null | undefined,
    location?: string,
  ): Promise<CommerceContext> {
    const subtotal = items.reduce(
      (s: number, i: any) =>
        s + Number(i.variant?.price ?? i.unitPrice ?? 0) * i.quantity,
      0,
    );
    const subtotalPaise = Math.round(subtotal * 100);
    let shopId: string | null = null;
    try {
      const pIds = [
        ...new Set(items.map((i: any) => i.productId).filter(Boolean)),
      ] as string[];
      if (pIds.length) {
        const { getPrisma } = await import('../prisma.ts');
        const prisma = getPrisma() as any;
        const products = await prisma.product.findMany({
          where: { id: { in: pIds } },
          select: { shopId: true },
        });
        const set = new Set(products.map((p: any) => p.shopId));
        if (set.size === 1) shopId = [...set][0] as string;
      }
    } catch {}
    return {
      shopId,
      items,
      subtotal,
      subtotalPaise,
      couponCode: normalizeCode(couponCode ?? null),
      location,
      currency: 'INR',
    };
  }

  static async resolvePromotion(
    ctx: CommerceContext,
  ): Promise<{ discount: number; coupon: any | null; freeShipping: boolean }> {
    if (!ctx.couponCode)
      return { discount: 0, coupon: null, freeShipping: false };
    try {
      const coupon = await CheckoutRepository.findCouponByCode(
        ctx.couponCode as any,
      );
      if (!coupon || !coupon.isActive)
        return { discount: 0, coupon: null, freeShipping: false };
      const now = new Date();
      if (coupon.validFrom && new Date(coupon.validFrom) > now)
        return { discount: 0, coupon: null, freeShipping: false };
      if (coupon.validUntil && new Date(coupon.validUntil) < now)
        return { discount: 0, coupon: null, freeShipping: false };
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
        return { discount: 0, coupon: null, freeShipping: false };
      if (coupon.minOrderValue && ctx.subtotal < coupon.minOrderValue)
        return { discount: 0, coupon: null, freeShipping: false };
      if ((coupon as any).shopId && (coupon as any).shopId !== ctx.shopId)
        return { discount: 0, coupon: null, freeShipping: false };
      if (coupon.discountType === 'free_shipping')
        return { discount: 0, coupon, freeShipping: true };
      let discountPaise = 0;
      if (coupon.discountType === 'percentage')
        discountPaise = Math.round(
          ctx.subtotalPaise * (coupon.discountValue / 100),
        );
      else if (coupon.discountType === 'fixed')
        discountPaise = Math.round(coupon.discountValue * 100);
      if (coupon.maxDiscountAmount) {
        const maxPaise = Math.round(coupon.maxDiscountAmount * 100);
        if (discountPaise > maxPaise) discountPaise = maxPaise;
      }
      if (discountPaise > ctx.subtotalPaise) discountPaise = ctx.subtotalPaise;
      return { discount: discountPaise / 100, coupon, freeShipping: false };
    } catch {
      return { discount: 0, coupon: null, freeShipping: false };
    }
  }

  static async resolveTax(
    ctx: CommerceContext,
    taxableAmount: number,
  ): Promise<number> {
    try {
      const taxSettings = await getAppSetting('tax').catch(() => ({
        gstRate: 18,
      }));
      const rate =
        typeof (taxSettings as any).gstRate === 'number'
          ? (taxSettings as any).gstRate
          : 18;
      const taxablePaise = Math.round(taxableAmount * 100);
      return Math.round(taxablePaise * (rate / 100)) / 100;
    } catch {
      return Math.round(taxableAmount * 100 * 0.18) / 100;
    }
  }

  static async resolveShipping(
    ctx: CommerceContext,
    taxableAmount: number,
    freeShipping: boolean,
  ): Promise<number> {
    if (freeShipping) return 0;
    try {
      const ship = await getAppSetting('shipping').catch(() => ({
        freeShippingThreshold: 500,
        defaultShippingRate: 50,
      }));
      const threshold = (ship as any).freeShippingThreshold ?? 500;
      const rate = (ship as any).defaultShippingRate ?? 50;
      if (taxableAmount >= threshold) return 0;
      return rate;
    } catch {
      if (taxableAmount >= 500) return 0;
      return 50;
    }
  }

  static async calculate(ctx: CommerceContext): Promise<PricingResult> {
    const promo = await this.resolvePromotion(ctx);
    const discount = Math.min(promo.discount, ctx.subtotal, ctx.subtotal * 0.5);
    const taxableAmount = Math.max(0, ctx.subtotal - discount);
    const tax = await this.resolveTax(ctx, taxableAmount);
    const shipping = await this.resolveShipping(
      ctx,
      taxableAmount,
      promo.freeShipping,
    );
    const grandTotal = Math.max(0, taxableAmount + tax + shipping);
    return {
      subtotal: ctx.subtotal,
      discount,
      taxableAmount,
      tax,
      shipping,
      grandTotal,
      freeShipping: promo.freeShipping,
      appliedCoupon: promo.coupon,
    };
  }

  static async priceCart(
    items: any[],
    couponCode: string | null | undefined,
    location?: string,
  ): Promise<PricingResult> {
    const ctx = await this.buildContext(items, couponCode, location);
    return this.calculate(ctx);
  }
}
