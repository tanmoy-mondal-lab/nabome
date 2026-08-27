/**
 * Checkout Types and Interfaces
 *
 * This file defines all TypeScript types for the Checkout system.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 * Following DATABASE_SPECIFICATION.md §4.5.5
 * Following REST_API_SPECIFICATION.md
 *
 * The Checkout Engine is the conversion engine connecting Cart, Inventory, Orders,
 * Shipping, Payments, Finance, Customer Accounts, Shop Owners, Admin Dashboard, and Analytics.
 */

import { z } from 'zod';

// ============================================================================
// CHECKOUT SESSION TYPES
// ============================================================================

export interface CheckoutSession {
  id: string;
  cartId: string;
  userId: string | null;
  status: CheckoutStatus;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  shippingRateId: string | null;
  shippingFee: number | null;
  totals: CheckoutTotals | null;
  couponCode: string | null;
  couponDiscount: number | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CheckoutStatus =
  | 'started'
  | 'address_entered'
  | 'payment_pending'
  | 'payment_processing'
  | 'completed'
  | 'abandoned'
  | 'expired';

export interface CheckoutTotals {
  itemsSubtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

// ============================================================================
// ADDRESS TYPES
// ============================================================================

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  addressType: AddressType;
  createdAt: Date;
  updatedAt: Date;
}

export type AddressType = 'shipping' | 'billing' | 'both';

export interface AddressInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType?: AddressType;
  isDefault?: boolean;
}

export interface AddressUpdateInput {
  id: string;
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  addressType?: AddressType;
  isDefault?: boolean;
}

// ============================================================================
// COUPON TYPES
// ============================================================================

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perCustomerLimit: number | null;
  validFrom: Date | null;
  validUntil: Date | null;
  isActive: boolean;
  applicableProducts: string[] | null;
  applicableCollections: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CouponDiscountType = 'percentage' | 'fixed' | 'free_shipping';

export interface CouponValidationResult {
  isValid: boolean;
  coupon: Coupon | null;
  discountAmount: number;
  appliedMessage: string | null;
  errorMessage: string | null;
  errorCodes: string[];
}

export interface CouponApplicationInput {
  code: string;
  cartId: string;
  userId?: string;
}

// ============================================================================
// TAX TYPES
// ============================================================================

export interface TaxCalculationResult {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  taxBreakdown: TaxBreakdown[];
  currency: string;
}

