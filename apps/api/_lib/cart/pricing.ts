/**
 * Cart Pricing Service
 *
 * Handles price calculations for cart items including:
 * - Item subtotal calculations
 * - Discount application
 * - Tax calculations
 * - Shipping costs
 * - Grand total computation
 *
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §6
 */

import type { CartTotals, CartItemWithProduct } from './types';

export class CartPricingService {
  /**
   * Calculate cart totals
   */
  static calculateCartTotals(items: CartItemWithProduct[]): CartTotals {
    const itemsSubtotal = this.calculateItemsSubtotal(items);
    const discountTotal = this.calculateDiscountTotal(items, itemsSubtotal);
    const taxTotal = this.calculateTaxTotal(itemsSubtotal - discountTotal);
    const shippingTotal = this.calculateShippingTotal(
      items,
      itemsSubtotal - discountTotal,
    );
    const grandTotal = itemsSubtotal - discountTotal + taxTotal + shippingTotal;

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
   * Calculate items subtotal
   */
  private static calculateItemsSubtotal(items: CartItemWithProduct[]): number {
    return items.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);
  }

  /**
   * Calculate discount total
   * Note: This is a placeholder. Actual discount logic will be implemented
   * with the Promotion Engine.
   */
  private static calculateDiscountTotal(
    _items: CartItemWithProduct[],
    _subtotal: number,
  ): number {
    // For now, no discounts applied
    // TODO: Integrate with Promotion Engine
    return 0;
  }

  /**
   * Calculate tax total
   * Note: This is a placeholder. Actual tax logic will be implemented
   * with the Tax Engine based on location and product tax categories.
   */
  private static calculateTaxTotal(amount: number): number {
    // For now, assume 18% GST (placeholder)
    // TODO: Integrate with Tax Engine
    const TAX_RATE = 0.18;
    return amount * TAX_RATE;
  }

  /**
   * Calculate shipping total
   * Note: This is a placeholder. Actual shipping logic will be implemented
   * with the Shipping Engine based on location, weight, and carrier rates.
   */
  private static calculateShippingTotal(
    _items: CartItemWithProduct[],
    subtotal: number,
  ): number {
    // For now, free shipping over ₹500, otherwise ₹50
    // TODO: Integrate with Shipping Engine
    if (subtotal >= 500) {
      return 0;
    }
    return 50;
  }

  /**
   * Calculate line total for a single item
   */
  static calculateLineTotal(unitPrice: number, quantity: number): number {
    return unitPrice * quantity;
  }

  /**
   * Format price for display
   */
  static formatPrice(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
