/**
 * Settlement Engine — lifecycle, period math, eligibility, and net amounts.
 *
 * Binding: FINANCE_ENGINE_ARCHITECTURE.md §4, Blueprint B.4, resolutions
 * ML-04 (hold starts at order `delivered`), ML-09 (reversal from COMPLETED
 * and PAID, earnings-scoped idempotency), ML-12 (PAID → REVERSED), and
 * REST_API_SPECIFICATION.md §7.17 (FIN-03..FIN-08).
 *
 * Period: weekly default (Mon–Sun, cut-off 23:59:59 UTC). Hold: 7 days from
 * delivery. Minimum settlement amount: ₹100. All money in paise.
 */

import {
  SETTLEMENT_HOLD_DAYS,
  SETTLEMENT_MIN_AMOUNT,
  subtract,
  type Paise,
} from '@nabome/payment';

import { SettlementStatus, PayoutMethod } from './enums';

// ──────────────────────────────────────────────────────────────────────────────
// Period math (FINANCE §4.13 — Monday–Sunday, UTC cut-off)
// ──────────────────────────────────────────────────────────────────────────────

/** Monday 00:00:00.000Z of the week containing `date`. */
export function startOfWeekUtc(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const daysSinceMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d;
}

/** Sunday 23:59:59.999Z of the week containing `date`. */
export function endOfWeekUtc(date: Date): Date {
  const start = startOfWeekUtc(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

// ──────────────────────────────────────────────────────────────────────────────
// Eligibility (ML-04 — hold starts at delivered)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Settlement eligibility of a delivered order: hold = deliveredAt + 7 days.
 * Eligible from `eligibleAt` inclusive (FINANCE §4.5, ML-04).
 */
export function holdEligibleAt(
  deliveredAt: Date,
  holdDays: number = SETTLEMENT_HOLD_DAYS,
): Date {
  const t = new Date(deliveredAt.getTime());
  t.setUTCDate(t.getUTCDate() + holdDays);
  t.setUTCHours(0, 0, 0, 0);
  return t;
}

export function isEligibleNow(
  deliveredAt: Date,
  now: Date,
  holdDays: number = SETTLEMENT_HOLD_DAYS,
): boolean {
  return deliveredAt.getTime() + holdDays * 86_400_000 <= now.getTime();
}

/** Minimum settlement amount check (FIN-05 — 422 SETTLEMENT_MINIMUM_NOT_MET). */
export function meetsMinimum(
  netAmount: Paise | number,
  minimum: Paise | number = SETTLEMENT_MIN_AMOUNT,
): boolean {
  return Number(netAmount) >= Number(minimum);
}

// ──────────────────────────────────────────────────────────────────────────────
// Net computation (DATABASE §4.9.3/§4.9.4)
// ──────────────────────────────────────────────────────────────────────────────

export interface SettlementItemCalc {
  grossAmount: Paise;
  commissionAmount: Paise;
  refundAdjustment: Paise;
  netAmount: Paise;
}

/** Per-order settlement line: net = gross − commission − refundAdjustment. */
export function computeSettlementItem(
  grossAmount: Paise,
  commissionAmount: Paise,
  refundAdjustment: Paise = 0 as Paise,
): SettlementItemCalc {
  const netAmount = subtract(
    subtract(grossAmount, commissionAmount),
    refundAdjustment,
  );
  return { grossAmount, commissionAmount, refundAdjustment, netAmount };
}

export interface SettlementTotals {
  grossAmount: Paise;
  commissionAmount: Paise;
  refundAdjustment: Paise;
  netAmount: Paise;
}

/** Batch totals across settlement items. */
export function sumSettlementItems(
  items: SettlementItemCalc[],
): SettlementTotals {
  return items.reduce<SettlementTotals>(
    (totals, item) => ({
      grossAmount: (Number(totals.grossAmount) +
        Number(item.grossAmount)) as Paise,
      commissionAmount: (Number(totals.commissionAmount) +
        Number(item.commissionAmount)) as Paise,
      refundAdjustment: (Number(totals.refundAdjustment) +
        Number(item.refundAdjustment)) as Paise,
      netAmount: (Number(totals.netAmount) + Number(item.netAmount)) as Paise,
    }),
    {
      grossAmount: 0 as Paise,
      commissionAmount: 0 as Paise,
      refundAdjustment: 0 as Paise,
      netAmount: 0 as Paise,
    },
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Settlement state machine (Blueprint B.4, ML-09/12)
// ──────────────────────────────────────────────────────────────────────────────

export interface SettlementTransition {
  from: SettlementStatus;
  to: SettlementStatus;
  /** Human-readable trigger description. */
  trigger: string;
  /** Roles allowed to perform the transition. */
  roles: Array<'system' | 'admin' | 'gateway'>;
}

const SETTLEMENT_TRANSITIONS: SettlementTransition[] = [
  {
    from: SettlementStatus.PENDING,
    to: SettlementStatus.ELIGIBLE,
    trigger: 'Hold period elapsed',
    roles: ['system'],
  },
  {
    from: SettlementStatus.ELIGIBLE,
    to: SettlementStatus.CREATED,
    trigger: 'Settlement batch created',
    roles: ['system', 'admin'],
  },
  {
    from: SettlementStatus.CREATED,
    to: SettlementStatus.REVIEW,
    trigger: 'Ready for admin review',
    roles: ['system'],
  },
  {
    from: SettlementStatus.REVIEW,
    to: SettlementStatus.APPROVED,
    trigger: 'Admin approval',
    roles: ['admin'],
  },
  {
    from: SettlementStatus.REVIEW,
    to: SettlementStatus.REJECTED,
    trigger: 'Admin rejection (reason required)',
    roles: ['admin'],
  },
  {
    from: SettlementStatus.REJECTED,
    to: SettlementStatus.PENDING,
    trigger: 'Re-eligible next period',
    roles: ['system'],
  },
  {
    from: SettlementStatus.APPROVED,
    to: SettlementStatus.PROCESSING,
    trigger: 'Payout initiated',
    roles: ['system'],
  },
  {
    from: SettlementStatus.PROCESSING,
    to: SettlementStatus.COMPLETED,
    trigger: 'Payout confirmed',
    roles: ['gateway', 'system'],
  },
  {
    from: SettlementStatus.PROCESSING,
    to: SettlementStatus.FAILED,
    trigger: 'Payout failed (retry or investigate)',
    roles: ['gateway', 'system'],
  },
  {
    from: SettlementStatus.FAILED,
    to: SettlementStatus.PROCESSING,
    trigger: 'Payout retry',
    roles: ['system', 'admin'],
  },
  {
    from: SettlementStatus.COMPLETED,
    to: SettlementStatus.PAID,
    trigger: 'Funds received by shop owner',
    roles: ['system'],
  },
  // ML-09/ML-12: reversal from COMPLETED or PAID (admin + reason + audit).
  {
    from: SettlementStatus.COMPLETED,
    to: SettlementStatus.REVERSED,
    trigger: 'Admin reversal (approval + reason)',
    roles: ['admin'],
  },
  {
    from: SettlementStatus.PAID,
    to: SettlementStatus.REVERSED,
    trigger: 'Admin reversal post-payout (approval + reason)',
    roles: ['admin'],
  },
];

export class SettlementStateMachine {
  static allowedTransitionsFrom(
    status: SettlementStatus,
  ): SettlementTransition[] {
    return SETTLEMENT_TRANSITIONS.filter((t) => t.from === status);
  }

  static canTransition(
    from: SettlementStatus,
    to: SettlementStatus,
    role: 'system' | 'admin' | 'gateway',
  ): boolean {
    return SETTLEMENT_TRANSITIONS.some(
      (t) => t.from === from && t.to === to && t.roles.includes(role),
    );
  }

  static assertTransition(
    from: SettlementStatus,
    to: SettlementStatus,
    role: 'system' | 'admin' | 'gateway',
  ): void {
    if (!this.canTransition(from, to, role)) {
      throw new Error(
        `Invalid settlement transition: ${from} → ${to} (role ${role})`,
      );
    }
  }

  /** FIN-05 idempotency scope: one settlement per (shop, period). */
  static periodKey(shopId: string, periodStart: Date, periodEnd: Date): string {
    return `${shopId}:${periodStart.toISOString()}:${periodEnd.toISOString()}`;
  }
}

/** Payout method eligibility — manual is the fallback for edge cases. */
export function defaultPayoutMethod(preferred: PayoutMethod): PayoutMethod {
  return preferred === PayoutMethod.MANUAL
    ? PayoutMethod.MANUAL
    : PayoutMethod.DIGITAL;
}
