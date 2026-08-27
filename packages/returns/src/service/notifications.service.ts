/**
 * Returns Notification Service
 *
 * Handles notifications for the returns lifecycle.
 * Integrates with the Notification module to send notifications to customers, shop owners, and admins.
 */

import { returnsEventPublisher } from '../events';

export interface NotificationRecipient {
  id: string;
  type: 'customer' | 'shop_owner' | 'admin';
  email?: string;
  phone?: string;
  userId?: string;
}

export interface NotificationPayload {
  eventType: string;
  recipient: NotificationRecipient;
  data: {
    returnRequestId?: string;
    orderNumber?: string;
    status?: string;
    refundAmount?: number;
    refundMethod?: string;
    pickupDate?: Date;
    trackingNumber?: string;
    inspectionResult?: string;
    reason?: string;
    shopName?: string;
    customerName?: string;
  };
}

export class ReturnsNotificationService {
  /**
   * Send notification to customer
   */
  async sendCustomerNotification(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
  ) {
    // In production, this would integrate with the actual Notification module
    console.log(`[CUSTOMER NOTIFICATION]`, {
      recipient: recipient.email || recipient.userId,
      eventType: payload.eventType,
      data: payload.data,
    });

    // TODO: Integrate with @nabome/notifications package
    // await notificationService.send({
    //   recipientId: recipient.id,
    //   recipientType: 'customer',
    //   channel: 'email',
    //   template: this.getTemplate(payload.eventType),
    //   data: payload.data,
    // });
  }

  /**
   * Send notification to shop owner
   */
  async sendShopOwnerNotification(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
  ) {
    // In production, this would integrate with the actual Notification module
    console.log(`[SHOP OWNER NOTIFICATION]`, {
      recipient: recipient.email || recipient.userId,
      eventType: payload.eventType,
      data: payload.data,
    });

    // TODO: Integrate with @nabome/notifications package
    // await notificationService.send({
    //   recipientId: recipient.id,
    //   recipientType: 'shop_owner',
    //   channel: 'email',
    //   template: this.getTemplate(payload.eventType),
    //   data: payload.data,
    // });
  }

  /**
   * Send notification to admin
   */
  async sendAdminNotification(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
  ) {
    // In production, this would integrate with the actual Notification module
    console.log(`[ADMIN NOTIFICATION]`, {
      recipient: recipient.email || recipient.userId,
      eventType: payload.eventType,
      data: payload.data,
    });

    // TODO: Integrate with @nabome/notifications package
    // await notificationService.send({
    //   recipientId: recipient.id,
    //   recipientType: 'admin',
    //   channel: 'email',
    //   template: this.getTemplate(payload.eventType),
    //   data: payload.data,
    //   priority: payload.eventType === 'dispute.escalated' ? 'high' : 'normal',
    // });
  }

  /**
   * Get notification template based on event type
   */
  private getTemplate(eventType: string): string {
    const templates: Record<string, string> = {
      'return.requested': 'return_requested',
      'return.approved': 'return_approved',
      'return.rejected': 'return_rejected',
      'pickup.scheduled': 'pickup_scheduled',
      'pickup.completed': 'pickup_completed',
      'inspection.completed': 'inspection_completed',
      'refund.initiated': 'refund_initiated',
      'refund.completed': 'refund_completed',
      'return.closed': 'return_closed',
      'dispute.raised': 'dispute_raised',
      'dispute.escalated': 'dispute_escalated',
      'dispute.resolved': 'dispute_resolved',
    };

    return templates[eventType] || 'return_notification';
  }

