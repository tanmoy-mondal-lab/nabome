/**
 * Admin Events System
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Events for: Shop Approved, Shop Suspended, Customer Locked, Product Moderated, Configuration Changed, Report Generated, Security Alert, Feature Flag Changed
 */

import type { Id } from '@nabome/types';

export type AdminEventType =
  | 'shop_approved'
  | 'shop_suspended'
  | 'shop_activated'
  | 'customer_locked'
  | 'customer_unlocked'
  | 'product_moderated'
  | 'product_approved'
  | 'product_rejected'
  | 'configuration_changed'
  | 'report_generated'
  | 'security_alert'
  | 'feature_flag_changed'
  | 'order_intervention'
  | 'policy_override'
  | 'session_revoked';

export interface AdminEvent {
  id: Id;
  type: AdminEventType;
  timestamp: string;
  userId: Id;
  entityType?: string;
  entityId?: Id;
  data: Record<string, unknown>;
}

export interface ShopApprovedEvent extends Omit<AdminEvent, 'type' | 'data'> {
  type: 'shop_approved';
  data: {
    shopId: Id;
    shopName: string;
    approvedBy: Id;
  };
}

export interface ShopSuspendedEvent extends Omit<AdminEvent, 'type' | 'data'> {
  type: 'shop_suspended';
  data: {
    shopId: Id;
    shopName: string;
    suspendedBy: Id;
    reason: string;
  };
}

export interface CustomerLockedEvent extends Omit<AdminEvent, 'type' | 'data'> {
  type: 'customer_locked';
  data: {
    customerId: Id;
    customerEmail: string;
    lockedBy: Id;
    reason: string;
  };
}

export interface ProductModeratedEvent extends Omit<
  AdminEvent,
  'type' | 'data'
> {
  type: 'product_moderated';
  data: {
    productId: Id;
    productName: string;
    moderatedBy: Id;
    action: 'approved' | 'rejected';
    reason?: string;
  };
}

export interface ConfigurationChangedEvent extends Omit<
  AdminEvent,
  'type' | 'data'
> {
  type: 'configuration_changed';
  data: {
    settingKey: string;
    oldValue: unknown;
    newValue: unknown;
    changedBy: Id;
  };
}

export interface ReportGeneratedEvent extends Omit<
  AdminEvent,
  'type' | 'data'
> {
  type: 'report_generated';
  data: {
    reportId: Id;
    reportType: string;
    generatedBy: Id;
    parameters: Record<string, unknown>;
  };
}

export interface SecurityAlertEvent extends Omit<AdminEvent, 'type' | 'data'> {
  type: 'security_alert';
  data: {
    alertId: Id;
    alertType: string;
    severity: string;
    affectedUsers: Id[];
  };
}

export interface FeatureFlagChangedEvent extends Omit<
  AdminEvent,
  'type' | 'data'
> {
  type: 'feature_flag_changed';
  data: {
    flagKey: string;
    oldValue: boolean;
    newValue: boolean;
    changedBy: Id;
  };
}

// Event emitter for local event handling
class AdminEventEmitter {
  private listeners: Map<AdminEventType, Set<(event: AdminEvent) => void>> =
    new Map();

  on(
    eventType: AdminEventType,
    listener: (event: AdminEvent) => void,
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  emit(event: AdminEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }

  // Publish event to backend for analytics, notifications, audit, monitoring
  async publish(event: AdminEvent): Promise<void> {
    // Emit locally
    this.emit(event);

    // Publish to backend
    try {
      const API_BASE =
        (import.meta.env.VITE_PUBLIC_API_URL as string | undefined) ??
        (import.meta.env.VITE_API_URL as string | undefined) ??
        'http://localhost:8788';
      const csrf =
        typeof document !== 'undefined'
          ? (document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)?.[1] ?? null)
          : null;

      await fetch(`${API_BASE}/api/v1/admin/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'x-csrf-token': decodeURIComponent(csrf) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to publish event to backend:', error);
    }
  }
}

export const adminEventEmitter = new AdminEventEmitter();

// Helper functions to create and publish events
export function createShopApprovedEvent(
  shopId: Id,
  shopName: string,
  approvedBy: Id,
): ShopApprovedEvent {
  return {
    id: crypto.randomUUID(),
    type: 'shop_approved',
    timestamp: new Date().toISOString(),
    userId: approvedBy,
    entityType: 'shop',
    entityId: shopId,
    data: { shopId, shopName, approvedBy },
  };
}

export function createShopSuspendedEvent(
  shopId: Id,
  shopName: string,
  suspendedBy: Id,
  reason: string,
): ShopSuspendedEvent {
  return {
    id: crypto.randomUUID(),
    type: 'shop_suspended',
    timestamp: new Date().toISOString(),
    userId: suspendedBy,
    entityType: 'shop',
    entityId: shopId,
    data: { shopId, shopName, suspendedBy, reason },
  };
}

export function createCustomerLockedEvent(
  customerId: Id,
  customerEmail: string,
  lockedBy: Id,
  reason: string,
): CustomerLockedEvent {
  return {
    id: crypto.randomUUID(),
    type: 'customer_locked',
    timestamp: new Date().toISOString(),
    userId: lockedBy,
    entityType: 'customer',
    entityId: customerId,
    data: { customerId, customerEmail, lockedBy, reason },
  };
}

export function createProductModeratedEvent(
  productId: Id,
  productName: string,
  moderatedBy: Id,
  action: 'approved' | 'rejected',
  reason?: string,
): ProductModeratedEvent {
  return {
    id: crypto.randomUUID(),
    type: 'product_moderated',
    timestamp: new Date().toISOString(),
    userId: moderatedBy,
    entityType: 'product',
    entityId: productId,
    data: { productId, productName, moderatedBy, action, reason },
  };
}

export function createConfigurationChangedEvent(
  settingKey: string,
  oldValue: unknown,
  newValue: unknown,
  changedBy: Id,
): ConfigurationChangedEvent {
  return {
    id: crypto.randomUUID(),
    type: 'configuration_changed',
    timestamp: new Date().toISOString(),
    userId: changedBy,
    entityType: 'setting',
    data: { settingKey, oldValue, newValue, changedBy },
  };
}

export function createReportGeneratedEvent(
  reportId: Id,
  reportType: string,
  generatedBy: Id,
  parameters: Record<string, unknown>,
): ReportGeneratedEvent {
  return {
    id: crypto.randomUUID(),
    type: 'report_generated',
    timestamp: new Date().toISOString(),
    userId: generatedBy,
    entityType: 'report',
    entityId: reportId,
    data: { reportId, reportType, generatedBy, parameters },
  };
}

export function createSecurityAlertEvent(
  alertId: Id,
  alertType: string,
  severity: string,
  affectedUsers: Id[],
): SecurityAlertEvent {
  return {
    id: crypto.randomUUID(),
    type: 'security_alert',
    timestamp: new Date().toISOString(),
    userId: 'system', // Security alerts are system-generated
    entityType: 'alert',
    entityId: alertId,
    data: { alertId, alertType, severity, affectedUsers },
  };
}

export function createFeatureFlagChangedEvent(
  flagKey: string,
  oldValue: boolean,
  newValue: boolean,
  changedBy: Id,
): FeatureFlagChangedEvent {
  return {
    id: crypto.randomUUID(),
    type: 'feature_flag_changed',
    timestamp: new Date().toISOString(),
    userId: changedBy,
    entityType: 'feature_flag',
    data: { flagKey, oldValue, newValue, changedBy },
  };
}
