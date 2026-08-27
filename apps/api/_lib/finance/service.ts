/**
 * Finance Service — records, commission, ledger, and settlements.
 *
 * Binding: FINANCE_ENGINE_ARCHITECTURE.md (commission §3, settlement §4,
 * financial records §5), DATABASE_SPECIFICATION.md §4.9, Blueprint B.4 and
 * ML-04/05/08/10/11/12. REST_API_SPECIFICATION §7.17 (FIN-01..FIN-12).
 *
 * Finance records, never processes money. Records are append-only; balances
 * are computed from the ledger — never cached without invalidation.
 */

import {
  computeCommission,
  formatRecordNumber,
  salePostings,
  refundPostings,
  settlementPayoutPostings,
  reversePostings,
  isBalanced,
  type CommissionRule,
  CommissionScope,
  SettlementStatus,
  PayoutMethod,
  SettlementStateMachine,
  computeSettlementItem,
  sumSettlementItems,
  startOfWeekUtc,
  endOfWeekUtc,
  meetsMinimum,
} from '@nabome/finance';
import { toPaise, fromPaise, percentOf, type Paise } from '@nabome/payment';

import type { Env } from '../env';
import { ApiError } from '../http/errors';
import { getFinanceConfig } from '../payment/config';
import { emitPaymentEvent } from '../payment/events';
import { getPrisma } from '../prisma';

function financeError(
  code:
    | 'SETTLEMENT_NOT_FOUND'
    | 'SETTLEMENT_STATE_INVALID'
    | 'DUPLICATE_SETTLEMENT'
    | 'SETTLEMENT_MINIMUM_NOT_MET'
    | 'COMMISSION_INVALID',
  message: string,
): ApiError {
  return new ApiError({ code, message });
}

// ──────────────────────────────────────────────────────────────────────────────
// Finance records on order confirmed (ML-10 — idempotent per orderId)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create the sale/commission finance records for an order at confirmation.
 * Idempotent: records exist per order → no-op. Commission uses the rule
 * snapshot; the ledger posting is balanced by construction (§4.9.2 invariant).
 */
export async function createOrderFinanceRecords(
  env: Env,
  orderId: string,
  paymentId: string,
): Promise<void> {
  const prisma = getPrisma();
  const existing = await prisma.financeRecord.findFirst({
    where: { orderId, type: 'sale', status: { not: 'reversed' } },
  });
  if (existing) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, shop: true },
  });
  if (!order) return;

  const config = getFinanceConfig(env);
  const itemsSubtotal = toPaise(order.itemsSubtotal.toString());
  const shippingTotal = toPaise(order.shippingTotal.toString());

  // Commission snapshot at order time (FINANCE §3.10, ML-05).
  // Per-order max cap = item total × cap% (canonical cap default 50%).
  const commission = computeCommission(
    itemsSubtotal,
    {
      shopRule: order.shopId
        ? await activeCommissionRule(env, 'shop', order.shopId)
        : null,
      categoryRule: null,
      platformRule: await activeCommissionRule(env, 'platform', null),
    },
    percentOf(itemsSubtotal, config.commissionCap),
  );
  const commissionAmount = commission.commissionAmount;

  const postings = salePostings(itemsSubtotal, commissionAmount, shippingTotal);
  if (!isBalanced(postings)) throw new Error('Unbalanced sale postings');

  const recordNumber = formatRecordNumber(
    'FIN',
    new Date(),
    await nextSequence('FIN'),
  );
  const record = await prisma.financeRecord.create({
    data: {
      orderId,
      recordNumber,
      type: 'sale',
      amount: fromPaise(Number(itemsSubtotal) + Number(shippingTotal)),
      status: 'posted',
      referenceType: 'payment',
      referenceId: paymentId,
      postedAt: new Date(),
      metadata: {
        commissionRate: commission.rate,
        ruleScope: commission.ruleUsed.scope,
        commissionAmount: fromPaise(commissionAmount),
      },
      ledgerEntries: {
        create: postings.map((p) => ({
          account: p.account,
          side: p.side,
          amount: fromPaise(p.amount),
        })),
      },
    },
  });

  // Commission detail record (FINANCE §5.8 — rate snapshot per order).
  await prisma.financeRecord.create({
    data: {
      orderId,
      recordNumber: formatRecordNumber(
        'FIN',
        new Date(),
        await nextSequence('FIN'),
      ),
      type: 'commission',
      amount: fromPaise(commissionAmount),
      status: 'posted',
      referenceType: 'financeRecord',
      referenceId: record.id,
      postedAt: new Date(),
    },
  });
}

