/**
 * Payment Feature Types
 *
 * Types for customer payment management including payment selection, status, retry, history, and transaction details.
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
 * Refund status enum
 */
export enum RefundStatus {
  INITIATED = 'INITIATED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SETTLED = 'SETTLED',
}

/**
 * Payment method
 */
export interface PaymentMethod {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  icon: string;
  supportedCurrencies: string[];
  supportedMethods: string[];
}

/**
 * Payment
 */
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  status: PaymentStatus;
  gatewayReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refund
 */
export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction detail
 */
export interface TransactionDetail {
  payment: Payment;
  refunds?: Refund[];
  timeline: TransactionTimelineEvent[];
}

/**
 * Transaction timeline event
 */
export interface TransactionTimelineEvent {
  id: string;
  type:
    'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
  status: string;
  timestamp: Date;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payment selection request
 */
export interface PaymentSelectionRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
}

/**
 * Payment retry request
 */
export interface PaymentRetryRequest {
  paymentId: string;
  method?: string;
  provider?: string;
}

/**
 * Payment history filters
 */
export interface PaymentHistoryFilters {
  status?: PaymentStatus;
  provider?: string;
  method?: string;
  startDate?: Date;
  endDate?: Date;
}
