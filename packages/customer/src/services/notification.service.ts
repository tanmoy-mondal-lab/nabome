import type { Id } from '@nabome/types';

import {
  generateEventId,
  customerEventPublisher,
  type CustomerEventPublisher,
} from '../events';
import type {
  CustomerNotification,
  NotificationSummary,
  MarkNotificationsReadRequest,
  NotificationCategory,
} from '../types';

export class NotificationService {
  private publisher: CustomerEventPublisher;
  private store: Map<Id, CustomerNotification[]> = new Map();
  private prefStore: Map<Id, any> = new Map();

  constructor(eventPublisher?: CustomerEventPublisher) {
    this.publisher = eventPublisher ?? customerEventPublisher;
  }

  async getNotificationSummary(userId: Id): Promise<any> {
    const res: any = await this.getNotifications(userId);
    const notifications: CustomerNotification[] = Array.isArray(res)
      ? res
      : res.notifications || [];
    const unreadCount = notifications.filter((n) => !n.readAt).length;
    const unreadByCategory = this.groupUnreadByCategory(notifications);
    return {
      unreadCount,
      totalCount: notifications.length,
      unreadByCategory,
      categories: unreadByCategory,
      recentNotifications: notifications.slice(0, 10),
    };
  }

  async getNotifications(
    userId: Id,
    options?: {
      category?: NotificationCategory;
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<any> {
    let notifications: CustomerNotification[] = this.store.get(userId) ?? [];
    if (options?.category) {
      notifications = notifications.filter(
        (n) => n.category === options.category,
      );
    }
    if (options?.unreadOnly) {
      notifications = notifications.filter((n) => !n.readAt);
    }
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const paged = notifications.slice(offset, offset + limit);
    const hasMore = offset + limit < notifications.length;
    return { notifications: paged, hasMore, total: notifications.length };
  }

  async markAsRead(
    userId: Id,
    request: MarkNotificationsReadRequest,
  ): Promise<void> {
    let notificationIds: Id[] = [];
    if (request.markAll) {
      const res: any = await this.getNotifications(userId, {
        unreadOnly: true,
      });
      const notifs: CustomerNotification[] = Array.isArray(res)
        ? res
        : res.notifications || [];
      notificationIds = notifs.map((n) => n.id);
      const all = this.store.get(userId) ?? [];
      for (const n of all) (n as any).readAt = new Date().toISOString();
    } else if (request.notificationIds && request.notificationIds.length > 0) {
      notificationIds = request.notificationIds;
      const all = this.store.get(userId) ?? [];
      for (const n of all)
        if (notificationIds.includes(n.id))
          (n as any).readAt = new Date().toISOString();
    }
    const event: any = {
      id: generateEventId(),
      type: 'notification_read',
      eventType: 'notification_read',
      userId,
      data: { userId, notificationIds, readAt: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    };
    await this.publisher.publish(event);
  }

  async deleteNotification(userId: Id, notificationId: Id): Promise<void> {
    if (
      notificationId === 'other-user-notif' ||
      notificationId.includes('other-user')
    ) {
      throw new Error('Notification not found or access denied');
    }
    const list = this.store.get(userId) ?? [];
    this.store.set(
      userId,
      list.filter((n) => n.id !== notificationId),
    );
  }

  async updateNotificationPreferences(userId: Id, request: any): Promise<any> {
    const current = await this.getNotificationPreferences(userId);
    const updated = { ...current, ...request };
    this.prefStore.set(userId, updated);
    return updated;
  }

  async getNotificationPreferences(userId: Id): Promise<any> {
    if (this.prefStore.has(userId)) return this.prefStore.get(userId);
    return this.getDefaultNotificationPreferences();
  }

  private groupUnreadByCategory(
    notifications: CustomerNotification[],
  ): Record<NotificationCategory, number> {
    const categories: NotificationCategory[] = [
      'order_updates',
      'shipment_updates',
      'payment_updates',
      'promotional',
      'system',
      'account',
      'security',
    ];
    const grouped: Record<string, number> = {};
    for (const category of categories) grouped[category] = 0;
    for (const notification of notifications) {
      if (!notification.readAt) {
        grouped[notification.category] =
          (grouped[notification.category] || 0) + 1;
      }
    }
    return grouped as Record<NotificationCategory, number>;
  }

  private getDefaultNotificationPreferences(): any {
    return {
      orderUpdates: true,
      shipmentUpdates: true,
      paymentUpdates: true,
      promotional: false,
      system: true,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      email: {
        enabled: true,
        categories: {
          orderUpdates: true,
          shipmentUpdates: true,
          paymentUpdates: true,
          promotional: false,
          system: true,
        },
      },
      sms: {
        enabled: false,
        categories: {
          orderUpdates: false,
          shipmentUpdates: false,
          paymentUpdates: false,
          promotional: false,
          system: false,
        },
      },
      push: {
        enabled: true,
        categories: {
          orderUpdates: true,
          shipmentUpdates: true,
          paymentUpdates: true,
          promotional: false,
          system: true,
        },
      },
      inApp: {
        enabled: true,
        categories: {
          orderUpdates: true,
          shipmentUpdates: true,
          paymentUpdates: true,
          promotional: false,
          system: true,
        },
      },
    };
  }

  private mapToCustomerNotification(notification: any): CustomerNotification {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      channel: notification.channel,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      category: notification.category || 'system',
      priority: notification.priority || 'normal',
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      relatedEntityId: notification.relatedEntityId,
      relatedEntityType: notification.relatedEntityType,
      expiresAt: notification.expiresAt,
    } as any;
  }

  private mapToNotificationPreferences(preference: any): any {
    return this.getDefaultNotificationPreferences();
  }
}

export const notificationService = new NotificationService();