/** Commission rate for a scope, effective today (FINANCE §3.5/§3.13). */
async function activeCommissionRule(
  env: Env,
  scope: 'platform' | 'shop' | 'category',
  scopeId: string | null,
): Promise<CommissionRule | null> {
  const config = getFinanceConfig(env);
  const prisma = getPrisma();
  const now = new Date();
  const row = await prisma.commissionRate.findFirst({
    where: {
      scope,
      ...(scopeId
        ? { shopId: scopeId }
        : scope === 'category'
          ? { categoryId: scopeId }
          : {}),
      isActive: true,
      effectiveFrom: { lte: now },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
    },
    orderBy: { effectiveFrom: 'desc' },
  });
  if (row) {
    return {
      id: row.id,
      scope: row.scope as CommissionScope,
      scopeId: row.shopId ?? row.categoryId ?? null,
      rate: Number(row.rate),
      effectiveFrom: row.effectiveFrom.toISOString(),
      effectiveTo: row.effectiveTo ? row.effectiveTo.toISOString() : null,
    };
  }
  if (scope === 'platform') {
    return {
      id: 'global-default',
      scope: CommissionScope.PLATFORM,
      scopeId: null,
      rate: config.commissionRate,
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
    };
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Refund finance records (FINANCE §5.11 — commission + earnings reversal)
// ──────────────────────────────────────────────────────────────────────────────

/** Refund record with proportional commission reversal. */
export async function createRefundFinanceRecords(
  _env: Env,
  orderId: string,
  paymentId: string,
  refundAmountPaise: number,
): Promise<void> {
  const prisma = getPrisma();
  const existing = await prisma.financeRecord.findFirst({
    where: {
      orderId,
      type: 'refund',
      referenceId: paymentId,
      status: { not: 'reversed' },
    },
  });
  if (existing) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      financeRecords: {
        where: { type: 'sale', status: 'posted' },
        include: { ledgerEntries: true },
      },
    },
  });
  if (!order) return;

  const saleRecord = order.financeRecords[0];
  const saleAmount = saleRecord
    ? toPaise(saleRecord.amount.toString())
    : toPaise(0);
  const saleCommission = saleRecord
    ? (saleRecord.ledgerEntries
        .filter((e) => e.account === 'commission_income' && e.side === 'credit')
        .reduce((sum, e) => sum + toPaise(e.amount.toString()), 0) as Paise)
    : toPaise(0);

  // Proportional commission reversal (PAYMENT §7.5/§7.6).
  let commissionReversal: Paise = 0 as Paise;
  if (Number(saleAmount) > 0) {
    commissionReversal = Math.round(
      (Number(saleCommission) * refundAmountPaise) / Number(saleAmount),
    ) as Paise;
  }

  const postings = refundPostings(toPaise(refundAmountPaise), true);
  const recordNumber = formatRecordNumber(
    'FIN',
    new Date(),
    await nextSequence('FIN'),
  );
  await prisma.financeRecord.create({
    data: {
      orderId,
      recordNumber,
      type: 'refund',
      amount: fromPaise(refundAmountPaise),
      status: 'posted',
      referenceType: 'payment',
      referenceId: paymentId,
      postedAt: new Date(),
      metadata: { commissionReversal: fromPaise(commissionReversal) },
      ledgerEntries: {
        create: postings.map((p) => ({
          account: p.account,
          side: p.side,
          amount: fromPaise(p.amount),
        })),
      },
    },
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Queries (FIN-01 earnings, FIN-02 ledger)
// ──────────────────────────────────────────────────────────────────────────────

export interface EarningsSummary {
  periodEarnings: string;
  availableBalance: string;
  inHoldBalance: string;
  settledTotal: string;
  pendingSettlements: number;
  nextSettlementDate: string | null;
}

/** Earnings summary computed from the append-only ledger (FIN-01). */
export async function getEarningsSummary(
  env: Env,
  shopId: string,
): Promise<EarningsSummary> {
  const prisma = getPrisma();
  const entries = await prisma.ledgerEntry.findMany({
    where: { account: 'seller_payable' },
    include: {
      financeRecord: { select: { order: { select: { shopId: true } } } },
    },
  });
  const shopEntries = entries.filter(
    (e) => e.financeRecord.order?.shopId === shopId,
  );
  const balance = shopEntries.reduce(
    (sum, e) =>
      sum +
      (e.side === 'credit'
        ? toPaise(e.amount.toString())
        : -toPaise(e.amount.toString())),
    0,
  ) as Paise;

  const config = getFinanceConfig(env);
  const holdCutoff = new Date(Date.now() - config.holdDays * 86_400_000);
  const heldOrders = await prisma.order.findMany({
    where: { shopId, status: 'delivered', settlementStatus: null },
    include: {
      shipments: {
        where: { deliveredAt: { not: null } },
        select: { deliveredAt: true },
      },
      financeRecords: {
        where: { type: 'sale' },
        include: { ledgerEntries: { where: { account: 'seller_payable' } } },
      },
    },
  });
  let inHoldPaise = 0;
  for (const order of heldOrders) {
    const latestDelivery = order.shipments.reduce(
      (max, s) =>
        s.deliveredAt && s.deliveredAt.getTime() > max.getTime()
          ? s.deliveredAt
          : max,
      new Date(0),
    );
    if (latestDelivery.getTime() > holdCutoff.getTime()) {
      inHoldPaise += order.financeRecords.reduce(
        (sum, r) =>
          sum +
          r.ledgerEntries.reduce(
            (s2, e) =>
              s2 + (e.side === 'credit' ? toPaise(e.amount.toString()) : 0),
            0,
          ),
        0,
      );
    }
  }

  const pendingSettlements = await prisma.settlement.count({
    where: {
      shopId,
      status: {
        in: [
          'pending',
          'eligible',
          'created',
          'review',
          'approved',
          'processing',
        ],
      },
    },
  });

  const weekEnd = endOfWeekUtc(new Date());
  const settled = await prisma.settlement.aggregate({
    where: { shopId, status: { in: ['completed', 'paid'] } },
    _sum: { netAmount: true },
  });

  return {
    periodEarnings: fromPaise(balance),
    availableBalance: fromPaise(Math.max(0, Number(balance) - inHoldPaise)),
    inHoldBalance: fromPaise(inHoldPaise),
    settledTotal: fromPaise(
      settled._sum.netAmount
        ? toPaise(settled._sum.netAmount.toString())
        : toPaise(0),
    ),
    pendingSettlements,
    nextSettlementDate: weekEnd.toISOString(),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Settlements (FIN-03..FIN-08)
// ──────────────────────────────────────────────────────────────────────────────

export interface CreateSettlementOptions {
  shopId: string;
  periodStart?: Date;
  periodEnd?: Date;
  actorId: string;
}

/** FIN-05 — create the period settlement batch (idempotent per shop+period). */
export async function createSettlement(
  env: Env,
  opts: CreateSettlementOptions,
): Promise<{ settlementId: string; status: string; amount: string }> {
  const prisma = getPrisma();
  const periodStart = opts.periodStart ?? startOfWeekUtc(new Date());
  const periodEnd = opts.periodEnd ?? endOfWeekUtc(new Date());

  const existing = await prisma.settlement.findUnique({
    where: {
      shopId_periodStart_periodEnd: {
        shopId: opts.shopId,
        periodStart,
        periodEnd,
      },
    },
  });
  if (existing)
    throw financeError(
      'DUPLICATE_SETTLEMENT',
      'Settlement already exists for this period',
    );

  const config = getFinanceConfig(env);
  const now = new Date();
  // Eligible orders (ML-04): delivered ≥ holdDays, hold starts at the latest
  // shipment's deliveredAt; never settled before.
  const holdCutoff = new Date(now.getTime() - config.holdDays * 86_400_000);
  const eligibleOrders = await prisma.order.findMany({
    where: {
      shopId: opts.shopId,
      status: 'delivered',
      settlementStatus: null,
    },
    include: {
      shipments: {
        where: { deliveredAt: { not: null } },
        select: { deliveredAt: true },
      },
      financeRecords: {
        where: { type: 'sale', status: 'posted' },
        include: { ledgerEntries: true },
      },
      refunds: {
        where: { isActive: true, status: { in: ['completed', 'settled'] } },
      },
    },
  });

  const items = eligibleOrders
    .filter((order) => {
      const latestDelivery = order.shipments.reduce(
        (max, s) =>
          s.deliveredAt && s.deliveredAt.getTime() > max.getTime()
            ? s.deliveredAt
            : max,
        new Date(0),
      );
      return latestDelivery.getTime() <= holdCutoff.getTime();
    })
    .map((order) => {
      const saleAmount = order.financeRecords[0]
        ? toPaise(order.financeRecords[0].amount.toString())
        : toPaise(0);
      const commissionAmount = order.financeRecords[0]
        ? (order.financeRecords[0].ledgerEntries
            .filter(
              (e) => e.account === 'commission_income' && e.side === 'credit',
            )
            .reduce((sum, e) => sum + toPaise(e.amount.toString()), 0) as Paise)
        : toPaise(0);
      const refundAdjustment = order.refunds.reduce(
        (sum, r) => sum + toPaise(r.amount.toString()),
        0,
      ) as Paise;
      const calc = computeSettlementItem(
        saleAmount,
        commissionAmount,
        refundAdjustment,
      );
      return { orderId: order.id, ...calc };
    });

  if (items.length === 0)
    throw financeError(
      'SETTLEMENT_MINIMUM_NOT_MET',
      'No eligible orders in this period',
    );
  const totals = sumSettlementItems(items);
  if (!meetsMinimum(totals.netAmount, config.settlementMinPaise)) {
    throw financeError(
      'SETTLEMENT_MINIMUM_NOT_MET',
      'Net settlement below the minimum amount',
    );
  }

  const shop = await prisma.shop.findUnique({ where: { id: opts.shopId } });
  const settlement = await prisma.settlement.create({
    data: {
      settlementNumber: formatRecordNumber(
        'STL',
        new Date(),
        await nextSequence('STL'),
      ),
      shopId: opts.shopId,
      periodStart,
      periodEnd,
      status: 'created',
      grossAmount: fromPaise(totals.grossAmount),
      commissionAmount: fromPaise(totals.commissionAmount),
      refundAdjustment: fromPaise(totals.refundAdjustment),
      netAmount: fromPaise(totals.netAmount),
      payoutMethod:
        shop?.payoutMethod === 'manual'
          ? PayoutMethod.MANUAL
          : PayoutMethod.DIGITAL,
      items: {
        create: items.map((item) => ({
          orderId: item.orderId,
          grossAmount: fromPaise(item.grossAmount),
          commissionAmount: fromPaise(item.commissionAmount),
          refundAdjustment: fromPaise(item.refundAdjustment),
          netAmount: fromPaise(item.netAmount),
        })),
      },
    },
    include: { items: true },
  });

  // Mark orders as settled (settlementStatus on Order).
  await prisma.order.updateMany({
    where: { id: { in: items.map((i) => i.orderId) } },
    data: { settlementStatus: 'eligible' },
  });

  await prisma.financeRecord.create({
    data: {
      orderId: items[0]!.orderId,
      recordNumber: formatRecordNumber(
        'FIN',
        new Date(),
        await nextSequence('FIN'),
      ),
      type: 'settlement',
      amount: fromPaise(totals.netAmount),
      status: 'posted',
      referenceType: 'settlement',
      referenceId: settlement.id,
      postedAt: new Date(),
    },
  });

  return {
    settlementId: settlement.id,
    status: 'created',
    amount: fromPaise(totals.netAmount),
  };
}

/** FIN-06 — approve (REVIEW → APPROVED → PROCESSING) with payout method. */
export async function approveSettlement(
  _env: Env,
  settlementId: string,
  actorId: string,
  reason: string | undefined,
  payoutMethod: 'digital' | 'manual',
): Promise<{ status: string }> {
  const prisma = getPrisma();
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });
  if (!settlement)
    throw financeError('SETTLEMENT_NOT_FOUND', 'Settlement not found');

  SettlementStateMachine.assertTransition(
    settlement.status as SettlementStatus,
    SettlementStatus.APPROVED,
    'admin',
  );
  await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      status: 'approved',
      payoutMethod:
        payoutMethod === 'manual' ? PayoutMethod.MANUAL : PayoutMethod.DIGITAL,
      approvalReason: reason ?? null,
      approvedBy: actorId,
      approvedAt: new Date(),
    },
  });

  // PROCESSING — payout queued for the shop (payout record created).
  const payout = await prisma.payout.create({
    data: {
      settlementId,
      shopId: settlement.shopId,
      amount: settlement.netAmount,
      currency: settlement.currency,
      status: 'queued',
      requestedAt: new Date(),
    },
  });
  await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: 'processing', payoutReference: payout.id },
  });

  return { status: 'processing' };
}

