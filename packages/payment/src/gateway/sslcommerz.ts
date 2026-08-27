/**
 * SSLCommerz Gateway Adapter
 *
 * Implements the PaymentGateway contract for SSLCommerz (Bangladesh).
 * Follows PAYMENT_ENGINE_ARCHITECTURE.md §3 gateway independence rules.
 *
 * Security: Never stores raw card data. Uses SSLCommerz tokens only.
 * Amounts: Always in paise (smallest currency unit - BDT uses poisha).
 * Idempotency: SSLCommerz session key on all mutations.
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

export interface SSLCommerzCredentials {
  storeId: string;
  storePassword: string;
  webhookSecret: string;
  sandbox?: boolean;
}

/**
 * SSLCommerz-specific error codes mapped to GatewayFailure classification.
 */
const SSLCOMMERZ_ERROR_CLASSIFICATION: Record<
  string,
  { transient: boolean; code: string }
> = {
  // Transient errors - retryable
  SYSTEM_ERROR: { transient: true, code: 'SYSTEM_ERROR' },
  TIMEOUT: { transient: true, code: 'TIMEOUT' },
  CONNECTION_ERROR: { transient: true, code: 'CONNECTION_ERROR' },

  // Permanent errors - not retryable
  INVALID_AMOUNT: { transient: false, code: 'INVALID_AMOUNT' },
  INVALID_CURRENCY: { transient: false, code: 'INVALID_CURRENCY' },
  TRANSACTION_FAILED: { transient: false, code: 'TRANSACTION_FAILED' },
  CARD_DECLINED: { transient: false, code: 'CARD_DECLINED' },
  INSUFFICIENT_FUNDS: { transient: false, code: 'INSUFFICIENT_FUNDS' },
};

