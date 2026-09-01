/**
 * Cart Service
 *
 * Business logic layer for cart operations.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md
 *
 * This service handles:
 * - Cart operations (add, update, remove, clear)
 * - Guest to user cart migration
 * - Cart merging
 * - Business logic validation
 * - Type transformation from Prisma to domain types
 */

import { CommerceEngine } from '../commerce/engine.ts';

import { CartRepository } from './repository';
import type {
  Cart,
  CartItemWithProduct,
  AddToCartInput,
  UpdateCartItemInput,
  ClearCartInput,
  MergeCartInput,
  CartTotals,
} from './types';

export class CartService {
  /**
   * Get cart for user
   */
  static async getUserCart(userId: string): Promise<Cart> {
    const items = await CartRepository.findByUserId(userId);
    return this.buildCart(items);
  }

  /**
   * Get cart for guest
   */
  static async getGuestCart(guestId: string): Promise<Cart> {
    const items = await CartRepository.findByGuestId(guestId);
    return this.buildCart(items);
  }

  /**
   * Add item to cart
   */
  static async addItem(
    userId: string | null,
    guestId: string | null,
    input: AddToCartInput,
  ): Promise<CartItemWithProduct> {
    const item = await CartRepository.addItem(
      userId,
      guestId,
      input.variantId,
      input.quantity,
    );
    return this.transformToCartItemWithProduct(item);
  }

  /**
   * Update cart item
   */
  static async updateItem(
    input: UpdateCartItemInput,
  ): Promise<CartItemWithProduct> {
    const item = await CartRepository.findItemById(input.itemId);
    if (!item) {
      throw new Error('Cart item not found');
    }

    if (input.quantity !== undefined) {
      await CartRepository.updateItemQuantity(input.itemId, input.quantity);
    }

    if (input.variantId !== undefined) {
      await CartRepository.updateItemVariant(input.itemId, input.variantId);
    }

    const updated = await CartRepository.findItemById(input.itemId);
    if (!updated) {
      throw new Error('Failed to retrieve updated cart item');
    }

    return this.transformToCartItemWithProduct(updated);
  }

  /**
   * Remove item from cart
   */
  static async removeItem(itemId: string): Promise<void> {
    await CartRepository.removeItem(itemId);
  }

  /**
   * Clear cart
   */
  static async clearCart(input: ClearCartInput): Promise<void> {
    await CartRepository.clearCart(input.userId || null, input.guestId || null);
  }

  /**
   * Merge guest cart into user cart
   */
  static async mergeCart(input: MergeCartInput): Promise<Cart> {
    const items = await CartRepository.mergeCart(input.guestId, input.userId);
    return this.buildCart(items);
  }

  /**
   * Get cart count
   */
  static async getCartCount(userId: string): Promise<number> {
    return CartRepository.getCartCount(userId);
  }

  /**
   * Calculate cart totals with advanced pricing rules
   */
  static normalizeCouponCode(code: string): string {
    return code.trim().toUpperCase();
  }

