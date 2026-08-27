import { describe, expect, it } from 'vitest';

import { toPaise } from '@nabome/payment';

import { LedgerAccount } from '../enums';
import {
  adjustmentPostings,
  codCollectionPostings,
  codSettlementPostings,
  formatRecordNumber,
  gatewayFeePostings,
  isBalanced,
  refundPostings,
  reversePostings,
  salePostings,
  settlementPayoutPostings,
} from '../ledger';

describe('ledger — double-entry invariant (DATABASE §4.9.2)', () => {
  it('sale postings balance (cash = commission + seller payable + shipping)', () => {
    const postings = salePostings(toPaise(1000), toPaise(150), toPaise(99));
    expect(isBalanced(postings)).toBe(true);
    const cash = postings.find((p) => p.account === LedgerAccount.CASH);
    expect(Number(cash?.amount)).toBe(109900); // ₹1,000 + ₹99 shipping
  });

  it('sale without shipping balances', () => {
    const postings = salePostings(toPaise(500), toPaise(75));
    expect(isBalanced(postings)).toBe(true);
  });

  it('refund postings balance', () => {
    expect(isBalanced(refundPostings(toPaise(250), true))).toBe(true);
  });

  it('COD collection and settlement postings balance', () => {
    expect(isBalanced(codCollectionPostings(toPaise(800)))).toBe(true);
    expect(isBalanced(codSettlementPostings(toPaise(800)))).toBe(true);
  });

  it('settlement payout postings balance', () => {
    expect(isBalanced(settlementPayoutPostings(toPaise(400)))).toBe(true);
  });

  it('gateway fee postings balance', () => {
    expect(isBalanced(gatewayFeePostings(toPaise(17)))).toBe(true);
  });

  it('adjustment postings balance in both directions', () => {
    expect(isBalanced(adjustmentPostings(toPaise(30), true))).toBe(true);
    expect(isBalanced(adjustmentPostings(toPaise(30), false))).toBe(true);
  });
});

describe('ledger — reversal (append-only corrections, FINANCE §5.6)', () => {
  it('reverses postings exactly', () => {
    const original = salePostings(toPaise(1000), toPaise(150));
    const reversed = reversePostings(original);
    expect(isBalanced(reversed)).toBe(true);
    for (const p of reversed) {
      const counterpart = original.find((o) => o.account === p.account);
      expect(counterpart?.side).not.toBe(p.side);
      expect(Number(counterpart?.amount)).toBe(Number(p.amount));
    }
  });
});

describe('ledger — record numbers', () => {
  it('formats FIN and STL numbers', () => {
    const date = new Date('2026-08-05T10:00:00Z');
    expect(formatRecordNumber('FIN', date, 1)).toBe('FIN-20260805-000001');
    expect(formatRecordNumber('STL', date, 42)).toBe('STL-20260805-000042');
  });
});
