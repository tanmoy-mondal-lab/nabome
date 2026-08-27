/**
 * Webhook Engine — Provider webhook validation, signature verification, idempotent processing, retry queue
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §9 (Webhook Processing),
 * mandatory rule 15.3 "No gateway logic in business modules"
 *
 * This module provides the core webhook processing logic:
 * - Provider webhook signature verification
 * - Idempotent webhook processing
 * - Webhook event parsing and normalization
 * - Retry queue for failed webhooks
 * - Failed webhook recovery
 */

import { PaymentStatus, RefundStatus, WebhookEventStatus } from './enums';
import type {
  PaymentGateway,
  RawWebhookDelivery,
  ParsedWebhookEvent,
} from './gateway/types';
import type { PaymentRepository } from './repository';
import { PaymentStateMachine } from './state-machine';

/**
 * Webhook processing result
 */
export interface WebhookProcessResult {
  success: boolean;
  eventId: string;
  eventType: string;
  processed: boolean;
  error?: string;
}

/**
 * Webhook retry configuration
 */
export interface WebhookRetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: WebhookRetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Webhook Engine class
 */
export class WebhookEngine {
  constructor(
    private gateway: PaymentGateway,
    private repository: PaymentRepository,
    private retryConfig: WebhookRetryConfig = DEFAULT_RETRY_CONFIG,
  ) {}

