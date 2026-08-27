import { describe, expect, it } from 'vitest';

import { PaymentStatus, RefundStatus, RefundType } from '../enums';
import {
  PaymentStateMachine,
  RefundStateMachine,
  deriveOrderPaymentSubStatus,
  deriveRefundAggregate,
  inferRefundType,
} from '../state-machine';

describe('PaymentStateMachine (Blueprint B.3 + PAYMENT §4.6)', () => {
  it('walks the happy path created → completed', () => {
    let status = PaymentStateMachine.transition(
      PaymentStatus.CREATED,
      PaymentStatus.INITIATED,
    );
    status = PaymentStateMachine.transition(status, PaymentStatus.PROCESSING);
    status = PaymentStateMachine.transition(status, PaymentStatus.AUTHORIZED);
    status = PaymentStateMachine.transition(status, PaymentStatus.CAPTURED);
    status = PaymentStateMachine.transition(status, PaymentStatus.COMPLETED);
    expect(status).toBe(PaymentStatus.COMPLETED);
    // ML-02: completed is terminal only for the forward flow — refund
    // transitions remain available, so it is not a hard terminal state.
    expect(PaymentStateMachine.isTerminal(status)).toBe(false);
  });

  it('marks cancelled and refunded as terminal', () => {
    expect(PaymentStateMachine.isTerminal(PaymentStatus.CANCELLED)).toBe(true);
    expect(PaymentStateMachine.isTerminal(PaymentStatus.REFUNDED)).toBe(true);
  });

  it('blocks invalid transitions', () => {
    expect(() =>
      PaymentStateMachine.transition(
        PaymentStatus.CREATED,
        PaymentStatus.CAPTURED,
      ),
    ).toThrow();
    expect(() =>
      PaymentStateMachine.transition(
        PaymentStatus.COMPLETED,
        PaymentStatus.FAILED,
      ),
    ).toThrow();
  });

  it('supports failed → created retry and expired → created retry', () => {
    expect(
      PaymentStateMachine.canTransition(
        PaymentStatus.FAILED,
        PaymentStatus.CREATED,
      ),
    ).toBe(true);
    expect(
      PaymentStateMachine.canTransition(
        PaymentStatus.EXPIRED,
        PaymentStatus.CREATED,
      ),
    ).toBe(true);
  });

  it('allows refund transitions from captured and completed (ML-02)', () => {
    expect(
      PaymentStateMachine.canTransition(
        PaymentStatus.CAPTURED,
        PaymentStatus.PARTIALLY_REFUNDED,
      ),
    ).toBe(true);
    expect(
      PaymentStateMachine.canTransition(
        PaymentStatus.CAPTURED,
        PaymentStatus.REFUNDED,
      ),
    ).toBe(true);
    expect(
      PaymentStateMachine.canTransition(
        PaymentStatus.COMPLETED,
        PaymentStatus.PARTIALLY_REFUNDED,
      ),
    ).toBe(true);
    expect(
      PaymentStateMachine.canTransition(
        PaymentStatus.COMPLETED,
        PaymentStatus.REFUNDED,
      ),
    ).toBe(true);
  });

  it('isRefundable only for captured/completed/partially_refunded (PAYMENT §7.7)', () => {
    expect(PaymentStateMachine.isRefundable(PaymentStatus.CAPTURED)).toBe(true);
    expect(PaymentStateMachine.isRefundable(PaymentStatus.COMPLETED)).toBe(
      true,
    );
    expect(
      PaymentStateMachine.isRefundable(PaymentStatus.PARTIALLY_REFUNDED),
    ).toBe(true);
    expect(PaymentStateMachine.isRefundable(PaymentStatus.CREATED)).toBe(false);
    expect(PaymentStateMachine.isRefundable(PaymentStatus.AUTHORIZED)).toBe(
      false,
    );
    expect(PaymentStateMachine.isRefundable(PaymentStatus.FAILED)).toBe(false);
  });
});

