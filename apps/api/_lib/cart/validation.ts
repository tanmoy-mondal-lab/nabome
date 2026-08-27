/**
 * Cart Validation Service
 *
 * Validates cart items against:
 * - Product existence and status
 * - Variant existence and availability
 * - Inventory availability
 * - Purchase limits
 * - Pricing integrity
 *
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §5
 */

import { CartRepository } from './repository';
import type {
  CartValidationResult,
  CartValidationError,
  CartValidationWarning,
} from './types';

export class CartValidationService {
  /**
   * Validate entire cart
   */
  static async validateCart(
    userId: string | null,
    guestId: string | null | undefined,
  ): Promise<CartValidationResult> {
    const items = userId
      ? await CartRepository.findByUserId(userId)
      : await CartRepository.findByGuestId(guestId!);

    const errors: CartValidationError[] = [];
    const warnings: CartValidationWarning[] = [];
    const updatedItems: any[] = [];

    for (const item of items) {
      const itemValidation = await this.validateCartItem(item);
      errors.push(...itemValidation.errors);
      warnings.push(...itemValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      updatedItems,
    };
  }

  /**
   * Validate single cart item
   */
  static async validateCartItem(item: any): Promise<{
    errors: CartValidationError[];
    warnings: CartValidationWarning[];
  }> {
    const errors: CartValidationError[] = [];
    const warnings: CartValidationWarning[] = [];

    // Validate product exists and is active
    if (!item.product) {
      errors.push({
        itemId: item.id,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
        severity: 'error',
      });
      return { errors, warnings };
    }

    if (
      item.product.status !== 'active' &&
      item.product.status !== 'published'
    ) {
      errors.push({
        itemId: item.id,
        code: 'PRODUCT_NOT_AVAILABLE',
        message: 'Product is not available',
        severity: 'error',
      });
    }

    // Validate variant exists
    if (!item.variant) {
      errors.push({
        itemId: item.id,
        code: 'VARIANT_NOT_FOUND',
        message: 'Variant not found',
        severity: 'error',
      });
      return { errors, warnings };
    }

    // Validate variant is active (check inventory status instead)
    if (item.variant.inventoryStatus === 'out_of_stock') {
      errors.push({
        itemId: item.id,
        code: 'VARIANT_NOT_AVAILABLE',
        message: 'Variant is not available',
        severity: 'error',
      });
    }

    // Validate inventory
    const availableStock =
      item.variant.availableStock - item.variant.reservedStock;
    if (availableStock <= 0) {
      errors.push({
        itemId: item.id,
        code: 'OUT_OF_STOCK',
        message: 'Item is out of stock',
        severity: 'error',
      });
    } else if (item.quantity > availableStock) {
      errors.push({
        itemId: item.id,
        code: 'INSUFFICIENT_STOCK',
        message: `Only ${availableStock} items available`,
        severity: 'error',
      });
    } else if (availableStock <= 10) {
      warnings.push({
        itemId: item.id,
        code: 'LOW_STOCK',
        message: `Only ${availableStock} items left`,
        severity: 'warning',
      });
    }

    // Validate quantity limits
    if (item.quantity > 10) {
      errors.push({
        itemId: item.id,
        code: 'QUANTITY_LIMIT_EXCEEDED',
        message: 'Maximum quantity is 10',
        severity: 'error',
      });
    }

    // Validate pricing
    if (item.variant.price <= 0) {
      errors.push({
        itemId: item.id,
        code: 'INVALID_PRICE',
        message: 'Invalid price',
        severity: 'error',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate variant availability before adding to cart
   */
  static async validateVariantAvailability(
    variantId: string,
    quantity: number,
  ): Promise<{
    valid: boolean;
    error?: string;
  }> {
    const variant = await CartRepository.findItemById(variantId);

    if (!variant) {
      return { valid: false, error: 'Variant not found' };
    }

    if (variant.variant.inventoryStatus === 'out_of_stock') {
      return { valid: false, error: 'Variant is not available' };
    }

    const availableStock =
      variant.variant.availableStock - variant.variant.reservedStock;
    if (availableStock < quantity) {
      return { valid: false, error: `Only ${availableStock} items available` };
    }

    if (quantity > 10) {
      return { valid: false, error: 'Maximum quantity is 10' };
    }

    return { valid: true };
  }
}
