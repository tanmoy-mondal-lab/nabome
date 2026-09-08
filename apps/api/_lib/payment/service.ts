/**
 * Payment Service — transaction engine for the payment lifecycle.
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md (lifecycle §4, validation §5,
 * refunds §7, failure handling §8), MASTER_ARCHITECTURE_BLUEPRINT.md B.3 and
 * ML-02/03/09/10. REST_API_SPECIFICATION §7.16 (PAY-02/03).
 *
 * Provider-neutral: every gateway call goes through the adapter contract;
 * business rules (amount match, 180-day window, shipment-state checks,
 * idempotency) live here — never in gateway code (mandatory rule 15.3).
 */

import {
  PaymentStateMachine,
  RefundStateMachine,
  RefundStatus,
  RefundType,
  PaymentStatus,
  PaymentTransactionStatus,
  PaymentTransactionType,
  REFUND_WINDOW_DAYS,
  toPaise,
  fromPaise,
  validateAmount,
  subtract,
  type Paise,
  type GatewayError,
} from '@nabome/payment';

import type { Env } from '../env';
import { ApiError } from '../http/errors';
import { getPrisma } from '../prisma';

import { PAYMENT_TIMEOUT_MINUTES } from './config';
import { emitPaymentEvent } from './events';
import { resolveGateway } from './gateway';

/** Payment-coded errors rendered through the canonical envelope (§6.7). */
function paymentError(
  code:
    | 'PAYMENT_FAILED'
    | 'PAYMENT_AMOUNT_MISMATCH'
    | 'INVALID_PAYMENT_SIGNATURE'
    | 'PAYMENT_NOT_CAPTURED'
    | 'PAYMENT_EXPIRED'
    | 'REFUND_EXCEEDS_PAYMENT'
    | 'REFUND_WINDOW_EXPIRED'
    | 'REFUND_REASON_REQUIRED'
    | 'ALREADY_REFUNDED'
    | 'REFUND_FAILED'
    | 'WEBHOOK_SIGNATURE_INVALID'
    | 'WEBHOOK_EVENT_STALE',
  message: string,
): ApiError {
  return new ApiError({ code, message });
}

// ──────────────────────────────────────────────────────────────────────────────
// Initiation
// ──────────────────────────────────────────────────────────────────────────────