export interface TaxBreakdown {
  taxName: string;
  taxRate: number;
  taxAmount: number;
  isInclusive: boolean;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  type: TaxType;
  isInclusive: boolean;
  applicableRegions: string[];
  applicableCategories: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaxType = 'cgst' | 'sgst' | 'igst' | 'vat' | 'sales_tax';

// ============================================================================
// SHIPPING TYPES
// ============================================================================

export interface ShippingRate {
  id: string;
  name: string;
  description: string | null;
  baseRate: number;
  ratePerKg: number | null;
  freeAboveAmount: number | null;
  estimatedDays: number | null;
  isActive: boolean;
  applicableRegions: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingCalculationResult {
  availableRates: ShippingRate[];
  selectedRate: ShippingRate | null;
  shippingCost: number;
  estimatedDelivery: Date | null;
}

export interface PackageSummary {
  weight: number;
  volume: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  itemCount: number;
}

// ============================================================================
// ORDER SNAPSHOT TYPES
// ============================================================================

export interface OrderSnapshot {
  checkoutSessionId: string;
  customer: CustomerSnapshot;
  items: OrderItemSnapshot[];
  addresses: AddressSnapshot;
  pricing: PricingSnapshot;
  shipping: ShippingSnapshot;
  discount: DiscountSnapshot;
  tax: TaxSnapshot;
  totals: CheckoutTotals;
  currency: string;
  createdAt: Date;
  isImmutable: boolean;
}

export interface CustomerSnapshot {
  userId: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  isGuest: boolean;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  attributes: Record<string, string>;
  imageUrl: string | null;
  stockValidated: boolean;
  reservedStockId: string | null;
}

export interface AddressSnapshot {
  shipping: AddressInput | null;
  billing: AddressInput | null;
  useSameAddress: boolean;
}

export interface PricingSnapshot {
  itemsSubtotal: number;
  baseCurrency: string;
  exchangeRate: number;
  pricingTimestamp: Date;
}

export interface ShippingSnapshot {
  methodId: string | null;
  methodName: string | null;
  cost: number;
  estimatedDelivery: Date | null;
  packageSummary: PackageSummary;
}

export interface DiscountSnapshot {
  couponCode: string | null;
  discountType: CouponDiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  appliedAt: Date | null;
}

export interface TaxSnapshot {
  taxAmount: number;
  taxRate: number;
  taxBreakdown: TaxBreakdown[];
  isInclusive: boolean;
  taxRegion: string;
}

// ============================================================================
// CHECKOUT VALIDATION TYPES
// ============================================================================

export interface CheckoutValidationResult {
  isValid: boolean;
  canProceed: boolean;
  errors: CheckoutValidationError[];
  warnings: CheckoutValidationWarning[];
  inventoryValidated: boolean;
  pricingValidated: boolean;
  addressValidated: boolean;
}

export interface CheckoutValidationError {
  code: string;
  message: string;
  field?: string;
  itemId?: string;
  severity: 'error';
}

export interface CheckoutValidationWarning {
  code: string;
  message: string;
  field?: string;
  itemId?: string;
  severity: 'warning';
}

export interface InventoryValidationResult {
  isValid: boolean;
  items: InventoryValidationItem[];
  hasIssues: boolean;
}

export interface InventoryValidationItem {
  variantId: string;
  productId: string;
  requestedQuantity: number;
  availableStock: number;
  reservedStock: number;
  canFulfill: boolean;
  issue?:
    | 'out_of_stock'
    | 'insufficient_stock'
    | 'purchase_limit_exceeded'
    | 'product_inactive'
    | 'variant_inactive';
  message?: string;
}

// ============================================================================
// CHECKOUT OPERATION TYPES
// ============================================================================

export interface StartCheckoutInput {
  cartId: string;
  userId?: string;
  guestId?: string;
}

export interface UpdateCheckoutInput {
  checkoutSessionId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingRateId?: string;
  couponCode?: string | null;
}

export interface ValidateCheckoutInput {
  checkoutSessionId: string;
  validateInventory?: boolean;
  validatePricing?: boolean;
  validateAddress?: boolean;
}

export interface CompleteCheckoutInput {
  checkoutSessionId: string;
  paymentMethod: string;
  paymentToken?: string;
}

export interface ResumeCheckoutInput {
  checkoutSessionId: string;
  userId?: string;
  guestId?: string;
}

// ============================================================================
// CHECKOUT EVENT TYPES
// ============================================================================

export interface CheckoutEvent {
  eventType: CheckoutEventType;
  checkoutSessionId: string;
  userId: string | null;
  guestId: string | null;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export type CheckoutEventType =
  | 'checkout_started'
  | 'checkout_resumed'
  | 'address_added'
  | 'address_updated'
  | 'shipping_selected'
  | 'coupon_applied'
  | 'coupon_removed'
  | 'checkout_validated'
  | 'checkout_locked'
  | 'checkout_completed'
  | 'checkout_abandoned'
  | 'checkout_expired'
  | 'inventory_validation_failed'
  | 'pricing_validation_failed';

// ============================================================================
// CHECKOUT ANALYTICS TYPES
// ============================================================================

export interface CheckoutAnalytics {
  checkoutSessionId: string;
  userId: string | null;
  guestId: string | null;
  step: CheckoutStep;
  timeInStep: number;
  totalCartValue: number;
  itemCount: number;
  couponApplied: boolean;
  shippingMethod: string | null;
  timestamp: Date;
}

export type CheckoutStep =
  | 'started'
  | 'address'
  | 'shipping'
  | 'payment'
  | 'review'
  | 'completed'
  | 'abandoned';

export interface CheckoutConversionMetrics {
  totalStarted: number;
  totalCompleted: number;
  conversionRate: number;
  averageTimeToComplete: number;
  averageCartValue: number;
  abandonmentRate: number;
  stepDropoffs: Record<CheckoutStep, number>;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const addressSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  line1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(300, 'Address line 1 must be less than 300 characters'),
  line2: z
    .string()
    .max(300, 'Address line 2 must be less than 300 characters')
    .optional(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  country: z.string().default('IN'),
  addressType: z.enum(['shipping', 'billing', 'both']).optional(),
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = z.object({
  id: z.string().uuid('Invalid address ID'),
  name: z.string().min(1).max(200).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    .optional(),
  line1: z.string().min(1).max(300).optional(),
  line2: z.string().max(300).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Invalid pincode')
    .optional(),
  country: z.string().optional(),
  addressType: z.enum(['shipping', 'billing', 'both']).optional(),
  isDefault: z.boolean().optional(),
});

export const startCheckoutSchema = z
  .object({
    cartId: z.string().uuid('Invalid cart ID'),
    userId: z.string().uuid('Invalid user ID').optional(),
    guestId: z.string().optional(),
  })
  .refine((data) => data.userId !== undefined || data.guestId !== undefined, {
    message: 'Either userId or guestId must be provided',
  });

export const updateCheckoutSchema = z.object({
  checkoutSessionId: z.string().uuid('Invalid checkout session ID'),
  shippingAddressId: z.string().uuid('Invalid shipping address ID').optional(),
  billingAddressId: z.string().uuid('Invalid billing address ID').optional(),
  shippingRateId: z.string().uuid('Invalid shipping rate ID').optional(),
  couponCode: z.string().max(50).nullable().optional(),
});

export const validateCheckoutSchema = z.object({
  checkoutSessionId: z.string().uuid('Invalid checkout session ID'),
  validateInventory: z.boolean().optional(),
  validatePricing: z.boolean().optional(),
  validateAddress: z.boolean().optional(),
});

export const applyCouponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code must be less than 50 characters'),
  cartId: z.string().uuid('Invalid cart ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
});

export const removeCouponSchema = z.object({
  checkoutSessionId: z.string().uuid('Invalid checkout session ID'),
});

export const completeCheckoutSchema = z.object({
  checkoutSessionId: z.string().uuid('Invalid checkout session ID'),
  paymentMethod: z.enum(['razorpay']),
  paymentToken: z.string().optional(),
});

export const resumeCheckoutSchema = z.object({
  checkoutSessionId: z.string().uuid('Invalid checkout session ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
  guestId: z.string().optional(),
});

export const createOrderSchema = z.object({
  addressId: z.string().uuid('Invalid address ID').optional(),
  address: addressSchema.optional(),
  shippingMethodId: z.string().uuid('Invalid shipping method ID'),
  couponCode: z.string().max(50).optional(),
  paymentMethod: z.enum(['razorpay']),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface CheckoutSessionResponse {
  checkoutSession: CheckoutSession;
  cart: {
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      variantId: string;
      variantName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
    itemCount: number;
    itemsSubtotal: number;
  };
  validation: CheckoutValidationResult;
  canProceed: boolean;
}

export interface CheckoutSummaryResponse {
  checkoutSession: CheckoutSession;
  items: OrderItemSnapshot[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingRate: ShippingRate | null;
  coupon: Coupon | null;
  totals: CheckoutTotals;
  validation: CheckoutValidationResult;
}

export interface AddressListResponse {
  addresses: Address[];
  defaultAddress: Address | null;
}

export interface CouponValidationResponse {
  isValid: boolean;
  coupon: Coupon | null;
  discountAmount: number;
  message: string;
  appliedAt: Date | null;
}

export interface TaxCalculationResponse {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  taxBreakdown: TaxBreakdown[];
  currency: string;
}

export interface ShippingRatesResponse {
  availableRates: ShippingRate[];
  selectedRate: ShippingRate | null;
  shippingCost: number;
  estimatedDelivery: Date | null;
}
