/**
 * Financial Ledger — Immutable ledger entries for payment, refund, settlement, adjustment, fee, tax
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §9 (Financial Ledger),
 * FINANCE_ENGINE_ARCHITECTURE.md §5 (Financial Records),
 * DATABASE_ARCHITECTURE.md §4.9 (Finance & Order Integrity)
 *
 * This module provides the core financial ledger logic:
 * - Immutable ledger entry creation
 * - Double-entry bookkeeping
 * - Account balance tracking
 * - Ledger reconciliation
 * - Financial audit trail
 */

import { add, subtract, fromPaise } from './money';

/**
 * Ledger account types (canonical chart of accounts)
 * Binding: DATABASE §4.9.2
 */
export enum LedgerAccount {
  SELLER_PAYABLE = 'seller_payable', // Amount owed to sellers
  COMMISSION_INCOME = 'commission_income', // Platform commission revenue
  CASH = 'cash', // Platform cash balance
  REFUNDS = 'refunds', // Refund liability
  GATEWAY_FEES = 'gateway_fees', // Gateway fee expense
  COD_PAYABLE = 'cod_payable', // COD collection liability
  SHIPPING_INCOME = 'shipping_income', // Shipping fee revenue
  ADJUSTMENTS = 'adjustments', // Manual adjustments
}

/**
 * Ledger entry types
 */
export enum LedgerEntryType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  SETTLEMENT = 'settlement',
  COMMISSION = 'commission',
  FEE = 'fee',
  TAX = 'tax',
  ADJUSTMENT = 'adjustment',
  COD_COLLECTION = 'cod_collection',
  SHIPPING_FEE = 'shipping_fee',
}

/**
 * Ledger entry sides (double-entry bookkeeping)
 */
export enum LedgerSide {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

/**
 * Immutable ledger entry
 */
export interface LedgerEntry {
  id: string;
  financeRecordId: string;
  account: LedgerAccount;
  side: LedgerSide;
  amountPaise: number;
  currency: string;
  description: string;
  referenceType?: string; // 'payment', 'refund', 'settlement', etc.
  referenceId?: string; // ID of the referenced entity
  createdAt: Date;
}

/**
 * Finance record (grouping of ledger entries)
 */
export interface FinanceRecord {
  id: string;
  type: LedgerEntryType;
  status: 'pending' | 'posted' | 'reversed';
  amountPaise: number;
  currency: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  postedAt?: Date;
}

/**
 * Account balance
 */
export interface AccountBalance {
  account: LedgerAccount;
  balancePaise: number;
  currency: string;
  lastUpdatedAt: Date;
}

/**
 * Ledger reconciliation result
 */
export interface ReconciliationResult {
  balanced: boolean;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  entries: LedgerEntry[];
}

/**
 * Ledger Engine class
 */
export class LedgerEngine {
  private entries: Map<string, LedgerEntry> = new Map();
  private records: Map<string, FinanceRecord> = new Map();
  private balances: Map<LedgerAccount, AccountBalance> = new Map();

  /**
   * Create a finance record (grouping header for ledger entries)
   */
  createFinanceRecord(
    type: LedgerEntryType,
    amountPaise: number,
    currency: string,
    description: string,
    referenceType?: string,
    referenceId?: string,
    metadata?: Record<string, unknown>,
  ): FinanceRecord {
    const record: FinanceRecord = {
      id: this.generateId(),
      type,
      status: 'pending',
      amountPaise,
      currency,
      description,
      referenceType,
      referenceId,
      metadata,
      createdAt: new Date(),
    };

    this.records.set(record.id, record);
    return record;
  }

  /**
   * Create a ledger entry (immutable)
   */
  createLedgerEntry(
    financeRecordId: string,
    account: LedgerAccount,
    side: LedgerSide,
    amountPaise: number,
    currency: string,
    description: string,
    referenceType?: string,
    referenceId?: string,
  ): LedgerEntry {
    const entry: LedgerEntry = {
      id: this.generateId(),
      financeRecordId,
      account,
      side,
      amountPaise,
      currency,
      description,
      referenceType,
      referenceId,
      createdAt: new Date(),
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  /**
   * Post a finance record with its ledger entries (double-entry)
   * All entries in a record must sum to zero (debits = credits)
   */
  postFinanceRecord(recordId: string, entries: LedgerEntry[]): boolean {
    const record = this.records.get(recordId);
    if (!record) {
      throw new Error(`Finance record not found: ${recordId}`);
    }

    // Validate double-entry: debits must equal credits
    const totalDebits = entries
      .filter((e) => e.side === LedgerSide.DEBIT)
      .reduce((sum, e) => add(sum, e.amountPaise), 0);
    const totalCredits = entries
      .filter((e) => e.side === LedgerSide.CREDIT)
      .reduce((sum, e) => add(sum, e.amountPaise), 0);

    if (totalDebits !== totalCredits) {
      throw new Error(
        `Double-entry violation: debits (${fromPaise(totalDebits)}) != credits (${fromPaise(totalCredits)})`,
      );
    }

    // Add entries to ledger
    for (const entry of entries) {
      this.entries.set(entry.id, entry);
      this.updateBalance(entry.account, entry.side, entry.amountPaise);
    }

    // Mark record as posted
    record.status = 'posted';
    record.postedAt = new Date();

    return true;
  }

  /**
   * Create a payment entry (double-entry)
   * Debit: Cash, Credit: Seller Payable (minus commission)
   */
  createPaymentEntries(
    financeRecordId: string,
    amountPaise: number,
    commissionPaise: number,
    currency: string,
    paymentId: string,
  ): LedgerEntry[] {
    const netAmount = subtract(amountPaise, commissionPaise);

    const entries: LedgerEntry[] = [
      // Debit cash (platform receives money)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.CASH,
        LedgerSide.DEBIT,
        amountPaise,
        currency,
        `Payment received: ${paymentId}`,
        'payment',
        paymentId,
      ),
      // Credit seller payable (platform owes seller net amount)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.SELLER_PAYABLE,
        LedgerSide.CREDIT,
        netAmount,
        currency,
        `Seller payable for payment: ${paymentId}`,
        'payment',
        paymentId,
      ),
      // Credit commission income (platform keeps commission)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.COMMISSION_INCOME,
        LedgerSide.CREDIT,
        commissionPaise,
        currency,
        `Commission on payment: ${paymentId}`,
        'payment',
        paymentId,
      ),
    ];

