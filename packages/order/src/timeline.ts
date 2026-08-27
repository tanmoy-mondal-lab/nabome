/**
 * Timeline Service
 *
 * Manages the chronological history of order events.
 * Every significant order event is recorded in the timeline for auditability
 * and customer visibility.
 *
 * Source: ORDER_MANAGEMENT_ARCHITECTURE.md (Timeline section)
 */

import { TimelineEventType, EventPriority, type OrderStatus } from './enums';
import type { TimelineEvent, Timeline } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Event Descriptions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Default descriptions for timeline events.
 * These can be customized per event.
 */
const EVENT_DESCRIPTIONS: Record<TimelineEventType, string> = {
  [TimelineEventType.ORDER_CREATED]: 'Order created',
  [TimelineEventType.PAYMENT_INITIATED]: 'Payment initiated',
  [TimelineEventType.PAYMENT_AUTHORIZED]: 'Payment authorized',
  [TimelineEventType.PAYMENT_CAPTURED]: 'Payment captured',
  [TimelineEventType.PAYMENT_FAILED]: 'Payment failed',
  [TimelineEventType.ORDER_CONFIRMED]: 'Order confirmed',
  [TimelineEventType.INVENTORY_RESERVED]: 'Inventory reserved',
  [TimelineEventType.ORDER_PROCESSING]: 'Order processing started',
  [TimelineEventType.ORDER_PACKED]: 'Order packed',
  [TimelineEventType.READY_FOR_SHIPMENT]: 'Ready for shipment',
  [TimelineEventType.ORDER_SHIPPED]: 'Order shipped',
  [TimelineEventType.ORDER_DELIVERED]: 'Order delivered',
  [TimelineEventType.ORDER_CANCELLED]: 'Order cancelled',
  [TimelineEventType.REFUND_INITIATED]: 'Refund initiated',
  [TimelineEventType.REFUND_COMPLETED]: 'Refund completed',
  [TimelineEventType.RETURN_REQUESTED]: 'Return requested',
  [TimelineEventType.RETURN_APPROVED]: 'Return approved',
  [TimelineEventType.RETURN_RECEIVED]: 'Return received',
  [TimelineEventType.RETURN_PROCESSED]: 'Return processed',
  [TimelineEventType.ORDER_COMPLETED]: 'Order completed',
  [TimelineEventType.ORDER_CLOSED]: 'Order closed',
  [TimelineEventType.NOTE_ADDED]: 'Note added',
  [TimelineEventType.STATUS_UPDATED]: 'Status updated',
  [TimelineEventType.ADDRESS_UPDATED]: 'Address updated',
  [TimelineEventType.MANUAL_OVERRIDE]: 'Manual override',
};

/**
 * Default priority for each event type.
 */
const EVENT_PRIORITIES: Record<TimelineEventType, EventPriority> = {
  [TimelineEventType.ORDER_CREATED]: EventPriority.NORMAL,
  [TimelineEventType.PAYMENT_INITIATED]: EventPriority.NORMAL,
  [TimelineEventType.PAYMENT_AUTHORIZED]: EventPriority.HIGH,
  [TimelineEventType.PAYMENT_CAPTURED]: EventPriority.HIGH,
  [TimelineEventType.PAYMENT_FAILED]: EventPriority.CRITICAL,
  [TimelineEventType.ORDER_CONFIRMED]: EventPriority.HIGH,
  [TimelineEventType.INVENTORY_RESERVED]: EventPriority.NORMAL,
  [TimelineEventType.ORDER_PROCESSING]: EventPriority.NORMAL,
  [TimelineEventType.ORDER_PACKED]: EventPriority.NORMAL,
  [TimelineEventType.READY_FOR_SHIPMENT]: EventPriority.NORMAL,
  [TimelineEventType.ORDER_SHIPPED]: EventPriority.HIGH,
  [TimelineEventType.ORDER_DELIVERED]: EventPriority.HIGH,
  [TimelineEventType.ORDER_CANCELLED]: EventPriority.CRITICAL,
  [TimelineEventType.REFUND_INITIATED]: EventPriority.HIGH,
  [TimelineEventType.REFUND_COMPLETED]: EventPriority.NORMAL,
  [TimelineEventType.RETURN_REQUESTED]: EventPriority.NORMAL,
  [TimelineEventType.RETURN_APPROVED]: EventPriority.NORMAL,
  [TimelineEventType.RETURN_RECEIVED]: EventPriority.NORMAL,
  [TimelineEventType.RETURN_PROCESSED]: EventPriority.NORMAL,
  [TimelineEventType.ORDER_COMPLETED]: EventPriority.NORMAL,
  [TimelineEventType.ORDER_CLOSED]: EventPriority.LOW,
  [TimelineEventType.NOTE_ADDED]: EventPriority.LOW,
  [TimelineEventType.STATUS_UPDATED]: EventPriority.NORMAL,
  [TimelineEventType.ADDRESS_UPDATED]: EventPriority.NORMAL,
  [TimelineEventType.MANUAL_OVERRIDE]: EventPriority.HIGH,
};

