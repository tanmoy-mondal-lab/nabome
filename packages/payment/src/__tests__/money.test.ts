import { describe, expect, it } from 'vitest';

import {
  MAX_PAYMENT_AMOUNT,
  MIN_PAYMENT_AMOUNT,
  fromPaise,
  isZero,
  percentOf,
  roundToPaise,
  toPaise,
  validateAmount,
} from '../money';

describe('money — toPaise', () => {
  it('converts decimal strings to integer paise', () => {
    expect(toPaise('0.01')).toBe(1);
    expect(toPaise('1')).toBe(100);
    expect(toPaise('1234.56')).toBe(123456);
    expect(toPaise('999999.99')).toBe(99999999);
  });

  it('converts numbers with 2-dp precision', () => {
    expect(toPaise(10.5)).toBe(1050);
  });

  it('rejects invalid formats (PAYMENT §5.4 — exactly 2 decimals)', () => {
    expect(() => toPaise('1.234')).toThrow();
    expect(() => toPaise('abc')).toThrow();
    expect(() => toPaise('-5')).toThrow();
  });
});

describe('money — fromPaise', () => {
  it('formats paise as 2-dp strings', () => {
    expect(fromPaise(1)).toBe('0.01');
    expect(fromPaise(123456)).toBe('1234.56');
    expect(fromPaise(100)).toBe('1.00');
  });
});

describe('money — rounding', () => {
  it('rounds half up to nearest paise', () => {
    expect(roundToPaise(10.5)).toBe(11);
    expect(roundToPaise(10.4)).toBe(10);
  });

  it('computes percentages exactly (commission math)', () => {
    // 15% of ₹1,000 = ₹150
    expect(percentOf(toPaise(1000), 15)).toBe(15000);
    // 8.5% of ₹999.99 = ₹85.00 (84.99915 → half-up → 85.00)
    expect(percentOf(toPaise('999.99'), 8.5)).toBe(8500);
  });
});

describe('money — validation (PAYMENT §5.4)', () => {
  it('enforces min/max bounds', () => {
    expect(validateAmount(MIN_PAYMENT_AMOUNT)).toBeNull();
    expect(validateAmount(MAX_PAYMENT_AMOUNT)).toBeNull();
    expect(validateAmount(0)).not.toBeNull();
    expect(validateAmount(MAX_PAYMENT_AMOUNT + 1)).not.toBeNull();
  });

  it('isZero works', () => {
    expect(isZero(0)).toBe(true);
    expect(isZero(1)).toBe(false);
  });
});
