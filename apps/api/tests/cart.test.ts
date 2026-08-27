/**
 * Cart Repository Tests
 *
 * Unit tests for the Cart Repository
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartRepository } from '../_lib/cart/repository';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    cartItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    productVariant: {
      findUnique: vi.fn(),
    },
  })),
}));

describe('CartRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should find cart items by user ID', async () => {
      const mockItems = [
        {
          id: '1',
          userId: 'user-1',
          productId: 'product-1',
          variantId: 'variant-1',
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 'product-1',
            name: 'Product 1',
            slug: 'product-1',
            status: 'active',
            basePrice: 100,
          },
          variant: {
            id: 'variant-1',
            name: 'Variant 1',
            sku: 'SKU-1',
            price: 100,
            compareAtPrice: null,
            availableStock: 10,
            reservedStock: 0,
            inventoryStatus: 'in_stock',
            attributes: {},
          },
        },
      ];

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.cartItem.findMany as any).mockResolvedValue(mockItems);

      const result = await CartRepository.findByUserId('user-1');

      expect(prisma.cartItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
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

      expect(result).toEqual(mockItems);
    });
  });

  describe('findByGuestId', () => {
    it('should find cart items by guest ID', async () => {
      const mockItems = [
        {
          id: '1',
          guestId: 'guest-1',
          productId: 'product-1',
          variantId: 'variant-1',
          quantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: 'product-1',
            name: 'Product 1',
            slug: 'product-1',
            status: 'active',
            basePrice: 100,
          },
          variant: {
            id: 'variant-1',
            name: 'Variant 1',
            sku: 'SKU-1',
            price: 100,
            compareAtPrice: null,
            availableStock: 10,
            reservedStock: 0,
            inventoryStatus: 'in_stock',
            attributes: {},
          },
        },
      ];

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.cartItem.findMany as any).mockResolvedValue(mockItems);

      const result = await CartRepository.findByGuestId('guest-1');

      expect(prisma.cartItem.findMany).toHaveBeenCalledWith({
        where: { guestId: 'guest-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(mockItems);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.cartItem.findFirst as any).mockResolvedValue(null);
      (prisma.productVariant.findUnique as any).mockResolvedValue({
        id: 'variant-1',
        price: 100,
        productId: 'product-1',
      });
      (prisma.cartItem.create as any).mockResolvedValue({
        id: '1',
        userId: 'user-1',
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 1,
      });

      const result = await CartRepository.addItem(
        'user-1',
        null,
        'variant-1',
        1,
      );

      expect(prisma.cartItem.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should update quantity if item already exists', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.cartItem.findFirst as any).mockResolvedValue({
        id: '1',
        quantity: 1,
      });
      (prisma.cartItem.update as any).mockResolvedValue({
        id: '1',
        quantity: 2,
      });

      const result = await CartRepository.addItem(
        'user-1',
        null,
        'variant-1',
        1,
      );

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { quantity: 2 },
      });
    });
  });

  describe('updateItemQuantity', () => {
    it('should update cart item quantity', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.cartItem.update as any).mockResolvedValue({
        id: '1',
        quantity: 5,
      });

      const result = await CartRepository.updateItemQuantity('1', 5);

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { quantity: 5 },
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.cartItem.delete as any).mockResolvedValue({
        id: '1',
      });

      const result = await CartRepository.removeItem('1');

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('clearCart', () => {
    it('should clear all items for user', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.cartItem.deleteMany as any).mockResolvedValue({ count: 5 });

      const result = await CartRepository.clearCart('user-1', null);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', guestId: null },
      });
    });
  });

  describe('getCartCount', () => {
    it('should return cart item count', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.cartItem.count as any).mockResolvedValue(3);

      const result = await CartRepository.getCartCount('user-1');

      expect(prisma.cartItem.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toBe(3);
    });
  });
});
