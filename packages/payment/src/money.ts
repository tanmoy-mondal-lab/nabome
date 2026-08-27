/**
 * Money Math — exact decimal(10,2) arithmetic for INR.
 *
 * Binding: PAYMENT §5.4/§5.5, mandatory rule 15.3 "DECIMAL(10,2) for all
 * currency values", "paise conversion only at adapter boundary".
 *
 * All internal math operates on integer paise (1 INR = 100 paise) so no
 * floating-point drift is possible. API boundaries accept/emit 2-dp decimal
 * strings; gateway boundaries convert via toPaise/fromPaise.
 */

export const MIN_PAYMENT_AMOUNT = 1; // ₹1.00 (PAYMENT §5.4)
export const MAX_PAYMENT_AMOUNT = 10_000_00; // ₹10,00,000 (PAYMENT §5.4)
export const COD_MAX_AMOUNT = 500_000; // ₹5,000 (canonical cod.maxAmount)
export const REFUND_WINDOW_DAYS = 180; // PAYMENT §7.7
export const PAYMENT_TIMEOUT_MINUTES = 15; // PAYMENT §4.8
export const SETTLEMENT_MIN_AMOUNT = 100_00; // ₹100 (FIN-05)
export const SETTLEMENT_HOLD_DAYS = 7; // finance.holdDays (ML-04)
export const COMMISSION_RATE_MIN = 0; // FINANCE §3.6
export const COMMISSION_RATE_MAX = 50; // default cap (ML-05)
export const COMMISSION_DEFAULT_RATE = 15; // FINANCE §2

export type Paise = number & { readonly __paise: unique symbol };

/** Parse a decimal string/number into integer paise. Throws on invalid format. */
export function toPaise(amount: string | number): Paise {
  const s = typeof amount === 'number' ? amount.toFixed(2) : String(amount);
  if (!/^\d+(\.\d{1,2})?$/.test(s)) {
    throw new Error(
      `Invalid amount format: ${amount} (exactly 2 decimals required)`,
    );
  }
  const [whole, frac = ''] = s.split('.');
  const paise = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  if (!Number.isSafeInteger(paise)) {
    throw new Error(`Amount out of range: ${amount}`);
  }
  return paise as Paise;
}

/** Convert integer paise to a 2-dp decimal string (e.g. "1234.56"). */
export function fromPaise(paise: Paise | number): string {
  const p = Math.trunc(paise);
  const whole = Math.trunc(p / 100);
  const frac = Math.abs(p % 100)
    .toString()
    .padStart(2, '0');
  return `${whole}.${frac}`;
}

export function paiseToNumber(paise: Paise | number): number {
  return (paise as number) / 100;
}

export function add(a: Paise | number, b: Paise | number): Paise {
  return (Number(a) + Number(b)) as Paise;
}

export function subtract(a: Paise | number, b: Paise | number): Paise {
  return (Number(a) - Number(b)) as Paise;
}

export function multiply(a: Paise | number, b: Paise | number): Paise {
  return (Number(a) * Number(b)) as Paise;
}

/** Round to nearest paise (half up) — used at computation boundaries. */
export function roundToPaise(value: number): Paise {
  return Math.round(value) as Paise;
}

/** percentage × amount, rounded to 2 dp — commission math (FINANCE §3.10). */
export function percentOf(amount: Paise | number, percent: number): Paise {
  return roundToPaise((Number(amount) * percent) / 100);
}

export function isNegative(value: Paise | number): boolean {
  return Number(value) < 0;
}

export function isZero(value: Paise | number): boolean {
  return Number(value) === 0;
}

/** Amount validation per PAYMENT §5.4 — returns error message or null. */
export function validateAmount(amount: Paise | number): string | null {
  const a = Number(amount);
  if (a < MIN_PAYMENT_AMOUNT) return 'Amount below minimum (₹1.00)';
  if (a > MAX_PAYMENT_AMOUNT) return 'Amount exceeds maximum (₹10,00,000)';
  return null;
}
