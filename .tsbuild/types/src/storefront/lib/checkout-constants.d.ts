/**
 * H-013: Shared checkout calculation constants and helpers
 *
 * Centralizes shipping/tax/coupon logic to eliminate duplication
 * across CartPage, CartDrawer, CheckoutPage, and OrderSummary.
 */
import type { SiteSettings } from "../hooks/useSettings";
export declare const DEFAULT_SHIPPING_COST = 99;
export declare const DEFAULT_TAX_RATE = 5;
export declare const DEFAULT_FREE_SHIPPING_THRESHOLD = 500;
export declare const FREE_SHIPPING_THRESHOLD = 500;
/**
 * Extracts checkout settings from SiteSettings with safe defaults.
 */
export declare function getCheckoutSettings(settings?: SiteSettings | null): {
    shippingCost: number;
    taxRate: number;
    freeShippingThreshold: number;
};
/**
 * Calculates shipping cost based on subtotal and free shipping threshold.
 * @returns 0 if subtotal >= threshold, otherwise the configured shipping cost.
 */
export declare function calculateShipping(subtotal: number, shippingCost: number, freeShippingThreshold: number): number;
/**
 * Calculates tax amount (GST) on the discounted subtotal.
 * @returns Tax amount rounded to nearest rupee.
 */
export declare function calculateTax(discountedSubtotal: number, taxRate: number): number;
/**
 * Calculates final total after discount, shipping, and tax.
 */
export declare function calculateTotal(subtotal: number, discountAmount: number, shipping: number, tax: number): number;
/**
 * Calculates discount amount from coupon.
 * The API returns discount as absolute rupee amount.
 */
export declare function calculateDiscountAmount(subtotal: number, discount: number): number;
/**
 * Full checkout calculation returning all derived values.
 */
export declare function calculateCheckout(subtotal: number, discount: number, settings?: SiteSettings | null): {
    shippingCost: number;
    taxRate: number;
    freeShippingThreshold: number;
    discountAmount: number;
    discountedSubtotal: number;
    shipping: number;
    tax: number;
    total: number;
};
