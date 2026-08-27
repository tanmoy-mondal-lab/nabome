/**
 * Refunds Service - Business Logic Layer
 *
 * This service handles refund processing with compensating financial records.
 * Never modifies immutable ledger entries - creates new compensating records.
 * Integrates with Payment Engine for actual refund processing.
 */

import { refundsRepository, returnsRepository } from '../repository';
import { CreateRefundInput, ReturnRefund } from '../types';
import { RefundStatus, RefundMethod } from '../enums';
import { RefundStatus as PrismaRefundStatus } from '@prisma/client';

export class RefundsService {
  /**
   * Create a refund record (compensating financial record)
   * This creates a new record rather than modifying existing ledger entries
   */
  async createRefund(
    input: CreateRefundInput & {
      returnRequestId: string;
      paymentId: string;
      orderId: string;
      profileId: string;
      shopId: string;
      initiatedBy: string;
    },
  ): Promise<ReturnRefund> {
    // Validate return request exists and is in correct state
    const returnRequest = await returnsRepository.findById(
      input.returnRequestId,
    );
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    // Check if refund already exists for this amount
    const existingRefunds = await refundsRepository.findByReturnRequestId(
      input.returnRequestId,
    );
    const totalRefunded = existingRefunds.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    const maxRefund = Number(returnRequest.totalRefundAmount);

    if (totalRefunded + Number(input.amount) > maxRefund) {
      throw new Error('Refund amount exceeds total return amount');
    }

    // Create the refund record (compensating financial record)
    const refund = await refundsRepository.createRefund(input);

    // Update return request refund status
    await returnsRepository.updateRefundStatus(
      input.returnRequestId,
      PrismaRefundStatus.PENDING,
    );

    // Initiate refund via Payment Engine (would integrate with Payment module)
    await this.initiateGatewayRefund(refund);

    return refund;
  }

  /**
   * Initiate refund via payment gateway
   * This would integrate with the Payment Engine
   */
  private async initiateGatewayRefund(refund: ReturnRefund): Promise<void> {
    // Integration point with Payment Engine
    // For now, we'll simulate the gateway call
    console.log(`Initiating gateway refund for refund: ${refund.id}`);

    // In production, this would call:
    // await paymentGateway.refund({
    //   paymentId: refund.paymentId,
    //   amount: refund.amount,
    //   currency: refund.currency,
    //   reason: refund.reason,
    //   reference: refund.id,
    // });
  }

  /**
   * Process refund completion from gateway webhook
   */
  async completeRefund(
    refundId: string,
    gatewayRef: string,
    gatewayStatus: string,
  ): Promise<ReturnRefund> {
    const refund = await refundsRepository.findById(refundId);

    if (!refund) {
      throw new Error('Refund not found');
    }

    if (
      refund.status !== RefundStatus.PENDING &&
      refund.status !== RefundStatus.PROCESSING
    ) {
      throw new Error('Refund is not in a completable state');
    }

    const updated = await refundsRepository.updateStatus(
      refundId,
      PrismaRefundStatus.COMPLETED,
      gatewayRef,
      gatewayStatus,
      new Date(),
      undefined,
      undefined,
      'system',
    );

    // Update return request refund status
    await returnsRepository.updateRefundStatus(
      refund.returnRequestId,
      PrismaRefundStatus.COMPLETED,
      new Date(),
    );

    // Create compensating financial record in Finance Engine
    await this.createCompensatingFinanceRecord(updated);

    return updated;
  }

  /**
   * Process refund failure from gateway webhook
   */
  async failRefund(
    refundId: string,
    failureReason: string,
  ): Promise<ReturnRefund> {
    const refund = await refundsRepository.findById(refundId);

    if (!refund) {
      throw new Error('Refund not found');
    }

    return await refundsRepository.updateStatus(
      refundId,
      PrismaRefundStatus.FAILED,
      undefined,
      undefined,
      undefined,
      new Date(),
      failureReason,
    );
  }

  /**
   * Create compensating financial record in Finance Engine
   * This ensures financial integrity by creating new records instead of modifying existing ones
   */
  private async createCompensatingFinanceRecord(
    refund: ReturnRefund,
  ): Promise<void> {
    // Integration point with Finance Engine
    // This creates a new FinanceRecord with type='refund' or type='reversal'
    console.log(
      `Creating compensating finance record for refund: ${refund.id}`,
    );

    // In production, this would call:
    // await financeService.createRecord({
    //   orderId: refund.orderId,
    //   type: FinanceRecordType.REFUND,
    //   amount: refund.amount,
    //   currency: refund.currency,
    //   referenceType: 'return_refund',
    //   referenceId: refund.id,
    //   ledgerEntries: [
    //     { account: LedgerAccount.REFUNDS, side: LedgerSide.DEBIT, amount: refund.amount },
    //     { account: LedgerAccount.CASH, side: LedgerSide.CREDIT, amount: refund.amount },
    //   ],
    // });
  }

  /**
   * Process store credit refund
   */
  async processStoreCreditRefund(
    refundId: string,
    amount: number,
  ): Promise<ReturnRefund> {
    const refund = await refundsRepository.findById(refundId);

    if (!refund) {
      throw new Error('Refund not found');
    }

    if (refund.method !== RefundMethod.STORE_CREDIT) {
      throw new Error('Refund method is not store credit');
    }

    // Add store credit to customer account (would integrate with Customer/Finance modules)
    console.log(
      `Adding store credit: ${amount} to profile: ${refund.profileId}`,
    );

    return await refundsRepository.updateStatus(
      refundId,
      PrismaRefundStatus.COMPLETED,
      undefined,
      'store_credit_applied',
      new Date(),
      undefined,
      undefined,
      'system',
    );
  }

  /**
   * Get refund by ID
   */
  async getRefund(refundId: string): Promise<ReturnRefund | null> {
    return await refundsRepository.findById(refundId);
  }

  /**
   * Get refunds for return request
   */
  async getReturnRefunds(returnRequestId: string): Promise<ReturnRefund[]> {
    return await refundsRepository.findByReturnRequestId(returnRequestId);
  }

  /**
   * Get refunds for order
   */
  async getOrderRefunds(orderId: string): Promise<ReturnRefund[]> {
    return await refundsRepository.findByOrderId(orderId);
  }

  /**
   * Get pending refunds for a shop
   */
  async getPendingRefunds(shopId: string): Promise<ReturnRefund[]> {
    return await refundsRepository.getPendingRefundsByShop(shopId);
  }

  /**
   * Get refund statistics
   */
  async getStatistics(
    shopId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    return await refundsRepository.getStatistics(shopId, startDate, endDate);
  }

  /**
   * Calculate refund amount for return items
   * Considers restocking fees, shipping refunds, etc.
   */
  calculateRefundAmount(
    items: Array<{ totalPrice: number }>,
    restockingFeePercentage?: number,
    refundShipping: boolean = false,
    shippingAmount: number = 0,
  ): number {
    const itemsTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    let refundAmount = itemsTotal;

    // Apply restocking fee if applicable
    if (restockingFeePercentage && restockingFeePercentage > 0) {
      const restockingFee = (itemsTotal * restockingFeePercentage) / 100;
      refundAmount -= restockingFee;
    }

    // Add shipping refund if applicable
    if (refundShipping) {
      refundAmount += shippingAmount;
    }

    return Math.max(0, refundAmount);
  }
}

export const refundsService = new RefundsService();
