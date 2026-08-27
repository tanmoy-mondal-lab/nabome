/**
 * Dashboard Events Tests
 *
 * Unit tests for dashboard events system
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  dashboardEvents,
  DashboardEventType,
  emitProductPublished,
  emitInventoryLowStock,
  emitOrderShipped,
  emitSettlementPaid,
  emitSettingsUpdated,
  emitReportGenerated,
} from '../events';

describe('Dashboard Events System', () => {
  beforeEach(() => {
    dashboardEvents.clearAll();
  });

  describe('EventEmitter', () => {
    it('subscribes to event type', () => {
      const handler = vi.fn();
      const unsubscribe = dashboardEvents.on(
        DashboardEventType.PRODUCT_PUBLISHED,
        handler,
      );

      expect(typeof unsubscribe).toBe('function');
    });

    it('calls handler when event is emitted', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.PRODUCT_PUBLISHED, handler);

      await dashboardEvents.emitEvent(DashboardEventType.PRODUCT_PUBLISHED, {
        productId: 'test-1',
      });

      expect(handler).toHaveBeenCalled();
    });

    it('passes event data to handler', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.PRODUCT_PUBLISHED, handler);

      const payload = { productId: 'test-1', productName: 'Test Product' };
      await dashboardEvents.emitEvent(
        DashboardEventType.PRODUCT_PUBLISHED,
        payload,
      );

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: DashboardEventType.PRODUCT_PUBLISHED,
          payload,
          timestamp: expect.any(Date),
        }),
      );
    });

    it('unsubscribes handler', async () => {
      const handler = vi.fn();
      const unsubscribe = dashboardEvents.on(
        DashboardEventType.PRODUCT_PUBLISHED,
        handler,
      );

      unsubscribe();
      await dashboardEvents.emitEvent(DashboardEventType.PRODUCT_PUBLISHED, {});

      expect(handler).not.toHaveBeenCalled();
    });

    it('supports multiple handlers for same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      dashboardEvents.on(DashboardEventType.PRODUCT_PUBLISHED, handler1);
      dashboardEvents.on(DashboardEventType.PRODUCT_PUBLISHED, handler2);

      await dashboardEvents.emitEvent(DashboardEventType.PRODUCT_PUBLISHED, {});

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('clears handlers for specific event type', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.PRODUCT_PUBLISHED, handler);

      dashboardEvents.clear(DashboardEventType.PRODUCT_PUBLISHED);
      await dashboardEvents.emitEvent(DashboardEventType.PRODUCT_PUBLISHED, {});

      expect(handler).not.toHaveBeenCalled();
    });

    it('clears all handlers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      dashboardEvents.on(DashboardEventType.PRODUCT_PUBLISHED, handler1);
      dashboardEvents.on(DashboardEventType.INVENTORY_LOW_STOCK, handler2);

      dashboardEvents.clearAll();

      await dashboardEvents.emitEvent(DashboardEventType.PRODUCT_PUBLISHED, {});
      await dashboardEvents.emitEvent(
        DashboardEventType.INVENTORY_LOW_STOCK,
        {},
      );

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    it('emitProductPublished emits correct event', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.PRODUCT_PUBLISHED, handler);

      await emitProductPublished('prod-1', 'Test Product', 'shop-1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: DashboardEventType.PRODUCT_PUBLISHED,
          payload: {
            productId: 'prod-1',
            productName: 'Test Product',
          },
          shopId: 'shop-1',
          entityId: 'prod-1',
        }),
      );
    });

    it('emitInventoryLowStock emits correct event', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.INVENTORY_LOW_STOCK, handler);

      await emitInventoryLowStock('prod-1', 'Test Product', 5, 10, 'shop-1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: DashboardEventType.INVENTORY_LOW_STOCK,
          payload: {
            productId: 'prod-1',
            productName: 'Test Product',
            currentStock: 5,
            threshold: 10,
          },
          shopId: 'shop-1',
          entityId: 'prod-1',
        }),
      );
    });

    it('emitOrderShipped emits correct event', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.ORDER_SHIPPED, handler);

      await emitOrderShipped('ord-1', 'ORD001', 'TRACK123', 'shop-1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: DashboardEventType.ORDER_SHIPPED,
          payload: {
            orderId: 'ord-1',
            orderNumber: 'ORD001',
            trackingNumber: 'TRACK123',
          },
          shopId: 'shop-1',
          entityId: 'ord-1',
        }),
      );
    });

    it('emitSettlementPaid emits correct event', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.SETTLEMENT_PAID, handler);

      await emitSettlementPaid('settle-1', 5000, 'shop-1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: DashboardEventType.SETTLEMENT_PAID,
          payload: {
            settlementId: 'settle-1',
            amount: 5000,
          },
          shopId: 'shop-1',
          entityId: 'settle-1',
        }),
      );
    });

    it('emitSettingsUpdated emits correct event', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.SETTINGS_UPDATED, handler);

      await emitSettingsUpdated('shipping', 'shop-1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: DashboardEventType.SETTINGS_UPDATED,
          payload: {
            settingType: 'shipping',
          },
          shopId: 'shop-1',
        }),
      );
    });

    it('emitReportGenerated emits correct event', async () => {
      const handler = vi.fn();
      dashboardEvents.on(DashboardEventType.REPORT_GENERATED, handler);

      await emitReportGenerated('sales', 'report-1', 'shop-1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: DashboardEventType.REPORT_GENERATED,
          payload: {
            reportType: 'sales',
            reportId: 'report-1',
          },
          shopId: 'shop-1',
          entityId: 'report-1',
        }),
      );
    });
  });
});