/**
 * Customer visibility for each event type.
 */
const EVENT_CUSTOMER_VISIBILITY: Record<TimelineEventType, boolean> = {
  [TimelineEventType.ORDER_CREATED]: true,
  [TimelineEventType.PAYMENT_INITIATED]: true,
  [TimelineEventType.PAYMENT_AUTHORIZED]: true,
  [TimelineEventType.PAYMENT_CAPTURED]: true,
  [TimelineEventType.PAYMENT_FAILED]: true,
  [TimelineEventType.ORDER_CONFIRMED]: true,
  [TimelineEventType.INVENTORY_RESERVED]: false,
  [TimelineEventType.ORDER_PROCESSING]: true,
  [TimelineEventType.ORDER_PACKED]: true,
  [TimelineEventType.READY_FOR_SHIPMENT]: true,
  [TimelineEventType.ORDER_SHIPPED]: true,
  [TimelineEventType.ORDER_DELIVERED]: true,
  [TimelineEventType.ORDER_CANCELLED]: true,
  [TimelineEventType.REFUND_INITIATED]: true,
  [TimelineEventType.REFUND_COMPLETED]: true,
  [TimelineEventType.RETURN_REQUESTED]: true,
  [TimelineEventType.RETURN_APPROVED]: true,
  [TimelineEventType.RETURN_RECEIVED]: true,
  [TimelineEventType.RETURN_PROCESSED]: true,
  [TimelineEventType.ORDER_COMPLETED]: true,
  [TimelineEventType.ORDER_CLOSED]: false,
  [TimelineEventType.NOTE_ADDED]: false,
  [TimelineEventType.STATUS_UPDATED]: true,
  [TimelineEventType.ADDRESS_UPDATED]: true,
  [TimelineEventType.MANUAL_OVERRIDE]: false,
};

// ──────────────────────────────────────────────────────────────────────────────
// Timeline Service Class
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Timeline Service
 *
 * Manages the creation and retrieval of timeline events.
 */
export class TimelineService {
  /**
   * Create a new timeline event.
   */
  createEvent(params: {
    orderId: string;
    type: TimelineEventType;
    description?: string;
    performedBy?: string;
    performedByType?: 'customer' | 'shop_owner' | 'admin' | 'system';
    previousStatus?: OrderStatus;
    newStatus?: OrderStatus;
    data?: Record<string, unknown>;
  }): TimelineEvent {
    const {
      orderId,
      type,
      description,
      performedBy,
      performedByType,
      previousStatus,
      newStatus,
      data,
    } = params;

    return {
      id: crypto.randomUUID(),
      orderId,
      type,
      description: description ?? EVENT_DESCRIPTIONS[type],
      occurredAt: new Date().toISOString(),
      performedBy: performedBy ?? null,
      performedByType: performedByType ?? null,
      previousStatus: previousStatus ?? null,
      newStatus: newStatus ?? null,
      priority: EVENT_PRIORITIES[type],
      data: data ?? null,
      customerVisible: EVENT_CUSTOMER_VISIBILITY[type],
    };
  }

