/**
 * Payment Notifications - Generate notifications for payment events
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §14 (Notifications),
 * NOTIFICATION_COMMUNICATION_MESSAGING_ARCHITECTURE.md (if exists)
 *
 * This module provides notification generation for payment lifecycle events:
 * - Payment success notifications
 * - Payment failure notifications
 * - Refund initiated notifications
 * - Refund completed notifications
 * - Settlement completed notifications
 */

import type { PaymentEventEmitter } from './events';
import { PaymentEventType } from './events';

/**
 * Notification channel
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification recipient
 */
export interface NotificationRecipient {
  userId?: string;
  email?: string;
  phone?: string;
  shopId?: string;
  role?: 'customer' | 'shop_owner' | 'admin';
}

/**
 * Notification template
 */
export interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  templateId: string;
  recipients: NotificationRecipient[];
  channels: NotificationChannel[];
  priority: NotificationPriority;
  data: Record<string, unknown>;
  scheduledAt: Date;
  sentAt?: Date;
}

/**
 * Notification publisher interface
 */
export interface NotificationPublisher {
  publish(notification: Notification): Promise<void>;
  publishBatch(notifications: Notification[]): Promise<void>;
}

/**
 * In-memory notification publisher (for development/testing)
 */
export class InMemoryNotificationPublisher implements NotificationPublisher {
  private notifications: Notification[] = [];

  async publish(notification: Notification): Promise<void> {
    this.notifications.push(notification);
  }

  async publishBatch(notifications: Notification[]): Promise<void> {
    this.notifications.push(...notifications);
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  clear(): void {
    this.notifications = [];
  }
}

/**
 * Notification templates
 */
const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  [PaymentEventType.PAYMENT_CAPTURED]: {
    id: 'payment_success',
    title: 'Payment Successful',
    body: 'Your payment of {{amount}} {{currency}} has been successfully processed for order #{{orderId}}.',
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
  },
  [PaymentEventType.PAYMENT_FAILED]: {
    id: 'payment_failed',
    title: 'Payment Failed',
    body: 'Your payment of {{amount}} {{currency}} for order #{{orderId}} has failed. {{reason}}',
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.HIGH,
  },
  [PaymentEventType.REFUND_INITIATED]: {
    id: 'refund_initiated',
    title: 'Refund Initiated',
    body: 'A refund of {{amount}} {{currency}} has been initiated for order #{{orderId}}. Reason: {{reason}}',
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
  },
  [PaymentEventType.REFUND_COMPLETED]: {
    id: 'refund_completed',
    title: 'Refund Completed',
    body: 'Your refund of {{amount}} {{currency}} for order #{{orderId}} has been successfully processed.',
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
  },
  [PaymentEventType.SETTLEMENT_COMPLETED]: {
    id: 'settlement_completed',
    title: 'Settlement Completed',
    body: 'Settlement #{{settlementNumber}} for {{amount}} {{currency}} has been completed and will be transferred to your bank account.',
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
  },
  [PaymentEventType.SETTLEMENT_PAID]: {
    id: 'settlement_paid',
    title: 'Settlement Paid',
    body: 'Settlement #{{settlementNumber}} for {{amount}} {{currency}} has been paid to your bank account.',
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
  },
};

/**
 * Payment Notification Service class
 */
export class PaymentNotificationService {
  constructor(
    _eventEmitter: PaymentEventEmitter,
    private notificationPublisher: NotificationPublisher,
  ) {}

  /**
   * Generate notification ID
   */
  private generateNotificationId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Create notification from template
   */
  private createNotification(
    template: NotificationTemplate,
    recipients: NotificationRecipient[],
    data: Record<string, unknown>,
  ): Notification {
    return {
      id: this.generateNotificationId(),
      templateId: template.id,
      recipients,
      channels: template.channels,
      priority: template.priority,
      data,
      scheduledAt: new Date(),
    };
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccessNotification(
    orderId: string,
    amount: number,
    currency: string,
    userId: string,
    email: string,
  ): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[PaymentEventType.PAYMENT_CAPTURED];
    if (!template) return;

    const notification = this.createNotification(
      template,
      [{ userId, email, role: 'customer' }],
      { orderId, amount, currency },
    );

    await this.notificationPublisher.publish(notification);
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailureNotification(
    orderId: string,
    amount: number,
    currency: string,
    reason: string,
    userId: string,
    email: string,
  ): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[PaymentEventType.PAYMENT_FAILED];
    if (!template) return;

    const notification = this.createNotification(
      template,
      [{ userId, email, role: 'customer' }],
      { orderId, amount, currency, reason },
    );

    await this.notificationPublisher.publish(notification);
  }

  /**
   * Send refund initiated notification
   */
  async sendRefundInitiatedNotification(
    orderId: string,
    amount: number,
    currency: string,
    reason: string,
    userId: string,
    email: string,
  ): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[PaymentEventType.REFUND_INITIATED];
    if (!template) return;

    const notification = this.createNotification(
      template,
      [{ userId, email, role: 'customer' }],
      { orderId, amount, currency, reason },
    );

    await this.notificationPublisher.publish(notification);
  }

  /**
   * Send refund completed notification
   */
  async sendRefundCompletedNotification(
    orderId: string,
    amount: number,
    currency: string,
    userId: string,
    email: string,
  ): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[PaymentEventType.REFUND_COMPLETED];
    if (!template) return;

    const notification = this.createNotification(
      template,
      [{ userId, email, role: 'customer' }],
      { orderId, amount, currency },
    );

    await this.notificationPublisher.publish(notification);
  }

  /**
   * Send settlement completed notification to shop owner
   */
  async sendSettlementCompletedNotification(
    settlementNumber: string,
    amount: number,
    currency: string,
    shopId: string,
    shopOwnerEmail: string,
  ): Promise<void> {
    const template =
      NOTIFICATION_TEMPLATES[PaymentEventType.SETTLEMENT_COMPLETED];
    if (!template) return;

    const notification = this.createNotification(
      template,
      [{ shopId, email: shopOwnerEmail, role: 'shop_owner' }],
      { settlementNumber, amount, currency },
    );

    await this.notificationPublisher.publish(notification);
  }

  /**
   * Send settlement paid notification to shop owner
   */
  async sendSettlementPaidNotification(
    settlementNumber: string,
    amount: number,
    currency: string,
    shopId: string,
    shopOwnerEmail: string,
  ): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[PaymentEventType.SETTLEMENT_PAID];
    if (!template) return;

    const notification = this.createNotification(
      template,
      [{ shopId, email: shopOwnerEmail, role: 'shop_owner' }],
      { settlementNumber, amount, currency },
    );

    await this.notificationPublisher.publish(notification);
  }

  /**
   * Subscribe to payment events and send notifications
   */
  async subscribeToPaymentEvents(): Promise<void> {
    // This would subscribe to the event emitter and automatically send notifications
    // For now, this is a placeholder for the event subscription logic
    // In production, this would use the event emitter's subscription mechanism
  }

  /**
   * Get notification template
   */
  getTemplate(eventType: PaymentEventType): NotificationTemplate | undefined {
    return NOTIFICATION_TEMPLATES[eventType];
  }

  /**
   * Get all notification templates
   */
  getAllTemplates(): Record<string, NotificationTemplate> {
    return { ...NOTIFICATION_TEMPLATES };
  }
}

/**
 * Payment notification service factory
 */
export function createPaymentNotificationService(
  eventEmitter: PaymentEventEmitter,
  notificationPublisher: NotificationPublisher,
): PaymentNotificationService {
  return new PaymentNotificationService(eventEmitter, notificationPublisher);
}
