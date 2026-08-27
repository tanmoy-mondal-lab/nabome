/**
 * Finance Module Enums
 *
 * Source: FINANCE_ENGINE_ARCHITECTURE.md (binding), DATABASE_SPECIFICATION.md
 * §4.9, MASTER_ARCHITECTURE_BLUEPRINT.md B.4 + resolutions ML-04/05/08/10/11/12.
 * Values mirror the Prisma enums 1:1.
 */

/**
 * Finance record types (binding: DATABASE §4.9.1). Records are append-only
 * facts; corrections are new rows with type=reversal.
 */
export enum FinanceRecordType {
  SALE = 'sale',
  COMMISSION = 'commission',
  HOLD = 'hold',
  RELEASE = 'release',
  SETTLEMENT = 'settlement',
  REFUND = 'refund',
  REVERSAL = 'reversal',
  ADJUSTMENT = 'adjustment',
  COD_COLLECTED = 'cod_collected',
  GATEWAY_FEE = 'gateway_fee',
}

export enum FinanceRecordStatus {
  PENDING = 'pending',
  POSTED = 'posted',
  REVERSED = 'reversed',
}

export enum LedgerSide {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

/** Canonical chart of accounts (binding: DATABASE §4.9.2). */
export enum LedgerAccount {
  SELLER_PAYABLE = 'seller_payable',
  COMMISSION_INCOME = 'commission_income',
  CASH = 'cash',
  REFUNDS = 'refunds',
  GATEWAY_FEES = 'gateway_fees',
  COD_PAYABLE = 'cod_payable',
  SHIPPING_INCOME = 'shipping_income',
  ADJUSTMENTS = 'adjustments',
}

export enum CommissionScope {
  PLATFORM = 'platform',
  SHOP = 'shop',
  CATEGORY = 'category',
}

/**
 * Settlement lifecycle (binding: Blueprint B.4, FINANCE §4.5, ML-09/12):
 * PENDING → ELIGIBLE → CREATED → REVIEW → APPROVED → PROCESSING → COMPLETED → PAID,
 * plus REJECTED → PENDING, FAILED (from PROCESSING), REVERSED (from COMPLETED or PAID).
 */
export enum SettlementStatus {
  PENDING = 'pending',
  ELIGIBLE = 'eligible',
  CREATED = 'created',
  REVIEW = 'review',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PAID = 'paid',
  REJECTED = 'rejected',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export enum PayoutMethod {
  DIGITAL = 'digital',
  MANUAL = 'manual',
}

export enum PayoutStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}
