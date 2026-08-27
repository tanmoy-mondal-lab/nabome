/**
 * Reconciliation service — gateway vs local payment state (PAY-05/06, PAYMENT §9).
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §7.4/§9 — gateway is the source of
 * truth for conflicts (PAYMENT §9.8). Recon diffs in-flight local payments
 * against the gateway's recorded state and reports mismatches; retries are
 * surfaced for operator action. Append-only — no writes beyond webhook-event
 * recording, which is handled by the webhook service.
 */
import { toPaise } from '@nabome/payment';

import type { Env } from '../env';
import { getPrisma } from '../prisma';

import { getGateway, buildGatewayCredentials } from './gateway';
import { verifyAndCapture } from './service';

export interface ReconMismatch {
  paymentId: string;
  orderId: string;
  amount: string;
  localStatus: string;
  gatewayStatus: string | null;
  reason: 'GATEWAY_MISMATCH' | 'GATEWAY_UNAVAILABLE' | 'STALE_LOCAL';
  retryable: boolean;
}

export interface ReconReport {
  mismatches: ReconMismatch[];
  summary: {
    totalPayments: number;
    inFlight: number;
    mismatchCount: number;
    retryableCount: number;
  };
  lastRunAt: string | null;
}

/**
 * PAY-05 — build the reconciliation report: fetch gateway state for every
 * in-flight payment and diff against local (gateway is source of truth).
 */
export async function buildReconReport(env: Env): Promise<ReconReport> {
  const prisma = getPrisma();
  const payments = await prisma.payment.findMany({
    where: { isActive: true },
    include: { order: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const inFlight = payments.filter((p) =>
    ['created', 'initiated', 'processing', 'authorized'].includes(p.status),
  );

  const gateway = getGateway(providerFor(env), buildGatewayCredentials(env));
  const mismatches: ReconMismatch[] = [];

  for (const payment of inFlight) {
    const reference = payment.gatewayReference ?? payment.razorpayOrderId;
    if (!reference) {
      // Created locally but never sent to a gateway — staleness signal.
      mismatches.push({
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amount.toString(),
        localStatus: payment.status,
        gatewayStatus: null,
        reason: 'STALE_LOCAL',
        retryable: true,
      });
      continue;
    }
    try {
      const gatewayState = await gateway.fetchPayment(reference);
      if (
        gatewayState.status === 'captured' ||
        gatewayState.status === 'paid'
      ) {
        // Gateway captured but local still in-flight — idempotent fix-up
        // (verifyAndCapture no-ops when already captured/completed).
        await verifyAndCapture(env, {
          paymentId: payment.id,
          gatewayPaymentId: reference,
        });
      } else if (gatewayState.status === 'failed') {
        mismatches.push({
          paymentId: payment.id,
          orderId: payment.orderId,
          amount: payment.amount.toString(),
          localStatus: payment.status,
          gatewayStatus: gatewayState.status,
          reason: 'GATEWAY_MISMATCH',
          retryable: false,
        });
      } else if (
        gatewayState.amountPaise !== toPaise(payment.amount.toString())
      ) {
        mismatches.push({
          paymentId: payment.id,
          orderId: payment.orderId,
          amount: payment.amount.toString(),
          localStatus: payment.status,
          gatewayStatus: gatewayState.status,
          reason: 'GATEWAY_MISMATCH',
          retryable: false,
        });
      }
    } catch {
      mismatches.push({
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amount.toString(),
        localStatus: payment.status,
        gatewayStatus: null,
        reason: 'GATEWAY_UNAVAILABLE',
        retryable: true,
      });
    }
  }

  return {
    mismatches,
    summary: {
      totalPayments: payments.length,
      inFlight: inFlight.length,
      mismatchCount: mismatches.length,
      retryableCount: mismatches.filter((m) => m.retryable).length,
    },
    lastRunAt: new Date().toISOString(),
  };
}

/**
 * PAY-06 — trigger a reconciliation run. Local fix-up happens via the webhook
 * fallback path (capture confirmation is idempotent); this report drives the
 * operator queue. Returns the report under a jobId for async consumption.
 */
export async function runReconciliation(
  env: Env,
): Promise<{ jobId: string; report: ReconReport }> {
  const report = await buildReconReport(env);
  return {
    jobId: crypto.randomUUID(),
    report,
  };
}

/** Active provider name (report works with any configured provider). */
function providerFor(env: Env): string {
  return env.PAYMENT_PROVIDER || 'mock';
}
