/**
 * Payment Service - Backend business logic for payment operations
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §1.6 (Payment Ownership),
 * FINANCE_ENGINE_ARCHITECTURE.md §3 (Payment Integration)
 *
 * This module provides the core payment business logic:
 * - Payment creation and authorization
 * - Payment verification and capture
 * - Refund processing
 * - Settlement processing
 * - Ledger integration
 * - Idempotency handling
 * - State management
 */

import {
  PaymentStatus,
  RefundStatus,
  type RefundType,
  SettlementStatus,
  PaymentTransactionType,
  PaymentTransactionStatus,
  type PaymentProvider,
} from './enums';
import type { PaymentGateway } from './gateway/types';
import { type LedgerEngine, createLedgerEngine } from './ledger';
import {
  toPaise,
  validateAmount,
  PAYMENT_TIMEOUT_MINUTES,
  REFUND_WINDOW_DAYS,
} from './money';
import type { PaymentRepository } from './repository';
import { type SettlementEngine, createSettlementEngine } from './settlement';
import {
  PaymentStateMachine,
  deriveRefundAggregate,
  inferRefundType,
} from './state-machine';
import { TransactionEngine, generateIdempotencyKey } from './transaction';

/**
 * Payment service configuration
 */
export interface PaymentServiceConfig {
  gateway: PaymentGateway;
  repository: PaymentRepository;
  settlementConfig?: {
    commissionRate?: number;
    taxRate?: number;
    platformFeeRate?: number;
    holdDays?: number;
    minSettlementAmount?: number;
  };
}

/**
 * Create payment request
 */
export interface CreatePaymentRequest {
  orderId: string;
  amount: string | number;
  currency: string;
  method: string;
  provider: PaymentProvider;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

/**
 * Create payment result
 */
export interface CreatePaymentResult {
  success: boolean;
  paymentId?: string;
  gatewayOrderId?: string;
  clientPayload?: Record<string, unknown>;
  redirectUrl?: string;
  error?: string;
}

/**
 * Verify payment request
 */
export interface VerifyPaymentRequest {
  paymentId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

/**
 * Verify payment result
 */
export interface VerifyPaymentResult {
  success: boolean;
  verified: boolean;
  paymentStatus: PaymentStatus;
  error?: string;
}

/**
 * Process refund request
 */
export interface ProcessRefundRequest {
  paymentId: string;
  amount: string | number;
  reason: string;
  type?: RefundType;
  idempotencyKey?: string;
}

/**
 * Process refund result
 */
export interface ProcessRefundResult {
  success: boolean;
  refundId?: string;
  gatewayReference?: string;
  error?: string;
}

/**
 * Create settlement request
 */
export interface CreateSettlementRequest {
  shopId: string;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Payment Service class
 */
export class PaymentService {
  private repository: PaymentRepository;
  private transactionEngine: TransactionEngine;
  private settlementEngine: SettlementEngine;
  private ledgerEngine: LedgerEngine;

  constructor(config: PaymentServiceConfig) {
    this.repository = config.repository;
    this.transactionEngine = new TransactionEngine(config.gateway);
    this.settlementEngine = createSettlementEngine({
      shopId: '',
      ...config.settlementConfig,
    });
    this.ledgerEngine = createLedgerEngine();
  }

