/**
 * Transaction Engine — Authorization, Capture, Void, Refund, Retry, Idempotency
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §4 (Payment Lifecycle), §6 (Transaction Engine)
 *
 * This module provides the core transaction orchestration logic:
 * - Authorization: Create payment intent with gateway
 * - Capture: Capture authorized funds
 * - Void: Cancel authorized but uncaptured payments
 * - Refund: Process full/partial refunds
 * - Retry: Exponential backoff for transient failures
 * - Idempotency: Duplicate prevention via idempotency keys
 */

import { PaymentStatus, PaymentTransactionType, FailureType } from './enums';
import type { PaymentGateway } from './gateway/types';

export interface TransactionOptions {
  idempotencyKey: string;
  amountPaise: number;
  currency: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  reason?: string;
}

export interface TransactionResult {
  success: boolean;
  gatewayReference?: string;
  amountPaise: number;
  status: string;
  failureCode?: string;
  failureMessage?: string;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export function classifyFailure(failureCode: string): FailureType {
  const transientCodes = [
    'RATE_LIMIT',
    'CONNECTION_ERROR',
    'TIMEOUT',
    'API_ERROR',
  ];
  const permanentCodes = [
    'CARD_DECLINED',
    'INSUFFICIENT_FUNDS',
    'EXPIRED_CARD',
    'INVALID_CVC',
  ];
  const systemCodes = ['AUTH_ERROR', 'PROCESSING_ERROR'];

  if (transientCodes.includes(failureCode)) return FailureType.TRANSIENT;
  if (permanentCodes.includes(failureCode)) return FailureType.PERMANENT;
  if (systemCodes.includes(failureCode)) return FailureType.SYSTEM;
  if (failureCode === 'INVALID_AMOUNT' || failureCode === 'INVALID_SIGNATURE')
    return FailureType.VALIDATION;
  if (failureCode === 'EXPIRED') return FailureType.EXPIRED;

  return FailureType.SYSTEM; // Default to system error
}

/**
 * Execute transaction with exponential backoff retry for transient failures
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  classifyError: (error: any) => FailureType = () => FailureType.TRANSIENT,
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const failureType = classifyError(error);

      // Don't retry permanent, system, validation, or expired errors
      if (failureType !== FailureType.TRANSIENT) {
        throw error;
      }

      // Don't retry after max attempts
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 0.1 * delay;
      const actualDelay = Math.min(delay + jitter, config.maxDelayMs);

      await new Promise((resolve) => setTimeout(resolve, actualDelay));
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }
  }

  throw lastError!;
}

/**
 * Transaction Engine class
 */
export class TransactionEngine {
  constructor(private gateway: PaymentGateway) {}

  /**
   * Authorize a payment (create payment intent)
   */
  async authorize(options: TransactionOptions): Promise<TransactionResult> {
    try {
      const result = await executeWithRetry(async () => {
        return await this.gateway.createOrder({
          idempotencyKey: options.idempotencyKey,
          amountPaise: options.amountPaise,
          currency: options.currency,
          orderNumber: options.gatewayOrderId || `NAB-${Date.now()}`,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
        });
      });

      return {
        success: true,
        gatewayReference: result.gatewayOrderId,
        amountPaise: options.amountPaise,
        status: result.status,
      };
    } catch (error: any) {
      return {
        success: false,
        amountPaise: options.amountPaise,
        status: 'failed',
        failureCode: error.code || 'AUTH_FAILED',
        failureMessage: error.message || 'Authorization failed',
      };
    }
  }

  /**
   * Capture an authorized payment
   */
  async capture(options: TransactionOptions): Promise<TransactionResult> {
    try {
      const result = await executeWithRetry(async () => {
        return await this.gateway.capture({
          gatewayOrderId: options.gatewayOrderId!,
          gatewayPaymentId: options.gatewayPaymentId!,
          amountPaise: options.amountPaise,
          idempotencyKey: options.idempotencyKey,
        });
      });

      return {
        success: result.captured,
        gatewayReference: result.gatewayReference,
        amountPaise: result.amountPaise,
        status: result.captured ? 'captured' : 'failed',
      };
    } catch (error: any) {
      return {
        success: false,
        amountPaise: options.amountPaise,
        status: 'failed',
        failureCode: error.code || 'CAPTURE_FAILED',
        failureMessage: error.message || 'Capture failed',
      };
    }
  }

