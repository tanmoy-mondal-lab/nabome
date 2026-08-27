/**
 * Admin Event System
 *
 * Handles event emission for admin operations:
 * - Shop approved/suspended/activated
 * - Customer locked/unlocked
 * - Platform governance actions
 *
 * These events are used for:
 * - Analytics tracking
 * - Real-time UI updates via WebSocket
 * - Audit logging
 * - Integration with external systems
 * - Email notifications
 */

export type AdminEventType =
  | 'shop_approved'
  | 'shop_suspended'
  | 'shop_activated'
  | 'shop_rejected'
  | 'customer_locked'
  | 'customer_unlocked'
  | 'customer_banned'
  | 'product_moderated'
  | 'platform_maintenance_started'
  | 'platform_maintenance_ended'
  | 'system_config_updated';

export interface AdminEvent {
  eventType: AdminEventType;
  userId: string;
  targetId?: string;
  targetType?: 'shop' | 'customer' | 'platform' | 'system';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export type AdminEventListener = (event: AdminEvent) => void;

export class AdminEventEmitter {
  private static listeners: Map<AdminEventType, Set<AdminEventListener>> =
    new Map();

  /**
   * Register event listener
   */
  static on(eventType: AdminEventType, listener: AdminEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  /**
   * Remove event listener
   */
  static off(eventType: AdminEventType, listener: AdminEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event
   */
  static emit(event: AdminEvent): void {
    const listeners = this.listeners.get(event.eventType);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  /**
   * Emit shop approved event
   */
  static emitShopApproved(
    adminUserId: string,
    shopId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'shop_approved',
      userId: adminUserId,
      targetId: shopId,
      targetType: 'shop',
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit shop suspended event
   */
  static emitShopSuspended(
    adminUserId: string,
    shopId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'shop_suspended',
      userId: adminUserId,
      targetId: shopId,
      targetType: 'shop',
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit shop activated event
   */
  static emitShopActivated(
    adminUserId: string,
    shopId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'shop_activated',
      userId: adminUserId,
      targetId: shopId,
      targetType: 'shop',
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit shop rejected event
   */
  static emitShopRejected(
    adminUserId: string,
    shopId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'shop_rejected',
      userId: adminUserId,
      targetId: shopId,
      targetType: 'shop',
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit customer locked event
   */
  static emitCustomerLocked(
    adminUserId: string,
    customerId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'customer_locked',
      userId: adminUserId,
      targetId: customerId,
      targetType: 'customer',
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit customer unlocked event
   */
  static emitCustomerUnlocked(
    adminUserId: string,
    customerId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'customer_unlocked',
      userId: adminUserId,
      targetId: customerId,
      targetType: 'customer',
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit customer banned event
   */
  static emitCustomerBanned(
    adminUserId: string,
    customerId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'customer_banned',
      userId: adminUserId,
      targetId: customerId,
      targetType: 'customer',
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit product moderated event
   */
  static emitProductModerated(
    adminUserId: string,
    productId: string,
    action: 'approved' | 'rejected',
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'product_moderated',
      userId: adminUserId,
      targetId: productId,
      targetType: 'system',
      metadata: { action, ...metadata },
      timestamp: new Date(),
    });
  }

  /**
   * Clear all listeners
   */
  static clearAllListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Admin Event Service
 *
 * High-level service for emitting admin events with proper context
 */
export class AdminEventService {
  /**
   * Track admin event for analytics
   */
  static trackEvent(event: AdminEvent): void {
    // Emit the event
    AdminEventEmitter.emit(event);

    // TODO: Send to analytics service
    // TODO: Log to audit system (already done in service layer)
    // TODO: Send to WebSocket for real-time updates
    // TODO: Send email notifications for critical events
  }
}