  /**
   * Handle return requested event
   */
  async handleReturnRequested(data: {
    returnRequestId: string;
    orderId: string;
    orderNumber: string;
    profileId: string;
    shopId: string;
    customerEmail?: string;
    shopOwnerEmail?: string;
  }) {
    // Notify customer
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'return.requested',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
        },
      },
    );

    // Notify shop owner
    await this.sendShopOwnerNotification(
      {
        id: data.shopId,
        type: 'shop_owner',
        email: data.shopOwnerEmail,
      },
      {
        eventType: 'return.requested',
        recipient: { id: data.shopId, type: 'shop_owner' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
        },
      },
    );
  }

  /**
   * Handle return approved event
   */
  async handleReturnApproved(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    customerEmail?: string;
  }) {
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'return.approved',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          status: 'return_approved',
        },
      },
    );
  }

  /**
   * Handle return rejected event
   */
  async handleReturnRejected(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    reason: string;
    customerEmail?: string;
  }) {
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'return.rejected',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          status: 'return_rejected',
          reason: data.reason,
        },
      },
    );
  }

  /**
   * Handle pickup scheduled event
   */
  async handlePickupScheduled(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    pickupDate: Date;
    trackingNumber: string;
    customerEmail?: string;
  }) {
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'pickup.scheduled',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          pickupDate: data.pickupDate,
          trackingNumber: data.trackingNumber,
        },
      },
    );
  }

  /**
   * Handle inspection completed event
   */
  async handleInspectionCompleted(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    shopId: string;
    inspectionResult: string;
    customerEmail?: string;
    shopOwnerEmail?: string;
  }) {
    // Notify customer
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'inspection.completed',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          inspectionResult: data.inspectionResult,
        },
      },
    );

    // Notify shop owner if inspection failed
    if (data.inspectionResult === 'failed') {
      await this.sendShopOwnerNotification(
        {
          id: data.shopId,
          type: 'shop_owner',
          email: data.shopOwnerEmail,
        },
        {
          eventType: 'inspection.completed',
          recipient: { id: data.shopId, type: 'shop_owner' },
          data: {
            returnRequestId: data.returnRequestId,
            orderNumber: data.orderNumber,
            inspectionResult: data.inspectionResult,
          },
        },
      );
    }
  }

  /**
   * Handle refund initiated event
   */
  async handleRefundInitiated(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    refundAmount: number;
    refundMethod: string;
    customerEmail?: string;
  }) {
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'refund.initiated',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          refundAmount: data.refundAmount,
          refundMethod: data.refundMethod,
        },
      },
    );
  }

  /**
   * Handle refund completed event
   */
  async handleRefundCompleted(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    refundAmount: number;
    refundMethod: string;
    customerEmail?: string;
  }) {
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'refund.completed',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          refundAmount: data.refundAmount,
          refundMethod: data.refundMethod,
        },
      },
    );
  }

  /**
   * Handle return closed event
   */
  async handleReturnClosed(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    shopId: string;
    customerEmail?: string;
    shopOwnerEmail?: string;
  }) {
    // Notify customer
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'return.closed',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          status: 'return_closed',
        },
      },
    );

    // Notify shop owner
    await this.sendShopOwnerNotification(
      {
        id: data.shopId,
        type: 'shop_owner',
        email: data.shopOwnerEmail,
      },
      {
        eventType: 'return.closed',
        recipient: { id: data.shopId, type: 'shop_owner' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          status: 'return_closed',
        },
      },
    );
  }

  /**
   * Handle dispute raised event
   */
  async handleDisputeRaised(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    shopId: string;
    reason: string;
    customerEmail?: string;
    shopOwnerEmail?: string;
  }) {
    // Notify shop owner
    await this.sendShopOwnerNotification(
      {
        id: data.shopId,
        type: 'shop_owner',
        email: data.shopOwnerEmail,
      },
      {
        eventType: 'dispute.raised',
        recipient: { id: data.shopId, type: 'shop_owner' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          reason: data.reason,
        },
      },
    );
  }

  /**
   * Handle dispute escalated event
   */
  async handleDisputeEscalated(data: {
    returnRequestId: string;
    orderNumber: string;
    shopId: string;
    reason: string;
    shopOwnerEmail?: string;
    adminEmail?: string;
  }) {
    // Notify shop owner
    await this.sendShopOwnerNotification(
      {
        id: data.shopId,
        type: 'shop_owner',
        email: data.shopOwnerEmail,
      },
      {
        eventType: 'dispute.escalated',
        recipient: { id: data.shopId, type: 'shop_owner' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          reason: data.reason,
        },
      },
    );

    // Notify admin
    await this.sendAdminNotification(
      {
        id: 'admin',
        type: 'admin',
        email: data.adminEmail,
      },
      {
        eventType: 'dispute.escalated',
        recipient: { id: 'admin', type: 'admin' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          reason: data.reason,
        },
      },
    );
  }

  /**
   * Handle dispute resolved event
   */
  async handleDisputeResolved(data: {
    returnRequestId: string;
    orderNumber: string;
    profileId: string;
    shopId: string;
    resolution: string;
    customerEmail?: string;
    shopOwnerEmail?: string;
  }) {
    // Notify customer
    await this.sendCustomerNotification(
      {
        id: data.profileId,
        type: 'customer',
        email: data.customerEmail,
      },
      {
        eventType: 'dispute.resolved',
        recipient: { id: data.profileId, type: 'customer' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          reason: data.resolution,
        },
      },
    );

    // Notify shop owner
    await this.sendShopOwnerNotification(
      {
        id: data.shopId,
        type: 'shop_owner',
        email: data.shopOwnerEmail,
      },
      {
        eventType: 'dispute.resolved',
        recipient: { id: data.shopId, type: 'shop_owner' },
        data: {
          returnRequestId: data.returnRequestId,
          orderNumber: data.orderNumber,
          reason: data.resolution,
        },
      },
    );
  }
}

// Singleton instance
export const returnsNotificationService = new ReturnsNotificationService();
