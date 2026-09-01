/**
 * Checkout Repository
 *
 * Data access layer for checkout operations.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 * Following DATABASE_SPECIFICATION.md §4.5.5
 *
 * This repository handles:
 * - Checkout session CRUD operations
 * - Address CRUD operations
 * - Coupon CRUD operations
 * - Shipping rate queries
 * - Tax rule queries
 * - Type transformation from Prisma to domain types
 */

import { getPrisma } from '../prisma.ts';

import type {
  CheckoutSession,
  Address,
  Coupon,
  ShippingRate,
  TaxRule,
  CheckoutStatus,
  CheckoutTotals,
} from './types';

const prisma = new Proxy({} as any, {
  get(_target: unknown, prop: string | symbol) {
    return (getPrisma() as any)[prop];
  },
});

export class CheckoutRepository {
  // ============================================================================
  // CHECKOUT SESSION OPERATIONS
  // ============================================================================

  /**
   * Create a new checkout session
   */
  static async createCheckoutSession(
    cartId: string,
    userId: string | null,
    expiresAt: Date,
  ): Promise<CheckoutSession> {
    const session = await prisma.checkoutSession.create({
      data: {
        cartId,
        userId,
        status: 'started',
        expiresAt,
      },
    });

    return this.transformToCheckoutSession(session);
  }

  /**
   * Find checkout session by ID
   */
  static async findCheckoutSessionById(
    id: string,
  ): Promise<CheckoutSession | null> {
    const session = await prisma.checkoutSession.findUnique({
      where: { id },
    });

    return session ? this.transformToCheckoutSession(session) : null;
  }

