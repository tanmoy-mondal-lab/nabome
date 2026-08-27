/**
 * Payment Module Enums
 *
 * Canonical payment lifecycle (binding: MASTER_ARCHITECTURE_BLUEPRINT.md B.3,
 * PAYMENT_ENGINE_ARCHITECTURE.md §4.4, resolutions ML-02/ML-03).
 *
 * Values mirror the extended Prisma `PaymentStatus` / `RefundStatus` enums so
 * package enums and database enums stay 1:1 (no mapping layer needed).
 */

/**
 * Payment lifecycle (11 canonical states + legacy aliases).
 *
 * created → initiated → processing → authorized → captured → completed
 * failed (→ created retry) · cancelled · expired (→ created retry)
 * captured/completed → partially_refunded → refunded
 */
export enum PaymentStatus {
  /** Payment record created, awaiting initiation. */
  CREATED = 'created',
  /** Gateway order created, awaiting customer action. */
  INITIATED = 'initiated',
  /** Customer submitted payment, gateway processing. */
  PROCESSING = 'processing',
  /** Gateway authorized, awaiting capture (cards). */
  AUTHORIZED = 'authorized',
  /** Payment confirmed, funds received. */
  CAPTURED = 'captured',
  /** Funds settled to platform account (terminal forward flow). */
  COMPLETED = 'completed',
  /** Failed at any stage (→ created for retry). */
  FAILED = 'failed',
  /** Customer cancelled (terminal). */
  CANCELLED = 'cancelled',
  /** Payment window expired — 15 min (→ created for retry). */
  EXPIRED = 'expired',
  /** Partial refund processed (→ refunded or partially_refunded). */
  PARTIALLY_REFUNDED = 'partially_refunded',
  /** Full refund processed (terminal). */
  REFUNDED = 'refunded',
  /** Refund in flight (aggregate sub-state). */
  REFUNDING = 'refunding',
}

/**
 * Refund operational lifecycle (binding: PAYMENT §7.9, ML-03):
 * initiated → processing → completed → settled, failed (retry).
 */
export enum RefundStatus {
  /** Refund requested, awaiting processing. */
  INITIATED = 'initiated',
  /** Gateway processing refund. */
  PROCESSING = 'processing',
  /** Refund confirmed by gateway. */
  COMPLETED = 'completed',
  /** Funds returned to customer. */
  SETTLED = 'settled',
  /** Failed (retry or investigate). */
  FAILED = 'failed',
}

export enum RefundType {
  FULL = 'full',
  PARTIAL = 'partial',
}

/**
 * Settlement lifecycle (binding: Blueprint B.4, FINANCE §4.5, ML-09/12):
 * PENDING → ELIGIBLE → CREATED → REVIEW → APPROVED → PROCESSING → COMPLETED → PAID,
 * plus REJECTED → PENDING, FAILED (from PROCESSING), REVERSED (from COMPLETED or PAID).
 */
export enum SettlementStatus {
  PENDING = 'pending',
  ELIGIBLE = 'eligible',
  CREATED = 'created',
  REVIEW = 'review',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PAID = 'paid',
  REJECTED = 'rejected',
  FAILED = 'failed',
  REVERSED = 'reversed',
  // Legacy values
  SETTLED = 'settled',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  INITIATED = 'initiated',
  RETRY_PENDING = 'retry_pending',
  PARTIALLY_SETTLED = 'partially_settled',
  MANUAL_REVIEW = 'manual_review',
}

/**
 * Immutable gateway transaction types (binding: DATABASE §4.7.3).
 */
export enum PaymentTransactionType {
  AUTHORIZE = 'authorize',
  CAPTURE = 'capture',
  REFUND = 'refund',
  VOID = 'void',
}

export enum PaymentTransactionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

/**
 * Registered gateway providers. All providers are registered in the registry;
 * only `razorpay` and `mock` have adapters implemented. Others throw
 * `PROVIDER_NOT_CONFIGURED` until their adapters ship (swap-in ready —
 * PAYMENT §3 gateway independence, mandatory rule 15.3).
 */
export enum PaymentProvider {
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
  SSLCOMMERZ = 'sslcommerz',
  BKASH = 'bkash',
  NAGAD = 'nagad',
  PAYPAL = 'paypal',
  COD = 'cod',
  MANUAL = 'manual',
  MOCK = 'mock',
}

/** Order payment sub-status (binding: CC-28). */
export enum OrderPaymentSubStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum PaymentMethodType {
  CARD = 'card',
  UPI = 'upi',
  NETBANKING = 'netbanking',
  WALLET = 'wallet',
  COD = 'cod',
  SAVED_CARD = 'saved_card',
}

/**
 * Failure classification (binding: PAYMENT §8.5). Drives retry policy.
 */
export enum FailureType {
  /** Network timeout, gateway busy — retryable (max 3, backoff). */
  TRANSIENT = 'transient',
  /** Insufficient funds, declined — not retryable, try another method. */
  PERMANENT = 'permanent',
  /** Gateway error, config issue — not retryable, contact support. */
  SYSTEM = 'system',
  /** Amount mismatch, invalid signature — restart checkout. */
  VALIDATION = 'validation',
  /** Payment window timeout — restart checkout. */
  EXPIRED = 'expired',
}

/**
 * Webhook event processing status (binding: DATABASE §4.7.4).
 */
export enum WebhookEventStatus {
  RECEIVED = 'received',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}
