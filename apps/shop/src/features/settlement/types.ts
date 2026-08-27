/**
 * Settlement Feature Types
 *
 * Types for shop owner settlement management including dashboard, transaction history, pending settlements, refund queue, and payout summary.
 */

/**
 * Settlement status enum
 */
export enum SettlementStatus {
  CREATED = 'CREATED',
  ELIGIBLE = 'ELIGIBLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

/**
 * Settlement
 */
export interface Settlement {
  id: string;
  settlementNumber: string;
  shopId: string;
  status: SettlementStatus;
  grossAmount: number;
  commissionAmount: number;
  taxAmount: number;
  platformFeeAmount: number;
  netAmount: number;
  currency: string;
  createdAt: Date;
  completedAt?: Date;
  paidAt?: Date;
}

/**
 * Settlement summary
 */
export interface SettlementSummary {
  totalSettlements: number;
  pendingSettlements: number;
  completedSettlements: number;
  paidSettlements: number;
  totalGrossAmount: number;
  totalNetAmount: number;
  currency: string;
}

/**
 * Payout summary
 */
export interface PayoutSummary {
  totalPayouts: number;
  pendingPayouts: number;
  completedPayouts: number;
  totalPayoutAmount: number;
  currency: string;
  nextPayoutDate?: Date;
}

/**
 * Refund queue item
 */
export interface RefundQueueItem {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  reason?: string;
  status: string;
  createdAt: Date;
}

/**
 * Settlement filters
 */
export interface SettlementFilters {
  status?: SettlementStatus;
  startDate?: Date;
  endDate?: Date;
}
