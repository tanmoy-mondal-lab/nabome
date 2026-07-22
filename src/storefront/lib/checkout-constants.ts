/**
 * H-013: Shared checkout calculation constants and helpers
 * 
 * Centralizes shipping/tax/coupon logic to eliminate duplication
 * across CartPage, CartDrawer, CheckoutPage, and OrderSummary.
 */

import type { SiteSettings } from "../hooks/useSettings";

// Default values (must match server-side defaults)
export const DEFAULT_SHIPPING_COST = 99;
export const DEFAULT_TAX_RATE = 5;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 500;

// Minimum cart total for free shipping eligibility
export const FREE_SHIPPING_THRESHOLD = DEFAULT_FREE_SHIPPING_THRESHOLD;

/**
 * Extracts checkout settings from SiteSettings with safe defaults.
 */
export function getCheckoutSettings(settings?: SiteSettings | null) {
  const prefs = (settings?.preferences ?? {}) as Record<string, unknown>;
  
  return {
    shippingCost: Number(prefs.shippingCost ?? DEFAULT_SHIPPING_COST),
    taxRate: Number(prefs.taxRate ?? DEFAULT_TAX_RATE),
    freeShippingThreshold: Number(
      prefs.freeShippingThreshold ?? 
      settings?.freeShippingThreshold ?? 
      DEFAULT_FREE_SHIPPING_THRESHOLD
    ),
  };
}

/**
 * Calculates shipping cost based on subtotal and free shipping threshold.
 * @returns 0 if subtotal >= threshold, otherwise the configured shipping cost.
 */
export function calculateShipping(
  subtotal: number,
  shippingCost: number,
  freeShippingThreshold: number
): number {
  return subtotal >= freeShippingThreshold ? 0 : shippingCost;
}

/**
 * Calculates tax amount (GST) on the discounted subtotal.
 * @returns Tax amount rounded to nearest rupee.
 */
export function calculateTax(
  discountedSubtotal: number,
  taxRate: number
): number {
  return Math.round(discountedSubtotal * taxRate) / 100;
}

/**
 * Calculates final total after discount, shipping, and tax.
 */
export function calculateTotal(
  subtotal: number,
  discountAmount: number,
  shipping: number,
  tax: number
): number {
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  return Math.max(0, Math.round((discountedSubtotal + shipping + tax) * 100) / 100);
}

/**
 * Calculates discount amount from coupon.
 * The API returns discount as absolute rupee amount.
 */
export function calculateDiscountAmount(
  subtotal: number,
  discount: number,
): number {
  // The /api/coupons/validate endpoint returns `discount` as an absolute
  // rupee amount (already computed for percentage coupons), so treat it
  // as absolute regardless of discountType.
  return Math.round(Math.min(subtotal, Math.max(0, discount)) * 100) / 100;
}

/**
 * Full checkout calculation returning all derived values.
 */
export function calculateCheckout(
  subtotal: number,
  discount: number,
  settings?: SiteSettings | null
) {
  const { shippingCost, taxRate, freeShippingThreshold } = getCheckoutSettings(settings);
  const discountAmount = calculateDiscountAmount(subtotal, discount);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shipping = calculateShipping(discountedSubtotal, shippingCost, freeShippingThreshold);
  const tax = calculateTax(discountedSubtotal, taxRate);
  const total = calculateTotal(subtotal, discountAmount, shipping, tax);

  return {
    shippingCost,
    taxRate,
    freeShippingThreshold,
    discountAmount,
    discountedSubtotal,
    shipping,
    tax,
    total,
  };
}