    return entries;
  }

  /**
   * Create a refund entry (double-entry)
   * Debit: Refunds, Credit: Cash
   */
  createRefundEntries(
    financeRecordId: string,
    amountPaise: number,
    currency: string,
    refundId: string,
    paymentId: string,
  ): LedgerEntry[] {
    const entries: LedgerEntry[] = [
      // Debit refunds (platform owes customer)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.REFUNDS,
        LedgerSide.DEBIT,
        amountPaise,
        currency,
        `Refund for payment: ${paymentId}`,
        'refund',
        refundId,
      ),
      // Credit cash (platform pays out)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.CASH,
        LedgerSide.CREDIT,
        amountPaise,
        currency,
        `Refund payout: ${refundId}`,
        'refund',
        refundId,
      ),
    ];

    return entries;
  }

  /**
   * Create a settlement entry (double-entry)
   * Debit: Seller Payable, Credit: Cash
   */
  createSettlementEntries(
    financeRecordId: string,
    amountPaise: number,
    currency: string,
    settlementId: string,
    shopId: string,
  ): LedgerEntry[] {
    const entries: LedgerEntry[] = [
      // Debit seller payable (platform pays seller)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.SELLER_PAYABLE,
        LedgerSide.DEBIT,
        amountPaise,
        currency,
        `Settlement for shop: ${shopId}`,
        'settlement',
        settlementId,
      ),
      // Credit cash (platform pays out)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.CASH,
        LedgerSide.CREDIT,
        amountPaise,
        currency,
        `Settlement payout: ${settlementId}`,
        'settlement',
        settlementId,
      ),
    ];

    return entries;
  }

  /**
   * Create a gateway fee entry (double-entry)
   * Debit: Gateway Fees, Credit: Cash
   */
  createGatewayFeeEntries(
    financeRecordId: string,
    amountPaise: number,
    currency: string,
    paymentId: string,
  ): LedgerEntry[] {
    const entries: LedgerEntry[] = [
      // Debit gateway fees (platform expense)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.GATEWAY_FEES,
        LedgerSide.DEBIT,
        amountPaise,
        currency,
        `Gateway fee for payment: ${paymentId}`,
        'fee',
        paymentId,
      ),
      // Credit cash (platform pays gateway)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.CASH,
        LedgerSide.CREDIT,
        amountPaise,
        currency,
        `Gateway fee payout: ${paymentId}`,
        'fee',
        paymentId,
      ),
    ];

    return entries;
  }

  /**
   * Create a COD collection entry (double-entry)
   * Debit: COD Payable, Credit: Cash
   */
  createCodCollectionEntries(
    financeRecordId: string,
    amountPaise: number,
    currency: string,
    orderId: string,
  ): LedgerEntry[] {
    const entries: LedgerEntry[] = [
      // Debit COD payable (courier owes platform)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.COD_PAYABLE,
        LedgerSide.DEBIT,
        amountPaise,
        currency,
        `COD collection for order: ${orderId}`,
        'cod_collection',
        orderId,
      ),
      // Credit cash (platform receives from courier)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.CASH,
        LedgerSide.CREDIT,
        amountPaise,
        currency,
        `COD received for order: ${orderId}`,
        'cod_collection',
        orderId,
      ),
    ];

    return entries;
  }

  /**
   * Create a shipping fee entry (double-entry)
   * Debit: Cash, Credit: Shipping Income
   */
  createShippingFeeEntries(
    financeRecordId: string,
    amountPaise: number,
    currency: string,
    orderId: string,
  ): LedgerEntry[] {
    const entries: LedgerEntry[] = [
      // Debit cash (customer pays shipping)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.CASH,
        LedgerSide.DEBIT,
        amountPaise,
        currency,
        `Shipping fee for order: ${orderId}`,
        'shipping_fee',
        orderId,
      ),
      // Credit shipping income (platform revenue)
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.SHIPPING_INCOME,
        LedgerSide.CREDIT,
        amountPaise,
        currency,
        `Shipping income for order: ${orderId}`,
        'shipping_fee',
        orderId,
      ),
    ];

    return entries;
  }

  /**
   * Create an adjustment entry (double-entry)
   * Debit/Credit: Adjustments, Credit/Debit: appropriate account
   */
  createAdjustmentEntries(
    financeRecordId: string,
    amountPaise: number,
    currency: string,
    description: string,
    targetAccount: LedgerAccount,
    adjustmentId: string,
  ): LedgerEntry[] {
    const entries: LedgerEntry[] = [
      // Debit adjustments
      this.createLedgerEntry(
        financeRecordId,
        LedgerAccount.ADJUSTMENTS,
        LedgerSide.DEBIT,
        amountPaise,
        currency,
        description,
        'adjustment',
        adjustmentId,
      ),
      // Credit target account
      this.createLedgerEntry(
        financeRecordId,
        targetAccount,
        LedgerSide.CREDIT,
        amountPaise,
        currency,
        description,
        'adjustment',
        adjustmentId,
      ),
    ];

    return entries;
  }

  /**
   * Update account balance
   */
  private updateBalance(
    account: LedgerAccount,
    side: LedgerSide,
    amountPaise: number,
  ): void {
    const current = this.balances.get(account) || {
      account,
      balancePaise: 0,
      currency: 'INR',
      lastUpdatedAt: new Date(),
    };

    if (side === LedgerSide.DEBIT) {
      current.balancePaise = add(current.balancePaise, amountPaise);
    } else {
      current.balancePaise = subtract(current.balancePaise, amountPaise);
    }

    current.lastUpdatedAt = new Date();
    this.balances.set(account, current);
  }

  /**
   * Get account balance
   */
  getBalance(account: LedgerAccount): AccountBalance | null {
    return (
      this.balances.get(account) || {
        account,
        balancePaise: 0,
        currency: 'INR',
        lastUpdatedAt: new Date(),
      }
    );
  }

  /**
   * Get all account balances
   */
  getAllBalances(): AccountBalance[] {
    return Array.from(this.balances.values());
  }

  /**
   * Reconcile ledger entries for a finance record
   */
  reconcileFinanceRecord(recordId: string): ReconciliationResult {
    const entries = Array.from(this.entries.values()).filter(
      (e) => e.financeRecordId === recordId,
    );

    const totalDebits = entries
      .filter((e) => e.side === LedgerSide.DEBIT)
      .reduce((sum, e) => add(sum, e.amountPaise), 0);
    const totalCredits = entries
      .filter((e) => e.side === LedgerSide.CREDIT)
      .reduce((sum, e) => add(sum, e.amountPaise), 0);
    const difference = subtract(totalDebits, totalCredits);

    return {
      balanced: difference === 0,
      totalDebits,
      totalCredits,
      difference,
      entries,
    };
  }

  /**
   * Get ledger entries by reference
   */
  getEntriesByReference(
    referenceType: string,
    referenceId: string,
  ): LedgerEntry[] {
    return Array.from(this.entries.values()).filter(
      (e) => e.referenceType === referenceType && e.referenceId === referenceId,
    );
  }

  /**
   * Get finance record by ID
   */
  getFinanceRecord(recordId: string): FinanceRecord | null {
    return this.records.get(recordId) || null;
  }

  /**
   * Get ledger entry by ID
   */
  getLedgerEntry(entryId: string): LedgerEntry | null {
    return this.entries.get(entryId) || null;
  }

  /**
   * Reverse a finance record (create reversal entries)
   */
  reverseFinanceRecord(recordId: string, reason: string): boolean {
    const record = this.records.get(recordId);
    if (!record || record.status !== 'posted') {
      throw new Error(
        `Cannot reverse unposted or non-existent record: ${recordId}`,
      );
    }

    // Create reversal record
    const reversalRecord = this.createFinanceRecord(
      LedgerEntryType.ADJUSTMENT,
      record.amountPaise,
      record.currency,
      `Reversal: ${reason}`,
      'reversal',
      recordId,
    );

    // Get original entries and create reversal entries (swap debit/credit)
    const originalEntries = Array.from(this.entries.values()).filter(
      (e) => e.financeRecordId === recordId,
    );
    const reversalEntries = originalEntries.map((entry) =>
      this.createLedgerEntry(
        reversalRecord.id,
        entry.account,
        entry.side === LedgerSide.DEBIT ? LedgerSide.CREDIT : LedgerSide.DEBIT,
        entry.amountPaise,
        entry.currency,
        `Reversal: ${entry.description}`,
        entry.referenceType,
        entry.referenceId,
      ),
    );

    // Post reversal
    this.postFinanceRecord(reversalRecord.id, reversalEntries);

    // Mark original as reversed
    record.status = 'reversed';

    return true;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `LED-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Ledger factory for creating configured ledger engines
 */
export function createLedgerEngine(): LedgerEngine {
  return new LedgerEngine();
}
