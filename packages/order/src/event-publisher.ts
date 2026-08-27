/**
 * Event Publisher
 *
 * Publishes order events to various systems (Inventory, Shipping, Payments,
 * Notifications, Analytics, Finance). This implements the event-driven architecture
 * for the Order Management System.
 *
 * Source: ORDER_MANAGEMENT_ARCHITECTURE.md (Event System section)
 */

import { TimelineEventType } from './enums';
import type {
  OrderEvent,
  OrderCreatedEvent,
  OrderStatusChangedEvent,
  InventoryReservedEvent,
  InventoryReleasedEvent,
  ShipmentCreatedEvent,
  ShipmentDeliveredEvent,
  RefundInitiatedEvent,
  ReturnRequestedEvent,
} from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Event Subscriber Interface
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Event Subscriber
 * Systems can subscribe to order events by implementing this interface.
 */
export interface EventSubscriber {
  /** Subscriber name */
  name: string;

  /** Event types this subscriber is interested in */
  subscribedEvents: string[];

  /** Handle an event */
  handle(event: OrderEvent): Promise<void>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Event Publisher Class
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Event Publisher
 *
 * Manages event publishing to subscribers.
 * Implements the publish-subscribe pattern for order events.
 */
export class EventPublisher {
  private subscribers: Map<string, EventSubscriber> = new Map();
  private eventQueue: OrderEvent[] = [];
  private isProcessing = false;

  /**
   * Register a subscriber.
   */
  subscribe(subscriber: EventSubscriber): void {
    this.subscribers.set(subscriber.name, subscriber);
  }

  /**
   * Unregister a subscriber.
   */
  unsubscribe(subscriberName: string): void {
    this.subscribers.delete(subscriberName);
  }

  /**
   * Publish an event to all interested subscribers.
   */
  async publish(event: OrderEvent): Promise<void> {
    this.eventQueue.push(event);
    await this.processQueue();
  }

