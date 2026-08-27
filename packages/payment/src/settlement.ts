/**
 * Settlement Engine — Shop allocation, platform fees, taxes, commission calculation
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §8 (Settlement Engine),
 * FINANCE_ENGINE_ARCHITECTURE.md §4 (Settlement),
 * MASTER_ARCHITECTURE_BLUEPRINT.md B.4
 *
 * This module provides the core settlement orchestration logic:
 * - Settlement record creation and lifecycle management
 * - Shop allocation of payments
 * - Platform fee calculation
 * - Tax calculation
 * - Commission calculation
 * - Settlement eligibility checking
 * - Payout generation
 */

import { SettlementStatus, PaymentStatus, RefundStatus } from './enums';
import {
  fromPaise,
  percentOf,
  add,
  subtract,
  SETTLEMENT_MIN_AMOUNT,
  SETTLEMENT_HOLD_DAYS,
  COMMISSION_DEFAULT_RATE,
} from './money';

export interface SettlementConfig {
  shopId: string;
  commissionRate?: number; // Percentage (default 15%)
  taxRate?: number; // Percentage (GST, default 18%)
  platformFeeRate?: number; // Percentage (default 2%)
  holdDays?: number; // Days to hold before settlement (default 7)
  minSettlementAmount?: number; // Minimum amount in paise (default ₹100)
}

export interface SettlementCalculation {
  totalAmount: number; // Total amount in paise
  commissionAmount: number; // Platform commission in paise
  taxAmount: number; // Tax on commission in paise
  platformFeeAmount: number; // Gateway/platform fee in paise
  netAmount: number; // Net payable to shop in paise
  refundAmount: number; // Total refunds in paise
  chargebackAmount: number; // Total chargebacks in paise
}

export interface SettlementItemInput {
  orderId: string;
  paymentId: string;
  amount: number; // Payment amount in paise
  refundAmount: number; // Refunded amount in paise
  commissionRate: number;
  taxRate: number;
  platformFeeRate: number;
}

export interface SettlementItemResult {
  orderId: string;
  paymentId: string;
  grossAmount: number;
  refundAmount: number;
  commissionAmount: number;
  taxAmount: number;
  platformFeeAmount: number;
  netAmount: number;
}

export interface SettlementEligibilityCheck {
  eligible: boolean;
  reason?: string;
  pendingAmount: number;
  holdUntil?: Date;
}

export interface PayoutRequest {
  settlementId: string;
  method: 'upi' | 'bank';
  accountDetails: {
    upiId?: string;
    accountNumber?: string;
    ifsc?: string;
    accountHolder?: string;
  };
}

export interface PayoutResult {
  success: boolean;
  payoutReference?: string;
  failureReason?: string;
}

/**
 * Settlement Engine class
 */
export class SettlementEngine {
  constructor(private config: SettlementConfig) {
    this.config = {
      commissionRate: config.commissionRate ?? COMMISSION_DEFAULT_RATE,
      taxRate: config.taxRate ?? 18,
      platformFeeRate: config.platformFeeRate ?? 2,
      holdDays: config.holdDays ?? SETTLEMENT_HOLD_DAYS,
      minSettlementAmount: config.minSettlementAmount ?? SETTLEMENT_MIN_AMOUNT,
      ...config,
    };
  }

  /**
   * Calculate settlement amounts for a single payment
   */
  calculateSettlementItem(input: SettlementItemInput): SettlementItemResult {
    const grossAmount = input.amount;
    const refundAmount = input.refundAmount;
    const netGross = subtract(grossAmount, refundAmount);

    // Calculate commission on net gross amount
    const commissionAmount = percentOf(netGross, input.commissionRate);

    // Calculate tax on commission (GST on service fee)
    const taxAmount = percentOf(commissionAmount, input.taxRate);

    // Calculate platform fee (gateway fee)
    const platformFeeAmount = percentOf(netGross, input.platformFeeRate);

    // Net amount payable to shop
    const netAmount = subtract(
      subtract(subtract(netGross, commissionAmount), taxAmount),
      platformFeeAmount,
    );

    return {
      orderId: input.orderId,
      paymentId: input.paymentId,
      grossAmount,
      refundAmount,
      commissionAmount,
      taxAmount,
      platformFeeAmount,
      netAmount,
    };
  }

