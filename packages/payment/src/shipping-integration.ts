/**
 * Shipping Integration - Support shipping fees, COD settlement, shipping refund
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §13 (Shipping Integration),
 * SHIPPING_ARCHITECTURE.md (if exists)
 *
 * This module provides the integration layer between Payment and Shipping systems:
 * - Handle shipping fee payments
 * - COD (Cash on Delivery) settlement processing
 * - Shipping refund handling
 * - Courier payment reconciliation
 * - Shipping fee ledger entries
 */

import type { PaymentEventEmitter } from './events';
import type { LedgerEngine } from './ledger';
import { toPaise } from './money';

/**
 * Shipping payment type
 */
export enum ShippingPaymentType {
  PREPAID = 'prepaid',
  COD = 'cod',
}

/**
 * COD collection status
 */
export enum CodCollectionStatus {
  PENDING = 'pending',
  COLLECTED = 'collected',
  SETTLED = 'settled',
  FAILED = 'failed',
}

/**
 * Shipping fee payment request
 */
export interface ShippingFeePaymentRequest {
  orderId: string;
  shippingId: string;
  amount: number;
  currency: string;
  paymentType: ShippingPaymentType;
  courierId?: string;
}

/**
 * Shipping fee payment result
 */
export interface ShippingFeePaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/**
 * COD collection request
 */
export interface CodCollectionRequest {
  orderId: string;
  shippingId: string;
  amount: number;
  currency: string;
  courierId: string;
  collectedAt: Date;
  referenceNumber?: string;
}

/**
 * COD collection result
 */
export interface CodCollectionResult {
  success: boolean;
  collectionId?: string;
  error?: string;
}

/**
 * Shipping refund request
 */
export interface ShippingRefundRequest {
  orderId: string;
  shippingId: string;
  amount: number;
  currency: string;
  reason: string;
}

/**
 * Shipping refund result
 */
export interface ShippingRefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

/**
 * Shipping integration configuration
 */
export interface ShippingIntegrationConfig {
  ledgerEngine: LedgerEngine;
  eventEmitter: PaymentEventEmitter;
}

/**
 * Shipping Integration class
 */
export class ShippingIntegration {
  constructor(private config: ShippingIntegrationConfig) {}

