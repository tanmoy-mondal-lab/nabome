/**
 * Logistics Event Publisher
 *
 * This file implements the event publisher for logistics events.
 * Publishes shipment lifecycle events for integration with notifications, analytics, etc.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import {
  ShipmentStatus,
  type TrackingEventType,
  type ExceptionType,
} from './enums';
import type {
  LogisticsEvent,
  ShipmentCreatedEvent,
  ShipmentStatusChangedEvent,
  TrackingEventAddedEvent,
  FulfillmentCompletedEvent,
  DeliveryConfirmedEvent,
  ShippingExceptionEvent,
} from './types';

/**
 * Logistics Event Publisher
 *
 * Publishes logistics events for integration with other systems.
 * This is a simple in-memory implementation that can be extended
 * to use a message queue like Cloudflare Queues or RabbitMQ.
 */
export class LogisticsEventPublisher {
  private eventHandlers: Map<string, Array<(event: LogisticsEvent) => void>> =
    new Map();

  /**
   * Register an event handler for a specific event type
   */
  on(eventType: string, handler: (event: LogisticsEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Unregister an event handler
   */
  off(eventType: string, handler: (event: LogisticsEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Publish an event to all registered handlers
   */
  private async publish(event: LogisticsEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.type}:`, error);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipment Events
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Publish shipment created event
   */
  async publishShipmentCreated(event: ShipmentCreatedEvent): Promise<void> {
    await this.publish({
      type: 'shipment.created',
      timestamp: new Date(),
      data: event,
    });
  }

  /**
   * Publish shipment status changed event
   */
  async publishShipmentStatusChanged(
    event: ShipmentStatusChangedEvent,
  ): Promise<void> {
    await this.publish({
      type: 'shipment.status_changed',
      timestamp: new Date(),
      data: event,
    });
  }

  /**
   * Publish tracking event added event
   */
  async publishTrackingEventAdded(
    event: TrackingEventAddedEvent,
  ): Promise<void> {
    await this.publish({
      type: 'shipment.tracking_event_added',
      timestamp: new Date(),
      data: event,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Fulfillment Events
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Publish fulfillment completed event
   */
  async publishFulfillmentCompleted(
    event: FulfillmentCompletedEvent,
  ): Promise<void> {
    await this.publish({
      type: 'fulfillment.completed',
      timestamp: new Date(),
      data: event,
    });
  }

  /**
   * Publish fulfillment started event
   */
  async publishFulfillmentStarted(
    fulfillmentId: string,
    orderId: string,
    assignedTo: string,
  ): Promise<void> {
    await this.publish({
      type: 'fulfillment.started',
      timestamp: new Date(),
      data: {
        fulfillmentId,
        orderId,
        assignedTo,
      },
    });
  }

  /**
   * Publish fulfillment failed event
   */
  async publishFulfillmentFailed(
    fulfillmentId: string,
    orderId: string,
    reason: string,
  ): Promise<void> {
    await this.publish({
      type: 'fulfillment.failed',
      timestamp: new Date(),
      data: {
        fulfillmentId,
        orderId,
        reason,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Delivery Events
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Publish delivery confirmed event
   */
  async publishDeliveryConfirmed(event: DeliveryConfirmedEvent): Promise<void> {
    await this.publish({
      type: 'delivery.confirmed',
      timestamp: new Date(),
      data: event,
    });
  }

  /**
   * Publish delivery failed event
   */
  async publishDeliveryFailed(
    shipmentId: string,
    orderId: string,
    reason: string,
  ): Promise<void> {
    await this.publish({
      type: 'delivery.failed',
      timestamp: new Date(),
      data: {
        shipmentId,
        orderId,
        reason,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Exception Events
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Publish shipping exception event
   */
  async publishShippingException(event: ShippingExceptionEvent): Promise<void> {
    await this.publish({
      type: 'shipping.exception',
      timestamp: new Date(),
      data: event,
    });
  }

  /**
   * Publish exception resolved event
   */
  async publishExceptionResolved(
    exceptionId: string,
    shipmentId: string,
    resolvedBy: string,
  ): Promise<void> {
    await this.publish({
      type: 'shipping.exception_resolved',
      timestamp: new Date(),
      data: {
        exceptionId,
        shipmentId,
        resolvedBy,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Carrier Events
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Publish carrier health check event
   */
  async publishCarrierHealthCheck(
    carrierCode: string,
    isHealthy: boolean,
    latency?: number,
  ): Promise<void> {
    await this.publish({
      type: 'carrier.health_check',
      timestamp: new Date(),
      data: {
        carrierCode,
        isHealthy,
        latency,
      },
    });
  }

  /**
   * Publish carrier rate calculation event
   */
  async publishCarrierRateCalculation(
    carrierCode: string,
    success: boolean,
    rate?: number,
  ): Promise<void> {
    await this.publish({
      type: 'carrier.rate_calculation',
      timestamp: new Date(),
      data: {
        carrierCode,
        success,
        rate,
      },
    });
  }
}

/**
 * Singleton instance of the logistics event publisher
 */
export const logisticsEventPublisher = new LogisticsEventPublisher();

/**
 * Helper function to create event payloads
 */
export const createShipmentCreatedEvent = (
  shipmentId: string,
  orderId: string,
  carrierCode: string | null,
): ShipmentCreatedEvent => ({
  shipmentId,
  orderId,
  carrierCode,
  status: ShipmentStatus.SHIPMENT_CREATED,
});

export const createShipmentStatusChangedEvent = (
  shipmentId: string,
  orderId: string,
  previousStatus: ShipmentStatus,
  newStatus: ShipmentStatus,
  actorType: string,
  actorId: string | null,
): ShipmentStatusChangedEvent => ({
  shipmentId,
  orderId,
  previousStatus,
  newStatus,
  actorType,
  actorId,
});

export const createTrackingEventAddedEvent = (
  shipmentId: string,
  trackingNumber: string,
  status: TrackingEventType,
  location: string | null,
  description: string,
): TrackingEventAddedEvent => ({
  shipmentId,
  trackingNumber,
  status,
  location,
  description,
});

export const createFulfillmentCompletedEvent = (
  fulfillmentId: string,
  orderId: string,
  shipmentId: string | null,
  completedBy: string,
): FulfillmentCompletedEvent => ({
  fulfillmentId,
  orderId,
  shipmentId,
  completedBy,
});

export const createDeliveryConfirmedEvent = (
  shipmentId: string,
  orderId: string,
  confirmationType: string,
  confirmedBy: string,
): DeliveryConfirmedEvent => ({
  shipmentId,
  orderId,
  confirmationType,
  confirmedBy,
});

export const createShippingExceptionEvent = (
  exceptionId: string,
  shipmentId: string,
  exceptionType: ExceptionType,
  description: string,
): ShippingExceptionEvent => ({
  exceptionId,
  shipmentId,
  exceptionType,
  description,
});
