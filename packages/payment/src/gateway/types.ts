/**
 * Gateway Adapter Contract — provider-agnostic payment operations.
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §3 (Gateway Architecture),
 * mandatory rule 15.3 "No gateway logic in business modules".
 *
 * Every provider (Razorpay, Mock, Stripe, SSLCommerz, bKash, Nagad, PayPal,
 * COD, Manual) implements this interface. Business modules only ever depend on
 * this contract — swapping providers never touches business logic.
 */

import type { PaymentTransactionType } from '../enums';

/** Gateway-order creation request (payment initiation). */
export interface CreateOrderRequest {
  /** Local payment idempotency key — required on every gateway call (DB §7.3). */
  idempotencyKey: string;
  /** Amount in paise — conversion boundary; gateways receive paise. */
  amountPaise: number;
  currency: string;
  /** Local order number (NAB-…) for gateway statement reference. */
  orderNumber: string;
  /** Customer contact (masked where possible). */
  customerEmail?: string;
  customerPhone?: string;
  /** Prefilled payment method when known. */
  methodHint?: string;
  /** ISO 8601 expiry for the payment window (15 min). */
  expiresAt: string;
  /** Optional callback URL for redirect-based gateways. */
  callbackUrl?: string;
}

/** Gateway-order creation result. */
export interface CreateOrderResult {
  /** Gateway-side order/payment-session identifier. */
  gatewayOrderId: string;
  /** Checkout payload for the client SDK (provider-specific JSON). */
  clientPayload?: Record<string, unknown>;
  /** Redirect URL for hosted gateways (optional). */
  redirectUrl?: string;
  /** Current gateway status. */
  status: string;
}

/** Verification of a payment callback (client-side verify call). */
export interface VerifyPaymentRequest {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
  /** Expected amount in paise — server-side amount match (PAYMENT §5.8/§5.9). */
  expectedAmountPaise: number;
  currency: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  gatewayStatus: string;
  /** Gateway payment/transaction reference. */
  gatewayPaymentId: string;
  amountPaise: number;
  currency: string;
  method?: string;
}

/** Capture an authorized payment (cards) — PAYMENT §4.6 authorized → captured. */
export interface CaptureRequest {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  amountPaise: number;
  idempotencyKey: string;
}

export interface CaptureResult {
  captured: boolean;
  gatewayReference: string;
  amountPaise: number;
}

/** Refund initiation — PAYMENT §7. */
export interface RefundRequest {
  gatewayPaymentId: string;
  amountPaise: number;
  idempotencyKey: string;
  /** Mandatory refund reason (PAYMENT §7.7). */
  reason: string;
}

export interface RefundResult {
  gatewayReference: string;
  status: string;
  amountPaise: number;
}

/** Void an authorized-but-uncaptured payment (cards). */
export interface VoidRequest {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  idempotencyKey: string;
}

/** Raw inbound webhook delivery (provider → platform). */
export interface RawWebhookDelivery {
  /** Raw body exactly as received — signature covers the raw bytes. */
  rawBody: string;
  headers: Record<string, string | undefined>;
}

/** Normalized webhook event after signature verification + parsing. */
export interface ParsedWebhookEvent {
  /** Provider event id (nonce) — dedupe key (REST §9.3). */
  eventId: string;
  eventType: string;
  /** Gateway payment/order reference (whichever the provider sends). */
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: string;
  amountPaise: number;
  currency: string;
  method?: string;
  /** Provider-specific extra fields (sanitized; no card data ever). */
  metadata?: Record<string, unknown>;
}

/** Structured failure from a gateway call. */
export interface GatewayFailure {
  code: string;
  message: string;
  /** Failure classification drives retry policy (PAYMENT §8.5). */
  transient: boolean;
  gatewayReference?: string;
}

export class GatewayError extends Error {
  readonly failure: GatewayFailure;
  constructor(failure: GatewayFailure) {
    super(failure.message);
    this.name = 'GatewayError';
    this.failure = failure;
  }
}

/**
 * A single normalized transaction record for the immutable gateway log
 * (binding: DATABASE §4.7.3 PaymentTransaction).
 */
export interface GatewayTransaction {
  type: PaymentTransactionType;
  amountPaise: number;
  currency: string;
  gatewayReference?: string;
  failureCode?: string;
  failureMessage?: string;
}

/**
 * PaymentGateway — the provider-neutral contract.
 *
 * Implementations MUST:
 * - carry their own idempotency key on every mutation;
 * - never leak secrets into logs or error messages;
 * - return structured GatewayFailure (never throw raw errors).
 */
export interface PaymentGateway {
  readonly provider: string;
  /** Create a gateway order for a payment attempt. */
  createOrder(req: CreateOrderRequest): Promise<CreateOrderResult>;
  /** Server-side verify of a client callback (amount + signature). */
  verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult>;
  /** Capture an authorized payment. */
  capture(req: CaptureRequest): Promise<CaptureResult>;
  /** Initiate a refund. */
  refund(req: RefundRequest): Promise<RefundResult>;
  /** Void an uncaptured authorization. */
  voidPayment(req: VoidRequest): Promise<void>;
  /** Verify an inbound webhook signature (provider scheme). */
  verifyWebhookSignature(delivery: RawWebhookDelivery): Promise<boolean>;
  /** Parse + normalize a verified webhook payload. */
  parseWebhookEvent(delivery: RawWebhookDelivery): ParsedWebhookEvent;
  /** Fetch gateway-side payment state (reconciliation, PAYMENT §9). */
  fetchPayment(gatewayPaymentId: string): Promise<{
    status: string;
    amountPaise: number;
    currency: string;
  }>;
}
