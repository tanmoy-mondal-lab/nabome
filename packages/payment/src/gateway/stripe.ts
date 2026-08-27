/**
 * Stripe Gateway Adapter
 *
 * Implements the PaymentGateway contract for Stripe.
 * Follows PAYMENT_ENGINE_ARCHITECTURE.md §3 gateway independence rules.
 *
 * Security: Never stores raw card data. Uses Stripe tokens only.
 * Amounts: Always in paise (smallest currency unit).
 * Idempotency: Stripe idempotency keys on all mutations.
 * Web Crypto: Uses crypto.subtle for Cloudflare Workers compatibility.
 */

import type {
  PaymentGateway,
  CreateOrderRequest,
  CreateOrderResult,
  VerifyPaymentRequest,
  VerifyPaymentResult,
  CaptureRequest,
  CaptureResult,
  RefundRequest,
  RefundResult,
  VoidRequest,
  RawWebhookDelivery,
  ParsedWebhookEvent,
  GatewayFailure,
} from './types';

/** Generate UUID v4 (Cloudflare Workers compatible). */
async function generateUUID(): Promise<string> {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  if (bytes[6] !== undefined) bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  if (bytes[8] !== undefined) bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/** HMAC-SHA256 hex digest via Web Crypto (Workers-compatible). */
async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface StripeCredentials {
  secretKey: string;
  webhookSecret: string;
  publishableKey?: string;
}

/**
 * Stripe-specific error codes mapped to GatewayFailure classification.
 */
const STRIPE_ERROR_CLASSIFICATION: Record<
  string,
  { transient: boolean; code: string }
> = {
  // Transient errors - retryable
  rate_limit: { transient: true, code: 'RATE_LIMIT' },
  api_connection_error: { transient: true, code: 'CONNECTION_ERROR' },
  api_error: { transient: true, code: 'API_ERROR' },
  authentication_error: { transient: false, code: 'AUTH_ERROR' },

  // Permanent errors - not retryable
  card_declined: { transient: false, code: 'CARD_DECLINED' },
  insufficient_funds: { transient: false, code: 'INSUFFICIENT_FUNDS' },
  expired_card: { transient: false, code: 'EXPIRED_CARD' },
  incorrect_cvc: { transient: false, code: 'INVALID_CVC' },
  invalid_amount: { transient: false, code: 'INVALID_AMOUNT' },
  invalid_currency: { transient: false, code: 'INVALID_CURRENCY' },
  processing_error: { transient: false, code: 'PROCESSING_ERROR' },
};

function classifyStripeError(stripeError: any): GatewayFailure {
  const code = stripeError.code || stripeError.type || 'UNKNOWN_ERROR';
  const classification = STRIPE_ERROR_CLASSIFICATION[code] || {
    transient: false,
    code: 'UNKNOWN_ERROR',
  };

  return {
    code: classification.code,
    message: stripeError.message || 'Unknown Stripe error',
    transient: classification.transient,
    gatewayReference: stripeError.payment_intent?.id || stripeError.charge?.id,
  };
}

/**
 * Stripe Gateway Implementation
 */
export class StripeGateway implements PaymentGateway {
  readonly provider = 'stripe';

  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly baseUrl = 'https://api.stripe.com/v1';

  constructor(credentials: StripeCredentials) {
    this.secretKey = credentials.secretKey;
    this.webhookSecret = credentials.webhookSecret;
  }

  private async stripeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const idempotencyKey =
      (options.headers as Record<string, string>)?.['Idempotency-Key'] ||
      (await generateUUID());

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': idempotencyKey,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      const failure = classifyStripeError(error);
      throw new Error(failure.message);
    }

    return response.json();
  }

  /**
   * Create a PaymentIntent on Stripe.
   * Stripe uses PaymentIntent as the unified order/payment object.
   */
  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResult> {
    const params = new URLSearchParams({
      amount: req.amountPaise.toString(),
      currency: req.currency.toLowerCase(),
      'metadata[order_number]': req.orderNumber,
      'metadata[idempotency_key]': req.idempotencyKey,
      ...(req.customerEmail && { receipt_email: req.customerEmail }),
      ...(req.methodHint && { payment_method_types: req.methodHint }),
    });

    if (req.expiresAt) {
      // Stripe doesn't have explicit payment window expiry,
      // but we can store it in metadata for our own validation
      params.append('metadata[expires_at]', req.expiresAt);
    }

    try {
      const intent = await this.stripeRequest<{
        id: string;
        status: string;
        client_secret: string;
      }>('/payment_intents', {
        method: 'POST',
        headers: { 'Idempotency-Key': req.idempotencyKey },
        body: params,
      });

      return {
        gatewayOrderId: intent.id,
        clientPayload: {
          clientSecret: intent.client_secret,
          publishableKey: this.secretKey.startsWith('sk_live')
            ? 'pk_live'
            : 'pk_test',
        },
        status: intent.status,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify a payment callback from Stripe.
   * Stripe uses PaymentIntent status for verification.
   */
  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    try {
      const intent = await this.stripeRequest<{
        id: string;
        status: string;
        amount: number;
        currency: string;
        payment_method?: string;
      }>(`/payment_intents/${req.gatewayPaymentId}`);

      // Verify amount matches (server-side validation)
      if (intent.amount !== req.expectedAmountPaise) {
        return {
          verified: false,
          gatewayStatus: intent.status,
          gatewayPaymentId: intent.id,
          amountPaise: intent.amount,
          currency: intent.currency,
        };
      }

      return {
        verified: intent.status === 'succeeded',
        gatewayStatus: intent.status,
        gatewayPaymentId: intent.id,
        amountPaise: intent.amount,
        currency: intent.currency,
        method: intent.payment_method,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Capture an authorized PaymentIntent.
   * Stripe auto-captures by default; this is for manual capture flows.
   */
  async capture(req: CaptureRequest): Promise<CaptureResult> {
    const params = new URLSearchParams({
      amount_to_capture: req.amountPaise.toString(),
    });

    try {
      const capture = await this.stripeRequest<{
        id: string;
        amount: number;
        status: string;
      }>(`/payment_intents/${req.gatewayPaymentId}/capture`, {
        method: 'POST',
        headers: { 'Idempotency-Key': req.idempotencyKey },
        body: params,
      });

      return {
        captured: capture.status === 'succeeded',
        gatewayReference: capture.id,
        amountPaise: capture.amount,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a refund on Stripe.
   */
  async refund(req: RefundRequest): Promise<RefundResult> {
    const params = new URLSearchParams({
      payment_intent: req.gatewayPaymentId,
      amount: req.amountPaise.toString(),
      reason: req.reason,
    });
    // Add idempotency key as a separate metadata parameter
    params.append('metadata[idempotency_key]', req.idempotencyKey);

    try {
      const refund = await this.stripeRequest<{
        id: string;
        status: string;
        amount: number;
      }>('/refunds', {
        method: 'POST',
        headers: { 'Idempotency-Key': req.idempotencyKey },
        body: params,
      });

      return {
        gatewayReference: refund.id,
        status: refund.status,
        amountPaise: refund.amount,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Void/cancel a PaymentIntent.
   */
  async voidPayment(req: VoidRequest): Promise<void> {
    try {
      await this.stripeRequest(
        `/payment_intents/${req.gatewayPaymentId}/cancel`,
        {
          method: 'POST',
          headers: { 'Idempotency-Key': req.idempotencyKey },
        },
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify Stripe webhook signature.
   * Stripe uses HMAC-SHA256 with timestamp and payload.
   */
  async verifyWebhookSignature(delivery: RawWebhookDelivery): Promise<boolean> {
    const signature = delivery.headers['stripe-signature'];
    if (!signature) return false;

    const timestamp = signature.split(',')[0]?.split('=')[1];
    if (!timestamp) return false;

    // Check timestamp is within tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const webhookTimestamp = parseInt(timestamp, 10);
    if (now - webhookTimestamp > 300) {
      return false;
    }

    const expectedSignature = await hmacHex(
      this.webhookSecret,
      `${timestamp}.${delivery.rawBody}`,
    );

    const receivedSignatures = signature.split(',').map((s) => s.split('=')[1]);
    return receivedSignatures.includes(expectedSignature);
  }

  /**
   * Parse Stripe webhook event.
   */
  parseWebhookEvent(delivery: RawWebhookDelivery): ParsedWebhookEvent {
    const payload = JSON.parse(delivery.rawBody);
    const event = payload.data?.object;

    // Map Stripe event types to our normalized types
    const eventTypeMap: Record<string, string> = {
      'payment_intent.succeeded': 'payment.captured',
      'payment_intent.payment_failed': 'payment.failed',
      'payment_intent.canceled': 'payment.cancelled',
      'charge.refunded': 'refund.completed',
      'charge.refund.updated': 'refund.processing',
    };

    const eventType = eventTypeMap[payload.type] || payload.type;

    return {
      eventId: payload.id,
      eventType,
      gatewayOrderId: event?.payment_intent,
      gatewayPaymentId: event?.id || event?.payment_intent,
      status: event?.status || 'unknown',
      amountPaise: event?.amount || 0,
      currency: event?.currency || 'inr',
      method: event?.payment_method_details?.type,
      metadata: {
        rawEventType: payload.type,
        livemode: payload.livemode,
      },
    };
  }

  /**
   * Fetch PaymentIntent status for reconciliation.
   */
  async fetchPayment(gatewayPaymentId: string): Promise<{
    status: string;
    amountPaise: number;
    currency: string;
  }> {
    const intent = await this.stripeRequest<{
      status: string;
      amount: number;
      currency: string;
    }>(`/payment_intents/${gatewayPaymentId}`);

    return {
      status: intent.status,
      amountPaise: intent.amount,
      currency: intent.currency,
    };
  }
}
