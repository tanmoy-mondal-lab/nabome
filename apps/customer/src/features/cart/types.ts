/**
 * Frontend Cart Types
 *
 * This file defines TypeScript types for the cart feature on the frontend.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §2
 */

// ============================================================================
// CART ITEM TYPES
// ============================================================================

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  priceSnapshot: PriceSnapshot | null;
  variantSnapshot: VariantSnapshot | null;
  reservedStock: number;
  reservationId: string | null;
  isActive: boolean;
  addedAt: string;
  updatedAt: string;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    basePrice: number;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    availableStock: number;
    reservedStock: number;
    inventoryStatus: string;
    attributes: Record<string, string> | null;
  };
  media: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface Cart {
  items: CartItemWithProduct[];
  itemCount: number;
  itemsSubtotal: number;
  currency: string;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}

export interface CartTotals {
  itemsSubtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  currency: string;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: CartValidationError[];
  warnings: CartValidationWarning[];
  updatedItems: CartItem[];
}

export interface CartValidationError {
  itemId: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CartValidationWarning {
  itemId: string;
  code: string;
  message: string;
  severity: 'warning';
}

// ============================================================================
// PRICE SNAPSHOT TYPES
// ============================================================================

export interface PriceSnapshot {
  price: number;
  compareAtPrice: number | null;
  currency: string;
  timestamp: string;
}

export interface VariantSnapshot {
  id: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  imageUrl: string | null;
}

// ============================================================================
// CART OPERATION TYPES
// ============================================================================

export interface AddToCartInput {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  itemId: string;
  quantity?: number;
  variantId?: string;
}

export interface RemoveCartItemInput {
  itemId: string;
}

export interface ClearCartInput {
  cartId: string;
}

// ============================================================================
// CART UI STATE TYPES
// ============================================================================

export interface CartUIState {
  isMiniCartOpen: boolean;
  isCartDrawerOpen: boolean;
  isUpdating: boolean;
  updatingItemId: string | null;
  validationErrors: CartValidationError[];
  lastActivityAt: string | null;
}

export interface CartOptimisticUpdate {
  itemId: string;
  previousQuantity: number;
  newQuantity: number;
  timestamp: number;
}

// ============================================================================
// CART ANALYTICS TYPES
// ============================================================================

export interface CartAnalyticsEvent {
  event: string;
  cartId: string;
  itemId?: string;
  variantId?: string;
  quantity?: number;
  value?: number;
  currency?: string;
  timestamp: number;
}

export type CartEventType =
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'update_quantity'
  | 'change_variant'
  | 'view_cart'
  | 'begin_checkout'
  | 'cart_abandoned'
  | 'cart_recovered';
