/**
 * Order Integration - Connect with Order Management for payment authorization, capture, failure, refund
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §11 (Order Integration),
 * ORDER_MANAGEMENT_ARCHITECTURE.md (if exists)
 *
 * This module provides the integration layer between Payment and Order systems:
 * - Order payment authorization
 * - Payment capture on order confirmation
 * - Payment failure handling with order status updates
 * - Refund processing with order status updates
 * - Order payment status synchronization
 */

import { PaymentStatus } from './enums';
import type { PaymentEventEmitter } from './events';
import type { PaymentService } from './service';

/**
 * Order payment status
 */
export enum OrderPaymentStatus {
  PENDING = 'pending',
  INITIATED = 'initiated',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

/**
 * Order integration configuration
 */
export interface OrderIntegrationConfig {
  paymentService: PaymentService;
  eventEmitter: PaymentEventEmitter;
  orderClient?: OrderClient;
}

/**
 * Order client interface (to be implemented by Order Management system)
 */
export interface OrderClient {
  updateOrderPaymentStatus(
    orderId: string,
    status: OrderPaymentStatus,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  getOrder(orderId: string): Promise<Order | null>;
}

/**
 * Order entity (simplified)
 */
export interface Order {
  id: string;
  userId: string;
  shopId: string;
  total: number;
  currency: string;
  paymentStatus: OrderPaymentStatus;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment authorization request
 */
export interface AuthorizeOrderPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  customerEmail?: string;
  customerPhone?: string;
}

/**
 * Payment authorization result
 */
export interface AuthorizeOrderPaymentResult {
  success: boolean;
  paymentId?: string;
  gatewayOrderId?: string;
  clientPayload?: Record<string, unknown>;
  error?: string;
}

/**
 * Payment capture request
 */
export interface CaptureOrderPaymentRequest {
  orderId: string;
  paymentId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

/**
 * Payment capture result
 */
export interface CaptureOrderPaymentResult {
  success: boolean;
  verified: boolean;
  paymentStatus: PaymentStatus;
  error?: string;
}

/**
 * Order refund request
 */
export interface RefundOrderPaymentRequest {
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
  type?: 'full' | 'partial';
}

/**
 * Order refund result
 */
export interface RefundOrderPaymentResult {
  success: boolean;
  refundId?: string;
  gatewayReference?: string;
  error?: string;
}

/**
 * Order Integration class
 */
export class OrderIntegration {
  constructor(private config: OrderIntegrationConfig) {}

