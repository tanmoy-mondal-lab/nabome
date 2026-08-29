/**
 * Cart Repository
 *
 * Data access layer for cart operations.
 * Following DATABASE_ARCHITECTURE.md and SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md
 *
 * This repository handles all database operations for cart items.
 * The simplified model uses userId/guestId directly on CartItem.
 * Business logic is handled by the Cart Service, not here.
 *
 * Note: This repository returns raw Prisma types. Transformation to domain types
 * happens in the Cart Service layer.
 */

import { getPrisma } from '../prisma.ts';

const prisma = new Proxy({} as any, {
  get(_target: unknown, prop: string | symbol) {
    return (getPrisma() as any)[prop];
  },
});

// ============================================================================
// CART ITEM REPOSITORY
// ============================================================================

export class CartRepository {
  /**
   * Find cart items by user ID
   */
  static async findByUserId(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            basePrice: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            availableStock: true,
            reservedStock: true,
            inventoryStatus: true,
            attributes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find cart items by guest ID
   */
  static async findByGuestId(guestId: string) {
    return prisma.cartItem.findMany({
      where: { guestId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            basePrice: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            availableStock: true,
            reservedStock: true,
            inventoryStatus: true,
            attributes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Add item to cart
   */
  static async addItem(
    userId: string | null,
    guestId: string | null,
    variantId: string,
    quantity: number,
  ) {
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: userId || null,
        guestId: guestId || null,
        variantId,
      },
    });

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = Math.min(existingItem.quantity + quantity, 10);
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    }

    // Get variant and product
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { price: true, productId: true },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    // Create new cart item
    return prisma.cartItem.create({
      data: {
        userId,
        guestId,
        productId: variant.productId,
        variantId,
        quantity,
      },
    });
  }

  /**
   * Update cart item quantity
   */
  static async updateItemQuantity(itemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  /**
   * Update cart item variant
   */
  static async updateItemVariant(itemId: string, variantId: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { variantId, productId: variant.productId },
    });
  }

  /**
   * Remove item from cart
   */
  static async removeItem(itemId: string) {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Clear all items for user/guest
   */
  static async clearCart(userId: string | null, guestId: string | null) {
    return prisma.cartItem.deleteMany({
      where: {
        userId,
        guestId,
      },
    });
  }

  /**
   * Get cart item by ID
   */
  static async findItemById(itemId: string) {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            basePrice: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            availableStock: true,
            reservedStock: true,
            inventoryStatus: true,
            attributes: true,
          },
        },
      },
    });
  }

  /**
   * Get cart count for user
   */
  static async getCartCount(userId: string) {
    return prisma.cartItem.count({
      where: { userId },
    });
  }

  /**
   * Merge guest cart into user cart
   */
  static async mergeCart(guestId: string, userId: string) {
    const guestItems = await this.findByGuestId(guestId);

    for (const guestItem of guestItems) {
      // Check if user already has this variant
      const existingUserItem = await prisma.cartItem.findFirst({
        where: {
          userId,
          variantId: guestItem.variantId,
        },
      });

      if (existingUserItem) {
        // Merge quantities
        const newQuantity = Math.min(
          existingUserItem.quantity + guestItem.quantity,
          10,
        );
        await this.updateItemQuantity(existingUserItem.id, newQuantity);
      } else {
        // Add item to user cart
        await this.addItem(
          userId,
          null,
          guestItem.variantId,
          guestItem.quantity,
        );
      }
    }

    // Delete all guest items
    await prisma.cartItem.deleteMany({
      where: { guestId },
    });

    // Return updated user cart
    return this.findByUserId(userId);
  }

  /**
   * Clean up expired guest carts (older than 90 days)
   */
  static async cleanupExpiredGuestCarts() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return prisma.cartItem.deleteMany({
      where: {
        guestId: { not: null },
        userId: null,
        createdAt: { lte: ninetyDaysAgo },
      },
    });
  }
}