/** FIN-07 — reject (REVIEW → REJECTED, re-eligible next period). */
export async function rejectSettlement(
  _env: Env,
  settlementId: string,
  reason: string,
): Promise<{ status: string }> {
  const prisma = getPrisma();
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });
  if (!settlement)
    throw financeError('SETTLEMENT_NOT_FOUND', 'Settlement not found');

  SettlementStateMachine.assertTransition(
    settlement.status as SettlementStatus,
    SettlementStatus.REJECTED,
    'admin',
  );
  await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: 'rejected', rejectionReason: reason },
  });
  return { status: 'rejected' };
}

/** Payout completion — PROCESSING → COMPLETED → PAID (gateway payout webhook). */
export async function completeSettlementPayout(
  settlementId: string,
  payoutGatewayReference?: string,
): Promise<{ status: string }> {
  const prisma = getPrisma();
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { shop: { select: { ownerId: true } } },
  });
  if (!settlement)
    throw financeError('SETTLEMENT_NOT_FOUND', 'Settlement not found');

  SettlementStateMachine.assertTransition(
    settlement.status as SettlementStatus,
    SettlementStatus.COMPLETED,
    'system',
  );
  SettlementStateMachine.assertTransition(
    SettlementStatus.COMPLETED,
    SettlementStatus.PAID,
    'system',
  );

  const now = new Date();
  const updated = await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      status: 'paid',
      completedAt: now,
      paidAt: now,
      ...(payoutGatewayReference ? { payoutGatewayReference } : {}),
    },
  });
  await prisma.payout.updateMany({
    where: { settlementId },
    data: { status: 'completed', completedAt: now },
  });

  await emitPaymentEvent({
    eventType: 'settlement_completed',
    shopId: settlement.shopId,
    userId: settlement.shop.ownerId,
    amountPaise: toPaise(settlement.netAmount.toString()),
    currency: settlement.currency,
    data: { settlementId, settlementNumber: settlement.settlementNumber },
    timestamp: now,
  });

  return { status: updated.status };
}