  /**
   * Calculate total settlement amounts
   */
  calculateSettlement(items: SettlementItemInput[]): SettlementCalculation {
    let totalAmount = 0;
    let commissionAmount = 0;
    let taxAmount = 0;
    let platformFeeAmount = 0;
    let netAmount = 0;
    let refundAmount = 0;
    const chargebackAmount = 0;

    for (const item of items) {
      const result = this.calculateSettlementItem(item);
      totalAmount = add(totalAmount, result.grossAmount);
      commissionAmount = add(commissionAmount, result.commissionAmount);
      taxAmount = add(taxAmount, result.taxAmount);
      platformFeeAmount = add(platformFeeAmount, result.platformFeeAmount);
      netAmount = add(netAmount, result.netAmount);
      refundAmount = add(refundAmount, result.refundAmount);
    }

    return {
      totalAmount,
      commissionAmount,
      taxAmount,
      platformFeeAmount,
      netAmount,
      refundAmount,
      chargebackAmount,
    };
  }

  /**
   * Check if a payment is eligible for settlement
   */
  checkPaymentEligibility(
    paymentStatus: PaymentStatus,
    paymentDate: Date,
    refundStatus?: RefundStatus,
  ): SettlementEligibilityCheck {
    const now = new Date();
    const holdUntil = new Date(paymentDate);
    holdUntil.setDate(holdUntil.getDate() + this.config.holdDays!);

    // Payment must be captured/completed
    if (
      paymentStatus !== PaymentStatus.CAPTURED &&
      paymentStatus !== PaymentStatus.COMPLETED
    ) {
      return {
        eligible: false,
        reason: `Payment not settled (status: ${paymentStatus})`,
        pendingAmount: 0,
      };
    }

    // If refund is in flight, wait for it to complete
    if (
      refundStatus === RefundStatus.INITIATED ||
      refundStatus === RefundStatus.PROCESSING
    ) {
      return {
        eligible: false,
        reason: 'Refund in progress',
        pendingAmount: 0,
      };
    }

    // Check hold period
    if (now < holdUntil) {
      return {
        eligible: false,
        reason: 'Payment in hold period',
        pendingAmount: 0,
        holdUntil,
      };
    }

    return {
      eligible: true,
      pendingAmount: 0,
    };
  }

  /**
   * Check if shop has sufficient eligible amount for settlement
   */
  checkSettlementEligibility(
    eligibleAmount: number,
  ): SettlementEligibilityCheck {
    const minAmount = this.config.minSettlementAmount ?? SETTLEMENT_MIN_AMOUNT;
    if (eligibleAmount < minAmount) {
      return {
        eligible: false,
        reason: `Amount below minimum (required: ${fromPaise(minAmount)}, available: ${fromPaise(eligibleAmount)})`,
        pendingAmount: eligibleAmount,
      };
    }

    return {
      eligible: true,
      pendingAmount: eligibleAmount,
    };
  }

  /**
   * Validate settlement state transition
   */
  validateSettlementTransition(
    currentStatus: SettlementStatus,
    targetStatus: SettlementStatus,
  ): boolean {
    const transitions: Record<SettlementStatus, SettlementStatus[]> = {
      [SettlementStatus.PENDING]: [
        SettlementStatus.ELIGIBLE,
        SettlementStatus.REJECTED,
      ],
      [SettlementStatus.ELIGIBLE]: [
        SettlementStatus.CREATED,
        SettlementStatus.REJECTED,
      ],
      [SettlementStatus.CREATED]: [
        SettlementStatus.REVIEW,
        SettlementStatus.REJECTED,
      ],
      [SettlementStatus.REVIEW]: [
        SettlementStatus.APPROVED,
        SettlementStatus.REJECTED,
      ],
      [SettlementStatus.APPROVED]: [
        SettlementStatus.PROCESSING,
        SettlementStatus.REJECTED,
      ],
      [SettlementStatus.PROCESSING]: [
        SettlementStatus.COMPLETED,
        SettlementStatus.FAILED,
      ],
      [SettlementStatus.COMPLETED]: [
        SettlementStatus.PAID,
        SettlementStatus.REVERSED,
      ],
      [SettlementStatus.PAID]: [SettlementStatus.REVERSED],
      [SettlementStatus.REJECTED]: [SettlementStatus.PENDING],
      [SettlementStatus.FAILED]: [
        SettlementStatus.PROCESSING,
        SettlementStatus.REJECTED,
      ],
      [SettlementStatus.REVERSED]: [],
      // Legacy values
      [SettlementStatus.SETTLED]: [SettlementStatus.REVERSED],
      [SettlementStatus.ON_HOLD]: [SettlementStatus.PENDING],
      [SettlementStatus.CANCELLED]: [SettlementStatus.PENDING],
      [SettlementStatus.INITIATED]: [
        SettlementStatus.PROCESSING,
        SettlementStatus.REJECTED,
      ],
      [SettlementStatus.RETRY_PENDING]: [
        SettlementStatus.PROCESSING,
        SettlementStatus.REJECTED,
      ],
      [SettlementStatus.PARTIALLY_SETTLED]: [SettlementStatus.COMPLETED],
      [SettlementStatus.MANUAL_REVIEW]: [
        SettlementStatus.APPROVED,
        SettlementStatus.REJECTED,
      ],
    };

    return transitions[currentStatus]?.includes(targetStatus) ?? false;
  }