  /**
   * Create an order created event.
   */
  createOrderCreatedEvent(orderId: string, orderNumber: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_CREATED,
      description: `Order ${orderNumber} created`,
      performedByType: 'system',
      data: { orderNumber },
    });
  }

  /**
   * Create a payment initiated event.
   */
  createPaymentInitiatedEvent(
    orderId: string,
    paymentId: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.PAYMENT_INITIATED,
      description: 'Payment initiated',
      performedByType: 'system',
      data: { paymentId },
    });
  }

  /**
   * Create a payment authorized event.
   */
  createPaymentAuthorizedEvent(
    orderId: string,
    paymentId: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.PAYMENT_AUTHORIZED,
      description: 'Payment authorized',
      performedByType: 'system',
      data: { paymentId },
    });
  }

  /**
   * Create a payment captured event.
   */
  createPaymentCapturedEvent(
    orderId: string,
    paymentId: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.PAYMENT_CAPTURED,
      description: 'Payment captured',
      performedByType: 'system',
      data: { paymentId },
    });
  }

  /**
   * Create a payment failed event.
   */
  createPaymentFailedEvent(
    orderId: string,
    paymentId: string,
    reason: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.PAYMENT_FAILED,
      description: `Payment failed: ${reason}`,
      performedByType: 'system',
      data: { paymentId, reason },
    });
  }

  /**
   * Create an order confirmed event.
   */
  createOrderConfirmedEvent(orderId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_CONFIRMED,
      description: 'Order confirmed',
      performedByType: 'system',
    });
  }

  /**
   * Create an inventory reserved event.
   */
  createInventoryReservedEvent(
    orderId: string,
    reservationId: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.INVENTORY_RESERVED,
      description: 'Inventory reserved',
      performedByType: 'system',
      data: { reservationId },
    });
  }

  /**
   * Create an order processing event.
   */
  createOrderProcessingEvent(orderId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_PROCESSING,
      description: 'Order processing started',
      performedByType: 'system',
    });
  }

  /**
   * Create an order packed event.
   */
  createOrderPackedEvent(
    orderId: string,
    performedBy: string,
    performedByType: 'shop_owner' | 'admin',
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_PACKED,
      description: 'Order packed',
      performedBy,
      performedByType,
    });
  }

  /**
   * Create a ready for shipment event.
   */
  createReadyForShipmentEvent(orderId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.READY_FOR_SHIPMENT,
      description: 'Ready for shipment',
      performedByType: 'system',
    });
  }

  /**
   * Create an order shipped event.
   */
  createOrderShippedEvent(
    orderId: string,
    trackingNumber: string,
    carrier: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_SHIPPED,
      description: `Order shipped via ${carrier} - Tracking: ${trackingNumber}`,
      performedByType: 'system',
      data: { trackingNumber, carrier },
    });
  }

  /**
   * Create an order delivered event.
   */
  createOrderDeliveredEvent(orderId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_DELIVERED,
      description: 'Order delivered',
      performedByType: 'system',
    });
  }

  /**
   * Create an order cancelled event.
   */
  createOrderCancelledEvent(
    orderId: string,
    reason: string,
    performedBy: string,
    performedByType: 'customer' | 'admin',
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_CANCELLED,
      description: `Order cancelled: ${reason}`,
      performedBy,
      performedByType,
      data: { reason },
    });
  }

  /**
   * Create a refund initiated event.
   */
  createRefundInitiatedEvent(
    orderId: string,
    refundId: string,
    amount: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.REFUND_INITIATED,
      description: `Refund initiated: ₹${amount}`,
      performedByType: 'system',
      data: { refundId, amount },
    });
  }

  /**
   * Create a refund completed event.
   */
  createRefundCompletedEvent(orderId: string, refundId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.REFUND_COMPLETED,
      description: 'Refund completed',
      performedByType: 'system',
      data: { refundId },
    });
  }

  /**
   * Create a return requested event.
   */
  createReturnRequestedEvent(
    orderId: string,
    returnId: string,
    reason: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.RETURN_REQUESTED,
      description: `Return requested: ${reason}`,
      performedByType: 'customer',
      data: { returnId, reason },
    });
  }

  /**
   * Create a return approved event.
   */
  createReturnApprovedEvent(
    orderId: string,
    returnId: string,
    performedBy: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.RETURN_APPROVED,
      description: 'Return approved',
      performedBy,
      performedByType: 'admin',
      data: { returnId },
    });
  }

  /**
   * Create a return received event.
   */
  createReturnReceivedEvent(orderId: string, returnId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.RETURN_RECEIVED,
      description: 'Return received',
      performedByType: 'system',
      data: { returnId },
    });
  }

  /**
   * Create a return processed event.
   */
  createReturnProcessedEvent(orderId: string, returnId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.RETURN_PROCESSED,
      description: 'Return processed',
      performedByType: 'system',
      data: { returnId },
    });
  }

  /**
   * Create an order completed event.
   */
  createOrderCompletedEvent(orderId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_COMPLETED,
      description: 'Order completed',
      performedByType: 'system',
    });
  }

  /**
   * Create an order closed event.
   */
  createOrderClosedEvent(orderId: string): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.ORDER_CLOSED,
      description: 'Order closed',
      performedByType: 'system',
    });
  }

  /**
   * Create a note added event.
   */
  createNoteAddedEvent(
    orderId: string,
    note: string,
    performedBy: string,
    performedByType: 'shop_owner' | 'admin',
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.NOTE_ADDED,
      description: 'Note added',
      performedBy,
      performedByType,
      data: { note },
    });
  }

  /**
   * Create a status updated event.
   */
  createStatusUpdatedEvent(
    orderId: string,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.STATUS_UPDATED,
      description: `Status updated from ${previousStatus} to ${newStatus}`,
      performedByType: 'system',
      previousStatus,
      newStatus,
    });
  }

  /**
   * Create a manual override event.
   */
  createManualOverrideEvent(
    orderId: string,
    action: string,
    performedBy: string,
  ): TimelineEvent {
    return this.createEvent({
      orderId,
      type: TimelineEventType.MANUAL_OVERRIDE,
      description: `Manual override: ${action}`,
      performedBy,
      performedByType: 'admin',
      data: { action },
    });
  }

  /**
   * Filter timeline events for customer visibility.
   */
  filterCustomerVisibleEvents(events: TimelineEvent[]): TimelineEvent[] {
    return events.filter((event) => event.customerVisible);
  }

  /**
   * Sort timeline events chronologically (newest first).
   */
  sortEventsChronologically(events: TimelineEvent[]): TimelineEvent[] {
    return [...events].sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }

  /**
   * Build a timeline from events.
   */
  buildTimeline(orderId: string, events: TimelineEvent[]): Timeline {
    const sortedEvents = this.sortEventsChronologically(events);
    return {
      orderId,
      events: sortedEvents,
      totalEvents: sortedEvents.length,
    };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Singleton Instance
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Singleton instance of the Timeline Service.
 * Use this instance throughout the application.
 */
export const timelineService = new TimelineService();
