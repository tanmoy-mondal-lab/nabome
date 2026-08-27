/**
 * Notification Service
 *
 * Business logic for customer notification management.
 * Handles inbox, read/unread status, categories, and notification preferences.
 *
 * Source: NOTIFICATION_COMMUNICATION_MESSAGING_ARCHITECTURE.md (binding)
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 */

import type { Id } from '@nabome/types';

import { publishNotificationRead } from '../events';
import type {
  CustomerNotification,
  NotificationSummary,
  MarkNotificationsReadRequest,
  UpdateNotificationPreferencesRequest,
  NotificationPreferences,
  NotificationCategory,
} from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// Notification Service
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Notification Service
 * Handles all notification-related business logic.
 */
export class NotificationService {
  /**
   * Get notification summary for a user
   */
  async getNotificationSummary(userId: Id): Promise<NotificationSummary> {
    const notifications = await this.getNotifications(userId);
    const unreadCount = notifications.filter((n) => !n.readAt).length;
    const unreadByCategory = this.groupUnreadByCategory(notifications);

    return {
      unreadCount,
      totalCount: notifications.length,
      unreadByCategory,
      recentNotifications: notifications.slice(0, 10),
    };
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: Id,
    options?: {
      category?: NotificationCategory;
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<CustomerNotification[]> {
    // TODO: Implement database query with filtering
    // const where: any = { userId };
    // if (options?.category) {
    //   where.category = options.category;
    // }
    // if (options?.unreadOnly) {
    //   where.readAt = null;
    // }
    //
    // const notifications = await prisma.notification.findMany({
    //   where,
    //   orderBy: { createdAt: 'desc' },
    //   take: options?.limit || 50,
    //   skip: options?.offset || 0,
    // });
    //
    // return notifications.map(n => this.mapToCustomerNotification(n));
    return [];
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(
    userId: Id,
    request: MarkNotificationsReadRequest,
  ): Promise<void> {
    if (request.markAll) {
      // Mark all as read
      // TODO: Implement database update
      // await prisma.notification.updateMany({
      //   where: { userId, readAt: null },
      //   data: { readAt: new Date() },
      // });

      // Get all unread notification IDs for event
      const unreadNotifications = await this.getNotifications(userId, {
        unreadOnly: true,
      });
      const notificationIds = unreadNotifications.map((n) => n.id);
      await publishNotificationRead(userId, notificationIds);
    } else if (request.notificationIds && request.notificationIds.length > 0) {
      // Mark specific notifications as read
      // TODO: Implement database update
      // await prisma.notification.updateMany({
      //   where: {
      //     id: { in: request.notificationIds },
      //     userId,
      //   },
      //   data: { readAt: new Date() },
      // });

      await publishNotificationRead(userId, request.notificationIds);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(userId: Id, notificationId: Id): Promise<void> {
    // TODO: Implement database delete with ownership check
    // await prisma.notification.deleteMany({
    //   where: { id: notificationId, userId },
    // });
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: Id,
    request: UpdateNotificationPreferencesRequest,
  ): Promise<NotificationPreferences> {
    // TODO: Implement database update for notification preferences
    // const current = await this.getNotificationPreferences(userId);
    //
    // const updated = await prisma.notificationPreference.upsert({
    //   where: { userId },
    //   create: { userId, [`${request.channel}Enabled`]: request.enabled },
    //   update: { [`${request.channel}Enabled`]: request.enabled },
    // });
    //
    // if (request.categories) {
    //   await prisma.notificationPreferenceCategory.upsert({
    //     where: { userId_channel: { userId, channel: request.channel } },
    //     create: { userId, channel: request.channel, ...request.categories },
    //     update: request.categories,
    //   });
    // }

    return this.getDefaultNotificationPreferences();
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(
    userId: Id,
  ): Promise<NotificationPreferences> {
    // TODO: Implement database query
    // const preferences = await prisma.notificationPreference.findUnique({
    //   where: { userId },
    //   include: { categories: true },
    // });
    // if (!preferences) {
    //   return this.getDefaultNotificationPreferences();
    // }
    // return this.mapToNotificationPreferences(preferences);
    return this.getDefaultNotificationPreferences();
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Group unread notifications by category
   */
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
    for (const category of categories) {
      grouped[category] = 0;
    }

    for (const notification of notifications) {
      if (!notification.readAt) {
        grouped[notification.category] =
          (grouped[notification.category] || 0) + 1;
      }
    }

    return grouped as Record<NotificationCategory, number>;
  }

  /**
   * Get default notification preferences
   */
  private getDefaultNotificationPreferences(): NotificationPreferences {
    return {
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

  /**
   * Map database notification to customer notification
   */
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
    };
  }

  /**
   * Map database preference to notification preferences
   */
  private mapToNotificationPreferences(
    preference: any,
  ): NotificationPreferences {
    return this.getDefaultNotificationPreferences();
  }
}

// Singleton instance
export const notificationService = new NotificationService();