  /**
   * Find checkout session by cart ID
   */
  static async findCheckoutSessionByCartId(
    cartId: string,
  ): Promise<CheckoutSession | null> {
    const session = await prisma.checkoutSession.findFirst({
      where: {
        cartId,
        status: {
          in: ['started', 'address_entered', 'payment_pending'],
        },
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return session ? this.transformToCheckoutSession(session) : null;
  }

  /**
   * Find checkout session by user ID
   */
  static async findCheckoutSessionByUserId(
    userId: string,
  ): Promise<CheckoutSession | null> {
    const session = await prisma.checkoutSession.findFirst({
      where: {
        userId,
        status: {
          in: ['started', 'address_entered', 'payment_pending'],
        },
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return session ? this.transformToCheckoutSession(session) : null;
  }

  /**
   * Update checkout session status
   */
  static async updateCheckoutSessionStatus(
    id: string,
    status: CheckoutStatus,
  ): Promise<CheckoutSession> {
    const session = await prisma.checkoutSession.update({
      where: { id },
      data: { status },
    });

    return this.transformToCheckoutSession(session);
  }

  /**
   * Update checkout session addresses
   */
  static async updateCheckoutSessionAddresses(
    id: string,
    shippingAddressId: string | null,
    billingAddressId: string | null,
  ): Promise<CheckoutSession> {
    const session = await prisma.checkoutSession.update({
      where: { id },
      data: {
        shippingAddressId,
        billingAddressId,
        status: shippingAddressId ? 'address_entered' : 'started',
      },
    });

    return this.transformToCheckoutSession(session);
  }

  /**
   * Update checkout session shipping
   */
  static async updateCheckoutSessionShipping(
    id: string,
    shippingRateId: string,
    shippingFee: number,
  ): Promise<CheckoutSession> {
    const session = await prisma.checkoutSession.update({
      where: { id },
      data: {
        shippingRateId,
        shippingFee,
      },
    });

    return this.transformToCheckoutSession(session);
  }

  /**
   * Update checkout session coupon
   */
  static async updateCheckoutSessionCoupon(
    id: string,
    couponCode: string | null,
    couponDiscount: number | null,
  ): Promise<CheckoutSession> {
    const session = await prisma.checkoutSession.update({
      where: { id },
      data: {
        couponCode,
        couponDiscount,
      },
    });

    return this.transformToCheckoutSession(session);
  }

  /**
   * Update checkout session totals
   */
  static async updateCheckoutSessionTotals(
    id: string,
    totals: CheckoutTotals,
  ): Promise<CheckoutSession> {
    const session = await prisma.checkoutSession.update({
      where: { id },
      data: {
        totals: totals as any,
      },
    });

    return this.transformToCheckoutSession(session);
  }

  /**
   * Delete checkout session
   */
  static async deleteCheckoutSession(id: string): Promise<void> {
    await prisma.checkoutSession.delete({
      where: { id },
    });
  }

  /**
   * Mark expired checkout sessions as abandoned
   */
  static async markExpiredSessionsAsAbandoned(): Promise<number> {
    const result = await prisma.checkoutSession.updateMany({
      where: {
        status: {
          in: ['started', 'address_entered', 'payment_pending'],
        },
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: 'expired',
      },
    });

    return result.count;
  }

  // ============================================================================
  // ADDRESS OPERATIONS
  // ============================================================================

  /**
   * Create address
   */
  static async createAddress(
    userId: string,
    addressData: {
      name: string;
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      type: 'home' | 'work' | 'other';
      isDefault: boolean;
    },
  ): Promise<Address> {
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const { name, ...rest } = addressData as any;
    const address = await prisma.address.create({
      data: {
        userId,
        label: name,
        ...rest,
      },
    });
    return this.transformToAddress(address);
  }

  /**
   * Find address by ID
   */
  static async findAddressById(id: string): Promise<Address | null> {
    const address = await prisma.address.findUnique({
      where: { id },
    });

    return address ? this.transformToAddress(address) : null;
  }

  /**
   * Find addresses by user ID
   */
  static async findAddressesByUserId(userId: string): Promise<Address[]> {
    const addresses = await prisma.address.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((addr: any) => this.transformToAddress(addr));
  }

  /**
   * Find default address for user
   */
  static async findDefaultAddressByUserId(
    userId: string,
  ): Promise<Address | null> {
    const address = await prisma.address.findFirst({
      where: { userId, isDefault: true, isActive: true },
    });

    return address ? this.transformToAddress(address) : null;
  }

  /**
   * Update address
   */
  static async updateAddress(
    id: string,
    addressData: Partial<{
      name: string;
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      type: 'home' | 'work' | 'other';
      isDefault: boolean;
    }>,
  ): Promise<Address> {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Address not found');
    }
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: existing.userId, id: { not: id } },
        data: { isDefault: false },
      });
    }
    const { name, ...rest } = addressData as any;
    const data: any = { ...rest };
    if (name !== undefined) data.label = name;
    const address = await prisma.address.update({
      where: { id },
      data,
    });
    return this.transformToAddress(address);
  }

  /**
   * Delete address
   */
  static async deleteAddress(id: string): Promise<void> {
    await prisma.address.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Set address as default
   */
  static async setAddressAsDefault(
    id: string,
    userId: string,
  ): Promise<Address> {
    // Remove default from other addresses
    await prisma.address.updateMany({
      where: { userId, id: { not: id } },
      data: { isDefault: false },
    });

    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return this.transformToAddress(address);
  }

  // ============================================================================
  // COUPON OPERATIONS
  // ============================================================================

  /**
   * Find coupon by code
   */
  static async findCouponByCode(code: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    return coupon ? this.transformToCoupon(coupon) : null;
  }

  /**
   * Find coupon by ID
   */
  static async findCouponById(id: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    return coupon ? this.transformToCoupon(coupon) : null;
  }

  /**
   * Get all active coupons
   */
  static async getActiveCoupons(): Promise<Coupon[]> {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ validFrom: null }, { validFrom: { lte: new Date() } }],
        AND: [
          {
            OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
          },
        ],
      },
    });

    return coupons.map((coupon: any) => this.transformToCoupon(coupon));
  }

  /**
   * Increment coupon usage count
   */
  static async incrementCouponUsage(id: string): Promise<Coupon> {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    return this.transformToCoupon(coupon);
  }

  /**
   * Decrement coupon usage count
   */
  static async decrementCouponUsage(id: string): Promise<Coupon> {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        usedCount: {
          decrement: 1,
        },
      },
    });

    return this.transformToCoupon(coupon);
  }

  // ============================================================================
  // SHIPPING RATE OPERATIONS
  // ============================================================================

  /**
   * Get all active shipping rates
   */
  static async getActiveShippingRates(): Promise<ShippingRate[]> {
    const rates = await prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: { baseRate: 'asc' },
    });

    return rates.map((rate: any) => this.transformToShippingRate(rate));
  }

  /**
   * Find shipping rate by ID
   */
  static async findShippingRateById(id: string): Promise<ShippingRate | null> {
    const rate = await prisma.shippingRate.findUnique({
      where: { id },
    });

    return rate ? this.transformToShippingRate(rate) : null;
  }

  // ============================================================================
  // TAX RULE OPERATIONS
  // ============================================================================

  /**
   * Get all active tax rules
   */
  static async getActiveTaxRules(): Promise<TaxRule[]> {
    const rules = await prisma.taxRule.findMany({
      orderBy: { name: 'asc' },
    });

    return rules.map((rule: any) => this.transformToTaxRule(rule));
  }

  /**
   * Find tax rules by region
   */
  static async findTaxRulesByRegion(region: string): Promise<TaxRule[]> {
    const rules = await prisma.taxRule.findMany();
    const filtered = rules.filter((r: any) => {
      const regions = r.applicableRegions as string[] | null;
      if (!regions || regions.length === 0) return true;
      return regions.includes(region);
    });
    return filtered.map((rule: any) => this.transformToTaxRule(rule));
  }

  /**
   * Find tax rule by ID
   */
  static async findTaxRuleById(id: string): Promise<TaxRule | null> {
    const rule = await prisma.taxRule.findUnique({
      where: { id },
    });

    return rule ? this.transformToTaxRule(rule) : null;
  }

  // ============================================================================
  // TRANSFORMATION METHODS
  // ============================================================================

  private static transformToCheckoutSession(session: any): CheckoutSession {
    return {
      id: session.id,
      cartId: session.cartId,
      userId: session.userId,
      status: session.status as CheckoutStatus,
      shippingAddressId: session.shippingAddressId,
      billingAddressId: session.billingAddressId,
      shippingRateId: session.shippingRateId,
      shippingFee: session.shippingFee ? Number(session.shippingFee) : null,
      totals: session.totals as CheckoutTotals | null,
      couponCode: session.couponCode,
      couponDiscount: session.couponDiscount
        ? Number(session.couponDiscount)
        : null,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  private static transformToAddress(address: any): Address {
    return {
      id: address.id,
      userId: address.userId,
      name: address.label || address.line1,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
      addressType:
        address.type === 'home'
          ? 'shipping'
          : address.type === 'work'
            ? 'billing'
            : 'both',
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  private static transformToCoupon(coupon: any): Coupon {
    return {
      id: coupon.id,
      code: coupon.code,
      description: null,
      discountType: coupon.type as any,
      discountValue: Number(coupon.value),
      minOrderValue: coupon.minOrderAmount
        ? Number(coupon.minOrderAmount)
        : null,
      maxDiscountAmount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      usageLimit: coupon.maxUses,
      usageCount: coupon.usedCount,
      perCustomerLimit: null,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
      applicableProducts: null,
      applicableCollections: null,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }

  private static transformToShippingRate(rate: any): ShippingRate {
    return {
      id: rate.id,
      name: rate.name,
      description: rate.description,
      baseRate: Number(rate.baseRate),
      ratePerKg: rate.ratePerKg ? Number(rate.ratePerKg) : null,
      freeAboveAmount: rate.freeAboveAmount
        ? Number(rate.freeAboveAmount)
        : null,
      estimatedDays: rate.estimatedDays,
      isActive: rate.isActive,
      applicableRegions: (rate.applicableRegions as string[] | null) || [],
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    };
  }

  private static transformToTaxRule(rule: any): TaxRule {
    return {
      id: rule.id,
      name: rule.name,
      rate: Number(rule.rate),
      type: rule.type,
      isInclusive: rule.isInclusive,
      applicableRegions: (rule.applicableRegions as string[] | null) || [],
      applicableCategories:
        (rule.applicableCategories as string[] | null) || [],
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