export interface InitiatePaymentOptions {
  orderId: string;
  method: string;
  amountPaise: number;
  currency?: string;
  idempotencyKey: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface InitiatePaymentResult {
  paymentId: string;
  status: PaymentStatus;
  gatewayOrderId: string;
  clientPayload?: Record<string, unknown>;
  expiresAt: Date;
}

/** Idempotent creation + gateway initiation (PAYMENT §5.7, DB §7.3). */
export async function initiatePayment(
  env: Env,
  opts: InitiatePaymentOptions,
): Promise<InitiatePaymentResult> {
  const prisma = getPrisma();
  const amountError = validateAmount(opts.amountPaise);
  if (amountError) throw ApiError.validation(amountError, 'amount');

  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey: opts.idempotencyKey },
  });
  if (existing) {
    return {
      paymentId: existing.id,
      status: existing.status as PaymentStatus,
      gatewayOrderId:
        existing.gatewayReference ?? existing.razorpayOrderId ?? '',
      clientPayload: existing.metadata
        ? (existing.metadata as Record<string, unknown>)
        : undefined,
      expiresAt: existing.expiresAt ?? new Date(),
    };
  }

  const gateway = resolveGateway(env);
  const order = await prisma.order.findUnique({ where: { id: opts.orderId } });
  if (!order) throw ApiError.notFound('Order not found');

  const expiresAt = new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60_000);
  const payment = await prisma.payment.create({
    data: {
      orderId: opts.orderId,
      method: opts.method as never,
      status: 'created',
      amount: fromPaise(opts.amountPaise),
      currency: opts.currency ?? 'INR',
      provider: gateway.provider,
      expiresAt,
      idempotencyKey: opts.idempotencyKey,
    },
  });

  let gatewayOrderId: string;
  let clientPayload: Record<string, unknown> | undefined;
  try {
    const created = await gateway.createOrder({
      idempotencyKey: opts.idempotencyKey,
      amountPaise: opts.amountPaise,
      currency: opts.currency ?? 'INR',
      orderNumber: order.orderNumber,
      customerEmail: opts.customerEmail,
      customerPhone: opts.customerPhone,
      methodHint: opts.method,
      expiresAt: expiresAt.toISOString(),
    });
    gatewayOrderId = created.gatewayOrderId;
    clientPayload = created.clientPayload;
  } catch (err) {
    const gatewayError = err as GatewayError;
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        failureReason:
          gatewayError.failure?.message ?? 'Gateway order creation failed',
      },
    });
    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        type: PaymentTransactionType.AUTHORIZE,
        amount: fromPaise(opts.amountPaise),
        currency: opts.currency ?? 'INR',
        status: PaymentTransactionStatus.FAILED,
        failureCode: gatewayError.failure?.code ?? 'GATEWAY_ERROR',
        failureMessage: gatewayError.failure?.message,
        idempotencyKey: `authorize:${opts.idempotencyKey}`,
      },
    });
    await addTimelineEvent(
      opts.orderId,
      'payment_failed',
      'Payment initiation failed',
    );
    throw paymentError('PAYMENT_FAILED', 'Payment initiation failed');
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'initiated',
      gatewayReference: gatewayOrderId,
      razorpayOrderId:
        gateway.provider === 'razorpay' ? gatewayOrderId : undefined,
      metadata: clientPayload as never,
    },
  });
  await addTimelineEvent(
    opts.orderId,
    'payment_initiated',
    'Payment initiated',
  );

  await emitPaymentEvent({
    eventType: 'payment_created',
    paymentId: payment.id,
    orderId: opts.orderId,
    userId: order.userId,
    shopId: order.shopId,
    amountPaise: opts.amountPaise,
    currency: opts.currency ?? 'INR',
    provider: gateway.provider,
    timestamp: new Date(),
  });

  return {
    paymentId: payment.id,
    status: PaymentStatus.INITIATED,
    gatewayOrderId,
    clientPayload,
    expiresAt,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Verification & capture
// ──────────────────────────────────────────────────────────────────────────────

export interface VerifyAndCaptureOptions {
  paymentId: string;
  gatewayPaymentId: string;
  signature?: string;
  gatewayOrderId?: string;
  /** Expected amount in paise — defaults to the payment record amount. */
  amountPaise?: number;
  /**
   * Webhook-attested capture: the inbound webhook signature was already
   * verified, so skip the interactive checkout signature check and confirm
   * via fetchPayment + amount match instead. Never set from client input.
   */
  webhookAttested?: boolean;
}

/**
 * Server-side verification + capture (PAYMENT §5.8/§5.9, §4.6).
 * Idempotent: re-verification of a captured payment returns the stored result.
 */
export async function verifyAndCapture(
  env: Env,
  opts: VerifyAndCaptureOptions,
): Promise<{ paymentId: string; status: PaymentStatus }> {
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { id: opts.paymentId },
  });
  if (!payment) throw ApiError.notFound('Payment not found');
  if (
    payment.status === 'captured' ||
    payment.status === 'completed' ||
    payment.status === 'refunded'
  ) {
    return { paymentId: payment.id, status: payment.status as PaymentStatus };
  }
  if (payment.status !== 'initiated' && payment.status !== 'processing') {
    throw paymentError('PAYMENT_FAILED', 'Payment not in a verifiable state');
  }

  const gateway = resolveGateway(env);
  let verified: {
    verified: boolean;
    gatewayStatus: string;
    gatewayPaymentId: string;
    amountPaise: number;
    currency: string;
    method?: string;
  };
  try {
    if (opts.webhookAttested === true) {
      const fetched = await gateway.fetchPayment(opts.gatewayPaymentId);
      const expectedAttested =
        opts.amountPaise ?? toPaise(payment.amount.toString());
      if (fetched.amountPaise !== expectedAttested) {
        throw paymentError(
          'PAYMENT_AMOUNT_MISMATCH',
          'Payment amount mismatch',
        );
      }
      verified = {
        verified: true,
        gatewayStatus: fetched.status,
        gatewayPaymentId: opts.gatewayPaymentId,
        amountPaise: fetched.amountPaise,
        currency: fetched.currency ?? payment.currency,
      };
    } else {
      verified = await gateway.verifyPayment({
        gatewayOrderId:
          opts.gatewayOrderId ??
          payment.gatewayReference ??
          payment.razorpayOrderId ??
          '',
        gatewayPaymentId: opts.gatewayPaymentId,
        signature: opts.signature ?? '',
        expectedAmountPaise:
          opts.amountPaise ?? toPaise(payment.amount.toString()),
        currency: payment.currency,
      });
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const gatewayError = err as GatewayError;
    const code = gatewayError.failure?.code;
    if (code === 'AMOUNT_MISMATCH')
      throw paymentError('PAYMENT_AMOUNT_MISMATCH', 'Payment amount mismatch');
    if (code === 'INVALID_SIGNATURE')
      throw paymentError(
        'INVALID_PAYMENT_SIGNATURE',
        'Invalid payment signature',
      );
    throw ApiError.internal(
      `Verification failed: ${gatewayError.failure?.message ?? 'Unknown gateway error'}`,
    );
  }

  if (!verified.verified) {
    throw paymentError(
      'INVALID_PAYMENT_SIGNATURE',
      'Payment verification failed',
    );
  }

  // Amount check (PAYMENT §5.4/§5.9) — gateway amount must equal the order total.
  const expected = opts.amountPaise ?? toPaise(payment.amount.toString());
  if (verified.amountPaise !== expected) {
    throw paymentError('PAYMENT_AMOUNT_MISMATCH', 'Payment amount mismatch');
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'processing',
      gatewayReference: payment.gatewayReference ?? undefined,
      razorpayPaymentId: verified.gatewayPaymentId,
    },
  });
  await prisma.paymentTransaction.create({
    data: {
      paymentId: payment.id,
      type: PaymentTransactionType.CAPTURE,
      amount: fromPaise(verified.amountPaise),
      currency: verified.currency,
      status: PaymentTransactionStatus.SUCCEEDED,
      gatewayReference: verified.gatewayPaymentId,
      idempotencyKey: `capture:${payment.id}:${verified.gatewayPaymentId}`,
    },
  });

  await markCaptured(env, payment.id);
  return { paymentId: payment.id, status: PaymentStatus.CAPTURED };
}

