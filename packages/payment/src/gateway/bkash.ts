/**
 * bKash Gateway Adapter
 *
 * Implements the PaymentGateway contract for bKash (Bangladesh mobile wallet).
 * Follows PAYMENT_ENGINE_ARCHITECTURE.md §3 gateway independence rules.
 *
 * Security: Never stores raw card data. Uses bKash OAuth tokens only.
 * Amounts: Always in paise (smallest currency unit - BDT uses poisha).
 * Idempotency: bKash merchant invoice number on all mutations.
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

export interface BkashCredentials {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  webhookSecret: string;
  sandbox?: boolean;
}

/**
 * bKash-specific error codes mapped to GatewayFailure classification.
 */
const BKASH_ERROR_CLASSIFICATION: Record<
  string,
  { transient: boolean; code: string }
> = {
  // Transient errors - retryable
  '2001': { transient: true, code: 'SYSTEM_ERROR' },
  '2002': { transient: true, code: 'TIMEOUT' },

  // Permanent errors - not retryable
  '1001': { transient: false, code: 'INVALID_AMOUNT' },
  '1002': { transient: false, code: 'INVALID_CURRENCY' },
  '1003': { transient: false, code: 'TRANSACTION_FAILED' },
  '1004': { transient: false, code: 'INSUFFICIENT_BALANCE' },
};

function classifyBkashError(error: any): GatewayFailure {
  const code = error.errorCode || error.code || 'UNKNOWN_ERROR';
  const classification = BKASH_ERROR_CLASSIFICATION[code] || {
    transient: false,
    code: 'UNKNOWN_ERROR',
  };

  return {
    code: classification.code,
    message: error.errorMessage || error.message || 'Unknown bKash error',
    transient: classification.transient,
    gatewayReference: error.trxID || error.merchantInvoiceNumber,
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
 * bKash Gateway Implementation
 */
export class BkashGateway implements PaymentGateway {
  readonly provider = 'bkash';

  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly webhookSecret: string;
  private readonly sandbox: boolean;
  private readonly baseUrl: string;
  tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(credentials: BkashCredentials) {
    this.appKey = credentials.appKey;
    this.appSecret = credentials.appSecret;
    this.webhookSecret = credentials.webhookSecret;
    this.sandbox = credentials.sandbox ?? true;
    this.baseUrl = this.sandbox
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
  }

  /**
   * Get OAuth token from bKash (cached until expiry).
   */
  private async getToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    const auth = btoa(`${this.appKey}:${this.appSecret}`);
    const response = await fetch(
      `${this.baseUrl}/tokenized/checkout/token/grant`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_key: this.appKey,
          app_secret: this.appSecret,
        }),
      },
    );

    if (!response.ok) {
      const error = (await response.json()) as any;
      throw new Error(error.errorMessage || 'Failed to get bKash token');
    }

    const data = (await response.json()) as any;
    this.tokenCache = {
      token: data.id_token,
      expiresAt: Date.now() + data.expires_in * 1000 - 60000, // 1 min buffer
    };

    return this.tokenCache.token;
  }

  private async bkashRequest<T>(
    endpoint: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        'X-APP-Key': this.appKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = (await response.json()) as any;
      const failure = classifyBkashError(error);
      throw new Error(failure.message);
    }

    return response.json();
  }

  /**
   * Create a bKash payment session.
   */
  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResult> {
    const amount = (req.amountPaise / 100).toFixed(2);

    const body = {
      mode: '0011',
      payerReference: req.customerPhone || '01700000000',
      callbackURL: req.callbackUrl || '',
      amount: amount,
      currency: req.currency,
      intent: 'sale',
      merchantInvoiceNumber: req.idempotencyKey,
    };

    try {
      const response = await this.bkashRequest<{
        paymentID: string;
        createTime: string;
        transactionStatus: string;
      }>('/tokenized/checkout/create', body);

      return {
        gatewayOrderId: response.paymentID,
        status: response.transactionStatus,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify a payment callback from bKash.
   */
  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    try {
      const transaction = await this.bkashRequest<{
        paymentID: string;
        transactionStatus: string;
        amount: string;
        currency: string;
        merchantInvoiceNumber: string;
      }>('/tokenized/checkout/execute', {
        paymentID: req.gatewayPaymentId,
      });

      const amountPaise = Math.round(parseFloat(transaction.amount) * 100);

      return {
        verified:
          transaction.transactionStatus === 'Completed' ||
          transaction.transactionStatus === 'Completed',
        gatewayStatus: transaction.transactionStatus,
        gatewayPaymentId: transaction.paymentID,
        amountPaise,
        currency: transaction.currency,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Capture - bKash auto-captures, this is for verification.
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
   * Create a refund on bKash.
   */
  async refund(req: RefundRequest): Promise<RefundResult> {
    const body = {
      paymentID: req.gatewayPaymentId,
      amount: (req.amountPaise / 100).toFixed(2),
      trxID: req.idempotencyKey,
      reason: req.reason,
      sku: 'NABOME_REFUND',
    };

    try {
      const refund = await this.bkashRequest<{
        transactionStatus: string;
        refundTrxID: string;
        amount: string;
      }>('/tokenized/checkout/refund', body);

      return {
        gatewayReference: refund.refundTrxID,
        status: refund.transactionStatus,
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
    // bKash uses refund for voiding
    await this.refund({
      gatewayPaymentId: req.gatewayPaymentId,
      amountPaise: 0,
      idempotencyKey: req.idempotencyKey,
      reason: 'Void transaction',
    });
  }

  /**
   * Verify bKash webhook signature.
   */
  async verifyWebhookSignature(delivery: RawWebhookDelivery): Promise<boolean> {
    const signature = delivery.headers['x-bkash-signature'];
    if (!signature) return false;

    const expectedSignature = await hmacHex(
      this.webhookSecret,
      delivery.rawBody,
    );
    return signature === expectedSignature;
  }

  /**
   * Parse bKash webhook event.
   */
  parseWebhookEvent(delivery: RawWebhookDelivery): ParsedWebhookEvent {
    const payload = JSON.parse(delivery.rawBody);

    // Map bKash statuses to our normalized types
    const statusMap: Record<string, string> = {
      Completed: 'captured',
      Pending: 'processing',
      Failed: 'failed',
      Cancelled: 'cancelled',
    };

    return {
      eventId:
        payload.paymentID ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'payment.status',
      gatewayPaymentId: payload.paymentID,
      status:
        statusMap[payload.transactionStatus] ||
        payload.transactionStatus.toLowerCase(),
      amountPaise: Math.round(parseFloat(payload.amount) * 100),
      currency: payload.currency,
      metadata: {
        merchantInvoiceNumber: payload.merchantInvoiceNumber,
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
    const transaction = await this.bkashRequest<{
      transactionStatus: string;
      amount: string;
      currency: string;
    }>('/tokenized/checkout/payment/status', {
      paymentID: gatewayPaymentId,
    });

    return {
      status: transaction.transactionStatus.toLowerCase(),
      amountPaise: Math.round(parseFloat(transaction.amount) * 100),
      currency: transaction.currency,
    };
  }
}
