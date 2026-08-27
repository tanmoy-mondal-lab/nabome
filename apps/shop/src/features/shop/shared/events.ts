/**
 * Dashboard Events System
 *
 * Event generation and handling for Shop Owner Dashboard
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

// Event types for dashboard actions
export enum DashboardEventType {
  // Product Events
  PRODUCT_PUBLISHED = 'product.published',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  PRODUCT_ARCHIVED = 'product.archived',

  // Inventory Events
  INVENTORY_UPDATED = 'inventory.updated',
  INVENTORY_LOW_STOCK = 'inventory.low_stock',
  INVENTORY_OUT_OF_STOCK = 'inventory.out_of_stock',
  INVENTORY_RESTOCKED = 'inventory.restocked',

  // Order Events
  ORDER_CREATED = 'order.created',
  ORDER_PROCESSING = 'order.processing',
  ORDER_PACKED = 'order.packed',
  ORDER_SHIPPED = 'order.shipped',
  ORDER_DELIVERED = 'order.delivered',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_REFUNDED = 'order.refunded',

  // Shipment Events
  SHIPMENT_CREATED = 'shipment.created',
  SHIPMENT_UPDATED = 'shipment.updated',
  SHIPMENT_DELIVERED = 'shipment.delivered',
  SHIPMENT_EXCEPTION = 'shipment.exception',

  // Payment Events
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',

  // Settlement Events
  SETTLEMENT_CREATED = 'settlement.created',
  SETTLEMENT_APPROVED = 'settlement.approved',
  SETTLEMENT_PAID = 'settlement.paid',
  SETTLEMENT_FAILED = 'settlement.failed',

  // Return Events
  RETURN_REQUESTED = 'return.requested',
  RETURN_APPROVED = 'return.approved',
  RETURN_REJECTED = 'return.rejected',
  RETURN_RECEIVED = 'return.received',
  RETURN_REFUNDED = 'return.refunded',

  // CMS Events
  CMS_SECTION_UPDATED = 'cms.section_updated',
  CMS_BANNER_UPDATED = 'cms.banner_updated',
  CMS_FEATURED_UPDATED = 'cms.featured_updated',

  // Settings Events
  SETTINGS_UPDATED = 'settings.updated',
  SETTINGS_SHIPPING_UPDATED = 'settings.shipping_updated',
  SETTINGS_PAYMENT_UPDATED = 'settings.payment_updated',
  SETTINGS_NOTIFICATION_UPDATED = 'settings.notification_updated',

  // Report Events
  REPORT_GENERATED = 'report.generated',
  REPORT_EXPORTED = 'report.exported',

  // Analytics Events
  ANALYTICS_VIEWED = 'analytics.viewed',
}

// Event payload interface
export interface DashboardEvent {
  type: DashboardEventType;
  payload: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  shopId?: string;
  entityId?: string;
}

// Event handler type
export type EventHandler = (event: DashboardEvent) => void | Promise<void>;

// Event emitter class
class DashboardEventEmitter {
  private handlers: Map<DashboardEventType, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event type
   */
  on(eventType: DashboardEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.off(eventType, handler);
    };
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType: DashboardEventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit(event: DashboardEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      await Promise.all(Array.from(handlers).map((handler) => handler(event)));
    }
  }

  /**
   * Emit an event with minimal payload
   */
  async emitEvent(
    type: DashboardEventType,
    payload: Record<string, unknown>,
    options?: { userId?: string; shopId?: string; entityId?: string },
  ): Promise<void> {
    const event: DashboardEvent = {
      type,
      payload,
      timestamp: new Date(),
      ...options,
    };
    await this.emit(event);
  }

  /**
   * Clear all handlers for an event type
   */
  clear(eventType: DashboardEventType): void {
    this.handlers.delete(eventType);
  }

  /**
   * Clear all handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}

// Global event emitter instance
export const dashboardEvents = new DashboardEventEmitter();

// Helper functions for common events
export const emitProductPublished = async (
  productId: string,
  productName: string,
  shopId: string,
) => {
  await dashboardEvents.emitEvent(
    DashboardEventType.PRODUCT_PUBLISHED,
    {
      productId,
      productName,
    },
    { shopId, entityId: productId },
  );
};

export const emitInventoryLowStock = async (
  productId: string,
  productName: string,
  currentStock: number,
  threshold: number,
  shopId: string,
) => {
  await dashboardEvents.emitEvent(
    DashboardEventType.INVENTORY_LOW_STOCK,
    {
      productId,
      productName,
      currentStock,
      threshold,
    },
    { shopId, entityId: productId },
  );
};

export const emitOrderShipped = async (
  orderId: string,
  orderNumber: string,
  trackingNumber: string,
  shopId: string,
) => {
  await dashboardEvents.emitEvent(
    DashboardEventType.ORDER_SHIPPED,
    {
      orderId,
      orderNumber,
      trackingNumber,
    },
    { shopId, entityId: orderId },
  );
};

export const emitSettlementPaid = async (
  settlementId: string,
  amount: number,
  shopId: string,
) => {
  await dashboardEvents.emitEvent(
    DashboardEventType.SETTLEMENT_PAID,
    {
      settlementId,
      amount,
    },
    { shopId, entityId: settlementId },
  );
};

export const emitSettingsUpdated = async (
  settingType: string,
  shopId: string,
) => {
  await dashboardEvents.emitEvent(
    DashboardEventType.SETTINGS_UPDATED,
    {
      settingType,
    },
    { shopId },
  );
};

export const emitReportGenerated = async (
  reportType: string,
  reportId: string,
  shopId: string,
) => {
  await dashboardEvents.emitEvent(
    DashboardEventType.REPORT_GENERATED,
    {
      reportType,
      reportId,
    },
    { shopId, entityId: reportId },
  );
};
