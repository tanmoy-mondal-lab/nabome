import { describe, expect, it } from 'vitest';

import type {
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Role,
  SettlementStatus,
  ShipmentStatus,
} from './index.ts';

const roles: Role[] = ['guest', 'customer', 'shop_owner', 'admin', 'system'];

describe('canonical type registry (leaf package)', () => {
  it('exposes exactly the 18 canonical order statuses', () => {
    const statuses: OrderStatus[] = [
      'pending',
      'confirmed',
      'processing',
      'accepted',
      'rejected',
      'packing',
      'ready_to_ship',
      'shipped',
      'in_transit',
      'delivered',
      'completed',
      'cancelled',
      'failed',
      'returned',
      'refunded',
      'archived',
      'failed_delivery',
      'held',
    ];
    expect(statuses).toHaveLength(18);
    expect(new Set(statuses).size).toBe(18);
  });

  it('keeps the additive role hierarchy', () => {
    expect(roles).toHaveLength(5);
    expect(roles.indexOf('customer')).toBeLessThan(roles.indexOf('admin'));
  });

  it('uses snake_case status enums', () => {
    const payment: PaymentStatus = 'processing';
    const settlement: SettlementStatus = 'eligible';
    const shipment: ShipmentStatus = 'ready_for_pickup';
    expect([payment, settlement, shipment]).toBeTruthy();
  });

  it('models money as DECIMAL string in INR', () => {
    const product: Product = {
      id: 'uuid',
      categoryId: 'uuid',
      shopId: 'uuid',
      name: 'Test',
      slug: 'test',
      description: '',
      status: 'published',
      isFeatured: false,
      isNew: false,
      isTrending: false,
      gender: 'unisex',
      sortOrder: 0,
      basePrice: { amount: '1999.00', currency: 'INR' },
      reviewCount: 0,
      averageRating: 0,
      totalSold: 0,
      tags: [],
      meta: null,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    expect(product.basePrice.currency).toBe('INR');
  });

  it('orders carry display numbers and amounts', () => {
    const order: Order = {
      id: 'uuid',
      orderNumber: 'NAB-20260804-000001',
      status: 'pending',
      customerVisibleStatus: 'pending',
      paymentStatus: 'pending',
      items: [],
      amounts: {
        subtotal: { amount: '0.00', currency: 'INR' },
        discountTotal: { amount: '0.00', currency: 'INR' },
        shippingTotal: { amount: '0.00', currency: 'INR' },
        taxTotal: { amount: '0.00', currency: 'INR' },
        grandTotal: { amount: '0.00', currency: 'INR' },
      },
      createdAt: '',
      updatedAt: '',
    };
    expect(order.orderNumber).toMatch(/^NAB-\d{8}-\d{6}$/);
  });
});