  /**
   * Process an incoming webhook from a payment provider
   */
  async processWebhook(
    provider: string,
    rawBody: string,
    headers: Record<string, string | undefined>,
  ): Promise<WebhookProcessResult> {
    const delivery: RawWebhookDelivery = {
      rawBody,
      headers,
    };

    try {
      // Verify webhook signature
      const signatureValid =
        await this.gateway.verifyWebhookSignature(delivery);
      if (!signatureValid) {
        return {
          success: false,
          eventId: '',
          eventType: 'signature_verification_failed',
          processed: false,
          error: 'Invalid webhook signature',
        };
      }

      // Parse webhook event
      const event = this.gateway.parseWebhookEvent(delivery);

      // Check for idempotency (duplicate event)
      const existingEvent =
        await this.repository.getWebhookEventByProviderEventId(
          provider,
          event.eventId,
        );
      if (existingEvent) {
        // Event already processed, return success (idempotent)
        return {
          success: true,
          eventId: event.eventId,
          eventType: event.eventType,
          processed: true,
        };
      }

      // Create webhook event record
      const webhookEvent = await this.repository.createWebhookEvent({
        provider,
        eventId: event.eventId,
        eventType: event.eventType,
        payload: event.metadata || {},
        signature: headers['x-signature'] || headers['signature'],
        status: WebhookEventStatus.PROCESSING,
        metadata: {
          gatewayOrderId: event.gatewayOrderId,
          gatewayPaymentId: event.gatewayPaymentId,
          status: event.status,
          amountPaise: event.amountPaise,
          currency: event.currency,
          method: event.method,
        },
        isActive: true,
      });

      // Process the event
      await this.processWebhookEvent(event, webhookEvent.id);

      // Update webhook event status
      await this.repository.updateWebhookEvent(webhookEvent.id, {
        status: WebhookEventStatus.PROCESSED,
        processedAt: new Date(),
      });

      return {
        success: true,
        eventId: event.eventId,
        eventType: event.eventType,
        processed: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Webhook processing failed';

      // Create failed webhook event record
      try {
        await this.repository.createWebhookEvent({
          provider,
          eventId: `failed-${Date.now()}`,
          eventType: 'unknown',
          payload: { rawBody },
          signature: headers['x-signature'] || headers['signature'],
          status: WebhookEventStatus.FAILED,
          failureReason: errorMessage,
          isActive: true,
        });
      } catch (createError) {
        // Ignore create error, just log
      }

      return {
        success: false,
        eventId: '',
        eventType: 'processing_failed',
        processed: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Process a parsed webhook event
   */
  private async processWebhookEvent(
    event: ParsedWebhookEvent,
    _webhookEventId: string,
  ): Promise<void> {
    if (!event.gatewayPaymentId) {
      throw new Error('Webhook event missing gateway payment ID');
    }

    // Find payment by gateway reference
    const payments = await this.repository.listPayments({
      limit: 100,
    });
    const payment = payments.find(
      (p) => p.gatewayReference === event.gatewayPaymentId,
    );

    if (!payment) {
      // Payment not found, could be for a different system or payment not yet created
      // Log and continue
      return;
    }

    // Update payment status based on webhook event
    switch (event.eventType.toLowerCase()) {
      case 'payment.captured':
      case 'payment.succeeded':
      case 'order.paid':
        await this.handlePaymentCaptured(payment, event);
        break;

      case 'payment.failed':
      case 'payment.failed':
        await this.handlePaymentFailed(payment, event);
        break;

      case 'refund.processed':
      case 'refund.succeeded':
        await this.handleRefundSucceeded(payment, event);
        break;

      case 'refund.failed':
        await this.handleRefundFailed(payment, event);
        break;

      default:
        // Unknown event type, log and continue
        break;
    }
  }

  /**
   * Handle payment captured event
   */
  private async handlePaymentCaptured(
    payment: any,
    event: ParsedWebhookEvent,
  ): Promise<void> {
    // Validate state transition
    if (
      !PaymentStateMachine.canTransition(
        payment.status as PaymentStatus,
        PaymentStatus.CAPTURED,
      )
    ) {
      return; // Invalid transition, ignore
    }

    // Update payment status
    await this.repository.updatePaymentStatus(
      payment.id,
      PaymentStatus.CAPTURED,
    );

    // Log transaction
    await this.repository.createTransaction({
      paymentId: payment.id,
      type: 'capture' as any,
      status: 'succeeded' as any,
      amount: event.amountPaise / 100,
      currency: event.currency,
      gatewayReference: event.gatewayPaymentId,
      isActive: true,
    });
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(
    payment: any,
    event: ParsedWebhookEvent,
  ): Promise<void> {
    // Validate state transition
    if (
      !PaymentStateMachine.canTransition(
        payment.status as PaymentStatus,
        PaymentStatus.FAILED,
      )
    ) {
      return; // Invalid transition, ignore
    }

    // Update payment status
    await this.repository.updatePaymentStatus(payment.id, PaymentStatus.FAILED);
    await this.repository.updatePayment(payment.id, {
      failureReason: `Gateway reported failure: ${event.status}`,
    });

    // Log transaction
    await this.repository.createTransaction({
      paymentId: payment.id,
      type: 'capture' as any,
      status: 'failed' as any,
      amount: event.amountPaise / 100,
      currency: event.currency,
      gatewayReference: event.gatewayPaymentId,
      failureCode: 'WEBHOOK_FAILURE',
      failureMessage: event.status,
      isActive: true,
    });
  }

  /**
   * Handle refund succeeded event
   */
  private async handleRefundSucceeded(
    payment: any,
    event: ParsedWebhookEvent,
  ): Promise<void> {
    // Find refund by gateway reference
    const refunds = await this.repository.getRefundsByPaymentId(payment.id);
    const refund = refunds.find(
      (r) => r.gatewayReference === event.gatewayPaymentId,
    );

    if (!refund) {
      // Refund not found, could be new refund initiated via gateway
      return;
    }

    // Update refund status
    await this.repository.updateRefundStatus(refund.id, RefundStatus.COMPLETED);
    await this.repository.updateRefund(refund.id, {
      completedAt: new Date(),
    });
  }

  /**
   * Handle refund failed event
   */
  private async handleRefundFailed(
    payment: any,
    event: ParsedWebhookEvent,
  ): Promise<void> {
    // Find refund by gateway reference
    const refunds = await this.repository.getRefundsByPaymentId(payment.id);
    const refund = refunds.find(
      (r) => r.gatewayReference === event.gatewayPaymentId,
    );

    if (!refund) {
      // Refund not found
      return;
    }

    // Update refund status
    await this.repository.updateRefundStatus(refund.id, RefundStatus.FAILED);
  }

  /**
   * Retry failed webhooks
   */
  async retryFailedWebhooks(): Promise<{ processed: number; failed: number }> {
    const failedWebhooks = await this.repository.listWebhookEvents({
      status: 'failed',
      limit: 100,
    });

    let processed = 0;
    let failed = 0;

    for (const webhook of failedWebhooks) {
      try {
        // Re-process the webhook
        const result = await this.processWebhook(
          webhook.provider,
          webhook.payload.rawBody as string,
          webhook.payload.headers as Record<string, string | undefined>,
        );

        if (result.success) {
          processed++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * Schedule webhook retry with exponential backoff
   */
  private async scheduleRetry(
    webhookEventId: string,
    attempt: number,
  ): Promise<void> {
    if (attempt >= this.retryConfig.maxRetries) {
      // Max retries reached, mark as failed
      await this.repository.updateWebhookEvent(webhookEventId, {
        status: WebhookEventStatus.FAILED,
        failureReason: 'Max retries exceeded',
      });
      return;
    }

    const delay = Math.min(
      this.retryConfig.initialDelayMs *
        Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelayMs,
    );

    // Schedule retry (in production, this would use a job queue)
    setTimeout(async () => {
      try {
        const webhookEvent =
          await this.repository.getWebhookEventById(webhookEventId);
        if (!webhookEvent) return;

        const result = await this.processWebhook(
          webhookEvent.provider,
          webhookEvent.payload.rawBody as string,
          webhookEvent.payload.headers as Record<string, string | undefined>,
        );

        if (!result.success) {
          await this.scheduleRetry(webhookEventId, attempt + 1);
        }
      } catch (error) {
        await this.scheduleRetry(webhookEventId, attempt + 1);
      }
    }, delay);
  }

  /**
   * Reconcile webhook events with payment status
   */
  async reconcileWebhooks(): Promise<{
    mismatched: number;
    reconciled: number;
  }> {
    const webhooks = await this.repository.listWebhookEvents({
      limit: 1000,
    });

    let mismatched = 0;
    let reconciled = 0;

    for (const webhook of webhooks) {
      if (webhook.status !== WebhookEventStatus.PROCESSED) continue;

      const payment = await this.repository
        .listPayments({
          limit: 100,
        })
        .then((payments) =>
          payments.find(
            (p) => p.gatewayReference === webhook.metadata?.gatewayPaymentId,
          ),
        );

      if (!payment) continue;

      // Check if webhook status matches payment status
      const webhookStatus = webhook.metadata?.status;
      const paymentStatus = payment.status;

      if (
        webhookStatus === 'captured' &&
        paymentStatus !== PaymentStatus.CAPTURED &&
        paymentStatus !== PaymentStatus.COMPLETED
      ) {
        mismatched++;
        // Reconcile by updating payment status
        await this.repository.updatePaymentStatus(
          payment.id,
          PaymentStatus.CAPTURED,
        );
        reconciled++;
      }
    }

    return { mismatched, reconciled };
  }
}

/**
 * Webhook engine factory
 */
export function createWebhookEngine(
  gateway: PaymentGateway,
  repository: PaymentRepository,
  retryConfig?: WebhookRetryConfig,
): WebhookEngine {
  return new WebhookEngine(gateway, repository, retryConfig);
}
