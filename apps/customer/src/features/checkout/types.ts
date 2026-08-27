/**
 * Frontend Checkout Types
 *
 * This file defines TypeScript types for the checkout feature on the frontend.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 * Following DATABASE_SPECIFICATION.md §4.5.5
 *
 * The Checkout Engine is the conversion engine connecting Cart, Inventory, Orders,
 * Shipping, Payments, Finance, Customer Accounts, Shop Owners, Admin Dashboard, and Analytics.
 */

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
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  applicableProducts: string[] | null;
  applicableCollections: string[] | null;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ShippingCalculationResult {
  availableRates: ShippingRate[];
  selectedRate: ShippingRate | null;
  shippingCost: number;
  estimatedDelivery: string | null;
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
  createdAt: string;
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
  pricingTimestamp: string;
}

export interface ShippingSnapshot {
  methodId: string | null;
  methodName: string | null;
  cost: number;
  estimatedDelivery: string | null;
  packageSummary: PackageSummary;
}

export interface DiscountSnapshot {
  couponCode: string | null;
  discountType: CouponDiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  appliedAt: string | null;
}

export interface TaxSnapshot {
  taxAmount: number;
  taxRate: number;
  taxBreakdown: TaxBreakdown[];
  isInclusive: boolean;
  taxRegion: string;
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
// CHECKOUT UI STATE TYPES
// ============================================================================

export interface CheckoutUIState {
  currentStep: CheckoutStep;
  isProcessing: boolean;
  isSubmitting: boolean;
  validationErrors: CheckoutValidationError[];
  selectedAddressId: string | null;
  selectedShippingRateId: string | null;
  appliedCoupon: Coupon | null;
  useSameAddress: boolean;
  showAddressForm: boolean;
  editingAddressId: string | null;
  lastActivityAt: string | null;
}

export type CheckoutStep =
  'address' | 'shipping' | 'payment' | 'review' | 'confirmation';

export interface CheckoutFormState {
  address: AddressInput;
  paymentMethod: 'razorpay';
  saveAddress: boolean;
  termsAccepted: boolean;
}

// ============================================================================
// CHECKOUT ANALYTICS TYPES
// ============================================================================

export interface CheckoutAnalyticsEvent {
  event: string;
  checkoutSessionId: string;
  step?: CheckoutStep;
  value?: number;
  currency?: string;
  couponCode?: string;
  shippingMethod?: string;
  timestamp: number;
}

export type CheckoutEventType =
  | 'checkout_started'
  | 'checkout_step_viewed'
  | 'address_added'
  | 'address_selected'
  | 'shipping_selected'
  | 'coupon_applied'
  | 'coupon_removed'
  | 'payment_initiated'
  | 'payment_completed'
  | 'checkout_completed'
  | 'checkout_abandoned';

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
  appliedAt: string | null;
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
  estimatedDelivery: string | null;
}