  /**
   * Process shipping fee payment
   */
  async processShippingFeePayment(
    request: ShippingFeePaymentRequest,
  ): Promise<ShippingFeePaymentResult> {
    try {
      const amountPaise = toPaise(request.amount);

      if (request.paymentType === ShippingPaymentType.PREPAID) {
        // Create ledger entry for prepaid shipping fee
        const financeRecord = this.config.ledgerEngine.createFinanceRecord(
          'shipping_fee' as any,
          amountPaise,
          request.currency,
          `Prepaid shipping fee for order: ${request.orderId}`,
          'shipping',
          request.shippingId,
        );

        const ledgerEntries = this.config.ledgerEngine.createShippingFeeEntries(
          financeRecord.id,
          amountPaise,
          request.currency,
          request.orderId,
        );

        this.config.ledgerEngine.postFinanceRecord(
          financeRecord.id,
          ledgerEntries,
        );

        // Emit shipping fee paid event
        await this.config.eventEmitter.emitPaymentCaptured({
          orderId: request.orderId,
          shippingId: request.shippingId,
          amount: request.amount,
          currency: request.currency,
          paymentType: request.paymentType,
        });

        return {
          success: true,
          paymentId: financeRecord.id,
        };
      } else {
        // COD - shipping fee will be collected on delivery
        // Emit shipping fee pending event
        await this.config.eventEmitter.emitPaymentInitiated({
          orderId: request.orderId,
          shippingId: request.shippingId,
          amount: request.amount,
          currency: request.currency,
          paymentType: request.paymentType,
        });

        return {
          success: true,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Shipping fee payment processing failed';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Process COD collection from courier
   */
  async processCodCollection(
    request: CodCollectionRequest,
  ): Promise<CodCollectionResult> {
    try {
      const amountPaise = toPaise(request.amount);

      // Create ledger entry for COD collection
      const financeRecord = this.config.ledgerEngine.createFinanceRecord(
        'cod_collection' as any,
        amountPaise,
        request.currency,
        `COD collection for order: ${request.orderId} from courier: ${request.courierId}`,
        'cod',
        request.shippingId,
      );

      const ledgerEntries = this.config.ledgerEngine.createCodCollectionEntries(
        financeRecord.id,
        amountPaise,
        request.currency,
        request.orderId,
      );

      this.config.ledgerEngine.postFinanceRecord(
        financeRecord.id,
        ledgerEntries,
      );

      // Emit COD collected event
      await this.config.eventEmitter.emitPaymentCaptured({
        orderId: request.orderId,
        shippingId: request.shippingId,
        courierId: request.courierId,
        amount: request.amount,
        currency: request.currency,
        collectedAt: request.collectedAt,
        referenceNumber: request.referenceNumber,
      });

      return {
        success: true,
        collectionId: financeRecord.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'COD collection processing failed';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Process shipping refund
   */
  async processShippingRefund(
    request: ShippingRefundRequest,
  ): Promise<ShippingRefundResult> {
    try {
      const amountPaise = toPaise(request.amount);

      // Create ledger entry for shipping refund
      const financeRecord = this.config.ledgerEngine.createFinanceRecord(
        'refund' as any,
        amountPaise,
        request.currency,
        `Shipping refund for order: ${request.orderId}`,
        'shipping_refund',
        request.shippingId,
      );

      const ledgerEntries = this.config.ledgerEngine.createRefundEntries(
        financeRecord.id,
        amountPaise,
        request.currency,
        request.shippingId,
        request.orderId,
      );

      this.config.ledgerEngine.postFinanceRecord(
        financeRecord.id,
        ledgerEntries,
      );

      // Emit shipping refund event
      await this.config.eventEmitter.emitRefundCompleted({
        orderId: request.orderId,
        shippingId: request.shippingId,
        amount: request.amount,
        currency: request.currency,
        reason: request.reason,
      });

      return {
        success: true,
        refundId: financeRecord.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Shipping refund processing failed';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Reconcile courier payments
   */
  async reconcileCourierPayments(
    _courierId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<{
    totalCollected: number;
    totalSettled: number;
    pending: number;
    mismatched: number;
  }> {
    // This would query ledger entries for COD collections within the period
    // and reconcile with courier settlement reports
    // For now, return placeholder values
    return {
      totalCollected: 0,
      totalSettled: 0,
      pending: 0,
      mismatched: 0,
    };
  }

  /**
   * Calculate COD settlement amount for a shop
   */
  async calculateCodSettlement(
    _shopId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<{
    totalOrders: number;
    totalCollected: number;
    courierFees: number;
    netSettlement: number;
  }> {
    // This would query ledger entries for COD collections for the shop
    // and calculate net settlement after deducting courier fees
    // For now, return placeholder values
    return {
      totalOrders: 0,
      totalCollected: 0,
      courierFees: 0,
      netSettlement: 0,
    };
  }

  /**
   * Process courier settlement
   */
  async processCourierSettlement(
    courierId: string,
    settlementAmount: number,
    currency: string,
    referenceNumber: string,
  ): Promise<{ success: boolean; settlementId?: string; error?: string }> {
    try {
      const amountPaise = toPaise(settlementAmount);

      // Create ledger entry for courier settlement
      const financeRecord = this.config.ledgerEngine.createFinanceRecord(
        'settlement' as any,
        amountPaise,
        currency,
        `Courier settlement for courier: ${courierId}`,
        'courier_settlement',
        referenceNumber,
      );

      const ledgerEntries = this.config.ledgerEngine.createSettlementEntries(
        financeRecord.id,
        amountPaise,
        currency,
        referenceNumber,
        courierId,
      );

      this.config.ledgerEngine.postFinanceRecord(
        financeRecord.id,
        ledgerEntries,
      );

      // Emit courier settlement event
      await this.config.eventEmitter.emitSettlementCompleted({
        courierId,
        settlementId: financeRecord.id,
        amount: settlementAmount,
        currency,
        referenceNumber,
      });

      return {
        success: true,
        settlementId: financeRecord.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Courier settlement processing failed';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

/**
 * Shipping integration factory
 */
export function createShippingIntegration(
  config: ShippingIntegrationConfig,
): ShippingIntegration {
  return new ShippingIntegration(config);
}
