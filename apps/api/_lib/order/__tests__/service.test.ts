/**
 * Order Service Tests
 *
 * Tests for the OrderService business logic layer.
 * Tests cover order creation, status transitions, inventory integration,
 * payment integration, and shipping integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Prisma client
const mockPrisma = {
  order: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  orderItem: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  payment: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  refund: {
    create: vi.fn(),
  },
  shipment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  stockReservation: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  stockMovement: {
    create: vi.fn(),
  },
  productVariant: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

import { OrderService } from '../service';

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createFromCheckout', () => {
    it('should create an order from checkout snapshot', async () => {
      const snapshot = {
        customer: { userId: 'user-123' },
        totals: {
          itemsSubtotal: 100,
          shippingTotal: 10,
          discountTotal: 0,
          taxTotal: 18,
          grandTotal: 128,
        },
        currency: 'INR',
        addresses: {
          shipping: {
            name: 'John Doe',
            line1: '123 Street',
            city: 'Mumbai',
            state: 'MH',
            pincode: '400001',
          },
          billing: {
            name: 'John Doe',
            line1: '123 Street',
            city: 'Mumbai',
            state: 'MH',
            pincode: '400001',
          },
        },
        paymentMethod: 'razorpay',
        paymentToken: 'pay-token-123',
        discount: { couponCode: 'SAVE10' },
        items: [
          {
            productId: 'prod-1',
            variantId: 'var-1',
            productName: 'Product 1',
            variantName: 'Variant 1',
            sku: 'SKU-001',
            unitPrice: 50,
            quantity: 2,
            lineTotal: 100,
            imageUrl: 'https://example.com/image.jpg',
          },
        ],
      };

      mockPrisma.order.findFirst.mockResolvedValue(null);
      mockPrisma.order.create.mockResolvedValue({
        id: 'order-123',
        orderNumber: 'NAB-20250105-000001',
      });
      mockPrisma.orderItem.create.mockResolvedValue({});
      mockPrisma.stockReservation.create.mockResolvedValue({});
      mockPrisma.stockMovement.create.mockResolvedValue({});

      const order = await OrderService.createFromCheckout(snapshot);

      expect(mockPrisma.order.create).toHaveBeenCalled();
      expect(mockPrisma.orderItem.create).toHaveBeenCalled();
      expect(order).toBeDefined();
    });

    it('should generate sequential order numbers', async () => {
      const snapshot = {
        customer: { userId: 'user-123' },
        totals: {
          itemsSubtotal: 100,
          shippingTotal: 10,
          discountTotal: 0,
          taxTotal: 18,
          grandTotal: 128,
        },
        currency: 'INR',
        addresses: {
          shipping: {
            name: 'John Doe',
            line1: '123 Street',
            city: 'Mumbai',
            state: 'MH',
            pincode: '400001',
          },
          billing: {
            name: 'John Doe',
            line1: '123 Street',
            city: 'Mumbai',
            state: 'MH',
            pincode: '400001',
          },
        },
        paymentMethod: 'razorpay',
        paymentToken: 'pay-token-123',
        discount: { couponCode: null },
        items: [],
      };

      mockPrisma.order.findFirst.mockResolvedValue({
        orderNumber: 'NAB-20250105-000001',
      });
      mockPrisma.order.create.mockResolvedValue({ id: 'order-123' });
      mockPrisma.orderItem.create.mockResolvedValue({});
      mockPrisma.stockReservation.create.mockResolvedValue({});
      mockPrisma.stockMovement.create.mockResolvedValue({});

      await OrderService.createFromCheckout(snapshot);

      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          orderNumber: {
            startsWith: expect.stringContaining('NAB-'),
          },
        },
        orderBy: {
          orderNumber: 'desc',
        },
        select: {
          orderNumber: true,
        },
      });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order and release inventory', async () => {
      const order = {
        id: 'order-123',
        items: [{ variantId: 'var-1', quantity: 2 }],
      };

      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        availableStock: 100,
        reservedStock: 10,
        lowStockThreshold: 5,
      });
      mockPrisma.productVariant.update.mockResolvedValue({});
      mockPrisma.stockMovement.create.mockResolvedValue({});
      mockPrisma.stockReservation.findFirst.mockResolvedValue({
        id: 'res-123',
      });
      mockPrisma.stockReservation.update.mockResolvedValue({});
      mockPrisma.order.update.mockResolvedValue({});

      const result = await OrderService.cancelOrder(
        'order-123',
        'Customer request',
        'user-123',
      );

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          status: 'cancelled',
          customerVisibleStatus: 'cancelled',
        },
      });
      expect(result).toBeDefined();
    });

    it('should throw error if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(
        OrderService.cancelOrder('order-123', 'reason', 'user-123'),
      ).rejects.toThrow('Order not found');
    });
  });

  describe('processRefund', () => {
    it('should process a refund and update order status', async () => {
      const order = {
        id: 'order-123',
        grandTotal: 128,
        currency: 'INR',
        items: [],
      };

      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.refund.create.mockResolvedValue({ id: 'refund-123' });
      mockPrisma.order.update.mockResolvedValue({});

      const result = await OrderService.processRefund(
        'order-123',
        128,
        'Customer request',
      );

      expect(mockPrisma.refund.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order-123',
          amount: 128,
          currency: 'INR',
          reason: 'Customer request',
          status: 'pending',
        },
      });
      expect(result.success).toBe(true);
      expect(result.refundId).toBe('refund-123');
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status and auto-transition order', async () => {
      const order = {
        id: 'order-123',
        grandTotal: 128,
        currency: 'INR',
      };

      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({});
      mockPrisma.order.update.mockResolvedValue({});

      await OrderService.updatePaymentStatus(
        'order-123',
        'pay-123',
        'completed',
      );

      expect(mockPrisma.payment.create).toHaveBeenCalled();
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          status: 'confirmed',
          customerVisibleStatus: 'confirmed',
        },
      });
    });

    it('should cancel order on payment failure', async () => {
      const order = {
        id: 'order-123',
        grandTotal: 128,
        currency: 'INR',
      };

      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({});
      mockPrisma.order.update.mockResolvedValue({});

      await OrderService.updatePaymentStatus('order-123', 'pay-123', 'failed');

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          status: 'cancelled',
          customerVisibleStatus: 'cancelled',
        },
      });
    });
  });

  describe('assignShipment', () => {
    it('should assign shipment to order and update status', async () => {
      const order = { id: 'order-123' };

      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.shipment.create.mockResolvedValue({ id: 'ship-123' });
      mockPrisma.order.update.mockResolvedValue({});

      const result = await OrderService.assignShipment(
        'order-123',
        'FedEx',
        'TRACK-123',
      );

      expect(mockPrisma.shipment.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order-123',
          carrier: 'FedEx',
          trackingNumber: 'TRACK-123',
          status: 'in_transit',
          shippedAt: expect.any(Date),
        },
      });
      expect(result.success).toBe(true);
      expect(result.shipmentId).toBe('ship-123');
    });
  });

  describe('confirmDelivery', () => {
    it('should confirm delivery and update order status', async () => {
      const shipment = {
        id: 'ship-123',
        orderId: 'order-123',
        order: { id: 'order-123' },
      };

      mockPrisma.shipment.findUnique.mockResolvedValue(shipment);
      mockPrisma.shipment.update.mockResolvedValue({});
      mockPrisma.order.update.mockResolvedValue({});

      await OrderService.confirmDelivery('ship-123');

      expect(mockPrisma.shipment.update).toHaveBeenCalledWith({
        where: { id: 'ship-123' },
        data: {
          status: 'delivered',
          deliveredAt: expect.any(Date),
        },
      });
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          status: 'delivered',
          customerVisibleStatus: 'delivered',
        },
      });
    });
  });
});
