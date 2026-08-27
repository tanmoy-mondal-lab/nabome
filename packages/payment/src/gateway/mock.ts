/**
 * Mock Gateway Adapter — deterministic in-memory provider for local dev,
 * tests, and the seeded demo shop. Never used in production (registry guards
 * against enabling it when ENVIRONMENT === 'production').
 *
 * Implements the same contract as RazorpayGateway: same signatures, same
 * amount semantics (paise), same failure classification. This is what makes
 * the provider abstraction testable end-to-end without gateway credentials.
 */

import { hmacHex, timingSafeEqualHex } from './razorpay';
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

export interface MockGatewayConfig {
  /** Always-fail every call (simulate gateway outage). */
  failAll?: boolean;
  /** Fail createOrder with a transient error. */
  failCreateOrder?: boolean;
  /** Fail capture (simulate capture failure). */
  failCapture?: boolean;
  /** Fail refunds. */
  failRefund?: boolean;
  /** Webhook secret used for signature verification. */
  webhookSecret?: string;
}

const MOCK_PREFIX = 'mock_';

export class MockGateway {
  readonly provider = 'mock';
  private readonly config: MockGatewayConfig;
  private orders = new Map<
    string,
    { status: string; amountPaise: number; currency: string }
  >();
  private payments = new Map<
    string,
    { status: string; amountPaise: number; currency: string; method: string }
  >();

  constructor(config: MockGatewayConfig = {}) {
    this.config = { webhookSecret: 'mock-webhook-secret', ...config };
  }

  private guard<T>(
    fail: boolean,
    code: string,
    message: string,
    transient: boolean,
  ): T {
    if (this.config.failAll || fail) {
      throw Object.assign(new Error(message), {
        failure: { code, message, transient },
      }) as GatewayError;
    }
    return undefined as T;
  }

  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResult> {
    this.guard<never>(
      this.config.failCreateOrder === true,
      'MOCK_FAIL',
      'Mock create order failure',
      true,
    );
    const id = `${MOCK_PREFIX}order_${req.idempotencyKey.slice(0, 12)}_${Math.random().toString(36).slice(2, 8)}`;
    this.orders.set(id, {
      status: 'created',
      amountPaise: req.amountPaise,
      currency: req.currency,
    });
    return {
      gatewayOrderId: id,
      status: 'created',
      clientPayload: { orderId: id },
    };
  }

  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    const expected = await hmacHex(
      this.config.webhookSecret ?? 'mock-webhook-secret',
      req.gatewayPaymentId,
    );
    if (!timingSafeEqualHex(expected, req.signature)) {
      throw Object.assign(new Error('Invalid payment signature'), {
        failure: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid payment signature',
          transient: false,
        },
      }) as GatewayError;
    }
    const order = this.orders.get(req.gatewayOrderId);
    if (!order) {
      throw Object.assign(new Error('Gateway order not found'), {
        failure: {
          code: 'ORDER_NOT_FOUND',
          message: 'Gateway order not found',
          transient: false,
        },
      }) as GatewayError;
    }
    if (order.amountPaise !== req.expectedAmountPaise) {
      throw Object.assign(new Error('Payment amount mismatch'), {
        failure: {
          code: 'AMOUNT_MISMATCH',
          message: 'Payment amount mismatch',
          transient: false,
        },
      }) as GatewayError;
    }
    this.payments.set(req.gatewayPaymentId, {
      status: 'captured',
      amountPaise: req.expectedAmountPaise,
      currency: req.currency,
      method: 'upi',
    });
    return {
      verified: true,
      gatewayStatus: 'captured',
      gatewayPaymentId: req.gatewayPaymentId,
      amountPaise: req.expectedAmountPaise,
      currency: req.currency,
      method: 'upi',
    };
  }

  async capture(req: CaptureRequest): Promise<CaptureResult> {
    this.guard<never>(
      this.config.failCapture === true,
      'MOCK_CAPTURE_FAIL',
      'Mock capture failure',
      true,
    );
    const payment = this.payments.get(req.gatewayPaymentId);
    if (payment) payment.status = 'captured';
    return {
      captured: true,
      gatewayReference: `${MOCK_PREFIX}txn_${req.idempotencyKey.slice(0, 12)}`,
      amountPaise: req.amountPaise,
    };
  }

  async refund(req: RefundRequest): Promise<RefundResult> {
    this.guard<never>(
      this.config.failRefund === true,
      'MOCK_REFUND_FAIL',
      'Mock refund failure',
      true,
    );
    return {
      gatewayReference: `${MOCK_PREFIX}refund_${req.idempotencyKey.slice(0, 12)}`,
      status: 'processed',
      amountPaise: req.amountPaise,
    };
  }

  async voidPayment(_req: VoidRequest): Promise<void> {
    this.guard<never>(
      false,
      'MOCK_VOID_UNSUPPORTED',
      'Void not supported by mock provider',
      false,
    );
  }

  async verifyWebhookSignature(delivery: RawWebhookDelivery): Promise<boolean> {
    const signature = delivery.headers['x-nabome-signature'];
    if (!signature) return false;
    const [timestamp, expected] = signature.split('.');
    if (!timestamp || !expected) return false;
    const actual = await hmacHex(
      this.config.webhookSecret ?? 'mock-webhook-secret',
      `${timestamp}.${delivery.rawBody}`,
    );
    return timingSafeEqualHex(actual, expected);
  }

  parseWebhookEvent(delivery: RawWebhookDelivery): ParsedWebhookEvent {
    const payload = JSON.parse(delivery.rawBody) as {
      id?: string;
      type?: string;
      status?: string;
      amount?: number;
      currency?: string;
      paymentId?: string;
      orderId?: string;
    };
    return {
      eventId: String(payload.id ?? 'unknown'),
      eventType: payload.type ?? 'unknown',
      gatewayOrderId: payload.orderId,
      gatewayPaymentId: payload.paymentId,
      status: payload.status ?? '',
      amountPaise: Number(payload.amount ?? 0),
      currency: payload.currency ?? 'INR',
      metadata: { source: 'mock' },
    };
  }

  async fetchPayment(gatewayPaymentId: string): Promise<{
    status: string;
    amountPaise: number;
    currency: string;
  }> {
    const payment = this.payments.get(gatewayPaymentId);
    return {
      status: payment?.status ?? 'not_found',
      amountPaise: payment?.amountPaise ?? 0,
      currency: payment?.currency ?? 'INR',
    };
  }
}

export default MockGateway;