  /**
   * Generate settlement number (NAB-STL-YYYYMMDD-XXXX)
   */
  generateSettlementNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `NAB-STL-${dateStr}-${random}`;
  }

  /**
   * Calculate settlement period (daily, weekly, monthly)
   */
  calculateSettlementPeriod(
    frequency: 'daily' | 'weekly' | 'monthly',
    referenceDate?: Date,
  ): { start: Date; end: Date } {
    const date = referenceDate || new Date();
    const start = new Date(date);
    const end = new Date(date);

    switch (frequency) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }

  /**
   * Process payout (integration with payout provider)
   */
  async processPayout(request: PayoutRequest): Promise<PayoutResult> {
    // This is a placeholder for actual payout provider integration
    // In production, this would integrate with:
    // - Razorpay Payouts
    // - Bank transfer APIs
    // - UPI payout APIs

    try {
      // Validate payout method
      if (request.method === 'upi' && !request.accountDetails.upiId) {
        return {
          success: false,
          failureReason: 'UPI ID required for UPI payout',
        };
      }

      if (
        request.method === 'bank' &&
        (!request.accountDetails.accountNumber || !request.accountDetails.ifsc)
      ) {
        return {
          success: false,
          failureReason: 'Account number and IFSC required for bank payout',
        };
      }

      // Simulate payout processing
      const payoutReference = `PO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      return {
        success: true,
        payoutReference,
      };
    } catch (error) {
      return {
        success: false,
        failureReason: error instanceof Error ? error.message : 'Payout failed',
      };
    }
  }

  /**
   * Reverse a payout (in case of failure or dispute)
   */
  async reversePayout(
    _payoutReference: string,
    _reason: string,
  ): Promise<boolean> {
    // This is a placeholder for actual payout reversal
    // In production, this would integrate with payout provider's reversal API

    try {
      // Simulate reversal
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate commission based on scope (platform, shop, category)
   */
  calculateCommission(
    amount: number,
    scope: 'platform' | 'shop' | 'category',
    customRate?: number,
  ): number {
    let rate: number;
    if (customRate !== undefined) rate = customRate;
    else if (scope === 'platform') rate = this.config.platformFeeRate ?? 2;
    else rate = this.config.commissionRate ?? COMMISSION_DEFAULT_RATE;
    return percentOf(amount, rate);
  }

  /**
   * Calculate tax based on jurisdiction
   */
  calculateTax(
    amount: number,
    jurisdiction: 'IN' | 'BD' | 'US' = 'IN',
    customRate?: number,
  ): number {
    // Default GST rates for India
    const defaultRates: Record<string, number> = {
      IN: 18, // GST
      BD: 15, // VAT
      US: 0, // Sales tax varies by state
    };

    const rate = customRate ?? defaultRates[jurisdiction] ?? 18;
    return percentOf(amount, rate);
  }
}

/**
 * Settlement factory for creating configured settlement engines
 */
export function createSettlementEngine(
  config: SettlementConfig,
): SettlementEngine {
  return new SettlementEngine(config);
}
