/**
 * Double-Entry Ledger — posting builder for immutable finance records.
 *
 * Binding: FINANCE_ENGINE_ARCHITECTURE.md §5, DATABASE_SPECIFICATION.md §4.9.2
 * ("every FinanceRecord's ledger entries sum to zero — append-only").
 *
 * The ledger never processes money; it records facts. Corrections are new
 * records with type=reversal — never edits (FINANCE §5.6, §8.2).
 */

import type { Paise } from '@nabome/payment';

import { LedgerAccount, LedgerSide } from './enums';

export interface LedgerPosting {
  account: LedgerAccount;
  side: LedgerSide;
  amount: Paise;
}

/** Posting templates for canonical events. */

/**
 * Sale proceeds: debit cash (customer paid items + shipping), credit
 * commission income, shipping income, and seller payable (net of commission).
 * Balanced by construction: items + shipping = commission + shipping + (items − commission).
 */
export function salePostings(
  saleAmount: Paise,
  commissionAmount: Paise,
  shippingAmount: Paise = 0 as Paise,
): LedgerPosting[] {
  const sellerPayable = Number(saleAmount) - Number(commissionAmount);
  const postings: LedgerPosting[] = [
    {
      account: LedgerAccount.CASH,
      side: LedgerSide.DEBIT,
      amount: (Number(saleAmount) + Number(shippingAmount)) as Paise,
    },
    {
      account: LedgerAccount.COMMISSION_INCOME,
      side: LedgerSide.CREDIT,
      amount: commissionAmount,
    },
    {
      account: LedgerAccount.SELLER_PAYABLE,
      side: LedgerSide.CREDIT,
      amount: sellerPayable as Paise,
    },
  ];
  if (Number(shippingAmount) > 0) {
    postings.push({
      account: LedgerAccount.SHIPPING_INCOME,
      side: LedgerSide.CREDIT,
      amount: shippingAmount,
    });
  }
  return postings;
}

/** Refund: debit seller payable (or refunds for platform-funded), credit cash. */
export function refundPostings(
  amount: Paise,
  fromSeller: boolean,
): LedgerPosting[] {
  return [
    {
      account: fromSeller
        ? LedgerAccount.SELLER_PAYABLE
        : LedgerAccount.REFUNDS,
      side: LedgerSide.DEBIT,
      amount,
    },
    { account: LedgerAccount.CASH, side: LedgerSide.CREDIT, amount },
  ];
}

/** COD collection: debit cash, credit COD payable (courier remittance). */
export function codCollectionPostings(amount: Paise): LedgerPosting[] {
  return [
    { account: LedgerAccount.CASH, side: LedgerSide.DEBIT, amount },
    { account: LedgerAccount.COD_PAYABLE, side: LedgerSide.CREDIT, amount },
  ];
}

/** COD → seller settlement: debit COD payable, credit seller payable. */
export function codSettlementPostings(amount: Paise): LedgerPosting[] {
  return [
    { account: LedgerAccount.COD_PAYABLE, side: LedgerSide.DEBIT, amount },
    { account: LedgerAccount.SELLER_PAYABLE, side: LedgerSide.CREDIT, amount },
  ];
}

/** Settlement payout: debit seller payable, credit cash. */
export function settlementPayoutPostings(amount: Paise): LedgerPosting[] {
  return [
    { account: LedgerAccount.SELLER_PAYABLE, side: LedgerSide.DEBIT, amount },
    { account: LedgerAccount.CASH, side: LedgerSide.CREDIT, amount },
  ];
}

/** Gateway fee expense: debit gateway fees, credit cash. */
export function gatewayFeePostings(amount: Paise): LedgerPosting[] {
  return [
    { account: LedgerAccount.GATEWAY_FEES, side: LedgerSide.DEBIT, amount },
    { account: LedgerAccount.CASH, side: LedgerSide.CREDIT, amount },
  ];
}

/** Manual adjustment: debit/credit adjustments with balancing cash. */
export function adjustmentPostings(
  amount: Paise,
  creditCash: boolean,
): LedgerPosting[] {
  return [
    {
      account: LedgerAccount.ADJUSTMENTS,
      side: creditCash ? LedgerSide.DEBIT : LedgerSide.CREDIT,
      amount,
    },
    {
      account: LedgerAccount.CASH,
      side: creditCash ? LedgerSide.CREDIT : LedgerSide.DEBIT,
      amount,
    },
  ];
}

/** Reversal: exact mirror of the original postings (append-only correction). */
export function reversePostings(original: LedgerPosting[]): LedgerPosting[] {
  return original.map((p) => ({
    account: p.account,
    side: p.side === LedgerSide.DEBIT ? LedgerSide.CREDIT : LedgerSide.DEBIT,
    amount: p.amount,
  }));
}

/** Balance check — postings sum to zero (invariant, DATABASE §4.9.2). */
export function isBalanced(postings: LedgerPosting[]): boolean {
  const net = postings.reduce(
    (sum, p) =>
      sum +
      (p.side === LedgerSide.DEBIT ? Number(p.amount) : -Number(p.amount)),
    0,
  );
  return net === 0;
}

/**
 * Human record numbers:
 * - Finance record: FIN-YYYYMMDD-###### (DATABASE §4.9.1)
 * - Settlement:     STL-YYYYMMDD-###### (FINANCE §4.9, Document STL report)
 * - Invoice:        INV-YYYY-NNNNNN (canonical — reserved for Document Engine)
 */
export function formatRecordNumber(
  prefix: 'FIN' | 'STL',
  date: Date,
  sequence: number,
): string {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${ymd}-${String(sequence).padStart(6, '0')}`;
}
