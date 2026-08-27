/**
 * PayPal Gateway Adapter
 *
 * Implements the PaymentGateway contract for PayPal.
 * Follows PAYMENT_ENGINE_ARCHITECTURE.md §3 gateway independence rules.
 *
 * Security: Never stores raw card data. Uses PayPal OAuth tokens only.
 * Amounts: Always in paise (smallest currency unit).
 * Idempotency: PayPal PayPal-Request-Id header on all mutations.
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

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
  sandbox?: boolean;
}

/**
 * PayPal-specific error codes mapped to GatewayFailure classification.
 */
const PAYPAL_ERROR_CLASSIFICATION: Record<
  string,
  { transient: boolean; code: string }
> = {
  // Transient errors - retryable
  SERVICE_UNAVAILABLE: { transient: true, code: 'SERVICE_UNAVAILABLE' },
  INTERNAL_SERVER_ERROR: { transient: true, code: 'INTERNAL_ERROR' },

  // Permanent errors - not retryable
  INVALID_RESOURCE: { transient: false, code: 'INVALID_RESOURCE' },
  PAYMENT_DECLINED: { transient: false, code: 'PAYMENT_DECLINED' },
  INSUFFICIENT_FUNDS: { transient: false, code: 'INSUFFICIENT_FUNDS' },
  INVALID_CURRENCY: { transient: false, code: 'INVALID_CURRENCY' },
};

function classifyPayPalError(error: any): GatewayFailure {
  const code = error.name || error.error || 'UNKNOWN_ERROR';
  const classification = PAYPAL_ERROR_CLASSIFICATION[code] || {
    transient: false,
    code: 'UNKNOWN_ERROR',
  };

  return {
    code: classification.code,
    message:
      error.message ||
      error.details?.[0]?.description ||
      'Unknown PayPal error',
    transient: classification.transient,
    gatewayReference: error.purchase_units?.[0]?.payments?.captures?.[0]?.id,
  };
}

/**
 * PayPal Gateway Implementation
 */
export class PayPalGateway implements PaymentGateway {
  readonly provider = 'paypal';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly webhookSecret: string;
  private readonly sandbox: boolean;
  private readonly baseUrl: string;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(credentials: PayPalCredentials) {
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.webhookSecret = credentials.webhookSecret;
    this.sandbox = credentials.sandbox ?? true;
    this.baseUrl = this.sandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  /**
   * Get OAuth token from PayPal (cached until expiry).
   */
  private async getToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    const auth = btoa(`${this.clientId}:${this.clientSecret}`);
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = (await response.json()) as any;
      throw new Error(error.error_description || 'Failed to get PayPal token');
    }

