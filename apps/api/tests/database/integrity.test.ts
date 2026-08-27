/**
 * Database Integrity Tests
 *
 * Tests for data integrity constraints, including:
 * - Check constraints (non-negative monetary values, stock constraints)
 * - Foreign key constraints
 * - Unique constraints
 * - Transaction safety
 * - Concurrency control
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Integrity', () => {
  let testUserId: string;
  let testShopId: string;
  let testProductId: string;
  let testVariantId: string;
  let testOrderId: string;

  beforeAll(async () => {
    // Setup test data
    const user = await prisma.user.create({
      data: {
        email: `test-integrity-${Date.now()}@test.com`,
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        emailVerifiedAt: new Date(),
        locale: 'en-IN',
      },
    });
    testUserId = user.id;

    const shop = await prisma.shop.create({
      data: {
        ownerId: testUserId,
        name: 'Test Shop',
        slug: `test-shop-${Date.now()}`,
        status: 'active',
      },
    });
    testShopId = shop.id;

    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: `test-category-${Date.now()}`,
        description: 'Test category for integrity tests',
      },
    });

    const product = await prisma.product.create({
      data: {
        categoryId: category.id,
        shopId: testShopId,
        name: 'Test Product',
        slug: `test-product-${Date.now()}`,
        shortDescription: 'Test product',
        status: 'published',
        basePrice: 100,
      },
    });
    testProductId = product.id;

    const variant = await prisma.productVariant.create({
      data: {
        productId: testProductId,
        sku: `TEST-SKU-${Date.now()}`,
        name: 'Test Variant',
        price: 100,
        availableStock: 50,
        reservedStock: 0,
        inventoryStatus: 'in_stock',
      },
    });
    testVariantId = variant.id;
  });

  afterAll(async () => {
    // Cleanup test data - must delete in reverse dependency order due to RESTRICT constraints
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { order: { userId: testUserId } } }),
      prisma.order.deleteMany({ where: { userId: testUserId } }),
      prisma.productVariant.deleteMany({ where: { productId: testProductId } }),
      prisma.product.deleteMany({ where: { id: testProductId } }),
      prisma.shop.deleteMany({ where: { id: testShopId } }),
      prisma.address.deleteMany({ where: { userId: testUserId } }),
      prisma.user.deleteMany({ where: { id: testUserId } }),
      prisma.category.deleteMany({
        where: { slug: { startsWith: 'test-category-' } },
      }),
    ]);
    await prisma.$disconnect();
  });

  describe('Check Constraints - Monetary Fields', () => {
    it('should reject negative basePrice in Product', async () => {
      await expect(
        prisma.product.create({
          data: {
            categoryId: (await prisma.category.findFirst({
              where: { slug: { startsWith: 'test-category-' } },
            }))!.id,
            shopId: testShopId,
            name: 'Invalid Product',
            slug: `invalid-${Date.now()}`,
            shortDescription: 'Test',
            status: 'published',
            basePrice: -10,
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject negative price in ProductVariant', async () => {
      await expect(
        prisma.productVariant.create({
          data: {
            productId: testProductId,
            sku: `INVALID-${Date.now()}`,
            name: 'Invalid Variant',
            price: -50,
            availableStock: 10,
            inventoryStatus: 'in_stock',
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject negative quantity in OrderItem', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: `TEST-ORD-${Date.now()}`,
          userId: testUserId,
          shopId: testShopId,
          status: 'pending',
          customerVisibleStatus: 'pending',
          paymentStatus: 'pending',
          itemsSubtotal: 100,
          shippingTotal: 0,
          discountTotal: 0,
          taxTotal: 0,
          grandTotal: 100,
          currency: 'INR',
        },
      });

      await expect(
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: testProductId,
            variantId: testVariantId,
            productName: 'Test',
            variantName: 'Test',
            sku: 'TEST',
            unitPrice: 100,
            quantity: -1,
            lineTotal: -100,
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject negative amount in Payment', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: `TEST-ORD-${Date.now()}`,
          userId: testUserId,
          shopId: testShopId,
          status: 'pending',
          customerVisibleStatus: 'pending',
          paymentStatus: 'pending',
          itemsSubtotal: 100,
          shippingTotal: 0,
          discountTotal: 0,
          taxTotal: 0,
          grandTotal: 100,
          currency: 'INR',
        },
      });

      await expect(
        prisma.payment.create({
          data: {
            orderId: order.id,
            method: 'card',
            status: 'pending',
            amount: -100,
            currency: 'INR',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('Check Constraints - Stock Integrity', () => {
    it('should reject negative availableStock', async () => {
      await expect(
        prisma.productVariant.create({
          data: {
            productId: testProductId,
            sku: `INVALID-STOCK-${Date.now()}`,
            name: 'Invalid Stock',
            price: 100,
            availableStock: -10,
            inventoryStatus: 'in_stock',
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject negative reservedStock', async () => {
      await expect(
        prisma.productVariant.create({
          data: {
            productId: testProductId,
            sku: `INVALID-RESERVED-${Date.now()}`,
            name: 'Invalid Reserved',
            price: 100,
            availableStock: 10,
            reservedStock: -5,
            inventoryStatus: 'in_stock',
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject reservedStock > availableStock', async () => {
      await expect(
        prisma.productVariant.create({
          data: {
            productId: testProductId,
            sku: `INVALID-RESERVE-${Date.now()}`,
            name: 'Invalid Reserve',
            price: 100,
            availableStock: 10,
            reservedStock: 15,
            inventoryStatus: 'in_stock',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('Transaction Safety', () => {
    it('should rollback order creation on failure', async () => {
      const initialOrderCount = await prisma.order.count({
        where: { userId: testUserId },
      });

      try {
        await prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              orderNumber: `TEST-ROLLBACK-${Date.now()}`,
              userId: testUserId,
              shopId: testShopId,
              status: 'pending',
              customerVisibleStatus: 'pending',
              paymentStatus: 'pending',
              itemsSubtotal: 100,
              shippingTotal: 0,
              discountTotal: 0,
              taxTotal: 0,
              grandTotal: 100,
              currency: 'INR',
            },
          });

          // This will fail due to check constraint
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: testProductId,
              variantId: testVariantId,
              productName: 'Test',
              variantName: 'Test',
              sku: 'TEST',
              unitPrice: 100,
              quantity: -1,
              lineTotal: -100,
            },
          });
        });
      } catch (error) {
        // Expected to fail
      }

      const finalOrderCount = await prisma.order.count({
        where: { userId: testUserId },
      });
      expect(finalOrderCount).toBe(initialOrderCount);
    });

    it('should commit successful transaction', async () => {
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber: `TEST-SUCCESS-${Date.now()}`,
            userId: testUserId,
            shopId: testShopId,
            status: 'pending',
            customerVisibleStatus: 'pending',
            paymentStatus: 'pending',
            itemsSubtotal: 100,
            shippingTotal: 0,
            discountTotal: 0,
            taxTotal: 0,
            grandTotal: 100,
            currency: 'INR',
          },
        });

        const item = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: testProductId,
            variantId: testVariantId,
            productName: 'Test',
            variantName: 'Test',
            sku: 'TEST',
            unitPrice: 100,
            quantity: 1,
            lineTotal: 100,
          },
        });

        return { orderId: order.id, itemId: item.id };
      });

      expect(result.orderId).toBeDefined();
      expect(result.itemId).toBeDefined();

      // Verify data was committed
      const order = await prisma.order.findUnique({
        where: { id: result.orderId },
      });
      expect(order).not.toBeNull();

      // Cleanup
      await prisma.orderItem.delete({ where: { id: result.itemId } });
      await prisma.order.delete({ where: { id: result.orderId } });
    });
  });

  describe('Optimistic Concurrency', () => {
    it('should have version field on ProductVariant', async () => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
        select: { version: true },
      });

      expect(variant).toBeDefined();
      expect(variant!.version).toBeGreaterThanOrEqual(0);
    });

    it('should increment version on update', async () => {
      const before = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
        select: { version: true },
      });

      await prisma.productVariant.update({
        where: { id: testVariantId },
        data: { availableStock: 45 },
      });

      const after = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
        select: { version: true },
      });

      expect(after!.version).toBe(before!.version + 1);
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should reject order with non-existent user', async () => {
      await expect(
        prisma.order.create({
          data: {
            orderNumber: `TEST-FK-${Date.now()}`,
            userId: '00000000-0000-0000-0000-000000000000',
            shopId: testShopId,
            status: 'pending',
            customerVisibleStatus: 'pending',
            paymentStatus: 'pending',
            itemsSubtotal: 100,
            shippingTotal: 0,
            discountTotal: 0,
            taxTotal: 0,
            grandTotal: 100,
            currency: 'INR',
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject orderItem with non-existent product', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: `TEST-FK2-${Date.now()}`,
          userId: testUserId,
          shopId: testShopId,
          status: 'pending',
          customerVisibleStatus: 'pending',
          paymentStatus: 'pending',
          itemsSubtotal: 100,
          shippingTotal: 0,
          discountTotal: 0,
          taxTotal: 0,
          grandTotal: 100,
          currency: 'INR',
        },
      });

      await expect(
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: '00000000-0000-0000-0000-000000000000',
            variantId: testVariantId,
            productName: 'Test',
            variantName: 'Test',
            sku: 'TEST',
            unitPrice: 100,
            quantity: 1,
            lineTotal: 100,
          },
        }),
      ).rejects.toThrow();

      await prisma.order.delete({ where: { id: order.id } });
    });
  });
});
