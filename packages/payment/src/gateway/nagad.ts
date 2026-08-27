/**
 * Nagad Gateway Adapter
 *
 * Implements the PaymentGateway contract for Nagad (Bangladesh mobile wallet).
 * Follows PAYMENT_ENGINE_ARCHITECTURE.md §3 gateway independence rules.
 *
 * Security: Never stores raw card data. Uses Nagad merchant credentials only.
 * Amounts: Always in paise (smallest currency unit - BDT uses poisha).
 * Idempotency: Nagad order ID on all mutations.
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

export interface NagadCredentials {
  merchantId: string;
  merchantKey: string;
  webhookSecret: string;
  sandbox?: boolean;
}

/**
 * Nagad-specific error codes mapped to GatewayFailure classification.
 */
const NAGAD_ERROR_CLASSIFICATION: Record<
  string,
  { transient: boolean; code: string }
> = {
  // Transient errors - retryable
  SYSTEM_ERROR: { transient: true, code: 'SYSTEM_ERROR' },
  TIMEOUT: { transient: true, code: 'TIMEOUT' },

  // Permanent errors - not retryable
  INVALID_AMOUNT: { transient: false, code: 'INVALID_AMOUNT' },
  INVALID_CURRENCY: { transient: false, code: 'INVALID_CURRENCY' },
  TRANSACTION_FAILED: { transient: false, code: 'TRANSACTION_FAILED' },
  INSUFFICIENT_BALANCE: { transient: false, code: 'INSUFFICIENT_BALANCE' },
};

function classifyNagadError(error: any): GatewayFailure {
  const code = error.errorCode || error.code || 'UNKNOWN_ERROR';
  const classification = NAGAD_ERROR_CLASSIFICATION[code] || {
    transient: false,
    code: 'UNKNOWN_ERROR',
  };

  return {
    code: classification.code,
    message: error.errorMessage || error.message || 'Unknown Nagad error',
    transient: classification.transient,
    gatewayReference: error.orderId || error.paymentRefId,
  };
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

/**
 * Nagad Gateway Implementation
 */
export class NagadGateway implements PaymentGateway {
  readonly provider = 'nagad';

  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly webhookSecret: string;
  private readonly sandbox: boolean;
  private readonly baseUrl: string;

  constructor(credentials: NagadCredentials) {
    this.merchantId = credentials.merchantId;
    this.merchantKey = credentials.merchantKey;
    this.webhookSecret = credentials.webhookSecret;
    this.sandbox = credentials.sandbox ?? true;
    this.baseUrl = this.sandbox
      ? 'https://sandbox.mynagad.com'
      : 'https://api.mynagad.com';
  }

  private async nagadRequest<T>(
    endpoint: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MERCHANT-KEY': this.merchantKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      const failure = classifyNagadError(error);
      throw new Error(failure.message);
    }

    return response.json();
  }

  /**
   * Create a Nagad payment session.
   */
  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResult> {
    const amount = (req.amountPaise / 100).toFixed(2);

    const body = {
      merchantId: this.merchantId,
      orderId: req.idempotencyKey,
      amount: amount,
      currency: req.currency,
      merchantCallbackURL: req.callbackUrl || '',
      customerMsisdn: req.customerPhone || '',
      productDetails: {
        productId: req.orderNumber,
        productName: 'Order Payment',
        productCategory: 'E-commerce',
      },
    };

    try {
      const response = await this.nagadRequest<{
        orderId: string;
        paymentUrl: string;
        status: string;
      }>('/api/v1/checkout/create', body);

      return {
        gatewayOrderId: response.orderId,
        redirectUrl: response.paymentUrl,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify a payment callback from Nagad.
   */
  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    try {
      const transaction = await this.nagadRequest<{
        orderId: string;
        paymentRefId: string;
        status: string;
        amount: string;
        currency: string;
      }>('/api/v1/checkout/verify', {
        orderId: req.gatewayOrderId,
        paymentRefId: req.gatewayPaymentId,
      });

      const amountPaise = Math.round(parseFloat(transaction.amount) * 100);

      return {
        verified:
          transaction.status === 'Success' ||
          transaction.status === 'COMPLETED',
        gatewayStatus: transaction.status,
        gatewayPaymentId: transaction.paymentRefId,
        amountPaise,
        currency: transaction.currency,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Capture - Nagad auto-captures, this is for verification.
   */
  async capture(req: CaptureRequest): Promise<CaptureResult> {
    const verifyResult = await this.verifyPayment({
      gatewayOrderId: req.gatewayOrderId,
      gatewayPaymentId: req.gatewayPaymentId,
      signature: '',
      expectedAmountPaise: req.amountPaise,
      currency: 'BDT',
    });

    return {
      captured: verifyResult.verified,
      gatewayReference: verifyResult.gatewayPaymentId,
      amountPaise: verifyResult.amountPaise,
    };
  }

  /**
   * Create a refund on Nagad.
   */
  async refund(req: RefundRequest): Promise<RefundResult> {
    const body = {
      paymentRefId: req.gatewayPaymentId,
      amount: (req.amountPaise / 100).toFixed(2),
      reason: req.reason,
      refundId: req.idempotencyKey,
    };

    try {
      const refund = await this.nagadRequest<{
        refundId: string;
        status: string;
        amount: string;
      }>('/api/v1/checkout/refund', body);

      return {
        gatewayReference: refund.refundId,
        status: refund.status,
        amountPaise: Math.round(parseFloat(refund.amount) * 100),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Void/cancel a transaction.
   */
  async voidPayment(req: VoidRequest): Promise<void> {
    // Nagad uses refund for voiding
    await this.refund({
      gatewayPaymentId: req.gatewayPaymentId,
      amountPaise: 0,
      idempotencyKey: req.idempotencyKey,
      reason: 'Void transaction',
    });
  }

  /**
   * Verify Nagad webhook signature.
   */
  async verifyWebhookSignature(delivery: RawWebhookDelivery): Promise<boolean> {
    const signature = delivery.headers['x-nagad-signature'];
    if (!signature) return false;

    const expectedSignature = await hmacHex(
      this.webhookSecret,
      delivery.rawBody,
    );
    return signature === expectedSignature;
  }

  /**
   * Parse Nagad webhook event.
   */
  parseWebhookEvent(delivery: RawWebhookDelivery): ParsedWebhookEvent {
    const payload = JSON.parse(delivery.rawBody);

    // Map Nagad statuses to our normalized types
    const statusMap: Record<string, string> = {
      Success: 'captured',
      COMPLETED: 'captured',
      Pending: 'processing',
      Failed: 'failed',
      Cancelled: 'cancelled',
    };

    return {
      eventId:
        payload.paymentRefId ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'payment.status',
      gatewayOrderId: payload.orderId,
      gatewayPaymentId: payload.paymentRefId,
      status: statusMap[payload.status] || payload.status.toLowerCase(),
      amountPaise: Math.round(parseFloat(payload.amount) * 100),
      currency: payload.currency,
      metadata: {
        customerMsisdn: payload.customerMsisdn,
      },
    };
  }

  /**
   * Fetch payment status for reconciliation.
   */
  async fetchPayment(gatewayPaymentId: string): Promise<{
    status: string;
    amountPaise: number;
    currency: string;
  }> {
    const transaction = await this.nagadRequest<{
      status: string;
      amount: string;
      currency: string;
    }>('/api/v1/checkout/status', {
      paymentRefId: gatewayPaymentId,
    });

    return {
      status: transaction.status.toLowerCase(),
      amountPaise: Math.round(parseFloat(transaction.amount) * 100),
      currency: transaction.currency,
    };
  }
}
