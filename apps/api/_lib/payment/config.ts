/**
 * Finance & Payment runtime configuration — env-driven with canonical defaults.
 *
 * Binding: FINANCE_ENGINE_ARCHITECTURE.md §6, ML-04/05, PAYMENT §2.6 (COD).
 * Canonical defaults: commission 15% (0–50, cap 50), hold 7 days from
 * delivery, settlement min ₹100, COD max ₹5,000, payment window 15 min.
 */

import type { Env } from '../env';

export interface FinanceConfig {
  /** Default global commission rate (%) — FINANCE §2, canonical 15. */
  commissionRate: number;
  /** Max commission rate cap (%) — ML-05 canonical range 10–50, default 50. */
  commissionCap: number;
  /** Settlement hold in days from order delivered — ML-04 canonical 7. */
  holdDays: number;
  /** Minimum settlement amount in rupees — FIN-05 canonical ₹100. */
  settlementMinPaise: number;
  /** COD availability + max order amount — PAYMENT §2.6, canonical ₹5,000. */
  codEnabled: boolean;
  codMaxAmountPaise: number;
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getFinanceConfig(env: Env): FinanceConfig {
  return {
    commissionRate: num(env.FINANCE_COMMISSION_RATE, 15),
    commissionCap: num(env.FINANCE_COMMISSION_CAP, 50),
    holdDays: num(env.FINANCE_HOLD_DAYS, 7),
    settlementMinPaise: Math.round(num(env.FINANCE_SETTLEMENT_MIN, 100) * 100),
    codEnabled: (env.COD_ENABLED ?? 'true') === 'true',
    codMaxAmountPaise: Math.round(num(env.COD_MAX_AMOUNT, 5000) * 100),
  };
}

export function getPaymentProvider(env: Env): string {
  const provider =
    env.PAYMENT_PROVIDER ??
    (env.ENVIRONMENT === 'production' ? 'razorpay' : 'mock');
  return provider;
}

export const PAYMENT_TIMEOUT_MINUTES = 15;
