/**
 * Order API Handler Tests
 *
 * Tests for the Order API endpoints.
 * Tests cover customer, shop owner, and admin endpoints.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  handleGetCustomerOrders,
  handleGetOrder,
  handleGetOrderTimeline,
  handleCancelOrder,
  handleCreateOrderFromCheckout,
} from '../index';

// Mock dependencies
vi.mock('../../../_lib/order/service.ts', () => ({
  OrderService: {
    getOrderById: vi.fn(),
    getUserOrders: vi.fn(),
    getOrderTimeline: vi.fn(),
    cancelOrder: vi.fn(),
    createFromCheckout: vi.fn(),
  },
}));

vi.mock('../../../_lib/checkout/service.ts', () => ({
  CheckoutService: {
    getCheckoutSessionResponse: vi.fn(),
    completeCheckout: vi.fn(),
  },
}));

import { OrderService } from '../../../_lib/order/service';
import { CheckoutService } from '../../../_lib/checkout/service';

function createMockContext(
  overrides: Partial<import('../../../_lib/http/context').RequestContext> = {},
): import('../../../_lib/http/context').RequestContext {
  return {
    env: {} as any,
    requestId: 'req-123',
    origin: null,
    accessToken: null,
    isMutation: false,
    method: 'GET',
    meta: { requestId: 'req-123', version: '1.0.0' },
    ...overrides,
  } as import('../../../_lib/http/context').RequestContext;
}

describe('Order API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleGetCustomerOrders', () => {
    it('should return customer orders', async () => {
      const mockOrders = [
        { id: 'order-1', orderNumber: 'NAB-20250105-000001' },
        { id: 'order-2', orderNumber: 'NAB-20250105-000002' },
      ];

      vi.mocked(OrderService.getUserOrders).mockResolvedValue(mockOrders);

      const request = new Request('http://localhost/api/v1/orders?limit=10');
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleGetCustomerOrders(request, context, {});
      const data = (await response.json()) as any;

      expect(data.orders).toEqual(mockOrders);
      expect(data.total).toBe(2);
    });

    it('should handle pagination parameters', async () => {
      vi.mocked(OrderService.getUserOrders).mockResolvedValue([]);

      const request = new Request(
        'http://localhost/api/v1/orders?limit=20&offset=0',
      );
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      await handleGetCustomerOrders(request, context, {});

      expect(OrderService.getUserOrders).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          limit: 20,
          offset: 0,
        }),
      );
    });
  });

  describe('handleGetOrder', () => {
    it('should return order details', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'NAB-20250105-000001',
        userId: 'user-123',
        status: 'confirmed',
      };

      vi.mocked(OrderService.getOrderById).mockResolvedValue(mockOrder);

      const request = new Request('http://localhost/api/v1/orders/order-123');
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleGetOrder(request, context, {
        id: 'order-123',
      });
      const data = (await response.json()) as any;

      expect(data.order).toEqual(mockOrder);
    });

    it('should return 404 if order not found', async () => {
      vi.mocked(OrderService.getOrderById).mockResolvedValue(null);

      const request = new Request('http://localhost/api/v1/orders/order-123');
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleGetOrder(request, context, {
        id: 'order-123',
      });
      const data = (await response.json()) as any;

      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 if user does not own the order', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'NAB-20250105-000001',
        userId: 'user-456',
        status: 'confirmed',
      };

      vi.mocked(OrderService.getOrderById).mockResolvedValue(mockOrder);

      const request = new Request('http://localhost/api/v1/orders/order-123');
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleGetOrder(request, context, {
        id: 'order-123',
      });
      const data = (await response.json()) as any;

      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('handleGetOrderTimeline', () => {
    it('should return order timeline', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
      };

      const mockTimeline = {
        orderId: 'order-123',
        events: [
          {
            type: 'order_created',
            description: 'Order created',
            occurredAt: '2025-01-05T10:00:00Z',
          },
        ],
        totalEvents: 1,
      };

      vi.mocked(OrderService.getOrderById).mockResolvedValue(mockOrder);
      vi.mocked(OrderService.getOrderTimeline).mockResolvedValue(mockTimeline);

      const request = new Request(
        'http://localhost/api/v1/orders/order-123/timeline',
      );
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleGetOrderTimeline(request, context, {
        id: 'order-123',
      });
      const data = (await response.json()) as any;

      expect(data.timeline).toEqual(mockTimeline);
    });
  });

  describe('handleCancelOrder', () => {
    it('should cancel an order', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
      };

      vi.mocked(OrderService.getOrderById).mockResolvedValue(mockOrder);
      vi.mocked(OrderService.cancelOrder).mockResolvedValue({ success: true });

      const request = new Request(
        'http://localhost/api/v1/orders/order-123/cancel',
        {
          method: 'POST',
          body: JSON.stringify({ reason: 'Customer request' }),
        },
      );
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleCancelOrder(request, context, {
        id: 'order-123',
      });
      const data = (await response.json()) as any;

      expect(data.success).toBe(true);
      expect(OrderService.cancelOrder).toHaveBeenCalledWith(
        'order-123',
        'Customer request',
        'user-123',
      );
    });

    it('should return error if cancel fails', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
      };

      vi.mocked(OrderService.getOrderById).mockResolvedValue(mockOrder);
      vi.mocked(OrderService.cancelOrder).mockResolvedValue({
        success: false,
        error: 'Cannot cancel shipped order',
      });

      const request = new Request(
        'http://localhost/api/v1/orders/order-123/cancel',
        {
          method: 'POST',
          body: JSON.stringify({ reason: 'Customer request' }),
        },
      );
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleCancelOrder(request, context, {
        id: 'order-123',
      });
      const data = (await response.json()) as any;

      expect(data.error).toBeDefined();
    });
  });

  describe('handleCreateOrderFromCheckout', () => {
    it('should create order from checkout snapshot', async () => {
      const mockCheckoutResponse = {
        checkoutSession: {
          id: 'checkout-123',
          status: 'completed',
        },
      };

      const mockSnapshot = {
        customer: { userId: 'user-123' },
        totals: { grandTotal: 128 },
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
        paymentToken: 'pay-123',
        discount: { couponCode: null },
        items: [],
      };

      const mockOrder = {
        id: 'order-123',
        orderNumber: 'NAB-20250105-000001',
      };

      vi.mocked(CheckoutService.getCheckoutSessionResponse).mockResolvedValue(
        mockCheckoutResponse as any,
      );
      vi.mocked(CheckoutService.completeCheckout).mockResolvedValue(
        mockSnapshot as any,
      );
      vi.mocked(OrderService.createFromCheckout).mockResolvedValue(
        mockOrder as any,
      );

      const request = new Request(
        'http://localhost/api/v1/orders/create-from-checkout',
        {
          method: 'POST',
          body: JSON.stringify({
            checkoutSessionId: 'checkout-123',
            paymentMethod: 'razorpay',
            paymentToken: 'pay-123',
          }),
        },
      );
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleCreateOrderFromCheckout(
        request,
        context,
        {},
      );
      const data = (await response.json()) as any;

      expect(data.order).toEqual(mockOrder);
      expect(CheckoutService.completeCheckout).toHaveBeenCalled();
      expect(OrderService.createFromCheckout).toHaveBeenCalledWith(
        mockSnapshot as any,
      );
    });

    it('should return error if checkout session not completed', async () => {
      const mockCheckoutResponse = {
        checkoutSession: {
          id: 'checkout-123',
          status: 'payment_pending',
        },
      };

      vi.mocked(CheckoutService.getCheckoutSessionResponse).mockResolvedValue(
        mockCheckoutResponse as any,
      );

      const request = new Request(
        'http://localhost/api/v1/orders/create-from-checkout',
        {
          method: 'POST',
          body: JSON.stringify({
            checkoutSessionId: 'checkout-123',
            paymentMethod: 'razorpay',
          }),
        },
      );
      const context = createMockContext({
        userId: 'user-123',
        requestId: 'req-123',
      });

      const response = await handleCreateOrderFromCheckout(
        request,
        context,
        {},
      );
      const data = (await response.json()) as any;

      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return error if not authenticated', async () => {
      const request = new Request(
        'http://localhost/api/v1/orders/create-from-checkout',
        {
          method: 'POST',
          body: JSON.stringify({
            checkoutSessionId: 'checkout-123',
            paymentMethod: 'razorpay',
          }),
        },
      );
      const context = createMockContext({
        userId: undefined,
        requestId: 'req-123',
      });

      const response = await handleCreateOrderFromCheckout(
        request,
        context,
        {},
      );
      const data = (await response.json()) as any;

      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });
});
