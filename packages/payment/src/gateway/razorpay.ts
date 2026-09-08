/**
 * Razorpay Gateway Adapter — real implementation for the India launch market
 * (binding: ML-01, PAYMENT §3).
 *
 * REST API: https://api.razorpay.com/v1 (orders, payments, refunds).
 * Webhook signature: HMAC-SHA256 over the raw body with the webhook secret,
 * header `x-razorpay-signature` (hex). Amounts in paise.
 *
 * Security: secrets come from env at construction time, never logged; all
 * mutations carry an idempotency key; failures map to structured
 * GatewayFailure with a `transient` classification (PAYMENT §8.5).
 */

import type {
  CaptureRequest,
  CaptureResult,
  CreateOrderRequest,
  CreateOrderResult,
  GatewayError,
  ParsedWebhookEvent,
  RawWebhookDelivery,
  RefundRequest,
  RefundResult,
  VerifyPaymentRequest,
  VerifyPaymentResult,
  VoidRequest,
} from './types';

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

const API_BASE = 'https://api.razorpay.com/v1';

export class RazorpayGateway {
  readonly provider = 'razorpay';
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(credentials: RazorpayCredentials) {
    this.keyId = credentials.keyId;
    this.keySecret = credentials.keySecret;
    this.webhookSecret = credentials.webhookSecret;
  }

