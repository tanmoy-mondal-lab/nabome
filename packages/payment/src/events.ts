/**
 * Payment Events - Event generation for payment lifecycle events
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §10 (Event System),
 * EVENT_SYSTEM_ARCHITECTURE.md (if exists)
 *
 * This module provides the core event generation logic:
 * - Payment lifecycle events (created, authorized, captured, failed, refunded)
 * - Refund events (initiated, completed, failed)
 * - Settlement events (created, completed, paid)
 * - Webhook events (received, processed, failed)
 * - Event publishing to downstream systems (Orders, Shipping, Finance, Notifications, Analytics)
 */

import { PaymentStatus, RefundStatus, SettlementStatus } from './enums';

/**
 * Payment event types
 */
export enum PaymentEventType {
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_AUTHORIZED = 'payment.authorized',
  PAYMENT_CAPTURED = 'payment.captured',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_CANCELLED = 'payment.cancelled',
  PAYMENT_EXPIRED = 'payment.expired',
  PAYMENT_REFUNDED = 'payment.refunded',
  PAYMENT_PARTIALLY_REFUNDED = 'payment.partially_refunded',
  REFUND_INITIATED = 'refund.initiated',
  REFUND_COMPLETED = 'refund.completed',
  REFUND_FAILED = 'refund.failed',
  SETTLEMENT_CREATED = 'settlement.created',
  SETTLEMENT_COMPLETED = 'settlement.completed',
  SETTLEMENT_PAID = 'settlement.paid',
  SETTLEMENT_FAILED = 'settlement.failed',
  WEBHOOK_RECEIVED = 'webhook.received',
  WEBHOOK_PROCESSED = 'webhook.processed',
  WEBHOOK_FAILED = 'webhook.failed',
}

/**
 * Event metadata
 */
export interface EventMetadata {
  paymentId?: string;
  orderId?: string;
  refundId?: string;
  settlementId?: string;
  shopId?: string;
  userId?: string;
  amount?: number;
  currency?: string;
  gatewayReference?: string;
  provider?: string;
  reason?: string;
  failureReason?: string;
  [key: string]: unknown;
}

/**
 * Payment event
 */
export interface PaymentEvent {
  id: string;
  type: PaymentEventType;
  timestamp: Date;
  metadata: EventMetadata;
  correlationId?: string;
}

/**
 * Event publisher interface
 */
export interface EventPublisher {
  publish(event: PaymentEvent): Promise<void>;
  publishBatch(events: PaymentEvent[]): Promise<void>;
}

/**
 * In-memory event publisher (for development/testing)
 */
export class InMemoryEventPublisher implements EventPublisher {
  private events: PaymentEvent[] = [];

  async publish(event: PaymentEvent): Promise<void> {
    this.events.push(event);
  }

  async publishBatch(events: PaymentEvent[]): Promise<void> {
    this.events.push(...events);
  }

