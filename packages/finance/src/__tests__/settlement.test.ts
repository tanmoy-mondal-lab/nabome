import { describe, expect, it } from 'vitest';

import { toPaise } from '@nabome/payment';

import { PayoutMethod, SettlementStatus } from '../enums';
import {
  SettlementStateMachine,
  computeSettlementItem,
  defaultPayoutMethod,
  endOfWeekUtc,
  holdEligibleAt,
  isEligibleNow,
  meetsMinimum,
  startOfWeekUtc,
  sumSettlementItems,
} from '../settlement';

describe('settlement — period math (FINANCE §4.13: Mon–Sun UTC)', () => {
  it('computes week boundaries for a Wednesday', () => {
    const wed = new Date('2026-08-05T12:00:00Z'); // Wednesday
    const start = startOfWeekUtc(wed);
    const end = endOfWeekUtc(wed);
    expect(start.toISOString()).toBe('2026-08-03T00:00:00.000Z'); // Monday
    expect(end.toISOString()).toBe('2026-08-09T23:59:59.999Z'); // Sunday
  });

  it('handles Sunday (day 0) as end of previous week', () => {
    const sunday = new Date('2026-08-09T08:00:00Z');
    expect(startOfWeekUtc(sunday).toISOString()).toBe(
      '2026-08-03T00:00:00.000Z',
    );
  });

  it('handles Monday as start of week', () => {
    const monday = new Date('2026-08-03T01:00:00Z');
    expect(startOfWeekUtc(monday).toISOString()).toBe(
      '2026-08-03T00:00:00.000Z',
    );
  });
});

describe('settlement — eligibility (ML-04: 7-day hold from delivered)', () => {
  const delivered = new Date('2026-07-27T10:00:00Z');

  it('eligible at deliveredAt + 7 days', () => {
    const eligibleAt = holdEligibleAt(delivered);
    expect(eligibleAt.toISOString()).toBe('2026-08-03T00:00:00.000Z');
  });

  it('not eligible during the hold window', () => {
    expect(isEligibleNow(delivered, new Date('2026-08-02T23:59:00Z'))).toBe(
      false,
    );
  });

  it('eligible after the hold window (deliveredAt + 7 days)', () => {
    expect(isEligibleNow(delivered, new Date('2026-08-03T09:59:59Z'))).toBe(
      false,
    );
    expect(isEligibleNow(delivered, new Date('2026-08-03T10:00:01Z'))).toBe(
      true,
    );
  });

  it('enforces the ₹100 minimum (FIN-05)', () => {
    expect(meetsMinimum(toPaise('99.99'))).toBe(false);
    expect(meetsMinimum(toPaise(100))).toBe(true);
    expect(meetsMinimum(toPaise('1000.50'))).toBe(true);
  });
});

describe('settlement — net computation (DATABASE §4.9.4)', () => {
  it('computes net = gross − commission − refundAdjustment', () => {
    const item = computeSettlementItem(
      toPaise(1000),
      toPaise(150),
      toPaise(50),
    );
    expect(Number(item.netAmount)).toBe(80000); // ₹800
  });

  it('sums batch totals', () => {
    const items = [
      computeSettlementItem(toPaise(1000), toPaise(150), toPaise(0)),
      computeSettlementItem(toPaise(500), toPaise(75), toPaise(25)),
    ];
    const totals = sumSettlementItems(items);
    expect(Number(totals.grossAmount)).toBe(150000);
    expect(Number(totals.commissionAmount)).toBe(22500);
    expect(Number(totals.refundAdjustment)).toBe(2500);
    expect(Number(totals.netAmount)).toBe(125000);
  });
});

describe('settlement — state machine (Blueprint B.4, ML-09/12)', () => {
  it('walks the canonical happy path', () => {
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.PENDING,
        SettlementStatus.ELIGIBLE,
        'system',
      ),
    ).toBe(true);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.ELIGIBLE,
        SettlementStatus.CREATED,
        'admin',
      ),
    ).toBe(true);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.CREATED,
        SettlementStatus.REVIEW,
        'system',
      ),
    ).toBe(true);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.REVIEW,
        SettlementStatus.APPROVED,
        'admin',
      ),
    ).toBe(true);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.APPROVED,
        SettlementStatus.PROCESSING,
        'system',
      ),
    ).toBe(true);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.PROCESSING,
        SettlementStatus.COMPLETED,
        'system',
      ),
    ).toBe(true);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.COMPLETED,
        SettlementStatus.PAID,
        'system',
      ),
    ).toBe(true);
  });

  it('supports rejection → pending re-eligibility', () => {
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.REVIEW,
        SettlementStatus.REJECTED,
        'admin',
      ),
    ).toBe(true);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.REJECTED,
        SettlementStatus.PENDING,
        'system',
      ),
    ).toBe(true);
  });

  it('supports reversal from COMPLETED and PAID (ML-09/ML-12)', () => {
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.COMPLETED,
        SettlementStatus.REVERSED,
        'admin',
      ),
    ).toBe(true);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.PAID,
        SettlementStatus.REVERSED,
        'admin',
      ),
    ).toBe(true);
  });

  it('rejects transitions by unauthorized roles and invalid edges', () => {
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.REVIEW,
        SettlementStatus.APPROVED,
        'system',
      ),
    ).toBe(false);
    expect(
      SettlementStateMachine.canTransition(
        SettlementStatus.PENDING,
        SettlementStatus.PAID,
        'admin',
      ),
    ).toBe(false);
    expect(() =>
      SettlementStateMachine.assertTransition(
        SettlementStatus.PENDING,
        SettlementStatus.PAID,
        'admin',
      ),
    ).toThrow();
  });

  it('derives idempotent period keys (FIN-05)', () => {
    const key = SettlementStateMachine.periodKey(
      'shop-1',
      new Date('2026-08-03'),
      new Date('2026-08-09'),
    );
    expect(key).toBe(
      'shop-1:2026-08-03T00:00:00.000Z:2026-08-09T00:00:00.000Z',
    );
  });
});

describe('settlement — payout method', () => {
  it('defaults to digital, keeps manual', () => {
    expect(defaultPayoutMethod(PayoutMethod.DIGITAL)).toBe(
      PayoutMethod.DIGITAL,
    );
    expect(defaultPayoutMethod(PayoutMethod.MANUAL)).toBe(PayoutMethod.MANUAL);
  });
});