  /**
   * Void an authorized but uncaptured payment
   */
  async void(options: TransactionOptions): Promise<TransactionResult> {
    try {
      await executeWithRetry(async () => {
        return await this.gateway.voidPayment({
          gatewayOrderId: options.gatewayOrderId!,
          gatewayPaymentId: options.gatewayPaymentId!,
          idempotencyKey: options.idempotencyKey,
        });
      });

      return {
        success: true,
        amountPaise: options.amountPaise,
        status: 'voided',
      };
    } catch (error: any) {
      return {
        success: false,
        amountPaise: options.amountPaise,
        status: 'failed',
        failureCode: error.code || 'VOID_FAILED',
        failureMessage: error.message || 'Void failed',
      };
    }
  }

  /**
   * Process a refund (full or partial)
   */
  async refund(options: TransactionOptions): Promise<TransactionResult> {
    try {
      const result = await executeWithRetry(async () => {
        return await this.gateway.refund({
          gatewayPaymentId: options.gatewayPaymentId!,
          amountPaise: options.amountPaise,
          idempotencyKey: options.idempotencyKey,
          reason: options.reason || 'Refund',
        });
      });

      return {
        success: true,
        gatewayReference: result.gatewayReference,
        amountPaise: result.amountPaise,
        status: result.status,
      };
    } catch (error: any) {
      return {
        success: false,
        amountPaise: options.amountPaise,
        status: 'failed',
        failureCode: error.code || 'REFUND_FAILED',
        failureMessage: error.message || 'Refund failed',
      };
    }
  }

  /**
   * Verify a payment (for webhook/callback confirmation)
   */
  async verify(
    options: TransactionOptions & { signature?: string },
  ): Promise<TransactionResult> {
    try {
      const result = await this.gateway.verifyPayment({
        gatewayOrderId: options.gatewayOrderId!,
        gatewayPaymentId: options.gatewayPaymentId!,
        signature: options.signature || '',
        expectedAmountPaise: options.amountPaise,
        currency: options.currency,
      });

      return {
        success: result.verified,
        gatewayReference: result.gatewayPaymentId,
        amountPaise: result.amountPaise,
        status: result.gatewayStatus,
      };
    } catch (error: any) {
      return {
        success: false,
        amountPaise: options.amountPaise,
        status: 'failed',
        failureCode: error.code || 'VERIFY_FAILED',
        failureMessage: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Check if a transaction can be retried based on failure type
   */
  canRetry(failureCode: string): boolean {
    return classifyFailure(failureCode) === FailureType.TRANSIENT;
  }

  /**
   * Validate state transition before executing transaction
   */
  validateTransition(
    currentStatus: PaymentStatus,
    _targetStatus: PaymentStatus,
    transactionType: PaymentTransactionType,
  ): boolean {
    // Authorization: created -> initiated
    if (transactionType === PaymentTransactionType.AUTHORIZE) {
      return currentStatus === PaymentStatus.CREATED;
    }

    // Capture: initiated/authorized -> captured
    if (transactionType === PaymentTransactionType.CAPTURE) {
      return (
        currentStatus === PaymentStatus.INITIATED ||
        currentStatus === PaymentStatus.AUTHORIZED ||
        currentStatus === PaymentStatus.PROCESSING
      );
    }

    // Void: initiated/authorized -> cancelled
    if (transactionType === PaymentTransactionType.VOID) {
      return (
        currentStatus === PaymentStatus.INITIATED ||
        currentStatus === PaymentStatus.AUTHORIZED
      );
    }

    // Refund: captured/completed -> refunded/partially_refunded
    if (transactionType === PaymentTransactionType.REFUND) {
      return (
        currentStatus === PaymentStatus.CAPTURED ||
        currentStatus === PaymentStatus.COMPLETED
      );
    }

    return false;
  }
}

/**
 * Idempotency key generator
 */
export function generateIdempotencyKey(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}:${timestamp}:${random}`;
}

/**
 * Validate idempotency key format
 */
export function isValidIdempotencyKey(key: string): boolean {
  // Format: prefix:timestamp:random (at least 20 chars)
  return key.length >= 20 && key.includes(':');
}