  /**
   * Process the event queue.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.deliverToSubscribers(event);
    }

    this.isProcessing = false;
  }

  /**
   * Deliver an event to all interested subscribers.
   */
  private async deliverToSubscribers(event: OrderEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const subscriber of this.subscribers.values()) {
      if (subscriber.subscribedEvents.includes(event.type)) {
        promises.push(this.handleSubscriberError(subscriber, event));
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Handle subscriber errors gracefully.
   */
  private async handleSubscriberError(
    subscriber: EventSubscriber,
    event: OrderEvent,
  ): Promise<void> {
    try {
      await subscriber.handle(event);
    } catch (error) {
      console.error(
        `Error in subscriber ${subscriber.name} for event ${event.type}:`,
        error,
      );
      // TODO: Implement retry logic or dead letter queue
    }
  }

  /**
   * Publish an order created event.
   */
  async publishOrderCreated(data: OrderCreatedEvent['data']): Promise<void> {
    const event: OrderCreatedEvent = {
      id: crypto.randomUUID(),
      type: 'order.created',
      orderId: data.orderId,
      data,
      createdAt: new Date().toISOString(),
      priority: 'normal',
      processed: false,
      processingAttempts: 0,
    };

    await this.publish(event);
  }

  /**
   * Publish an order status changed event.
   */
  async publishOrderStatusChanged(
    data: OrderStatusChangedEvent['data'],
  ): Promise<void> {
    const event: OrderStatusChangedEvent = {
      id: crypto.randomUUID(),
      type: 'order.status_changed',
      orderId: data.orderId,
      data,
      createdAt: new Date().toISOString(),
      priority: 'high',
      processed: false,
      processingAttempts: 0,
    };

    await this.publish(event);
  }

  /**
   * Publish an inventory reserved event.
   */
  async publishInventoryReserved(
    data: InventoryReservedEvent['data'],
  ): Promise<void> {
    const event: InventoryReservedEvent = {
      id: crypto.randomUUID(),
      type: 'inventory.reserved',
      orderId: data.orderId,
      data,
      createdAt: new Date().toISOString(),
      priority: 'high',
      processed: false,
      processingAttempts: 0,
    };

    await this.publish(event);
  }

  /**
   * Publish an inventory released event.
   */
  async publishInventoryReleased(
    data: InventoryReleasedEvent['data'],
  ): Promise<void> {
    const event: InventoryReleasedEvent = {
      id: crypto.randomUUID(),
      type: 'inventory.released',
      orderId: data.orderId,
      data,
      createdAt: new Date().toISOString(),
      priority: 'high',
      processed: false,
      processingAttempts: 0,
    };

    await this.publish(event);
  }

  /**
   * Publish a shipment created event.
   */
  async publishShipmentCreated(
    data: ShipmentCreatedEvent['data'],
  ): Promise<void> {
    const event: ShipmentCreatedEvent = {
      id: crypto.randomUUID(),
      type: 'shipment.created',
      orderId: data.orderId,
      data,
      createdAt: new Date().toISOString(),
      priority: 'high',
      processed: false,
      processingAttempts: 0,
    };

    await this.publish(event);
  }

  /**
   * Publish a shipment delivered event.
   */
  async publishShipmentDelivered(
    data: ShipmentDeliveredEvent['data'],
  ): Promise<void> {
    const event: ShipmentDeliveredEvent = {
      id: crypto.randomUUID(),
      type: 'shipment.delivered',
      orderId: data.orderId,
      data,
      createdAt: new Date().toISOString(),
      priority: 'high',
      processed: false,
      processingAttempts: 0,
    };

    await this.publish(event);
  }

  /**
   * Publish a refund initiated event.
   */
  async publishRefundInitiated(
    data: RefundInitiatedEvent['data'],
  ): Promise<void> {
    const event: RefundInitiatedEvent = {
      id: crypto.randomUUID(),
      type: 'refund.initiated',
      orderId: data.orderId,
      data,
      createdAt: new Date().toISOString(),
      priority: 'high',
      processed: false,
      processingAttempts: 0,
    };

    await this.publish(event);
  }

  /**
   * Publish a return requested event.
   */
  async publishReturnRequested(
    data: ReturnRequestedEvent['data'],
  ): Promise<void> {
    const event: ReturnRequestedEvent = {
      id: crypto.randomUUID(),
      type: 'return.requested',
      orderId: data.orderId,
      data,
      createdAt: new Date().toISOString(),
      priority: 'normal',
      processed: false,
      processingAttempts: 0,
    };

    await this.publish(event);
  }

  /**
   * Get queue size.
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Get subscriber count.
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Example Subscribers (to be implemented in respective modules)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Inventory Subscriber
 * Handles inventory-related events.
 */
export class InventorySubscriber implements EventSubscriber {
  name = 'inventory';

  subscribedEvents = [
    'order.created',
    'order.status_changed',
    'inventory.reserved',
    'inventory.released',
  ];

  async handle(event: OrderEvent): Promise<void> {
    // TODO: Implement inventory event handling
    // - Reserve stock on order created
    // - Convert reservation to sale on confirmation
    // - Release stock on cancellation
    // - Restock on returns
    console.log(`Inventory handling event: ${event.type}`, event.data);
  }
}

/**
 * Shipping Subscriber
 * Handles shipping-related events.
 */
export class ShippingSubscriber implements EventSubscriber {
  name = 'shipping';

  subscribedEvents = [
    'order.status_changed',
    'shipment.created',
    'shipment.delivered',
  ];

  async handle(event: OrderEvent): Promise<void> {
    // TODO: Implement shipping event handling
    // - Create shipment on ready for shipment
    // - Update tracking on shipped
    // - Confirm delivery
    console.log(`Shipping handling event: ${event.type}`, event.data);
  }
}

/**
 * Payment Subscriber
 * Handles payment-related events.
 */
export class PaymentSubscriber implements EventSubscriber {
  name = 'payment';

  subscribedEvents = [
    'order.created',
    'order.status_changed',
    'refund.initiated',
  ];

  async handle(event: OrderEvent): Promise<void> {
    // TODO: Implement payment event handling
    // - Initiate payment on order created
    // - Capture payment on confirmation
    // - Process refund on refund initiated
    console.log(`Payment handling event: ${event.type}`, event.data);
  }
}

/**
 * Notification Subscriber
 * Handles notification-related events.
 */
export class NotificationSubscriber implements EventSubscriber {
  name = 'notification';

  subscribedEvents = [
    'order.created',
    'order.status_changed',
    'shipment.created',
    'shipment.delivered',
    'refund.initiated',
    'return.requested',
  ];

  async handle(event: OrderEvent): Promise<void> {
    // TODO: Implement notification event handling
    // - Send email/SMS/push notifications for various events
    console.log(`Notification handling event: ${event.type}`, event.data);
  }
}

/**
 * Analytics Subscriber
 * Handles analytics-related events.
 */
export class AnalyticsSubscriber implements EventSubscriber {
  name = 'analytics';

  subscribedEvents = [
    'order.created',
    'order.status_changed',
    'refund.initiated',
    'return.requested',
  ];

  async handle(event: OrderEvent): Promise<void> {
    // TODO: Implement analytics event handling
    // - Track order metrics
    // - Track conversion rates
    // - Track cancellation/refund rates
    console.log(`Analytics handling event: ${event.type}`, event.data);
  }
}

/**
 * Finance Subscriber
 * Handles finance-related events.
 */
export class FinanceSubscriber implements EventSubscriber {
  name = 'finance';

  subscribedEvents = [
    'order.created',
    'order.status_changed',
    'refund.initiated',
  ];

  async handle(event: OrderEvent): Promise<void> {
    // TODO: Implement finance event handling
    // - Record revenue
    // - Track settlements
    // - Process refunds
    console.log(`Finance handling event: ${event.type}`, event.data);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Singleton Instance
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Singleton instance of the Event Publisher.
 * Use this instance throughout the application.
 */
export const eventPublisher = new EventPublisher();

// Register default subscribers
eventPublisher.subscribe(new InventorySubscriber());
eventPublisher.subscribe(new ShippingSubscriber());
eventPublisher.subscribe(new PaymentSubscriber());
eventPublisher.subscribe(new NotificationSubscriber());
eventPublisher.subscribe(new AnalyticsSubscriber());
eventPublisher.subscribe(new FinanceSubscriber());