  /**
   * Authorize payment for an order
   */
  async authorizeOrderPayment(
    request: AuthorizeOrderPaymentRequest,
  ): Promise<AuthorizeOrderPaymentResult> {
    try {
      // Create payment through payment service
      const result = await this.config.paymentService.createPayment({
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
        method: request.method,
        provider: request.provider as any,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        metadata: {
          orderId: request.orderId,
        },
      });

      if (!result.success) {
        // Update order payment status to failed
        await this.updateOrderPaymentStatus(
          request.orderId,
          OrderPaymentStatus.FAILED,
          {
            error: result.error,
          },
        );

        // Emit payment failed event
        await this.config.eventEmitter.emitPaymentFailed({
          orderId: request.orderId,
          amount: request.amount,
          currency: request.currency,
          failureReason: result.error,
        });

        return {
          success: false,
          error: result.error,
        };
      }

      // Update order payment status to initiated
      await this.updateOrderPaymentStatus(
        request.orderId,
        OrderPaymentStatus.INITIATED,
        {
          paymentId: result.paymentId,
          gatewayOrderId: result.gatewayOrderId,
        },
      );

      // Emit payment initiated event
      await this.config.eventEmitter.emitPaymentInitiated({
        orderId: request.orderId,
        paymentId: result.paymentId,
        amount: request.amount,
        currency: request.currency,
        gatewayReference: result.gatewayOrderId,
      });

      return {
        success: true,
        paymentId: result.paymentId,
        gatewayOrderId: result.gatewayOrderId,
        clientPayload: result.clientPayload,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment authorization failed';

      // Update order payment status to failed
      await this.updateOrderPaymentStatus(
        request.orderId,
        OrderPaymentStatus.FAILED,
        {
          error: errorMessage,
        },
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Capture payment for an order (after customer completes payment)
   */
  async captureOrderPayment(
    request: CaptureOrderPaymentRequest,
  ): Promise<CaptureOrderPaymentResult> {
    try {
      // Verify payment through payment service
      const result = await this.config.paymentService.verifyPayment({
        paymentId: request.paymentId,
        gatewayOrderId: request.gatewayOrderId,
        gatewayPaymentId: request.gatewayPaymentId,
        signature: request.signature,
      });

      if (!result.success) {
        // Update order payment status to failed
        await this.updateOrderPaymentStatus(
          request.orderId,
          OrderPaymentStatus.FAILED,
          {
            error: result.error,
          },
        );

        // Emit payment failed event
        await this.config.eventEmitter.emitPaymentFailed({
          orderId: request.orderId,
          paymentId: request.paymentId,
          failureReason: result.error,
        });

        return {
          success: true,
          verified: false,
          paymentStatus: result.paymentStatus,
          error: result.error,
        };
      }

      if (!result.verified) {
        // Payment not verified yet, keep order in initiated state
        return {
          success: true,
          verified: false,
          paymentStatus: result.paymentStatus,
        };
      }

      // Payment verified successfully
      if (
        result.paymentStatus === PaymentStatus.CAPTURED ||
        result.paymentStatus === PaymentStatus.COMPLETED
      ) {
        // Update order payment status to captured
        await this.updateOrderPaymentStatus(
          request.orderId,
          OrderPaymentStatus.CAPTURED,
          {
            paymentId: request.paymentId,
          },
        );

        // Emit payment captured event
        await this.config.eventEmitter.emitPaymentCaptured({
          orderId: request.orderId,
          paymentId: request.paymentId,
        });

        return {
          success: true,
          verified: true,
          paymentStatus: result.paymentStatus,
        };
      }

      // Payment failed
      await this.updateOrderPaymentStatus(
        request.orderId,
        OrderPaymentStatus.FAILED,
        {
          paymentId: request.paymentId,
        },
      );

      await this.config.eventEmitter.emitPaymentFailed({
        orderId: request.orderId,
        paymentId: request.paymentId,
      });

      return {
        success: true,
        verified: false,
        paymentStatus: result.paymentStatus,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment capture failed';

      // Update order payment status to failed
      await this.updateOrderPaymentStatus(
        request.orderId,
        OrderPaymentStatus.FAILED,
        {
          error: errorMessage,
        },
      );

      return {
        success: false,
        verified: false,
        paymentStatus: PaymentStatus.FAILED,
        error: errorMessage,
      };
    }
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(
    orderId: string,
    paymentId: string,
    reason: string,
  ): Promise<void> {
    // Update order payment status to failed
    await this.updateOrderPaymentStatus(orderId, OrderPaymentStatus.FAILED, {
      paymentId,
      failureReason: reason,
    });

    // Emit payment failed event
    await this.config.eventEmitter.emitPaymentFailed({
      orderId,
      paymentId,
      failureReason: reason,
    });
  }

  /**
   * Process refund for an order
   */
  async refundOrderPayment(
    request: RefundOrderPaymentRequest,
  ): Promise<RefundOrderPaymentResult> {
    try {
      // Process refund through payment service
      const result = await this.config.paymentService.processRefund({
        paymentId: request.paymentId,
        amount: request.amount,
        reason: request.reason,
        type: request.type === 'full' ? ('full' as any) : ('partial' as any),
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      // Update order payment status based on refund type
      const newStatus =
        request.type === 'full'
          ? OrderPaymentStatus.REFUNDED
          : OrderPaymentStatus.PARTIALLY_REFUNDED;
      await this.updateOrderPaymentStatus(request.orderId, newStatus, {
        refundId: result.refundId,
      });

      // Emit refund completed event
      await this.config.eventEmitter.emitRefundCompleted({
        orderId: request.orderId,
        paymentId: request.paymentId,
        refundId: result.refundId,
        amount: request.amount,
      });

      return {
        success: true,
        refundId: result.refundId,
        gatewayReference: result.gatewayReference,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Refund processing failed';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Synchronize order payment status with payment status
   */
  async syncOrderPaymentStatus(orderId: string): Promise<void> {
    // Get payment from payment service
    const payments =
      await this.config.paymentService.getPaymentsByOrderId(orderId);

    if (payments.length === 0) {
      // No payment found, set order to pending
      await this.updateOrderPaymentStatus(orderId, OrderPaymentStatus.PENDING);
      return;
    }

    const payment = payments[0];
    if (!payment) {
      await this.updateOrderPaymentStatus(orderId, OrderPaymentStatus.PENDING);
      return;
    }

    // Map payment status to order payment status
    const orderPaymentStatus = this.mapPaymentStatusToOrderStatus(
      payment.status,
    );

    // Update order payment status
    await this.updateOrderPaymentStatus(orderId, orderPaymentStatus, {
      paymentId: payment.id,
    });
  }

  /**
   * Map payment status to order payment status
   */
  private mapPaymentStatusToOrderStatus(
    paymentStatus: PaymentStatus,
  ): OrderPaymentStatus {
    switch (paymentStatus) {
      case PaymentStatus.CREATED:
        return OrderPaymentStatus.PENDING;
      case PaymentStatus.INITIATED:
        return OrderPaymentStatus.INITIATED;
      case PaymentStatus.AUTHORIZED:
        return OrderPaymentStatus.AUTHORIZED;
      case PaymentStatus.CAPTURED:
        return OrderPaymentStatus.CAPTURED;
      case PaymentStatus.COMPLETED:
        return OrderPaymentStatus.COMPLETED;
      case PaymentStatus.FAILED:
      case PaymentStatus.EXPIRED:
      case PaymentStatus.CANCELLED:
        return OrderPaymentStatus.FAILED;
      case PaymentStatus.REFUNDED:
        return OrderPaymentStatus.REFUNDED;
      case PaymentStatus.PARTIALLY_REFUNDED:
        return OrderPaymentStatus.PARTIALLY_REFUNDED;
      default:
        return OrderPaymentStatus.PENDING;
    }
  }

  /**
   * Update order payment status via order client
   */
  private async updateOrderPaymentStatus(
    orderId: string,
    status: OrderPaymentStatus,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (this.config.orderClient) {
      await this.config.orderClient.updateOrderPaymentStatus(
        orderId,
        status,
        metadata,
      );
    }
    // If no order client, this is a no-op (order system will handle status updates via events)
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    if (this.config.orderClient) {
      return this.config.orderClient.getOrder(orderId);
    }
    return null;
  }
}

/**
 * Order integration factory
 */
export function createOrderIntegration(
  config: OrderIntegrationConfig,
): OrderIntegration {
  return new OrderIntegration(config);
}