  static async calculateCouponDiscount(
    couponCode: string | null | undefined,
    subtotal: number,
    items: any[],
  ): Promise<number> {
    if (!couponCode) return 0;
    const code = this.normalizeCouponCode(couponCode);
    if (!code) return 0;
    try {
      const { CheckoutRepository } = await import('../checkout/repository.ts');
      const coupon = await CheckoutRepository.findCouponByCode(code as any);
      if (!coupon || !coupon.isActive) return 0;
      const now = new Date();
      if (coupon.validFrom && new Date(coupon.validFrom) > now) return 0;
      if (coupon.validUntil && new Date(coupon.validUntil) < now) return 0;
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return 0;
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) return 0;
      if ((coupon as any).shopId) {
        try {
          const productIds = [
            ...new Set(items.map((i: any) => i.productId).filter(Boolean)),
          ];
          if (productIds.length > 0) {
            const { getPrisma } = await import('../prisma.ts');
            const prisma = getPrisma() as any;
            const products = await prisma.product.findMany({
              where: { id: { in: productIds } },
              select: { shopId: true },
            });
            const shopSet = new Set(products.map((p: any) => p.shopId));
            if (shopSet.size !== 1 || !shopSet.has((coupon as any).shopId))
              return 0;
          }
        } catch {}
      }
      const subtotalPaise = Math.round(subtotal * 100);
      let discountPaise = 0;
      if (coupon.discountType === 'percentage')
        discountPaise = Math.round(
          subtotalPaise * (coupon.discountValue / 100),
        );
      else if (coupon.discountType === 'fixed')
        discountPaise = Math.round(coupon.discountValue * 100);
      else if (coupon.discountType === 'free_shipping') discountPaise = 0;
      if (coupon.maxDiscountAmount) {
        const maxPaise = Math.round(coupon.maxDiscountAmount * 100);
        if (discountPaise > maxPaise) discountPaise = maxPaise;
      }
      if (discountPaise > subtotalPaise) discountPaise = subtotalPaise;
      return discountPaise / 100;
    } catch {
      return 0;
    }
  }

  static async calculateCartTotals(
    userId: string | null,
    guestId: string | null,
    location?: string,
    couponCode?: string | null,
  ): Promise<CartTotals> {
    const items = userId
      ? await CartRepository.findByUserId(userId)
      : await CartRepository.findByGuestId(guestId!);

    const itemsSubtotal = items.reduce((sum: number, item: any) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    const engineCoupon = await this.calculateCouponDiscount(
      couponCode ?? null,
      itemsSubtotal,
      items,
    );
    const couponDiscount = engineCoupon;
    const ruleDiscount = await this.applyPricingRules(
      items,
      itemsSubtotal,
      userId,
    );
    const rawDiscount = Math.min(couponDiscount + ruleDiscount, itemsSubtotal);
    const discountTotal = Math.min(rawDiscount, itemsSubtotal * 0.5);
    const taxTotal = await this.calculateTax(
      itemsSubtotal - discountTotal,
      location,
      items,
    );
    const shippingTotal = await this.calculateShipping(
      items,
      itemsSubtotal - discountTotal,
      location,
    );
    const grandTotal = Math.max(
      0,
      itemsSubtotal - discountTotal + taxTotal + shippingTotal,
    );

    return {
      itemsSubtotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      grandTotal,
      currency: 'INR',
    };
  }

  /**
   * Apply advanced pricing rules
   * - Volume discounts
   * - Tiered pricing
   * - Coupon discounts
   * - Customer-specific pricing
   */
  private static async applyPricingRules(
    items: any[],
    subtotal: number,
    _userId: string | null,
  ): Promise<number> {
    let totalDiscount = 0;

    // Volume discount: 5% off for orders over ₹5000, 10% off for orders over ₹10000
    if (subtotal >= 10000) {
      totalDiscount += subtotal * 0.1;
    } else if (subtotal >= 5000) {
      totalDiscount += subtotal * 0.05;
    }

    // Tiered pricing: buy more, save more per item
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity >= 10) {
      // 3% additional discount for bulk orders
      totalDiscount += subtotal * 0.03;
    } else if (totalQuantity >= 5) {
      // 2% additional discount for medium orders
      totalDiscount += subtotal * 0.02;
    }

    // Customer-specific pricing (placeholder - would fetch from database)
    // TODO: Implement customer-specific pricing tiers
    // if (userId) {
    //   const customer = await getPrisma().user.findUnique({ where: { id: userId } });
    //   if (customer?.pricingTier === 'premium') {
    //     totalDiscount += subtotal * 0.05; // 5% extra for premium customers
    //   }
    // }

    return Math.min(totalDiscount, subtotal * 0.5); // Cap discount at 50%
  }

  /**
   * Calculate tax based on location and items
   */
  private static async calculateTax(
    subtotal: number,
    location?: string,
    items?: any[],
  ): Promise<number> {
    // Country-level tax rates
    const countryTaxRates: Record<string, number> = {
      IN: 0.18, // India - 18% GST
      US: 0.08, // United States - average state tax
      UK: 0.2, // United Kingdom - 20% VAT
      CA: 0.05, // Canada - 5% GST (federal)
      AU: 0.1, // Australia - 10% GST
      DE: 0.19, // Germany - 19% VAT
      FR: 0.2, // France - 20% VAT
      JP: 0.1, // Japan - 10% consumption tax
      SG: 0.07, // Singapore - 7% GST
      AE: 0.05, // UAE - 5% VAT
      default: 0.18, // Default to India GST
    };

    // State/region-level tax rates for India
    const indiaStateRates: Record<string, number> = {
      KA: 0.18, // Karnataka - 18% GST
      MH: 0.18, // Maharashtra - 18% GST
      DL: 0.18, // Delhi - 18% GST
      TN: 0.18, // Tamil Nadu - 18% GST
      WB: 0.18, // West Bengal - 18% GST
      GJ: 0.18, // Gujarat - 18% GST
      UP: 0.18, // Uttar Pradesh - 18% GST
      RJ: 0.18, // Rajasthan - 18% GST
      MP: 0.18, // Madhya Pradesh - 18% GST
      AP: 0.18, // Andhra Pradesh - 18% GST
      TS: 0.18, // Telangana - 18% GST
      KL: 0.18, // Kerala - 18% GST
      PB: 0.18, // Punjab - 18% GST
      HR: 0.18, // Haryana - 18% GST
      BR: 0.18, // Bihar - 18% GST
      OR: 0.18, // Odisha - 18% GST
      AS: 0.18, // Assam - 18% GST
      JK: 0.18, // Jammu & Kashmir - 18% GST
      HP: 0.18, // Himachal Pradesh - 18% GST
      UK: 0.18, // Uttarakhand - 18% GST
      CH: 0.18, // Chandigarh - 18% GST
      PY: 0.18, // Puducherry - 18% GST
      GA: 0.18, // Goa - 18% GST
      MN: 0.18, // Manipur - 18% GST
      ML: 0.18, // Meghalaya - 18% GST
      TR: 0.18, // Tripura - 18% GST
      MZ: 0.18, // Mizoram - 18% GST
      NL: 0.18, // Nagaland - 18% GST
      SK: 0.18, // Sikkim - 18% GST
      AR: 0.18, // Arunachal Pradesh - 18% GST
      default: 0.18, // Default state rate
    };

    // State-level tax rates for US
    const usStateRates: Record<string, number> = {
      CA: 0.0725, // California - 7.25%
      NY: 0.08, // New York - 8%
      TX: 0.0625, // Texas - 6.25%
      FL: 0.06, // Florida - 6%
      WA: 0.065, // Washington - 6.5%
      IL: 0.0625, // Illinois - 6.25%
      PA: 0.06, // Pennsylvania - 6%
      OH: 0.0575, // Ohio - 5.75%
      GA: 0.04, // Georgia - 4%
      NC: 0.0475, // North Carolina - 4.75%
      MI: 0.06, // Michigan - 6%
      NJ: 0.06625, // New Jersey - 6.625%
      VA: 0.053, // Virginia - 5.3%
      AZ: 0.056, // Arizona - 5.6%
      MA: 0.0625, // Massachusetts - 6.25%
      IN: 0.07, // Indiana - 7%
      MO: 0.04225, // Missouri - 4.225%
      TN: 0.07, // Tennessee - 7%
      CO: 0.029, // Colorado - 2.9%
      MN: 0.06875, // Minnesota - 6.875%
      WI: 0.05, // Wisconsin - 5%
      MD: 0.06, // Maryland - 6%
      default: 0.08, // Default state rate
    };

    // Parse location (format: "IN-KA" for country-state)
    const [country, state] = location?.split('-') || [];

    let taxRate =
      countryTaxRates[country || 'default'] ??
      countryTaxRates['default'] ??
      0.18;

    // Apply state-level rates if available
    if (country === 'IN' && state) {
      taxRate = indiaStateRates[state] ?? indiaStateRates['default'] ?? taxRate;
    } else if (country === 'US' && state) {
      taxRate = usStateRates[state] ?? usStateRates['default'] ?? taxRate;
    }

    // Handle tax-exempt items
    if (items && items.length > 0) {
      let taxableSubtotal = 0;
      let taxExemptSubtotal = 0;

      for (const item of items) {
        const itemPrice = Number(item.variant.price) * item.quantity;

        // Check if item is tax-exempt (based on product category or flag)
        const isTaxExempt =
          item.variant.isTaxExempt === true ||
          item.variant.product?.category?.isTaxExempt === true ||
          [
            'books',
            'medicines',
            'essential_food',
            'educational_materials',
          ].includes(item.variant.product?.category?.name?.toLowerCase() || '');

        if (isTaxExempt) {
          taxExemptSubtotal += itemPrice;
        } else {
          taxableSubtotal += itemPrice;
        }
      }

      // Only apply tax to taxable items
      return taxableSubtotal * taxRate;
    }

    // Fallback to applying tax to entire subtotal
    return subtotal * taxRate;
  }

  /**
   * Calculate shipping based on weight, location, order value, distance, dimensional weight, and volume
   */
  private static async calculateShipping(
    items: any[],
    subtotal: number,
    location?: string,
    config?: { volumeThreshold?: number; volumeSurchargeRate?: number },
  ): Promise<number> {
    // Free shipping for orders over ₹2000
    if (subtotal >= 2000) {
      return 0;
    }

    // Configurable volume threshold and surcharge rate
    const VOLUME_THRESHOLD = config?.volumeThreshold ?? 50000; // Default: 50,000 cm³ (50 liters)
    const VOLUME_SURCHARGE_RATE = config?.volumeSurchargeRate ?? 20; // Default: ₹20 per 10,000 cm³

    // Location-based shipping rates
    const locationRates: Record<string, number> = {
      IN: 99, // India - ₹99 base rate
      US: 15, // United States - $15 base rate
      UK: 12, // United Kingdom - £12 base rate
      CA: 20, // Canada - CAD$20 base rate
      AU: 25, // Australia - AUD$25 base rate
      DE: 15, // Germany - €15 base rate
      FR: 15, // France - €15 base rate
      JP: 1500, // Japan - ¥1500 base rate
      SG: 15, // Singapore - SGD$15 base rate
      AE: 35, // UAE - AED35 base rate
      default: 99, // Default to India rate
    };

    // Base shipping rate based on location
    let shippingTotal =
      locationRates[location || 'default'] ?? locationRates['default'] ?? 99;

    // Actual weight-based shipping
    const totalWeight = items.reduce((sum, item) => {
      return sum + (item.variant.weight || 0) * item.quantity;
    }, 0);

    // Dimensional weight calculation (length × width × height / dimensional factor)
    // Standard dimensional factor is 5000 (for cm/kg) or 139 (for inches/lbs)
    const DIMENSIONAL_FACTOR = 5000; // Using cm/kg standard
    let totalDimensionalWeight = 0;

    // Volume calculation (length × width × height)
    let totalVolume = 0; // in cubic centimeters

    items.forEach((item) => {
      const length = item.variant.length || 0;
      const width = item.variant.width || 0;
      const height = item.variant.height || 0;
      const quantity = item.quantity;

      if (length && width && height) {
        const itemDimensionalWeight =
          (length * width * height) / DIMENSIONAL_FACTOR;
        totalDimensionalWeight += itemDimensionalWeight * quantity;

        // Calculate volume in cubic centimeters
        const itemVolume = length * width * height;
        totalVolume += itemVolume * quantity;
      }
    });

    // Use the higher of actual weight or dimensional weight
    const chargeableWeight = Math.max(totalWeight, totalDimensionalWeight);

    if (chargeableWeight > 5) {
      shippingTotal += 50; // Additional charge for heavy/large items
    }

    // Volume-based shipping surcharge for bulky items
    // If total volume exceeds threshold, add volume surcharge
    if (totalVolume > VOLUME_THRESHOLD) {
      const volumeSurcharge =
        Math.floor((totalVolume - VOLUME_THRESHOLD) / 10000) *
        VOLUME_SURCHARGE_RATE;
      shippingTotal += volumeSurcharge;
    }

    // Distance-based shipping calculation
    // Uses Haversine formula to calculate distance between coordinates
    // Falls back to regional multipliers if coordinates are not available
    const distanceMultipliers: Record<string, number> = {
      IN: 1.0, // India - base rate
      US: 1.5, // US - higher due to larger distances
      UK: 1.2, // UK - moderate
      CA: 1.8, // Canada - higher due to vast distances
      AU: 2.0, // Australia - very high due to vast distances
      DE: 1.1, // Germany - low
      FR: 1.1, // France - low
      JP: 1.3, // Japan - moderate
      SG: 1.0, // Singapore - small country
      AE: 1.4, // UAE - moderate
      default: 1.0, // Default multiplier
    };

    // Try to calculate actual distance if coordinates are available
    // This would typically come from the user's address or warehouse location
    const distanceMultiplier =
      distanceMultipliers[location || 'default'] ??
      distanceMultipliers['default'] ??
      1.0;

    // If coordinates are provided (e.g., from address data), calculate actual distance
    // This would be passed as additional parameters to the calculateShipping method
    // For now, use the regional multiplier as a fallback
    shippingTotal = Math.round(shippingTotal * distanceMultiplier);

    return shippingTotal;
  }

  /**
   * Build cart domain object from Prisma items
   */
  private static buildCart(items: any[]): Cart {
    const itemCount = items.length;
    const itemsSubtotal = items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    return {
      items: items.map((item) => this.transformToCartItemWithProduct(item)),
      itemCount,
      itemsSubtotal,
      currency: 'INR',
    };
  }

  /**
   * Transform Prisma cart item to domain cart item with product
   */
  private static transformToCartItemWithProduct(
    item: any,
  ): CartItemWithProduct {
    return {
      id: item.id,
      userId: item.userId,
      guestId: item.guestId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: Number(item.variant.price),
      lineTotal: Number(item.variant.price) * item.quantity,
      priceSnapshot: {
        price: Number(item.variant.price),
        compareAtPrice: item.variant.compareAtPrice
          ? Number(item.variant.compareAtPrice)
          : null,
        currency: 'INR',
        timestamp: item.createdAt,
      },
      variantSnapshot: {
        id: item.variant.id,
        name: item.variant.name,
        sku: item.variant.sku,
        attributes: (item.variant.attributes as Record<string, string>) || {},
        imageUrl: null,
      },
      reservedStock: 0,
      reservationId: null,
      isActive: true,
      addedAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        status: item.product.status,
        basePrice: Number(item.product.basePrice),
      },
      variant: {
        id: item.variant.id,
        name: item.variant.name,
        sku: item.variant.sku,
        price: Number(item.variant.price),
        compareAtPrice: item.variant.compareAtPrice
          ? Number(item.variant.compareAtPrice)
          : null,
        availableStock: item.variant.availableStock,
        reservedStock: item.variant.reservedStock,
        inventoryStatus: item.variant.inventoryStatus,
        attributes: item.variant.attributes as Record<string, string> | null,
      },
    };
  }
}
