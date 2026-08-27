/**
 * Customer Account Event System
 *
 * This file implements the event system for customer account operations.
 * Events are published for profile updates, address changes, preference changes,
 * notification interactions, session management, and security events.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: NOTIFICATION_COMMUNICATION_MESSAGING_ARCHITECTURE.md (binding)
 */

import type { Id } from '@nabome/types';

import type {
  CustomerEvent,
  CustomerEventType,
  ProfileUpdatedEvent,
  AddressAddedEvent,
  PreferenceUpdatedEvent,
  NotificationReadEvent,
  SessionRevokedEvent,
} from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Event Publisher
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Event Publisher Interface
 * Abstract interface for publishing customer events.
 * Implementations can use Cloudflare Queues, message brokers, or in-memory.
 */
export interface CustomerEventPublisher {
  /**
   * Publish a customer event
   */
  publish(event: CustomerEvent): Promise<void>;

  /**
   * Publish multiple events in batch
   */
  publishBatch(events: CustomerEvent[]): Promise<void>;
}

/**
 * In-Memory Event Publisher
 * Simple implementation for development/testing.
 * Production should use Cloudflare Queues or message broker.
 */
export class InMemoryCustomerEventPublisher implements CustomerEventPublisher {
  private handlers: Map<
    CustomerEventType,
    Set<(event: CustomerEvent) => void>
  > = new Map();

  /**
   * Register an event handler for a specific event type
   */
  on(
    eventType: CustomerEventType,
    handler: (event: CustomerEvent) => void,
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * Unregister an event handler
   */
  off(
    eventType: CustomerEventType,
    handler: (event: CustomerEvent) => void,
  ): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Publish an event to registered handlers
   */
  async publish(event: CustomerEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (error) {
          // Error in event handler - log in production

          console.error(
            `Error in event handler for ${event.eventType}:`,
            error,
          );
        }
      }
    }
  }

  /**
   * Publish multiple events in batch
   */
  async publishBatch(events: CustomerEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Global singleton instance
export const customerEventPublisher = new InMemoryCustomerEventPublisher();

// ──────────────────────────────────────────────────────────────────────────────
// Event Builders
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique event ID
 */
export function generateEventId(): Id {
  // Simple UUID v4 generator for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a profile updated event
 */
export function createProfileUpdatedEvent(
  userId: Id,
  changes: Record<string, { from: unknown; to: unknown }>,
  metadata?: Record<string, unknown>,
): ProfileUpdatedEvent {
  return {
    id: generateEventId(),
    eventType: 'profile.updated',
    userId,
    data: { userId, changes },
    timestamp: new Date().toISOString(),
    metadata,
  };
}

/**
 * Create an address added event
 */
export function createAddressAddedEvent(
  userId: Id,
  addressId: Id,
  addressType: string,
  metadata?: Record<string, unknown>,
): AddressAddedEvent {
  return {
    id: generateEventId(),
    eventType: 'address.added',
    userId,
    data: { userId, addressId, addressType },
    timestamp: new Date().toISOString(),
    metadata,
  };
}

/**
 * Create a preference updated event
 */
export function createPreferenceUpdatedEvent(
  userId: Id,
  preferenceType: string,
  changes: Record<string, { from: unknown; to: unknown }>,
  metadata?: Record<string, unknown>,
): PreferenceUpdatedEvent {
  return {
    id: generateEventId(),
    eventType: 'preference.updated',
    userId,
    data: { userId, preferenceType, changes },
    timestamp: new Date().toISOString(),
    metadata,
  };
}

/**
 * Create a notification read event
 */
export function createNotificationReadEvent(
  userId: Id,
  notificationIds: Id[],
  metadata?: Record<string, unknown>,
): NotificationReadEvent {
  return {
    id: generateEventId(),
    eventType: 'notification.read',
    userId,
    data: { userId, notificationIds, readAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    metadata,
  };
}

/**
 * Create a session revoked event
 */
export function createSessionRevokedEvent(
  userId: Id,
  sessionId: Id,
  reason?: string,
  metadata?: Record<string, unknown>,
): SessionRevokedEvent {
  return {
    id: generateEventId(),
    eventType: 'session.revoked',
    userId,
    data: { userId, sessionId, revokedAt: new Date().toISOString(), reason },
    timestamp: new Date().toISOString(),
    metadata,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Event Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Publish a profile updated event
 */
export async function publishProfileUpdated(
  userId: Id,
  changes: Record<string, { from: unknown; to: unknown }>,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createProfileUpdatedEvent(userId, changes, metadata);
  await customerEventPublisher.publish(event);
}

/**
 * Publish an address added event
 */
export async function publishAddressAdded(
  userId: Id,
  addressId: Id,
  addressType: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createAddressAddedEvent(
    userId,
    addressId,
    addressType,
    metadata,
  );
  await customerEventPublisher.publish(event);
}

/**
 * Publish a preference updated event
 */
export async function publishPreferenceUpdated(
  userId: Id,
  preferenceType: string,
  changes: Record<string, { from: unknown; to: unknown }>,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createPreferenceUpdatedEvent(
    userId,
    preferenceType,
    changes,
    metadata,
  );
  await customerEventPublisher.publish(event);
}

/**
 * Publish a notification read event
 */
export async function publishNotificationRead(
  userId: Id,
  notificationIds: Id[],
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createNotificationReadEvent(userId, notificationIds, metadata);
  await customerEventPublisher.publish(event);
}

/**
 * Publish a session revoked event
 */
export async function publishSessionRevoked(
  userId: Id,
  sessionId: Id,
  reason?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createSessionRevokedEvent(userId, sessionId, reason, metadata);
  await customerEventPublisher.publish(event);
}