/** FIN-08 — reverse from COMPLETED/PAID (ML-09/12): admin + reason + audit. */
export async function reverseSettlement(
  _env: Env,
  settlementId: string,
  reason: string,
  approvalRef: string | undefined,
): Promise<{ status: string; reversalRecordId: string }> {
  const prisma = getPrisma();
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { payouts: true, items: true },
  });
  if (!settlement)
    throw financeError('SETTLEMENT_NOT_FOUND', 'Settlement not found');

  const current = settlement.status as SettlementStatus;
  if (
    current !== SettlementStatus.COMPLETED &&
    current !== SettlementStatus.PAID
  ) {
    throw financeError(
      'SETTLEMENT_STATE_INVALID',
      'Reversal allowed only from COMPLETED or PAID',
    );
  }

  const reversalRecord = await prisma.financeRecord.create({
    data: {
      orderId: settlement.items[0]?.orderId ?? '',
      recordNumber: formatRecordNumber(
        'FIN',
        new Date(),
        await nextSequence('FIN'),
      ),
      type: 'reversal',
      amount: settlement.netAmount,
      status: 'posted',
      referenceType: 'settlement',
      referenceId: settlementId,
      postedAt: new Date(),
      metadata: { reason, approvalRef: approvalRef ?? null },
      ledgerEntries: {
        create: reversePostings(
          settlementPayoutPostings(toPaise(settlement.netAmount.toString())),
        ).map((p) => ({
          account: p.account,
          side: p.side,
          amount: fromPaise(p.amount),
        })),
      },
    },
  });

  await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: 'reversed' },
  });
  await prisma.payout.updateMany({
    where: { settlementId },
    data: { status: 'reversed' },
  });
  // ML-09: restored earnings re-enter eligibility (orders become settleable again).
  await prisma.order.updateMany({
    where: { id: { in: settlement.items.map((i) => i.orderId) } },
    data: { settlementStatus: null },
  });

  await emitPaymentEvent({
    eventType: 'settlement_reversed',
    shopId: settlement.shopId,
    userId: null,
    amountPaise: toPaise(settlement.netAmount.toString()),
    currency: settlement.currency,
    data: { settlementId, reason, approvalRef },
    timestamp: new Date(),
  });

  return { status: 'reversed', reversalRecordId: reversalRecord.id };
}

/** Settlement detail with items + payout (FIN-04). */
export async function getSettlementDetail(settlementId: string) {
  return getPrisma().settlement.findUnique({
    where: { id: settlementId },
    include: { items: true, payouts: true },
  });
}

async function nextSequence(prefix: 'FIN' | 'STL'): Promise<number> {
  const prisma = getPrisma() as any;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const likePrefix = `${prefix}-${today}-`;
  const latest = await prisma.financeRecord
    .findFirst({
      where: { recordNumber: { startsWith: likePrefix } },
      orderBy: { recordNumber: 'desc' },
      select: { recordNumber: true },
    })
    .catch(() => null);
  const latestSettlement = !latest
    ? await prisma.settlement
        .findFirst({
          where: { settlementNumber: { startsWith: likePrefix } },
          orderBy: { settlementNumber: 'desc' },
          select: { settlementNumber: true },
        })
        .catch(() => null)
    : null;
  const lastNum =
    latest?.recordNumber ??
    latestSettlement?.settlementNumber ??
    `${likePrefix}000000`;
  const seqStr = lastNum.replace(likePrefix, '');
  const seq = parseInt(seqStr, 10) || 0;
  return seq + 1;
}