/** Internal capture transition + order sync + finance records (ML-10). */
async function markCaptured(env: Env, paymentId: string): Promise<void> {
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return;
  if (payment.status === 'captured' || payment.status === 'completed') return;

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    select: { userId: true, shopId: true },
  });

  PaymentStateMachine.transition(
    payment.status as PaymentStatus,
    PaymentStatus.CAPTURED,
  );
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'captured', method: payment.method },
  });

  // Order sync: payment captured → order confirmed (ML-10 anchor).
  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      status: 'confirmed',
      customerVisibleStatus: 'confirmed',
      paymentStatus: 'succeeded',
      paymentSubStatus: 'captured',
      razorpayPaymentId: payment.razorpayPaymentId ?? undefined,
      paymentMethod: payment.method,
    },
  });

  await addTimelineEvent(
    payment.orderId,
    'payment_completed',
    'Payment captured',
  );
  await addTimelineEvent(payment.orderId, 'order_confirmed', 'Order confirmed');

  await emitPaymentEvent({
    eventType: 'payment_captured',
    paymentId,
    orderId: payment.orderId,
    userId: order?.userId ?? null,
    shopId: order?.shopId ?? null,
    amountPaise: toPaise(payment.amount.toString()),
    currency: payment.currency,
    provider: payment.provider ?? undefined,
    timestamp: new Date(),
  });

  // Finance records on order confirmed (ML-10 — idempotent per orderId).
  const { createOrderFinanceRecords } = await import('../finance/service');
  await createOrderFinanceRecords(env, payment.orderId, paymentId);
}