describe('RefundStateMachine (PAYMENT §7.9, ML-03)', () => {
  it('walks initiated → processing → completed → settled', () => {
    let status = RefundStateMachine.transition(
      RefundStatus.INITIATED,
      RefundStatus.PROCESSING,
    );
    status = RefundStateMachine.transition(status, RefundStatus.COMPLETED);
    status = RefundStateMachine.transition(status, RefundStatus.SETTLED);
    expect(status).toBe(RefundStatus.SETTLED);
  });

  it('supports retry from failed (PAYMENT §8.6)', () => {
    expect(
      RefundStateMachine.canTransition(
        RefundStatus.FAILED,
        RefundStatus.INITIATED,
      ),
    ).toBe(true);
    expect(
      RefundStateMachine.canTransition(
        RefundStatus.FAILED,
        RefundStatus.PROCESSING,
      ),
    ).toBe(true);
  });

  it('blocks skipped stages', () => {
    expect(() =>
      RefundStateMachine.transition(
        RefundStatus.INITIATED,
        RefundStatus.COMPLETED,
      ),
    ).toThrow();
  });
});

describe('deriveRefundAggregate (ML-03 — derived on read, never stored)', () => {
  it('derives partially_refunded', () => {
    const agg = deriveRefundAggregate({
      paymentAmount: 10000,
      refunds: [{ amount: 2500, status: RefundStatus.SETTLED }],
    });
    expect(agg.refundedAmount).toBe(2500);
    expect(agg.remainingRefundable).toBe(7500);
    expect(agg.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
  });

  it('derives refunded when fully refunded', () => {
    const agg = deriveRefundAggregate({
      paymentAmount: 10000,
      refunds: [{ amount: 10000, status: RefundStatus.SETTLED }],
    });
    expect(agg.status).toBe(PaymentStatus.REFUNDED);
    expect(agg.remainingRefundable).toBe(0);
  });

  it('derives refunding while a refund is in flight', () => {
    const agg = deriveRefundAggregate({
      paymentAmount: 10000,
      refunds: [{ amount: 5000, status: RefundStatus.PROCESSING }],
    });
    expect(agg.status).toBe(PaymentStatus.REFUNDING);
  });

  it('returns null before any refund exists', () => {
    const agg = deriveRefundAggregate({ paymentAmount: 10000, refunds: [] });
    expect(agg.status).toBeNull();
    expect(agg.remainingRefundable).toBe(10000);
  });
});

describe('deriveOrderPaymentSubStatus (CC-28)', () => {
  it('maps lifecycle to the 6 CC-28 values', () => {
    expect(
      deriveOrderPaymentSubStatus(PaymentStatus.INITIATED, {
        status: null,
        refundedAmount: 0,
        remainingRefundable: 100,
      }),
    ).toBe('pending');
    expect(
      deriveOrderPaymentSubStatus(PaymentStatus.AUTHORIZED, {
        status: null,
        refundedAmount: 0,
        remainingRefundable: 100,
      }),
    ).toBe('authorized');
    expect(
      deriveOrderPaymentSubStatus(PaymentStatus.COMPLETED, {
        status: null,
        refundedAmount: 0,
        remainingRefundable: 100,
      }),
    ).toBe('captured');
    expect(
      deriveOrderPaymentSubStatus(PaymentStatus.FAILED, {
        status: null,
        refundedAmount: 0,
        remainingRefundable: 100,
      }),
    ).toBe('failed');
    expect(
      deriveOrderPaymentSubStatus(PaymentStatus.COMPLETED, {
        status: PaymentStatus.REFUNDING,
        refundedAmount: 50,
        remainingRefundable: 50,
      }),
    ).toBe('refunding');
    expect(
      deriveOrderPaymentSubStatus(PaymentStatus.COMPLETED, {
        status: PaymentStatus.REFUNDED,
        refundedAmount: 100,
        remainingRefundable: 0,
      }),
    ).toBe('refunded');
  });
});

describe('inferRefundType', () => {
  it('infers full vs partial by amount', () => {
    expect(inferRefundType(10000, 10000)).toBe(RefundType.FULL);
    expect(inferRefundType(5000, 10000)).toBe(RefundType.PARTIAL);
  });
});
