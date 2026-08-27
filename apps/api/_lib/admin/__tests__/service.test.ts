/**
 * Admin Service Tests
 * Tests for admin governance, monitoring, reporting, and settings services
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  approveShop,
  suspendShop,
  verifyShop,
  lockCustomer,
  unlockCustomer,
  banCustomer,
  approveProduct,
  rejectProduct,
  searchOrders,
  getOrderExceptions,
  manualIntervention,
  getOrderAuditTimeline,
  getPaymentProviderHealth,
  searchTransactions,
  getSettlements,
  getRefunds,
  getFinancialExceptions,
  getReturnsQueue,
  overrideReturnPolicy,
  getDisputes,
  getFraudReview,
  getSystemHealth,
  generateRevenueReport,
  generateCommerceReport,
  generateCustomerReport,
  generateShopReport,
  generateSecurityReport,
  generateAuditReport,
  generateOperationsReport,
} from '../service';

// Mock Prisma Client
const mockPrisma = {
  shop: {
    update: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  user: {
    update: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  order: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  product: {
    count: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  returnRequest: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $queryRaw: vi.fn(),
};

vi.mock('../prisma', () => ({
  getPrisma: vi.fn(() => mockPrisma),
}));

vi.mock('../audit/audit-log', () => ({
  logAuditEvent: vi.fn(),
  AuditEventType: {
    RESOURCE_ACCESS_GRANTED: 'RESOURCE_ACCESS_GRANTED',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  },
}));

describe('Admin Service - Shop Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should approve a shop', async () => {
    const mockShop = {
      id: 'shop-1',
      name: 'Test Shop',
      status: 'active',
    };

    mockPrisma.shop.update.mockResolvedValue(mockShop);

    const result = await approveShop(
      'shop-1',
      'admin-1',
      'Approved for compliance',
    );

    expect(result).toBeDefined();
    expect(mockPrisma.shop.update).toHaveBeenCalledWith({
      where: { id: 'shop-1' },
      data: { status: 'active' },
    });
  });

  it('should suspend a shop with reason', async () => {
    const mockShop = {
      id: 'shop-1',
      name: 'Test Shop',
      status: 'suspended',
    };

    mockPrisma.shop.update.mockResolvedValue(mockShop);

    const result = await suspendShop('shop-1', 'admin-1', 'Policy violation');

    expect(result).toBeDefined();
    expect(mockPrisma.shop.update).toHaveBeenCalledWith({
      where: { id: 'shop-1' },
      data: { status: 'suspended' },
    });
  });

  it('should verify a shop', async () => {
    const mockShop = {
      id: 'shop-1',
      name: 'Test Shop',
      status: 'active',
    };

    mockPrisma.shop.update.mockResolvedValue(mockShop);

    const result = await verifyShop(
      'shop-1',
      'admin-1',
      'Verification complete',
    );

    expect(result).toBeDefined();
    expect(mockPrisma.shop.update).toHaveBeenCalledWith({
      where: { id: 'shop-1' },
      data: { status: 'active' },
    });
  });
});

describe('Admin Service - Customer Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should lock a customer account', async () => {
    const mockCustomer = {
      id: 'customer-1',
      email: 'test@example.com',
      isActive: false,
    };

    mockPrisma.user.update.mockResolvedValue(mockCustomer);

    const result = await lockCustomer(
      'customer-1',
      'admin-1',
      'Fraud detected',
    );

    expect(result).toBeDefined();
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { isActive: false },
    });
  });

  it('should unlock a customer account', async () => {
    const mockCustomer = {
      id: 'customer-1',
      email: 'test@example.com',
      isActive: true,
    };

    mockPrisma.user.update.mockResolvedValue(mockCustomer);

    const result = await unlockCustomer(
      'customer-1',
      'admin-1',
      'Investigation cleared',
    );

    expect(result).toBeDefined();
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { isActive: true },
    });
  });

  it('should ban a customer account', async () => {
    const mockCustomer = {
      id: 'customer-1',
      email: 'test@example.com',
      isActive: false,
      status: 'banned',
    };

    mockPrisma.user.update.mockResolvedValue(mockCustomer);

    const result = await banCustomer(
      'customer-1',
      'admin-1',
      'Severe policy violation',
    );

    expect(result).toBeDefined();
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { isActive: false, status: 'banned' },
    });
  });
});

describe('Admin Service - System Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get system health status', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await getSystemHealth();

    expect(result).toHaveProperty('database');
    expect(result).toHaveProperty('cache');
    expect(result).toHaveProperty('storage');
    expect(result).toHaveProperty('api');
    expect(result.database.status).toBe('healthy');
  });

  it('should handle database connection failure in health check', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

    const result = await getSystemHealth();

    expect(result.database.status).toBe('unhealthy');
  });
});

describe('Admin Service - Product Moderation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should approve a product', async () => {
    const mockProduct = {
      id: 'product-1',
      name: 'Test Product',
      status: 'published',
    };

    mockPrisma.product.update.mockResolvedValue(mockProduct);

    const result = await approveProduct('product-1', 'admin-1');

    expect(result).toBeDefined();
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { status: 'published' },
    });
  });

  it('should reject a product with reason', async () => {
    const mockProduct = {
      id: 'product-1',
      name: 'Test Product',
      status: 'archived',
    };

    mockPrisma.product.update.mockResolvedValue(mockProduct);

    const result = await rejectProduct(
      'product-1',
      'admin-1',
      'Violates policy',
    );

    expect(result).toBeDefined();
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { status: 'archived' },
    });
  });
});

describe('Admin Service - Order Governance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should search orders', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'confirmed',
        user: { id: 'user-1', email: 'test@example.com' },
        shop: { id: 'shop-1', name: 'Test Shop' },
      },
    ];

    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const result = await searchOrders({
      status: 'confirmed',
      page: 1,
      limit: 20,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(mockPrisma.order.findMany).toHaveBeenCalled();
  });

  it('should get order exceptions', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'cancelled',
        user: { id: 'user-1', email: 'test@example.com' },
        shop: { id: 'shop-1', name: 'Test Shop' },
      },
    ];

    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const result = await getOrderExceptions({ page: 1, limit: 20 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should perform manual intervention on order', async () => {
    const mockOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: 'cancelled',
    };

    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
    mockPrisma.order.update.mockResolvedValue({
      ...mockOrder,
      status: 'cancelled',
    });

    const result = await manualIntervention(
      'order-1',
      'cancel',
      'admin-1',
      'Customer request',
    );

    expect(result).toBeDefined();
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'cancelled' },
    });
  });

  it('should get order audit timeline', async () => {
    const result = await getOrderAuditTimeline('order-1');

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('Admin Service - Payments Governance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get payment provider health', async () => {
    const result = await getPaymentProviderHealth();

    expect(result).toBeDefined();
    expect(result).toHaveProperty('razorpay');
    expect(result).toHaveProperty('cod');
  });

  it('should search transactions', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        razorpayPaymentId: 'pay-123',
        paymentMethod: 'razorpay',
        paymentStatus: 'succeeded',
        grandTotal: 1000,
        currency: 'INR',
        status: 'confirmed',
        user: { id: 'user-1', email: 'test@example.com' },
      },
    ];

    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const result = await searchTransactions({ page: 1, limit: 20 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get settlements', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        shopId: 'shop-1',
        grandTotal: 1000,
        currency: 'INR',
        status: 'delivered',
        shop: { id: 'shop-1', name: 'Test Shop' },
      },
    ];

    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const result = await getSettlements({ page: 1, limit: 20 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get refunds', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        grandTotal: 1000,
        currency: 'INR',
        status: 'refunded',
        user: { id: 'user-1', email: 'test@example.com' },
        shop: { id: 'shop-1', name: 'Test Shop' },
      },
    ];

    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const result = await getRefunds({ page: 1, limit: 20 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get financial exceptions', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        grandTotal: 1000,
        currency: 'INR',
        status: 'failed',
        user: { id: 'user-1', email: 'test@example.com' },
        shop: { id: 'shop-1', name: 'Test Shop' },
      },
    ];

    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const result = await getFinancialExceptions({ page: 1, limit: 20 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('Admin Service - Returns Governance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get returns queue', async () => {
    const mockReturnRequests = [
      {
        id: 'return-1',
        orderId: 'order-1',
        status: 'return_requested',
        reason: 'Defective product',
        createdAt: new Date(),
        order: {
          id: 'order-1',
          orderNumber: 'ORD-001',
          grandTotal: 1000,
          currency: 'INR',
          user: { id: 'user-1', email: 'test@example.com' },
        },
      },
    ];

    mockPrisma.returnRequest.findMany.mockResolvedValue(mockReturnRequests);

    const result = await getReturnsQueue({ page: 1, limit: 20 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should override return policy', async () => {
    const mockReturnRequest = {
      id: 'return-1',
      status: 'return_requested',
    };

    mockPrisma.returnRequest.findUnique.mockResolvedValue(mockReturnRequest);
    mockPrisma.returnRequest.update.mockResolvedValue({
      ...mockReturnRequest,
      status: 'return_approved',
    });

    const result = await overrideReturnPolicy(
      'return-1',
      'admin-1',
      'Exceptional case',
    );

    expect(result).toBeDefined();
    expect(mockPrisma.returnRequest.update).toHaveBeenCalledWith({
      where: { id: 'return-1' },
      data: { status: 'return_approved' },
    });
  });

  it('should get disputes', async () => {
    const mockReturnRequests = [
      {
        id: 'return-1',
        orderId: 'order-1',
        status: 'return_rejected',
        reason: 'Product not as described',
        createdAt: new Date(),
        order: {
          id: 'order-1',
          orderNumber: 'ORD-001',
          grandTotal: 1000,
          currency: 'INR',
          user: { id: 'user-1', email: 'test@example.com' },
        },
      },
    ];

    mockPrisma.returnRequest.findMany.mockResolvedValue(mockReturnRequests);

    const result = await getDisputes({ page: 1, limit: 20 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get fraud review queue', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'failed',
        grandTotal: 1000,
        currency: 'INR',
        createdAt: new Date(),
        user: { id: 'user-1', email: 'test@example.com' },
        shop: { id: 'shop-1', name: 'Test Shop' },
      },
    ];

    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const result = await getFraudReview({ page: 1, limit: 20 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('Admin Service - Reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate revenue report', async () => {
    mockPrisma.order.findMany.mockResolvedValue([
      {
        grandTotal: 1000,
        currency: 'INR',
        createdAt: new Date(),
      },
    ]);

    const result = await generateRevenueReport(
      { startDate: '2024-01-01', endDate: '2024-01-31' },
      'admin-1',
    );

    expect(result).toHaveProperty('totalRevenue');
    expect(result).toHaveProperty('growth');
    expect(result).toHaveProperty('breakdown');
    expect(result.totalRevenue.amount).toBe('1000');
  });

  it('should generate commerce report', async () => {
    mockPrisma.order.count.mockResolvedValue(100);
    mockPrisma.product.count.mockResolvedValue(50);
    mockPrisma.shop.count.mockResolvedValue(10);
    mockPrisma.user.count.mockResolvedValue(200);

    const result = await generateCommerceReport(
      { startDate: '2024-01-01', endDate: '2024-01-31' },
      'admin-1',
    );

    expect(result).toHaveProperty('orders');
    expect(result).toHaveProperty('products');
    expect(result).toHaveProperty('shops');
    expect(result).toHaveProperty('customers');
    expect(result.orders).toBe(100);
  });

  it('should generate customer report', async () => {
    mockPrisma.user.count
      .mockResolvedValueOnce(1000)
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(800);

    const result = await generateCustomerReport(
      { startDate: '2024-01-01', endDate: '2024-01-31' },
      'admin-1',
    );

    expect(result).toHaveProperty('totalCustomers');
    expect(result).toHaveProperty('newCustomers');
    expect(result).toHaveProperty('activeCustomers');
    expect(result).toHaveProperty('churnRate');
    expect(result.totalCustomers).toBe(1000);
  });

  it('should generate shop report', async () => {
    mockPrisma.shop.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(80)
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(5);

    const result = await generateShopReport({}, 'admin-1');

    expect(result).toHaveProperty('totalShops');
    expect(result).toHaveProperty('activeShops');
    expect(result).toHaveProperty('pendingShops');
    expect(result).toHaveProperty('suspendedShops');
    expect(result.totalShops).toBe(100);
  });

  it('should generate security report', async () => {
    const result = await generateSecurityReport(
      { startDate: '2024-01-01', endDate: '2024-01-31' },
      'admin-1',
    );

    expect(result).toHaveProperty('totalAlerts');
    expect(result).toHaveProperty('criticalAlerts');
    expect(result).toHaveProperty('resolvedAlerts');
    expect(result).toHaveProperty('failedLogins');
  });

  it('should generate audit report', async () => {
    const result = await generateAuditReport(
      { startDate: '2024-01-01', endDate: '2024-01-31' },
      'admin-1',
    );

    expect(result).toHaveProperty('totalActions');
    expect(result).toHaveProperty('adminActions');
    expect(result).toHaveProperty('systemActions');
    expect(result).toHaveProperty('failedActions');
  });

  it('should generate operations report', async () => {
    mockPrisma.order.count.mockResolvedValue(300);

    const result = await generateOperationsReport(
      { startDate: '2024-01-01', endDate: '2024-01-31' },
      'admin-1',
    );

    expect(result).toHaveProperty('systemUptime');
    expect(result).toHaveProperty('apiResponseTime');
    expect(result).toHaveProperty('errorRate');
    expect(result).toHaveProperty('throughput');
    expect(result.systemUptime).toBe(99.9);
  });
});