// ──────────────────────────────────────────────────────────────────────────────
// Refunds (PAYMENT §7, ML-03/09)
// ──────────────────────────────────────────────────────────────────────────────

export interface ProcessRefundOptions {
  orderId: string;
  amountPaise: number;
  reason: string;
  idempotencyKey: string;
  actorId: string;
  actorRole: 'admin' | 'system';
  /** return_received order id when refund follows a completed return (ML-09). */
  returnReceivedOrderId?: string;
}

/**
 * Full/partial refund with the canonical precondition set (PAYMENT §7.7 +
 * ML-09 shipment-state checks). Idempotent per idempotencyKey (DB §7.3).
 */
export async function processRefund(
  env: Env,
  opts: ProcessRefundOptions,
): Promise<{ refundId: string; status: string }> {
  const prisma = getPrisma();
  const existing = await prisma.refund.findUnique({
    where: { idempotencyKey: opts.idempotencyKey },
  });
  if (existing) return { refundId: existing.id, status: existing.status };

  if (!opts.reason || opts.reason.trim().length === 0) {
    throw paymentError('REFUND_REASON_REQUIRED', 'Refund reason is required');
  }

  const order = await prisma.order.findUnique({
    where: { id: opts.orderId },
    include: {
      payments: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      refunds: { where: { isActive: true } },
      shipments: true,
    },
  });
  if (!order) throw ApiError.notFound('Order not found');

  const payment = order.payments[0];
  if (!payment) throw ApiError.notFound('Payment not found');
  if (!PaymentStateMachine.isRefundable(payment.status as PaymentStatus)) {
    throw paymentError(
      'PAYMENT_NOT_CAPTURED',
      'Payment not captured — refund not allowed',
    );
  }

  const paymentAmount = toPaise(payment.amount.toString());
  const refundedSoFar = order.refunds.reduce(
    (sum, r) => sum + toPaise(r.amount.toString()),
    0,
  ) as Paise;
  const remaining = subtract(paymentAmount, refundedSoFar);
  if (opts.amountPaise > Number(remaining)) {
    throw paymentError(
      'REFUND_EXCEEDS_PAYMENT',
      'Refund exceeds remaining refundable amount',
    );
  }

  // 180-day window from payment creation (PAYMENT §7.7).
  const windowCutoff = new Date(
    payment.createdAt.getTime() + REFUND_WINDOW_DAYS * 86_400_000,
  );
  if (new Date() > windowCutoff) {
    throw paymentError(
      'REFUND_WINDOW_EXPIRED',
      'Refund window expired (> 180 days from payment)',
    );
  }

  // ML-09: after shipment, refunds require a return-received signal
  // (except admin/fraud cases). Shipment statuses: shipped/in_transit/delivered.
  const goodsInTransit = order.shipments.some((s) =>
    ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(
      s.status,
    ),
  );
  if (
    goodsInTransit &&
    opts.actorRole !== 'admin' &&
    !opts.returnReceivedOrderId
  ) {
    throw paymentError(
      'PAYMENT_NOT_CAPTURED',
      'Refund not allowed while goods are in transit — complete the return first',
    );
  }

  const refundType =
    opts.amountPaise >= Number(paymentAmount)
      ? RefundType.FULL
      : RefundType.PARTIAL;
  const refund = await prisma.refund.create({
    data: {
      orderId: opts.orderId,
      paymentId: payment.id,
      type: refundType,
      amount: fromPaise(opts.amountPaise),
      currency: payment.currency,
      status: 'initiated',
      reason: opts.reason,
      idempotencyKey: opts.idempotencyKey,
    },
  });

  const gateway = resolveGateway(env);
  try {
    const result = await gateway.refund({
      gatewayPaymentId:
        payment.gatewayReference ?? payment.razorpayPaymentId ?? '',
      amountPaise: opts.amountPaise,
      idempotencyKey: `refund:${opts.idempotencyKey}`,
      reason: opts.reason,
    });
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: 'processing',
        gatewayReference: result.gatewayReference,
        razorpayRefundId:
          gateway.provider === 'razorpay' ? result.gatewayReference : undefined,
      },
    });
    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        type: PaymentTransactionType.REFUND,
        amount: fromPaise(opts.amountPaise),
        currency: payment.currency,
        status: PaymentTransactionStatus.SUCCEEDED,
        gatewayReference: result.gatewayReference,
        idempotencyKey: `refund-txn:${opts.idempotencyKey}`,
      },
    });
    await addTimelineEvent(
      opts.orderId,
      'refund_initiated',
      `Refund of ₹${fromPaise(opts.amountPaise)} initiated`,
    );
  } catch (err) {
    const gatewayError = err as GatewayError;
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: 'failed',
        gatewayReference: gatewayError.failure?.gatewayReference,
      },
    });
    await addTimelineEvent(
      opts.orderId,
      'refund_failed',
      `Refund failed: ${gatewayError.failure?.message ?? 'Gateway error'}`,
    );
    throw paymentError('REFUND_FAILED', 'Refund failed');
  }

  // Webhook/gateway confirmation completes the refund (see webhook service);
  // derive aggregate state eagerly so PAY-03 is accurate.
  await syncRefundState(env, opts.orderId, payment.id, opts.amountPaise);

  await emitPaymentEvent({
    eventType: 'refund_initiated',
    paymentId: payment.id,
    orderId: opts.orderId,
    userId: order.userId,
    shopId: order.shopId,
    amountPaise: opts.amountPaise,
    currency: payment.currency,
    provider: payment.provider ?? undefined,
    timestamp: new Date(),
  });

  return { refundId: refund.id, status: 'processing' };
}

