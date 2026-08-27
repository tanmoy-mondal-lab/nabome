import { describe, expect, it } from 'vitest';

import { toPaise } from '@nabome/payment';

import {
  calculateCommission,
  computeCommission,
  resolveCommissionRule,
  validateCommissionRate,
} from '../commission';
import { CommissionScope } from '../enums';

const platformRule = {
  id: 'r-global',
  scope: CommissionScope.PLATFORM,
  scopeId: null,
  rate: 15,
  effectiveFrom: '2026-01-01',
  effectiveTo: null,
};

const categoryRule = {
  id: 'r-cat',
  scope: CommissionScope.CATEGORY,
  scopeId: 'cat-1',
  rate: 8,
  effectiveFrom: '2026-01-01',
  effectiveTo: null,
};

const shopRule = {
  id: 'r-shop',
  scope: CommissionScope.SHOP,
  scopeId: 'shop-1',
  rate: 10,
  effectiveFrom: '2026-01-01',
  effectiveTo: null,
};

describe('commission — hierarchy (FINANCE §3.5: Shop > Category > Global)', () => {
  it('prefers shop over category and global', () => {
    expect(
      resolveCommissionRule({ shopRule, categoryRule, platformRule }),
    ).toEqual(shopRule);
  });

  it('prefers category over global when no shop rule', () => {
    expect(
      resolveCommissionRule({ shopRule: null, categoryRule, platformRule }),
    ).toEqual(categoryRule);
  });

  it('falls back to global', () => {
    expect(
      resolveCommissionRule({
        shopRule: null,
        categoryRule: null,
        platformRule,
      }),
    ).toEqual(platformRule);
  });

  it('returns null when nothing applies', () => {
    expect(
      resolveCommissionRule({
        shopRule: null,
        categoryRule: null,
        platformRule: null,
      }),
    ).toBeNull();
  });
});

describe('commission — calculation (FINANCE §3.10, ML-05)', () => {
  it('computes commission = itemTotal × rate / 100 (2 dp)', () => {
    const { commissionAmount } = calculateCommission(toPaise(1000), 15, null);
    expect(Number(commissionAmount)).toBe(15000); // ₹150 on ₹1,000
  });

  it('caps at maxCommissionPerOrder', () => {
    const { commissionAmount, capApplied } = calculateCommission(
      toPaise(100000),
      15,
      toPaise(5000),
    );
    expect(Number(commissionAmount)).toBe(500000);
    expect(Number(capApplied)).toBe(500000);
  });

  it('does not cap below the maximum', () => {
    const { commissionAmount, capApplied } = calculateCommission(
      toPaise(1000),
      15,
      toPaise(5000),
    );
    expect(Number(commissionAmount)).toBe(15000);
    expect(capApplied).toBeNull();
  });

  it('snapshots the rule used (transparency — FINANCE §3.4)', () => {
    const result = computeCommission(
      toPaise(1000),
      { shopRule, categoryRule, platformRule },
      null,
    );
    expect(result.ruleUsed).toEqual({
      scope: CommissionScope.SHOP,
      id: 'shop-1',
    });
    expect(result.rate).toBe(10);
    expect(Number(result.commissionAmount)).toBe(10000);
  });
});

describe('commission — validation (ML-05: 0–50%, cap 10–50)', () => {
  it('rejects out-of-range rates', () => {
    expect(validateCommissionRate(-1)).not.toBeNull();
    expect(validateCommissionRate(51)).not.toBeNull();
    expect(validateCommissionRate(NaN)).not.toBeNull();
  });

  it('accepts valid rates including 0 (promotional)', () => {
    expect(validateCommissionRate(0)).toBeNull();
    expect(validateCommissionRate(15)).toBeNull();
    expect(validateCommissionRate(50)).toBeNull();
  });

  it('enforces the configured cap', () => {
    expect(validateCommissionRate(60, 50)).not.toBeNull();
    expect(validateCommissionRate(45, 50)).toBeNull();
  });
});
