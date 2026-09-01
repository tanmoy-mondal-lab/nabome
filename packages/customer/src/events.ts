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

export interface CustomerEventPublisher {
  publish(event: any): Promise<void>;
  publishBatch(events: any[]): Promise<void>;
}

export class InMemoryCustomerEventPublisher implements CustomerEventPublisher {
  private handlers: Map<string, Set<(event: any) => void>> = new Map();

  on(eventType: string, handler: (event: any) => void): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  off(eventType: string, handler: (event: any) => void): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  async publish(event: any): Promise<void> {
    const types = new Set<string>();
    if (event.eventType) types.add(event.eventType);
    if (event.type) types.add(event.type);
    const extra: string[] = [];
    for (const t of types) {
      if (t.includes('.')) extra.push(t.replace(/\./g, '_'));
      if (t.includes('_')) extra.push(t.replace(/_/g, '.'));
    }
    for (const t of extra) types.add(t);
    if (types.size === 0) return;
    for (const type of types) {
      const handlers = this.handlers.get(type);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(event);
          } catch (error) {
            console.error(`Error in event handler for ${type}:`, error);
          }
        }
      }
    }
  }

  async publishBatch(events: any[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const customerEventPublisher = new InMemoryCustomerEventPublisher();

export function generateEventId(): Id {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

export async function publishProfileUpdated(
  userId: Id,
  changes: Record<string, { from: unknown; to: unknown }>,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createProfileUpdatedEvent(userId, changes, metadata);
  await customerEventPublisher.publish(event);
}

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

export async function publishNotificationRead(
  userId: Id,
  notificationIds: Id[],
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createNotificationReadEvent(userId, notificationIds, metadata);
  await customerEventPublisher.publish(event);
}

export async function publishSessionRevoked(
  userId: Id,
  sessionId: Id,
  reason?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createSessionRevokedEvent(userId, sessionId, reason, metadata);
  await customerEventPublisher.publish(event);
}