/** Gateway-confirmed refund completion (webhook path). */
export async function completeRefund(
  env: Env,
  paymentId: string,
  gatewayReference: string,
  amountPaise: number,
): Promise<void> {
  const prisma = getPrisma();
  const refund = await prisma.refund.findFirst({
    where: { paymentId, gatewayReference },
    orderBy: { createdAt: 'desc' },
  });
  if (!refund) return;
  if (refund.status === 'completed' || refund.status === 'settled') return;

  RefundStateMachine.transition(
    refund.status as RefundStatus,
    RefundStatus.COMPLETED,
  );
  await prisma.refund.update({
    where: { id: refund.id },
    data: { status: 'completed', completedAt: new Date() },
  });
  await addTimelineEvent(
    refund.orderId,
    'refund_completed',
    'Refund completed',
  );
  await syncRefundState(env, refund.orderId, paymentId, amountPaise);

  const order = await prisma.order.findUnique({
    where: { id: refund.orderId },
    select: { userId: true, shopId: true },
  });
  await emitPaymentEvent({
    eventType: 'refund_completed',
    paymentId,
    orderId: refund.orderId,
    userId: order?.userId ?? null,
    shopId: order?.shopId ?? null,
    amountPaise,
    currency: refund.currency,
    timestamp: new Date(),
  });
}