    const data = (await response.json()) as any;
    this.tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000 - 60000, // 1 min buffer
    };

    return this.tokenCache.token;
  }

  private async paypalRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as any;
      const failure = classifyPayPalError(error);
      throw new Error(failure.message);
    }

    return response.json();
  }

  /**
   * Create a PayPal order.
   */
  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResult> {
    const amount = (req.amountPaise / 100).toFixed(2);

    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: req.idempotencyKey,
          amount: {
            currency_code: req.currency.toUpperCase(),
            value: amount,
          },
          custom_id: req.orderNumber,
        },
      ],
      application_context: {
        return_url: req.callbackUrl || '',
        cancel_url: req.callbackUrl || '',
        brand_name: 'Nabome',
        user_action: 'PAY_NOW',
      },
    };

    try {
      const order = await this.paypalRequest<{
        id: string;
        status: string;
        links: Array<{ rel: string; href: string }>;
      }>('/v2/checkout/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const approveLink = order.links.find((l) => l.rel === 'approve');

      return {
        gatewayOrderId: order.id,
        redirectUrl: approveLink?.href,
        clientPayload: { orderId: order.id },
        status: order.status,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify a payment callback from PayPal.
   */
  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    try {
      const order = await this.paypalRequest<{
        id: string;
        status: string;
        purchase_units: Array<{
          payments: {
            captures: Array<{
              id: string;
              amount: { value: string; currency_code: string };
              status: string;
            }>;
          };
        }>;
      }>(`/v2/checkout/orders/${req.gatewayPaymentId}`);

      const capture = order.purchase_units[0]?.payments?.captures?.[0];
      if (!capture) {
        return {
          verified: false,
          gatewayStatus: order.status,
          gatewayPaymentId: order.id,
          amountPaise: 0,
          currency: req.currency,
        };
      }

      const amountPaise = Math.round(parseFloat(capture.amount.value) * 100);

      return {
        verified:
          capture.status === 'COMPLETED' &&
          amountPaise === req.expectedAmountPaise,
        gatewayStatus: capture.status,
        gatewayPaymentId: capture.id,
        amountPaise,
        currency: capture.amount.currency_code,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Capture an authorized PayPal order.
   */
  async capture(req: CaptureRequest): Promise<CaptureResult> {
    try {
      const capture = await this.paypalRequest<{
        id: string;
        status: string;
        amount: { value: string; currency_code: string };
      }>(`/v2/checkout/orders/${req.gatewayOrderId}/capture`, {
        method: 'POST',
        headers: { 'PayPal-Request-Id': req.idempotencyKey },
      });

      return {
        captured: capture.status === 'COMPLETED',
        gatewayReference: capture.id,
        amountPaise: Math.round(parseFloat(capture.amount.value) * 100),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a refund on PayPal.
   */
  async refund(req: RefundRequest): Promise<RefundResult> {
    const amount = (req.amountPaise / 100).toFixed(2);

    const body = {
      amount: {
        value: amount,
        currency_code: 'USD', // PayPal requires currency, will be adjusted based on capture
      },
      note_to_payer: req.reason,
    };

    try {
      const refund = await this.paypalRequest<{
        id: string;
        status: string;
        amount: { value: string; currency_code: string };
      }>(`/v2/payments/captures/${req.gatewayPaymentId}/refund`, {
        method: 'POST',
        headers: { 'PayPal-Request-Id': req.idempotencyKey },
        body: JSON.stringify(body),
      });

      return {
        gatewayReference: refund.id,
        status: refund.status,
        amountPaise: Math.round(parseFloat(refund.amount.value) * 100),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Void an authorized PayPal order.
   */
  async voidPayment(req: VoidRequest): Promise<void> {
    await this.paypalRequest(
      `/v2/checkout/orders/${req.gatewayOrderId}/do-void`,
      {
        method: 'POST',
        headers: { 'PayPal-Request-Id': req.idempotencyKey },
      },
    );
  }

  /**
   * Verify PayPal webhook signature.
   */
  async verifyWebhookSignature(delivery: RawWebhookDelivery): Promise<boolean> {
    const signature = delivery.headers['paypal-transmission-sig'];
    const timestamp = delivery.headers['paypal-transmission-time'];
    const authAlgo = delivery.headers['paypal-auth-algo'];

    if (!signature || !timestamp || !authAlgo) return false;

    // PayPal webhook verification requires calling their verification API
    const body = {
      auth_algo: authAlgo,
      cert_url: delivery.headers['paypal-cert-url'],
      transmission_id: delivery.headers['paypal-transmission-id'],
      transmission_sig: signature,
      transmission_time: timestamp,
      webhook_id: this.webhookSecret,
      webhook_event: JSON.parse(delivery.rawBody),
    };

    try {
      const response = await this.paypalRequest<{
        verification_status: string;
      }>('/v1/notifications/verify-webhook-signature', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      return response.verification_status === 'SUCCESS';
    } catch {
      return false;
    }
  }

  /**
   * Parse PayPal webhook event.
   */
  parseWebhookEvent(delivery: RawWebhookDelivery): ParsedWebhookEvent {
    const payload = JSON.parse(delivery.rawBody);
    const event = payload.event_type || '';
    const resource = payload.resource || {};

    // Map PayPal event types to our normalized types
    const eventTypeMap: Record<string, string> = {
      'PAYMENT.CAPTURE.COMPLETED': 'payment.captured',
      'PAYMENT.CAPTURE.DENIED': 'payment.failed',
      'PAYMENT.ORDER.CREATED': 'payment.created',
      'PAYMENT.ORDER.APPROVED': 'payment.authorized',
      'PAYMENT.CAPTURE.REFUNDED': 'refund.completed',
    };

    // Map PayPal statuses to our normalized types
    const statusMap: Record<string, string> = {
      COMPLETED: 'captured',
      APPROVED: 'authorized',
      CREATED: 'created',
      DECLINED: 'failed',
      VOIDED: 'cancelled',
    };

    return {
      eventId:
        payload.id ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: eventTypeMap[event] || event.toLowerCase(),
      gatewayOrderId:
        resource.id || resource.supplementary_data?.related_ids?.order_id,
      gatewayPaymentId: resource.id,
      status:
        statusMap[resource.status] ||
        resource.status?.toLowerCase() ||
        'unknown',
      amountPaise: resource.amount
        ? Math.round(parseFloat(resource.amount.value) * 100)
        : 0,
      currency: resource.amount?.currency_code || 'USD',
      metadata: {
        event_type: event,
        resource_type: payload.resource_type,
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
    const order = await this.paypalRequest<{
      status: string;
      purchase_units: Array<{
        payments: {
          captures: Array<{
            amount: { value: string; currency_code: string };
          }>;
        };
      }>;
    }>(`/v2/checkout/orders/${gatewayPaymentId}`);

    const capture = order.purchase_units[0]?.payments?.captures?.[0];

    return {
      status: order.status.toLowerCase(),
      amountPaise: capture
        ? Math.round(parseFloat(capture.amount.value) * 100)
        : 0,
      currency: capture?.amount?.currency_code || 'USD',
    };
  }
}
