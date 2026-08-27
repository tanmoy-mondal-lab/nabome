/**
 * Commission Engine — rule resolution and calculation.
 *
 * Binding: FINANCE_ENGINE_ARCHITECTURE.md §3 (hierarchy Shop > Category >
 * Global, snapshot at order time, ML-05 cap 10–50% default 50%, rate 0–50).
 *
 * commission = itemTotal × rate / 100, rounded to 2 dp, capped at the
 * configured per-order maximum. Rules are never applied retroactively —
 * the snapshot taken at order confirmation is what sticks.
 */

import { percentOf, toPaise, type Paise } from '@nabome/payment';

import { CommissionScope } from './enums';

/** Rate as a percentage (e.g. 15 = 15%). Bounds per ML-05/FINANCE §3.6. */
export type CommissionRateValue = number;

export interface CommissionRule {
  id: string;
  scope: CommissionScope;
  /** Scope target: shop id, category id, or null for platform/global. */
  scopeId: string | null;
  rate: CommissionRateValue;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface CommissionInput {
  /** Snapshot rules for the order's shop (highest priority). */
  shopRule: CommissionRule | null;
  /** Snapshot rule for the product's category. */
  categoryRule: CommissionRule | null;
  /** Global default rule (lowest priority). */
  platformRule: CommissionRule | null;
}

export interface CommissionResult {
  rate: number;
  /** Order-item total the commission is computed on (paise). */
  baseAmount: Paise;
  commissionAmount: Paise;
  /** Per-order max cap applied (paise); null when not configured. */
  capApplied: Paise | null;
  /** Which rule won (for transparency + audit — FINANCE §3.4). */
  ruleUsed: { scope: CommissionScope; id: string | null };
}

/** Resolve the effective rule: shop > category > platform (FINANCE §3.5). */
export function resolveCommissionRule(
  input: CommissionInput,
): CommissionRule | null {
  if (input.shopRule) return input.shopRule;
  if (input.categoryRule) return input.categoryRule;
  return input.platformRule;
}

/**
 * Validate a commission rate (FINANCE §3.6, ML-05): 0 ≤ rate ≤ 50.
 * Returns error message or null. Throwing happens at the API boundary
 * (COMMISSION_INVALID 422).
 */
export function validateCommissionRate(
  rate: number,
  maxCap: number = 50,
): string | null {
  if (!Number.isFinite(rate)) return 'Commission rate must be a finite number';
  if (rate < 0) return 'Commission rate cannot be negative';
  if (rate > maxCap) return `Commission rate exceeds maximum cap (${maxCap}%)`;
  return null;
}

/**
 * Calculate commission for an order-item line total (FINANCE §3.10):
 * commission = itemTotal × rate / 100 (2 dp), capped at maxCommissionPerOrder.
 */
export function calculateCommission(
  itemTotalPaise: Paise | number,
  rate: number,
  maxCommissionPerOrderPaise: Paise | null,
): { commissionAmount: Paise; capApplied: Paise | null } {
  const amount = percentOf(itemTotalPaise, rate);
  if (
    maxCommissionPerOrderPaise !== null &&
    amount > Number(maxCommissionPerOrderPaise)
  ) {
    return {
      commissionAmount: maxCommissionPerOrderPaise,
      capApplied: maxCommissionPerOrderPaise,
    };
  }
  return { commissionAmount: amount, capApplied: null };
}

/** Convenience: full resolution + calculation in one step. */
export function computeCommission(
  itemTotalPaise: Paise | number,
  input: CommissionInput,
  maxCommissionPerOrderPaise: Paise | null,
): CommissionResult {
  const rule = resolveCommissionRule(input);
  const rate = rule?.rate ?? 0;
  const { commissionAmount, capApplied } = calculateCommission(
    itemTotalPaise,
    rate,
    maxCommissionPerOrderPaise,
  );
  return {
    rate,
    baseAmount: toPaise(itemTotalPaise),
    commissionAmount,
    capApplied,
    ruleUsed: rule
      ? { scope: rule.scope, id: rule.scopeId }
      : { scope: CommissionScope.PLATFORM, id: null },
  };
}