/** Aggregate refund state sync (ML-03) — payment status + order sub-status. */
export async function syncRefundState(
  env: Env,
  orderId: string,
  paymentId: string,
  refundAmountPaise: number,
): Promise<void> {
  const prisma = getPrisma();
  const { deriveRefundAggregate, deriveOrderPaymentSubStatus } =
    await import('@nabome/payment');
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return;

  const refunds = await prisma.refund.findMany({
    where: { paymentId, isActive: true },
    select: { amount: true, status: true },
  });
  const aggregate = deriveRefundAggregate({
    paymentAmount: toPaise(payment.amount.toString()),
    refunds: refunds.map((r) => ({
      amount: toPaise(r.amount.toString()),
      status: r.status as never,
    })),
  });

  const paymentStatus = aggregate.status ?? payment.status;
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: paymentStatus },
  });
  const subStatus = deriveOrderPaymentSubStatus(
    paymentStatus as PaymentStatus,
    aggregate,
  );
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus:
        paymentStatus === 'refunded'
          ? 'refunded'
          : paymentStatus === 'partially_refunded'
            ? 'partially_refunded'
            : 'succeeded',
      paymentSubStatus: subStatus as never,
    },
    // Note: `subStatus` is a CC-28 string (pending/authorized/captured/refunding/
    // refunded/failed); cast through never to the Prisma enum — values match 1:1.
  });

  const { createRefundFinanceRecords } = await import('../finance/service');
  await createRefundFinanceRecords(env, orderId, paymentId, refundAmountPaise);
}

// ──────────────────────────────────────────────────────────────────────────────
// Expiry & failure
// ──────────────────────────────────────────────────────────────────────────────

/** Expire stale payments (PAYMENT §4.8 — 15-min window; → expired, release). */
export async function expireStalePayments(): Promise<number> {
  const prisma = getPrisma();
  const cutoff = new Date(Date.now() - PAYMENT_TIMEOUT_MINUTES * 60_000);
  const stale = await prisma.payment.findMany({
    where: {
      status: { in: ['created', 'initiated'] },
      expiresAt: { lt: cutoff },
      isActive: true,
    },
    select: { id: true, orderId: true },
  });
  for (const payment of stale) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'expired' },
    });
    await addTimelineEvent(
      payment.orderId,
      'payment_failed',
      'Payment window expired',
    );

    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      select: { userId: true, shopId: true },
    });
    await emitPaymentEvent({
      eventType: 'payment_expired',
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: order?.userId ?? null,
      shopId: order?.shopId ?? null,
      timestamp: new Date(),
    });
  }
  return stale.length;
}

/** Mark a payment failed (webhook fallback) — payment + order state sync. */
export async function markPaymentFailed(
  paymentId: string,
  failureReason?: string,
): Promise<void> {
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return;
  if (payment.status === 'failed' || payment.status === 'cancelled') return;

  PaymentStateMachine.transition(
    payment.status as PaymentStatus,
    PaymentStatus.FAILED,
  );
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'failed', failureReason },
  });
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { paymentStatus: 'failed', paymentSubStatus: 'failed' },
  });
  await addTimelineEvent(
    payment.orderId,
    'payment_failed',
    failureReason ?? 'Payment failed',
  );

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    select: { userId: true, shopId: true },
  });
  await emitPaymentEvent({
    eventType: 'payment_failed',
    paymentId,
    orderId: payment.orderId,
    userId: order?.userId ?? null,
    shopId: order?.shopId ?? null,
    amountPaise: toPaise(payment.amount.toString()),
    currency: payment.currency,
    provider: payment.provider ?? undefined,
    data: { failureReason },
    timestamp: new Date(),
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Timeline event helper (TimelineEvent model — always visible to customer). */
export async function addTimelineEvent(
  orderId: string,
  type: string,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await getPrisma().timelineEvent.create({
    data: {
      orderId,
      type: type as never,
      description,
      customerVisible: true,
      metadata: (metadata as never) ?? undefined,
    },
  });
}

export { fromPaise };