  getEvents(): PaymentEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

/**
 * Payment Event Emitter class
 */
export class PaymentEventEmitter {
  constructor(private publisher: EventPublisher) {}

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Emit payment created event
   */
  async emitPaymentCreated(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_CREATED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment initiated event
   */
  async emitPaymentInitiated(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_INITIATED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment authorized event
   */
  async emitPaymentAuthorized(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_AUTHORIZED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment captured event
   */
  async emitPaymentCaptured(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_CAPTURED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment completed event
   */
  async emitPaymentCompleted(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_COMPLETED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment failed event
   */
  async emitPaymentFailed(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_FAILED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment cancelled event
   */
  async emitPaymentCancelled(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_CANCELLED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment expired event
   */
  async emitPaymentExpired(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_EXPIRED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment refunded event
   */
  async emitPaymentRefunded(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_REFUNDED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit payment partially refunded event
   */
  async emitPaymentPartiallyRefunded(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.PAYMENT_PARTIALLY_REFUNDED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.paymentId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit refund initiated event
   */
  async emitRefundInitiated(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.REFUND_INITIATED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.refundId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit refund completed event
   */
  async emitRefundCompleted(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.REFUND_COMPLETED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.refundId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit refund failed event
   */
  async emitRefundFailed(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.REFUND_FAILED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.refundId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit settlement created event
   */
  async emitSettlementCreated(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.SETTLEMENT_CREATED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.settlementId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit settlement completed event
   */
  async emitSettlementCompleted(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.SETTLEMENT_COMPLETED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.settlementId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit settlement paid event
   */
  async emitSettlementPaid(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.SETTLEMENT_PAID,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.settlementId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit settlement failed event
   */
  async emitSettlementFailed(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.SETTLEMENT_FAILED,
      timestamp: new Date(),
      metadata,
      correlationId: metadata.settlementId,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit webhook received event
   */
  async emitWebhookReceived(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.WEBHOOK_RECEIVED,
      timestamp: new Date(),
      metadata,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit webhook processed event
   */
  async emitWebhookProcessed(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.WEBHOOK_PROCESSED,
      timestamp: new Date(),
      metadata,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit webhook failed event
   */
  async emitWebhookFailed(metadata: EventMetadata): Promise<string> {
    const event: PaymentEvent = {
      id: this.generateCorrelationId(),
      type: PaymentEventType.WEBHOOK_FAILED,
      timestamp: new Date(),
      metadata,
    };

    await this.publisher.publish(event);
    return event.id;
  }

  /**
   * Emit event based on payment status change
   */
  async emitPaymentStatusChange(
    _oldStatus: PaymentStatus | null,
    newStatus: PaymentStatus,
    metadata: EventMetadata,
  ): Promise<string | null> {
    switch (newStatus) {
      case PaymentStatus.CREATED:
        return await this.emitPaymentCreated(metadata);
      case PaymentStatus.INITIATED:
        return await this.emitPaymentInitiated(metadata);
      case PaymentStatus.AUTHORIZED:
        return await this.emitPaymentAuthorized(metadata);
      case PaymentStatus.CAPTURED:
        return await this.emitPaymentCaptured(metadata);
      case PaymentStatus.COMPLETED:
        return await this.emitPaymentCompleted(metadata);
      case PaymentStatus.FAILED:
        return await this.emitPaymentFailed(metadata);
      case PaymentStatus.CANCELLED:
        return await this.emitPaymentCancelled(metadata);
      case PaymentStatus.EXPIRED:
        return await this.emitPaymentExpired(metadata);
      case PaymentStatus.REFUNDED:
        return await this.emitPaymentRefunded(metadata);
      case PaymentStatus.PARTIALLY_REFUNDED:
        return await this.emitPaymentPartiallyRefunded(metadata);
      default:
        return null;
    }
  }

  /**
   * Emit event based on refund status change
   */
  async emitRefundStatusChange(
    _oldStatus: RefundStatus | null,
    newStatus: RefundStatus,
    metadata: EventMetadata,
  ): Promise<string | null> {
    switch (newStatus) {
      case RefundStatus.INITIATED:
        return await this.emitRefundInitiated(metadata);
      case RefundStatus.COMPLETED:
      case RefundStatus.SETTLED:
        return await this.emitRefundCompleted(metadata);
      case RefundStatus.FAILED:
        return await this.emitRefundFailed(metadata);
      default:
        return null;
    }
  }

  /**
   * Emit event based on settlement status change
   */
  async emitSettlementStatusChange(
    _oldStatus: SettlementStatus | null,
    newStatus: SettlementStatus,
    metadata: EventMetadata,
  ): Promise<string | null> {
    switch (newStatus) {
      case SettlementStatus.CREATED:
        return await this.emitSettlementCreated(metadata);
      case SettlementStatus.COMPLETED:
        return await this.emitSettlementCompleted(metadata);
      case SettlementStatus.PAID:
        return await this.emitSettlementPaid(metadata);
      case SettlementStatus.FAILED:
        return await this.emitSettlementFailed(metadata);
      default:
        return null;
    }
  }
}

/**
 * Payment event emitter factory
 */
export function createPaymentEventEmitter(
  publisher: EventPublisher,
): PaymentEventEmitter {
  return new PaymentEventEmitter(publisher);
}
