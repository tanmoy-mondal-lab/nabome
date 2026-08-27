/**
 * Payment & Refund State Machines — the canonical transition tables.
 *
 * Binding: MASTER_ARCHITECTURE_BLUEPRINT.md B.3, PAYMENT_ENGINE_ARCHITECTURE.md
 * §4.6 (transition rules), §7.9 (refund lifecycle), resolutions ML-02/ML-03.
 *
 * - `Payment.status` is the operational lifecycle (canonical 11 states).
 * - `Order.paymentSubStatus` is the CC-28 aggregate view derived from
 *   payment status + refund state (see deriveOrderPaymentSubStatus).
 * - Refund derivation rule (ML-03): `refunded`/`partially_refunded` are
 *   computed from refund records on read — never stored separately.
 */

import { PaymentStatus, RefundStatus, RefundType } from './enums';

// ──────────────────────────────────────────────────────────────────────────────
// Payment transitions (Blueprint B.3 + PAYMENT §4.6)
// ──────────────────────────────────────────────────────────────────────────────

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.CREATED]: [PaymentStatus.INITIATED, PaymentStatus.FAILED],
  [PaymentStatus.INITIATED]: [
    PaymentStatus.PROCESSING,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
    PaymentStatus.EXPIRED,
  ],
  [PaymentStatus.PROCESSING]: [PaymentStatus.AUTHORIZED, PaymentStatus.FAILED],
  [PaymentStatus.AUTHORIZED]: [PaymentStatus.CAPTURED, PaymentStatus.FAILED],
  [PaymentStatus.CAPTURED]: [
    PaymentStatus.COMPLETED,
    PaymentStatus.PARTIALLY_REFUNDED,
    PaymentStatus.REFUNDED,
    PaymentStatus.REFUNDING,
  ],
  [PaymentStatus.COMPLETED]: [
    PaymentStatus.PARTIALLY_REFUNDED,
    PaymentStatus.REFUNDED,
    PaymentStatus.REFUNDING,
  ],
  [PaymentStatus.FAILED]: [PaymentStatus.CREATED],
  [PaymentStatus.CANCELLED]: [],
  [PaymentStatus.EXPIRED]: [PaymentStatus.CREATED],
  [PaymentStatus.PARTIALLY_REFUNDED]: [
    PaymentStatus.REFUNDED,
    PaymentStatus.PARTIALLY_REFUNDED,
  ],
  [PaymentStatus.REFUNDED]: [],
  [PaymentStatus.REFUNDING]: [
    PaymentStatus.PARTIALLY_REFUNDED,
    PaymentStatus.REFUNDED,
  ],
};

export class PaymentStateMachine {
  static canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
    return PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static transition(from: PaymentStatus, to: PaymentStatus): PaymentStatus {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid payment transition: ${from} → ${to}`);
    }
    return to;
  }

  static isTerminal(status: PaymentStatus): boolean {
    return PAYMENT_TRANSITIONS[status]?.length === 0;
  }

  static isForwardCompleted(status: PaymentStatus): boolean {
    return (
      status === PaymentStatus.CAPTURED || status === PaymentStatus.COMPLETED
    );
  }

  /** Can a refund be initiated against this payment? (PAYMENT §7.7) */
  static isRefundable(status: PaymentStatus): boolean {
    return (
      this.isForwardCompleted(status) ||
      status === PaymentStatus.PARTIALLY_REFUNDED
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Refund transitions (PAYMENT §7.9, ML-03)
// ──────────────────────────────────────────────────────────────────────────────

const REFUND_TRANSITIONS: Record<RefundStatus, RefundStatus[]> = {
  [RefundStatus.INITIATED]: [RefundStatus.PROCESSING, RefundStatus.FAILED],
  [RefundStatus.PROCESSING]: [RefundStatus.COMPLETED, RefundStatus.FAILED],
  [RefundStatus.COMPLETED]: [RefundStatus.SETTLED],
  [RefundStatus.SETTLED]: [],
  [RefundStatus.FAILED]: [RefundStatus.INITIATED, RefundStatus.PROCESSING],
};

export class RefundStateMachine {
  static canTransition(from: RefundStatus, to: RefundStatus): boolean {
    return REFUND_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static transition(from: RefundStatus, to: RefundStatus): RefundStatus {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid refund transition: ${from} → ${to}`);
    }
    return to;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Aggregate derivation (ML-03 + CC-28)
// ──────────────────────────────────────────────────────────────────────────────

export interface RefundAggregateInput {
  paymentAmount: number;
  refunds: Array<{ amount: number; status: RefundStatus }>;
}

export interface RefundAggregate {
  refundedAmount: number;
  remainingRefundable: number;
  /** Aggregate payment state derived from refund records (never stored). */
  status: PaymentStatus | null;
}

/**
 * Derive the aggregate refund state of a payment from its refund records
 * (binding: ML-03 — `refunded`/`partially_refunded` derived on read).
 * Null when no refund has been initiated.
 */
export function deriveRefundAggregate(
  input: RefundAggregateInput,
): RefundAggregate {
  const refundedAmount = input.refunds.reduce((sum, r) => sum + r.amount, 0);
  const remainingRefundable = input.paymentAmount - refundedAmount;
  const anyInFlight = input.refunds.some(
    (r) =>
      r.status === RefundStatus.INITIATED ||
      r.status === RefundStatus.PROCESSING,
  );
  let status: PaymentStatus | null = null;
  if (input.refunds.length > 0) {
    if (anyInFlight) status = PaymentStatus.REFUNDING;
    else if (remainingRefundable <= 0) status = PaymentStatus.REFUNDED;
    else status = PaymentStatus.PARTIALLY_REFUNDED;
  }
  return { refundedAmount, remainingRefundable, status };
}

/**
 * CC-28 order payment sub-status: pending | authorized | captured |
 * refunding | refunded | failed — derived from payment + refunds (PAY-03).
 */
export function deriveOrderPaymentSubStatus(
  paymentStatus: PaymentStatus | null,
  aggregate: RefundAggregate,
): string {
  if (
    aggregate.status === PaymentStatus.REFUNDED ||
    aggregate.status === PaymentStatus.PARTIALLY_REFUNDED
  ) {
    // CC-28 has no "partially_refunded" value — refunds complete (in whole or
    // part) map to `refunded`; refunds still in flight map to `refunding`.
    return 'refunded';
  }
  if (aggregate.status === PaymentStatus.REFUNDING) return 'refunding';
  switch (paymentStatus) {
    case PaymentStatus.FAILED:
    case PaymentStatus.CANCELLED:
    case PaymentStatus.EXPIRED:
      return 'failed';
    case PaymentStatus.AUTHORIZED:
      return 'authorized';
    case PaymentStatus.CAPTURED:
    case PaymentStatus.COMPLETED:
      return 'captured';
    case PaymentStatus.CREATED:
    case PaymentStatus.INITIATED:
    case PaymentStatus.PROCESSING:
      return 'pending';
    default:
      return 'pending';
  }
}

/** Refund type implied by amount vs payment amount (PAYMENT §7.5/§7.6). */
export function inferRefundType(
  refundAmount: number,
  paymentAmount: number,
): RefundType {
  return refundAmount >= paymentAmount ? RefundType.FULL : RefundType.PARTIAL;
}
