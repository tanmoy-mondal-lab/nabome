/**
 * Cart Types and Interfaces
 *
 * This file defines all TypeScript types for the Cart system.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §2
 *
 * Simplified model: CartItem has userId/guestId directly (no separate Cart model)
 */

import { z } from 'zod';

// ============================================================================
// CART ITEM TYPES
// ============================================================================

export interface CartItem {
  id: string;
  userId: string | null;
  guestId: string | null;
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
  addedAt: Date;
  updatedAt: Date;
}

export interface PriceSnapshot {
  price: number;
  compareAtPrice: number | null;
  currency: string;
  timestamp: Date;
}

export interface VariantSnapshot {
  id: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  imageUrl: string | null;
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
  userId?: string;
  guestId?: string;
}

export interface MergeCartInput {
  guestId: string;
  userId: string;
}

export interface ValidateCartInput {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
}

// ============================================================================
// CART SYNC TYPES
// ============================================================================

export interface CartSyncResult {
  merged: boolean;
  itemsAdded: number;
  itemsUpdated: number;
  itemsRemoved: number;
  conflicts: CartConflict[];
}

export interface CartConflict {
  variantId: string;
  localQuantity: number;
  serverQuantity: number;
  resolvedQuantity: number;
  resolution: 'local' | 'server' | 'sum';
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const addToCartSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Minimum quantity is 1')
    .max(10, 'Maximum quantity is 10'),
});

export const updateCartItemSchema = z
  .object({
    itemId: z.string().uuid('Invalid cart item ID'),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Minimum quantity is 1')
      .max(10, 'Maximum quantity is 10')
      .optional(),
    variantId: z.string().uuid('Invalid variant ID').optional(),
  })
  .refine(
    (data) => data.quantity !== undefined || data.variantId !== undefined,
    {
      message: 'Either quantity or variantId must be provided',
    },
  );

export const removeCartItemSchema = z.object({
  itemId: z.string().uuid('Invalid cart item ID'),
});

export const clearCartSchema = z
  .object({
    userId: z.string().uuid('Invalid user ID').optional(),
    guestId: z.string().optional(),
  })
  .refine((data) => data.userId !== undefined || data.guestId !== undefined, {
    message: 'Either userId or guestId must be provided',
  });

export const mergeCartSchema = z.object({
  guestId: z.string(),
  userId: z.string().uuid('Invalid user ID'),
});

export const validateCartSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().uuid('Invalid variant ID'),
        quantity: z
          .number()
          .int('Quantity must be an integer')
          .min(1, 'Minimum quantity is 1'),
      }),
    )
    .min(1, 'Cart must have at least one item'),
});

// ============================================================================
// CART EVENT TYPES
// ============================================================================

export interface CartEvent {
  eventType: CartEventType;
  userId: string | null;
  guestId: string | null;
  itemId?: string;
  variantId?: string;
  quantity?: number;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export type CartEventType =
  | 'item_added'
  | 'item_removed'
  | 'quantity_updated'
  | 'variant_changed'
  | 'cart_merged'
  | 'cart_synced'
  | 'cart_cleared'
  | 'cart_validated'
  | 'checkout_started';

// ============================================================================
// CART ANALYTICS TYPES
// ============================================================================

export interface CartAnalytics {
  userId: string | null;
  guestId: string | null;
  itemCount: number;
  totalValue: number;
  averageItemPrice: number;
  topCategories: string[];
  lastActivityAt: Date;
  timeSinceLastActivity: number;
}

export interface CartAbandonmentMetrics {
  totalAbandoned: number;
  recovered: number;
  recoveryRate: number;
  averageTimeToRecovery: number;
  averageCartValue: number;
}