  /**
   * Create a new payment
   */
  async createPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResult> {
    try {
      // Validate amount
      const amountPaise = toPaise(request.amount);
      const amountError = validateAmount(amountPaise);
      if (amountError) {
        return { success: false, error: amountError };
      }

      const idempotencyKey =
        request.idempotencyKey ?? generateIdempotencyKey('payment');
      const existingPayment =
        await this.repository.getPaymentByIdempotencyKey(idempotencyKey);
      if (existingPayment) {
        return {
          success: true,
          paymentId: existingPayment.id,
          gatewayOrderId: existingPayment.gatewayReference,
          clientPayload: existingPayment.metadata as Record<string, unknown>,
        };
      }

      // Create gateway order
      const gatewayResult = await this.transactionEngine.authorize({
        idempotencyKey,
        amountPaise,
        currency: request.currency,
        gatewayOrderId: request.orderId,
      });

      if (!gatewayResult.success) {
        return {
          success: false,
          error: gatewayResult.failureMessage || 'Payment authorization failed',
        };
      }

      // Create payment record
      const payment = await this.repository.createPayment({
        orderId: request.orderId,
        method: request.method,
        status: PaymentStatus.INITIATED,
        amount: amountPaise / 100, // Store as decimal
        currency: request.currency,
        provider: request.provider,
        gatewayReference: gatewayResult.gatewayReference,
        idempotencyKey,
        expiresAt: new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000),
        metadata: request.metadata,
        isActive: true,
      });

      // Log transaction
      await this.repository.createTransaction({
        paymentId: payment.id,
        type: PaymentTransactionType.AUTHORIZE,
        status: PaymentTransactionStatus.SUCCEEDED,
        amount: amountPaise / 100,
        currency: request.currency,
        gatewayReference: gatewayResult.gatewayReference,
        isActive: true,
      });

      return {
        success: true,
        paymentId: payment.id,
        gatewayOrderId: gatewayResult.gatewayReference,
        clientPayload: gatewayResult.gatewayReference
          ? { gatewayOrderId: gatewayResult.gatewayReference }
          : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Verify a payment callback
   */
  async verifyPayment(
    request: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResult> {
    try {
      // Get payment
      const payment = await this.repository.getPaymentById(request.paymentId);
      if (!payment) {
        return {
          success: false,
          verified: false,
          paymentStatus: PaymentStatus.FAILED,
          error: 'Payment not found',
        };
      }

      // Verify with gateway
      const verifyResult = await this.transactionEngine.verify({
        gatewayOrderId: request.gatewayOrderId,
        gatewayPaymentId: request.gatewayPaymentId,
        signature: request.signature,
        amountPaise: Math.round(payment.amount * 100),
        currency: payment.currency,
        idempotencyKey: payment.idempotencyKey || '',
      });

      if (!verifyResult.success) {
        // Update payment status to failed
        await this.repository.updatePaymentStatus(
          payment.id,
          PaymentStatus.FAILED,
        );
        await this.repository.updatePayment(payment.id, {
          failureReason: verifyResult.failureMessage,
        });

        return {
          success: true,
          verified: false,
          paymentStatus: PaymentStatus.FAILED,
          error: verifyResult.failureMessage,
        };
      }

      // Check if payment was verified successfully (status indicates success)
      const verified =
        verifyResult.status === 'captured' ||
        verifyResult.status === 'succeeded';

      if (!verified) {
        return {
          success: true,
          verified: false,
          paymentStatus: payment.status,
        };
      }

      // Update payment status to captured
      const newStatus = PaymentStateMachine.transition(
        payment.status,
        PaymentStatus.CAPTURED,
      );
      await this.repository.updatePaymentStatus(payment.id, newStatus);

      // Log capture transaction
      await this.repository.createTransaction({
        paymentId: payment.id,
        type: PaymentTransactionType.CAPTURE,
        status: PaymentTransactionStatus.SUCCEEDED,
        amount: payment.amount,
        currency: payment.currency,
        gatewayReference: verifyResult.gatewayReference,
        isActive: true,
      });

      // Create ledger entries
      const financeRecord = this.ledgerEngine.createFinanceRecord(
        'payment' as any,
        Math.round(payment.amount * 100),
        payment.currency,
        `Payment captured: ${payment.id}`,
        'payment',
        payment.id,
      );

      const commissionRate = 15; // Default commission rate
      const commissionPaise = Math.round(
        (payment.amount * 100 * commissionRate) / 100,
      );
      const ledgerEntries = this.ledgerEngine.createPaymentEntries(
        financeRecord.id,
        Math.round(payment.amount * 100),
        commissionPaise,
        payment.currency,
        payment.id,
      );

      this.ledgerEngine.postFinanceRecord(financeRecord.id, ledgerEntries);

      // Persist finance record and ledger entries
      await this.repository.createFinanceRecord({
        type: financeRecord.type,
        status: financeRecord.status,
        amount: financeRecord.amountPaise / 100,
        currency: financeRecord.currency,
        description: financeRecord.description,
        referenceType: financeRecord.referenceType,
        referenceId: financeRecord.referenceId,
        metadata: financeRecord.metadata,
        postedAt: financeRecord.postedAt,
      });

      for (const entry of ledgerEntries) {
        await this.repository.createLedgerEntry({
          financeRecordId: entry.financeRecordId,
          account: entry.account,
          side: entry.side,
          amount: entry.amountPaise / 100,
          currency: entry.currency,
          description: entry.description,
          referenceType: entry.referenceType,
          referenceId: entry.referenceId,
        });
      }

      return {
        success: true,
        verified: true,
        paymentStatus: newStatus,
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        paymentStatus: PaymentStatus.FAILED,
        error:
          error instanceof Error
            ? error.message
            : 'Payment verification failed',
      };
    }
  }

  /**
   * Process a refund
   */
  async processRefund(
    request: ProcessRefundRequest,
  ): Promise<ProcessRefundResult> {
    try {
      // Get payment
      const payment = await this.repository.getPaymentById(request.paymentId);
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      // Validate payment is refundable
      if (!PaymentStateMachine.isRefundable(payment.status)) {
        return { success: false, error: 'Payment is not refundable' };
      }

      // Validate refund window
      const refundWindow = new Date(payment.createdAt);
      refundWindow.setDate(refundWindow.getDate() + REFUND_WINDOW_DAYS);
      if (new Date() > refundWindow) {
        return { success: false, error: 'Refund window has expired' };
      }

      // Calculate refund amount
      const refundAmountPaise = toPaise(request.amount);
      const paymentAmountPaise = Math.round(payment.amount * 100);

      if (refundAmountPaise > paymentAmountPaise) {
        return {
          success: false,
          error: 'Refund amount exceeds payment amount',
        };
      }

      // Infer refund type if not provided
      const refundType =
        request.type || inferRefundType(refundAmountPaise, paymentAmountPaise);

      const idempotencyKey =
        request.idempotencyKey ?? generateIdempotencyKey('refund');
      const existingRefund = request.idempotencyKey
        ? await this.repository
            .getRefundByIdempotencyKey?.(request.idempotencyKey)
            .catch(() => null)
        : null;
      if (existingRefund)
        return {
          success: true,
          refundId: existingRefund.id,
          gatewayReference: (existingRefund as any).gatewayReference,
        };

      // Process refund with gateway
      const refundResult = await this.transactionEngine.refund({
        gatewayPaymentId: payment.gatewayReference || '',
        amountPaise: refundAmountPaise,
        idempotencyKey,
        reason: request.reason,
        currency: payment.currency,
      });

      if (!refundResult.success) {
        return {
          success: false,
          error: refundResult.failureMessage || 'Refund processing failed',
        };
      }

      // Create refund record
      const refund = await this.repository.createRefund({
        orderId: payment.orderId,
        paymentId: payment.id,
        type: refundType,
        amount: refundAmountPaise / 100,
        currency: payment.currency,
        status: RefundStatus.INITIATED,
        reason: request.reason,
        gatewayReference: refundResult.gatewayReference,
        idempotencyKey,
        isActive: true,
      });

      // Log refund transaction
      await this.repository.createTransaction({
        paymentId: payment.id,
        type: PaymentTransactionType.REFUND,
        status: PaymentTransactionStatus.SUCCEEDED,
        amount: refundAmountPaise / 100,
        currency: payment.currency,
        gatewayReference: refundResult.gatewayReference,
        isActive: true,
      });

      // Update refund status to processing
      await this.repository.updateRefundStatus(
        refund.id,
        RefundStatus.PROCESSING,
      );

      // Create ledger entries for refund
      const financeRecord = this.ledgerEngine.createFinanceRecord(
        'refund' as any,
        refundAmountPaise,
        payment.currency,
        `Refund for payment: ${payment.id}`,
        'refund',
        refund.id,
      );

      const ledgerEntries = this.ledgerEngine.createRefundEntries(
        financeRecord.id,
        refundAmountPaise,
        payment.currency,
        refund.id,
        payment.id,
      );

      this.ledgerEngine.postFinanceRecord(financeRecord.id, ledgerEntries);

      // Persist finance record and ledger entries
      await this.repository.createFinanceRecord({
        type: financeRecord.type,
        status: financeRecord.status,
        amount: financeRecord.amountPaise / 100,
        currency: financeRecord.currency,
        description: financeRecord.description,
        referenceType: financeRecord.referenceType,
        referenceId: financeRecord.referenceId,
        metadata: financeRecord.metadata,
        postedAt: financeRecord.postedAt,
      });

      for (const entry of ledgerEntries) {
        await this.repository.createLedgerEntry({
          financeRecordId: entry.financeRecordId,
          account: entry.account,
          side: entry.side,
          amount: entry.amountPaise / 100,
          currency: entry.currency,
          description: entry.description,
          referenceType: entry.referenceType,
          referenceId: entry.referenceId,
        });
      }

      // Update refund status to completed
      await this.repository.updateRefundStatus(
        refund.id,
        RefundStatus.COMPLETED,
      );
      await this.repository.updateRefund(refund.id, {
        completedAt: new Date(),
      });

      // Update payment status based on refund aggregate
      const refunds = await this.repository.getRefundsByPaymentId(payment.id);
      const refundAggregate = deriveRefundAggregate({
        paymentAmount: paymentAmountPaise,
        refunds: refunds.map((r) => ({
          amount: Math.round(r.amount * 100),
          status: r.status as RefundStatus,
        })),
      });

      if (refundAggregate.status) {
        await this.repository.updatePaymentStatus(
          payment.id,
          refundAggregate.status,
        );
      }

      return {
        success: true,
        refundId: refund.id,
        gatewayReference: refundResult.gatewayReference,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  /**
   * Create a settlement for a shop
   */
  async createSettlement(
    request: CreateSettlementRequest,
  ): Promise<{ success: boolean; settlementId?: string; error?: string }> {
    try {
      // Get eligible payments for the shop and period
      // This would typically query payments with captured/completed status
      // within the settlement period that haven't been settled yet
      const payments = await this.repository.listPayments({
        // Add filters for shop, period, status
        limit: 1000,
      });

      // Calculate settlement
      const settlementItems = payments.map((payment) => ({
        orderId: payment.orderId,
        paymentId: payment.id,
        amount: Math.round(payment.amount * 100),
        refundAmount: 0, // Would calculate from refunds
        commissionRate: 15,
        taxRate: 18,
        platformFeeRate: 2,
      }));

      const calculation =
        this.settlementEngine.calculateSettlement(settlementItems);

      // Check eligibility
      const eligibility = this.settlementEngine.checkSettlementEligibility(
        calculation.netAmount,
      );
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason };
      }

      // Create settlement record
      const settlement = await this.repository.createSettlement({
        settlementNumber: this.settlementEngine.generateSettlementNumber(),
        shopId: request.shopId,
        status: SettlementStatus.PENDING,
        periodStart: request.periodStart,
        periodEnd: request.periodEnd,
        totalAmount: calculation.totalAmount / 100,
        commissionAmount: calculation.commissionAmount / 100,
        taxAmount: calculation.taxAmount / 100,
        platformFeeAmount: calculation.platformFeeAmount / 100,
        netAmount: calculation.netAmount / 100,
        refundAmount: calculation.refundAmount / 100,
        chargebackAmount: calculation.chargebackAmount / 100,
        currency: 'INR',
        isActive: true,
      });

      // Create ledger entries for settlement
      const financeRecord = this.ledgerEngine.createFinanceRecord(
        'settlement' as any,
        calculation.netAmount,
        'INR',
        `Settlement for shop: ${request.shopId}`,
        'settlement',
        settlement.id,
      );

      const ledgerEntries = this.ledgerEngine.createSettlementEntries(
        financeRecord.id,
        calculation.netAmount,
        'INR',
        settlement.id,
        request.shopId,
      );

      this.ledgerEngine.postFinanceRecord(financeRecord.id, ledgerEntries);

      // Persist finance record and ledger entries
      await this.repository.createFinanceRecord({
        type: financeRecord.type,
        status: financeRecord.status,
        amount: financeRecord.amountPaise / 100,
        currency: financeRecord.currency,
        description: financeRecord.description,
        referenceType: financeRecord.referenceType,
        referenceId: financeRecord.referenceId,
        metadata: financeRecord.metadata,
        postedAt: financeRecord.postedAt,
      });

      for (const entry of ledgerEntries) {
        await this.repository.createLedgerEntry({
          financeRecordId: entry.financeRecordId,
          account: entry.account,
          side: entry.side,
          amount: entry.amountPaise / 100,
          currency: entry.currency,
          description: entry.description,
          referenceType: entry.referenceType,
          referenceId: entry.referenceId,
        });
      }

      // Update settlement status to eligible
      await this.repository.updateSettlementStatus(
        settlement.id,
        SettlementStatus.ELIGIBLE,
      );

      return {
        success: true,
        settlementId: settlement.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Settlement creation failed',
      };
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string) {
    return this.repository.getPaymentById(paymentId);
  }

  /**
   * Get payments by order ID
   */
  async getPaymentsByOrderId(orderId: string) {
    return this.repository.listPayments({ orderId });
  }

  /**
   * Get refunds by payment ID
   */
  async getRefundsByPaymentId(paymentId: string) {
    return this.repository.getRefundsByPaymentId(paymentId);
  }

  /**
   * Get settlements by shop ID
   */
  async getSettlementsByShopId(shopId: string) {
    return this.repository.getSettlementsByShopId(shopId);
  }
}

/**
 * Payment service factory
 */
export function createPaymentService(
  config: PaymentServiceConfig,
): PaymentService {
  return new PaymentService(config);
}
