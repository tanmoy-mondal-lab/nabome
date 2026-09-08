/**
 * Webhook service — inbound provider webhook processing (PAY-07, REST §9).
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §7.10/§15, REST_API_SPECIFICATION.md
 * PAY-07: signature verification (provider scheme + platform X-Nabome-Signature),
 * 5-minute freshness, nonce/replay tracking, idempotent processing
 * (`@@unique([provider, eventId])`), non-2xx on failure so the provider retries.
 */
import {
  isFresh,
  hashPayload,
  parseNabomeSignature,
  type ParsedWebhookEvent,
} from '@nabome/payment';

import type { Env } from '../env';
import { ApiError } from '../http/errors';
import { getPrisma } from '../prisma';

import { getGateway, buildGatewayCredentials } from './gateway';
import {
  verifyAndCapture,
  completeRefund,
  syncRefundState,
  markPaymentFailed,
} from './service';

const WEBHOOK_FRESHNESS_SECONDS = 300;

/** PAY-07 — process an inbound gateway webhook; throws on failure (non-2xx). */
export async function handleGatewayWebhook(
  env: Env,
  provider: string,
  rawBody: string,
  headers: Headers,
): Promise<void> {
  const prisma = getPrisma();
  const gateway = getGateway(provider, buildGatewayCredentials(env));
  const delivery = { rawBody, headers: headersToRecord(headers) };

  // 1. Signature: platform X-Nabome-Signature (verified callbacks) and/or the
  //    provider scheme. Never skip verification (PAYMENT §15.3).
  const platformSignature = headers.get('x-nabome-signature');
  if (platformSignature) {
    const parsed = parseNabomeSignature(platformSignature);
    if (!parsed)
      throw webhookError(
        'WEBHOOK_SIGNATURE_INVALID',
        'Malformed X-Nabome-Signature',
      );
    if (!isFresh(parsed.timestamp)) {
      throw webhookError(
        'WEBHOOK_EVENT_STALE',
        'Webhook replay: delivery timestamp outside freshness window',
      );
    }
    if (env.WEBHOOK_SECRET) {
      const { verifyNabomeSignature } = await import('@nabome/payment');
      const ok = await verifyNabomeSignature(
        rawBody,
        platformSignature,
        env.WEBHOOK_SECRET,
      );
      if (!ok)
        throw webhookError(
          'WEBHOOK_SIGNATURE_INVALID',
          'X-Nabome-Signature HMAC verification failed',
        );
    }
  }
  const verified = await gateway.verifyWebhookSignature(delivery);
  if (!verified)
    throw webhookError(
      'WEBHOOK_SIGNATURE_INVALID',
      'Webhook signature verification failed',
    );

  // 2. Parse + normalize.
  let event: ParsedWebhookEvent;
  try {
    event = gateway.parseWebhookEvent(delivery);
  } catch {
    throw webhookError(
      'WEBHOOK_SIGNATURE_INVALID',
      'Unparseable webhook payload',
    );
  }

  // 3. Nonce/replay: exactly-once per provider+eventId (REST §9.3).
  const payloadHash = await hashPayload(rawBody);
  const existing = await prisma.webhookEvent.findUnique({
    where: { provider_eventId: { provider, eventId: event.eventId } },
  });
  if (existing) {
    // Already processed — ack (idempotent; never reprocess).
    return;
  }

  const record = await prisma.webhookEvent.create({
    data: {
      provider,
      eventId: event.eventId,
      eventType: event.eventType,
      payloadHash,
      status: 'received',
    },
  });

  try {
    await processEvent(env, provider, event);
    await prisma.webhookEvent.update({
      where: { id: record.id },
      data: { status: 'processed', processedAt: new Date() },
    });
  } catch (err) {
    await prisma.webhookEvent.update({
      where: { id: record.id },
      data: {
        status: 'failed',
        failureReason: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}

/** Dispatch a verified event to the payment/refund services (idempotent fallback). */
async function processEvent(
  env: Env,
  provider: string,
  event: ParsedWebhookEvent,
): Promise<void> {
  const prisma = getPrisma();

  if (
    event.eventType === 'payment.captured' ||
    event.eventType === 'payment.authorized'
  ) {
    if (!event.gatewayPaymentId && !event.gatewayOrderId)
      throw webhookError(
        'PAYMENT_NOT_CAPTURED',
        'Webhook missing gateway payment id',
      );
    const payment = await prisma.payment.findFirst({
      where: {
        provider,
        OR: [
          ...(event.gatewayPaymentId
            ? [
                { gatewayReference: event.gatewayPaymentId },
                { razorpayPaymentId: event.gatewayPaymentId },
              ]
            : []),
          ...(event.gatewayOrderId
            ? [
                { gatewayReference: event.gatewayOrderId },
                { razorpayOrderId: event.gatewayOrderId },
              ]
            : []),
        ],
      },
    });
    if (!payment) {
      // Unknown to us — nothing to reconcile locally; ack to stop retries.
      return;
    }
    // Idempotent fallback: no-ops when already captured/completed (service guard).
    // Webhook HMAC already verified above — attest so verifyAndCapture uses
    // fetchPayment + amount match instead of the interactive checkout signature.
    await verifyAndCapture(env, {
      paymentId: payment.id,
      gatewayPaymentId:
        event.gatewayPaymentId ?? payment.razorpayPaymentId ?? '',
      webhookAttested: true,
      amountPaise: event.amountPaise || undefined,
    });
    return;
  }

  if (event.eventType === 'payment.failed') {
    if (!event.gatewayPaymentId && !event.gatewayOrderId)
      throw webhookError(
        'PAYMENT_NOT_CAPTURED',
        'Webhook missing gateway payment id',
      );
    const payment = await prisma.payment.findFirst({
      where: {
        provider,
        OR: [
          ...(event.gatewayPaymentId
            ? [
                { gatewayReference: event.gatewayPaymentId },
                { razorpayPaymentId: event.gatewayPaymentId },
              ]
            : []),
          ...(event.gatewayOrderId
            ? [
                { gatewayReference: event.gatewayOrderId },
                { razorpayOrderId: event.gatewayOrderId },
              ]
            : []),
        ],
      },
    });
    if (!payment) return;
    await markPaymentFailed(
      payment.id,
      event.status === 'failed' ? 'gateway_declined' : 'webhook_failed',
    );
    return;
  }

  if (
    event.eventType === 'refund.processed' ||
    event.eventType === 'refund.completed'
  ) {
    const refund = await prisma.refund.findFirst({
      where: {
        payment: { is: { provider } },
        gatewayReference: event.gatewayPaymentId ?? '',
      },
    });
    if (!refund || !refund.paymentId) return;
    await completeRefund(
      env,
      refund.paymentId,
      refund.gatewayReference ?? '',
      event.amountPaise,
    );
    await syncRefundState(
      env,
      refund.orderId,
      refund.paymentId,
      event.amountPaise,
    );
    return;
  }

  // Unknown event types are acknowledged (no state change) — the provider
  // registry defines which events are actionable (PAYMENT §15.3).
}

/** Webhook-coded errors — non-2xx propagates to the provider (retry). */
function webhookError(
  code:
    | 'WEBHOOK_SIGNATURE_INVALID'
    | 'WEBHOOK_EVENT_STALE'
    | 'PAYMENT_NOT_CAPTURED'
    | 'PAYMENT_AMOUNT_MISMATCH',
  message: string,
): ApiError {
  return new ApiError({ code, message });
}

/** Headers → plain record for the provider-agnostic delivery contract. */
function headersToRecord(headers: Headers): Record<string, string | undefined> {
  const record: Record<string, string | undefined> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}