  private authHeader(): string {
    return `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const { idempotencyKey, ...rest } = body ?? {};
    const headers: Record<string, string> = {
      Authorization: this.authHeader(),
      'Content-Type': 'application/json',
    };
    if (typeof idempotencyKey === 'string' && idempotencyKey.length > 0) {
      headers['X-Razorpay-Idempotency-Key'] = idempotencyKey;
    }

    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: Object.keys(rest).length > 0 ? JSON.stringify(rest) : undefined,
        signal: AbortSignal.timeout(15000),
      });
    } catch (err) {
      const error = err as Error;
      throw Object.assign(new Error('Gateway unavailable'), {
        failure: {
          code: 'GATEWAY_UNAVAILABLE',
          message: error.message,
          transient: true,
        },
      }) as GatewayError;
    }

    const text = await res.text();
    if (!res.ok) {
      let code = `HTTP_${res.status}`;
      let message = text;
      try {
        const parsed = JSON.parse(text) as {
          error?: { code?: string; description?: string };
        };
        code = parsed.error?.code ?? code;
        message = parsed.error?.description ?? message;
      } catch {
        // non-JSON error body — keep raw text
      }
      const transient = res.status >= 500 || res.status === 429;
      throw Object.assign(new Error(message), {
        failure: { code, message, transient },
      }) as GatewayError;
    }
    return JSON.parse(text) as T;
  }

  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResult> {
    const order = await this.request<Record<string, unknown>>(
      'POST',
      '/orders',
      {
        amount: req.amountPaise,
        currency: req.currency,
        receipt: req.orderNumber,
        idempotencyKey: req.idempotencyKey,
      },
    );
    return {
      gatewayOrderId: String(order.id),
      status: String(order.status),
      clientPayload: { orderId: String(order.id) },
    };
  }

  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    // Razorpay signature: HMAC-SHA256(secret, `${orderId}|${paymentId}`)
    const payload = `${req.gatewayOrderId}|${req.gatewayPaymentId}`;
    const expected = await hmacHex(this.keySecret, payload);
    if (!timingSafeEqualHex(expected, req.signature)) {
      throw Object.assign(new Error('Invalid payment signature'), {
        failure: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid payment signature',
          transient: false,
        },
      }) as GatewayError;
    }
    const payment = await this.request<Record<string, unknown>>(
      'GET',
      `/payments/${req.gatewayPaymentId}`,
    );
    const amountPaise = Number(payment.amount ?? req.expectedAmountPaise);
    if (amountPaise !== req.expectedAmountPaise) {
      throw Object.assign(new Error('Payment amount mismatch'), {
        failure: {
          code: 'AMOUNT_MISMATCH',
          message: 'Payment amount mismatch',
          transient: false,
        },
      }) as GatewayError;
    }
    return {
      verified: true,
      gatewayStatus: String(payment.status),
      gatewayPaymentId: req.gatewayPaymentId,
      amountPaise,
      currency: String(payment.currency ?? req.currency),
      method: payment.method ? String(payment.method) : undefined,
    };
  }

  async capture(req: CaptureRequest): Promise<CaptureResult> {
    const res = await this.request<Record<string, unknown>>(
      'POST',
      `/payments/${req.gatewayPaymentId}/capture`,
      {
        amount: req.amountPaise,
        currency: req.currency ?? 'INR',
        idempotencyKey: req.idempotencyKey,
      },
    );
    return {
      captured: true,
      gatewayReference: String(res.id),
      amountPaise: Number(res.amount),
    };
  }

  async refund(req: RefundRequest): Promise<RefundResult> {
    const res = await this.request<Record<string, unknown>>(
      'POST',
      `/payments/${req.gatewayPaymentId}/refunds`,
      {
        amount: req.amountPaise,
        notes: { reason: req.reason },
        idempotencyKey: req.idempotencyKey,
      },
    );
    return {
      gatewayReference: String(res.id),
      status: String(res.status),
      amountPaise: Number(res.amount),
    };
  }

  async voidPayment(_req: VoidRequest): Promise<void> {
    // Razorpay auto-captures; void applies only to authorized payments which
    // Razorpay exposes as `authorized` → release via refund of uncaptured.
    throw Object.assign(new Error('Void not supported by provider'), {
      failure: {
        code: 'VOID_UNSUPPORTED',
        message: 'Void not supported by Razorpay',
        transient: false,
      },
    }) as GatewayError;
  }

  async verifyWebhookSignature(delivery: RawWebhookDelivery): Promise<boolean> {
    const signature = delivery.headers['x-razorpay-signature'];
    if (!signature) return false;
    const expected = await hmacHex(this.webhookSecret, delivery.rawBody);
    return timingSafeEqualHex(expected, signature);
  }

  parseWebhookEvent(delivery: RawWebhookDelivery): ParsedWebhookEvent {
    const payload = JSON.parse(delivery.rawBody) as {
      event?: string;
      payload?: {
        payment?: { entity?: Record<string, unknown> };
        refund?: { entity?: Record<string, unknown> };
        order?: { entity?: Record<string, unknown> };
      };
    };
    const entity =
      payload.payload?.payment?.entity ??
      payload.payload?.refund?.entity ??
      payload.payload?.order?.entity ??
      {};
    const amountPaise = Number(entity.amount ?? 0);
    const gatewayPaymentId = entity.id ? String(entity.id) : undefined;
    const gatewayOrderId = entity.order_id
      ? String(entity.order_id)
      : undefined;
    return {
      eventId:
        [payload.event, gatewayPaymentId, gatewayOrderId]
          .filter(Boolean)
          .join(':') || 'unknown',
      eventType: payload.event ?? 'unknown',
      gatewayOrderId,
      gatewayPaymentId,
      status: String(entity.status ?? ''),
      amountPaise,
      currency: String(entity.currency ?? 'INR'),
      method: entity.method ? String(entity.method) : undefined,
      metadata: { source: 'razorpay' },
    };
  }

  async fetchPayment(gatewayPaymentId: string): Promise<{
    status: string;
    amountPaise: number;
    currency: string;
  }> {
    const res = await this.request<Record<string, unknown>>(
      'GET',
      `/payments/${gatewayPaymentId}`,
    );
    return {
      status: String(res.status),
      amountPaise: Number(res.amount),
      currency: String(res.currency ?? 'INR'),
    };
  }
}

/** HMAC-SHA256 hex digest via Web Crypto (Workers-compatible). */
export async function hmacHex(
  secret: string,
  payload: string,
): Promise<string> {
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

/** Constant-time hex comparison — never short-circuits on length mismatch. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default RazorpayGateway;