function classifySSLCommerzError(error: any): GatewayFailure {
  const code = error.error_code || error.code || 'UNKNOWN_ERROR';
  const classification = SSLCOMMERZ_ERROR_CLASSIFICATION[code] || {
    transient: false,
    code: 'UNKNOWN_ERROR',
  };

  return {
    code: classification.code,
    message: error.error_message || error.message || 'Unknown SSLCommerz error',
    transient: classification.transient,
    gatewayReference: error.tran_id || error.sessionkey,
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
 * SSLCommerz Gateway Implementation
 */
export class SSLCommerzGateway implements PaymentGateway {
  readonly provider = 'sslcommerz';

  private readonly storeId: string;
  private readonly storePassword: string;
  private readonly sandbox: boolean;
  private readonly baseUrl: string;

  constructor(credentials: SSLCommerzCredentials) {
    this.storeId = credentials.storeId;
    this.storePassword = credentials.storePassword;
    this.sandbox = credentials.sandbox ?? true;
    this.baseUrl = this.sandbox
      ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
  }

  private async sslcommerzRequest<T>(params: URLSearchParams): Promise<T> {
    // SSLCommerz uses POST with form data
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const error = await response.json();
      const failure = classifySSLCommerzError(error);
      throw new Error(failure.message);
    }

    return response.json();
  }

  /**
   * Create an SSLCommerz session (order).
   */
  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResult> {
    const params = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: (req.amountPaise / 100).toFixed(2), // SSLCommerz uses decimal
      currency: req.currency,
      tran_id: req.idempotencyKey,
      success_url: req.callbackUrl || '',
      fail_url: req.callbackUrl || '',
      cancel_url: req.callbackUrl || '',
      ipn_url: req.callbackUrl || '',
      product_name: 'Order Payment',
      product_category: 'E-commerce',
      product_profile: 'general',
      cus_name: req.customerEmail?.split('@')[0] || 'Customer',
      cus_email: req.customerEmail || '',
      cus_phone: req.customerPhone || '',
      multi_card_name: req.methodHint || '',
      value_a: req.orderNumber,
      value_b: req.expiresAt,
    });

    try {
      const response = await this.sslcommerzRequest<{
        sessionkey?: string;
        status: string;
        error?: string;
      }>(params);

      if (response.status === 'FAILED' || !response.sessionkey) {
        throw new Error(
          response.error || 'Failed to create SSLCommerz session',
        );
      }

      return {
        gatewayOrderId: response.sessionkey,
        redirectUrl: `${this.sandbox ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com'}/gwprocess/v4/gw.php?Q=${response.sessionkey}`,
        status: 'created',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify a payment callback from SSLCommerz.
   */
  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    // SSLCommerz verification requires checking the transaction status via IPN or API
    const params = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePassword,
      tran_id: req.gatewayPaymentId,
      request_type: 'TRANSACTION_DETAILS',
    });

    try {
      const transaction = await this.sslcommerzRequest<{
        tran_id: string;
        status: string;
        amount: string;
        currency: string;
        card_type: string;
      }>(params);

      const amountPaise = Math.round(parseFloat(transaction.amount) * 100);

      return {
        verified:
          transaction.status === 'SUCCESS' || transaction.status === 'VALID',
        gatewayStatus: transaction.status,
        gatewayPaymentId: transaction.tran_id,
        amountPaise,
        currency: transaction.currency,
        method: transaction.card_type,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Capture - SSLCommerz auto-captures, this is a no-op for verification.
   */
  async capture(req: CaptureRequest): Promise<CaptureResult> {
    // SSLCommerz auto-captures on successful payment
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
   * Create a refund on SSLCommerz.
   */
  async refund(req: RefundRequest): Promise<RefundResult> {
    const params = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePassword,
      tran_id: req.gatewayPaymentId,
      refund_amount: (req.amountPaise / 100).toFixed(2),
      refund_reason: req.reason,
      refund_req_id: req.idempotencyKey,
    });

    try {
      const refund = await this.sslcommerzRequest<{
        refund_ref_id: string;
        status: string;
        refund_amount: string;
      }>(params);

      return {
        gatewayReference: refund.refund_ref_id,
        status: refund.status,
        amountPaise: Math.round(parseFloat(refund.refund_amount) * 100),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Void/cancel a transaction.
   */
  async voidPayment(req: VoidRequest): Promise<void> {
    // SSLCommerz doesn't have a direct void, refunds are used
    await this.refund({
      gatewayPaymentId: req.gatewayPaymentId,
      amountPaise: 0, // Will be determined from transaction
      idempotencyKey: req.idempotencyKey,
      reason: 'Void transaction',
    });
  }

  /**
   * Verify SSLCommerz webhook signature (IPN validation).
   */
  async verifyWebhookSignature(delivery: RawWebhookDelivery): Promise<boolean> {
    const signature = delivery.headers['verify_sign'];
    if (!signature) return false;

    const payload = JSON.parse(delivery.rawBody);
    const expectedSignature = await hmacHex(
      this.storePassword,
      `${payload.tran_id}${payload.amount}${payload.currency}${this.storeId}`,
    );

    return signature === expectedSignature;
  }

  /**
   * Parse SSLCommerz webhook event (IPN).
   */
  parseWebhookEvent(delivery: RawWebhookDelivery): ParsedWebhookEvent {
    const payload = JSON.parse(delivery.rawBody);

    // Map SSLCommerz statuses to our normalized types
    const statusMap: Record<string, string> = {
      SUCCESS: 'captured',
      VALID: 'captured',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
      PENDING: 'processing',
    };

    return {
      eventId:
        payload.tran_id ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'payment.status',
      gatewayOrderId: payload.sessionkey,
      gatewayPaymentId: payload.tran_id,
      status: statusMap[payload.status] || payload.status.toLowerCase(),
      amountPaise: Math.round(parseFloat(payload.amount) * 100),
      currency: payload.currency,
      method: payload.card_type,
      metadata: {
        bank_tran_id: payload.bank_tran_id,
        card_issuer: payload.card_issuer,
      },
    };
  }

  /**
   * Fetch transaction status for reconciliation.
   */
  async fetchPayment(gatewayPaymentId: string): Promise<{
    status: string;
    amountPaise: number;
    currency: string;
  }> {
    const params = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePassword,
      tran_id: gatewayPaymentId,
      request_type: 'TRANSACTION_DETAILS',
    });

    const transaction = await this.sslcommerzRequest<{
      status: string;
      amount: string;
      currency: string;
    }>(params);

    return {
      status: transaction.status.toLowerCase(),
      amountPaise: Math.round(parseFloat(transaction.amount) * 100),
      currency: transaction.currency,
    };
  }
}
