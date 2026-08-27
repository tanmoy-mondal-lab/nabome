/**
 * Shipment Notification Service
 *
 * Manages notification events for shipment lifecycle.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import type { Id } from '@nabome/types';

import type {
  ShipmentStatus,
  TrackingEventType,
  ExceptionType,
  ActorType,
} from './enums';
import {
  logisticsEventPublisher,
  createShipmentCreatedEvent,
  createShipmentStatusChangedEvent,
  createTrackingEventAddedEvent,
  createFulfillmentCompletedEvent,
  createDeliveryConfirmedEvent,
  createShippingExceptionEvent,
} from './event-publisher';
import type {
  ShipmentCreatedEvent,
  ShipmentStatusChangedEvent,
  TrackingEventAddedEvent,
  FulfillmentCompletedEvent,
  DeliveryConfirmedEvent,
  ShippingExceptionEvent,
} from './types';

/**
 * Shipment Notification Service
 *
 * Publishes notification events for shipment lifecycle changes.
 * Integrates with the Logistics Event Publisher.
 */
export class ShipmentNotificationService {
  /**
   * Notify when a shipment is created
   */
  async notifyShipmentCreated(
    shipmentId: Id,
    orderId: Id,
    carrierCode: string | null,
  ): Promise<void> {
    const event: ShipmentCreatedEvent = createShipmentCreatedEvent(
      shipmentId,
      orderId,
      carrierCode,
    );
    await logisticsEventPublisher.publishShipmentCreated(event);
  }

  /**
   * Notify when shipment status changes
   */
  async notifyShipmentStatusChanged(
    shipmentId: Id,
    orderId: Id,
    previousStatus: ShipmentStatus,
    newStatus: ShipmentStatus,
    actorType: ActorType,
    actorId: Id | null,
  ): Promise<void> {
    const event: ShipmentStatusChangedEvent = createShipmentStatusChangedEvent(
      shipmentId,
      orderId,
      previousStatus,
      newStatus,
      actorType,
      actorId,
    );
    await logisticsEventPublisher.publishShipmentStatusChanged(event);
  }

  /**
   * Notify when a tracking event is added
   */
  async notifyTrackingEventAdded(
    shipmentId: Id,
    trackingNumber: string,
    status: TrackingEventType,
    location: string | null,
    description: string,
  ): Promise<void> {
    const event: TrackingEventAddedEvent = createTrackingEventAddedEvent(
      shipmentId,
      trackingNumber,
      status,
      location,
      description,
    );
    await logisticsEventPublisher.publishTrackingEventAdded(event);
  }

  /**
   * Notify when fulfillment is completed
   */
  async notifyFulfillmentCompleted(
    fulfillmentId: Id,
    orderId: Id,
    shipmentId: Id | null,
    completedBy: Id,
  ): Promise<void> {
    const event: FulfillmentCompletedEvent = createFulfillmentCompletedEvent(
      fulfillmentId,
      orderId,
      shipmentId,
      completedBy,
    );
    await logisticsEventPublisher.publishFulfillmentCompleted(event);
  }

  /**
   * Notify when delivery is confirmed
   */
  async notifyDeliveryConfirmed(
    shipmentId: Id,
    orderId: Id,
    confirmationType: string,
    confirmedBy: Id,
  ): Promise<void> {
    const event: DeliveryConfirmedEvent = createDeliveryConfirmedEvent(
      shipmentId,
      orderId,
      confirmationType,
      confirmedBy,
    );
    await logisticsEventPublisher.publishDeliveryConfirmed(event);
  }

  /**
   * Notify when a shipping exception occurs
   */
  async notifyShippingException(
    exceptionId: Id,
    shipmentId: Id,
    exceptionType: ExceptionType,
    description: string,
  ): Promise<void> {
    const event: ShippingExceptionEvent = createShippingExceptionEvent(
      exceptionId,
      shipmentId,
      exceptionType,
      description,
    );
    await logisticsEventPublisher.publishShippingException(event);
  }

  /**
   * Send customer notification for shipment status change
   * This would integrate with the notification system
   */
  async sendCustomerNotification(
    customerId: Id,
    shipmentId: Id,
    status: ShipmentStatus,
    message: string,
  ): Promise<void> {
    // In a real implementation, this would call the notification service
    // to send email/SMS/push notifications to the customer
    console.log(
      `[Customer Notification] Customer: ${customerId}, Shipment: ${shipmentId}, Status: ${status}, Message: ${message}`,
    );
  }

  /**
   * Send shop owner notification for fulfillment queue update
   */
  async sendShopOwnerNotification(
    shopOwnerId: Id,
    fulfillmentId: Id,
    orderId: Id,
    message: string,
  ): Promise<void> {
    // In a real implementation, this would call the notification service
    // to send notifications to the shop owner
    console.log(
      `[Shop Owner Notification] Owner: ${shopOwnerId}, Fulfillment: ${fulfillmentId}, Order: ${orderId}, Message: ${message}`,
    );
  }

  /**
   * Send admin notification for shipping exception
   */
  async sendAdminNotification(
    shipmentId: Id,
    exceptionType: ExceptionType,
    message: string,
  ): Promise<void> {
    // In a real implementation, this would call the notification service
    // to send alerts to admin users
    console.log(
      `[Admin Notification] Shipment: ${shipmentId}, Exception: ${exceptionType}, Message: ${message}`,
    );
  }
}

/**
 * Factory function to create a ShipmentNotificationService instance
 */
export function createShipmentNotificationService(): ShipmentNotificationService {
  return new ShipmentNotificationService();
}
