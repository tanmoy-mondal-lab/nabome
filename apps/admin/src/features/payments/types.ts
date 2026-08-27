/**
 * Admin Payments Feature Types
 *
 * Types for admin payment management including global dashboard, provider management, settlement management, refund management, financial exceptions, and transaction search.
 */

/**
 * Payment status enum
 */
export enum PaymentStatus {
  CREATED = 'CREATED',
  INITIATED = 'INITIATED',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

/**
 * Provider
 */
export interface Provider {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  healthStatus: 'healthy' | 'degraded' | 'down';
  lastHealthCheck?: Date;
  totalTransactions: number;
  successRate: number;
  averageResponseTime: number;
}

/**
 * Global payment metrics
 */
export interface GlobalPaymentMetrics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalAmount: number;
  currency: string;
  successRate: number;
  failureRate: number;
  averageTransactionValue: number;
}

/**
 * Financial exception
 */
export interface FinancialException {
  id: string;
  type:
    'ledger_mismatch' | 'settlement_error' | 'refund_error' | 'payment_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

/**
 * Transaction search filters
 */
export interface TransactionSearchFilters {
  paymentId?: string;
  orderId?: string;
  shopId?: string;
  provider?: string;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}
