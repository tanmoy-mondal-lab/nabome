/**
 * Financial Ledger Tests
 *
 * Tests for immutable ledger entries, double-entry bookkeeping, account balance tracking, and reconciliation.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  LedgerEngine,
  LedgerAccount,
  LedgerSide,
  LedgerEntryType,
} from '../ledger';

describe('LedgerEngine', () => {
  let ledgerEngine: LedgerEngine;

  beforeEach(() => {
    ledgerEngine = new LedgerEngine();
  });

  describe('createFinanceRecord', () => {
    it('should create a finance record with correct properties', () => {
      const record = ledgerEngine.createFinanceRecord(
        LedgerEntryType.PAYMENT,
        100000, // INR 1000 in paise
        'INR',
        'Payment for order #123',
        'payment',
        'pay-123',
      );

      expect(record.id).toBeDefined();
      expect(record.type).toBe(LedgerEntryType.PAYMENT);
      expect(record.amountPaise).toBe(100000);
      expect(record.currency).toBe('INR');
      expect(record.description).toBe('Payment for order #123');
      expect(record.referenceType).toBe('payment');
      expect(record.referenceId).toBe('pay-123');
      expect(record.status).toBe('pending');
      expect(record.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('createLedgerEntry', () => {
    it('should create a ledger entry with correct properties', () => {
      const entry = ledgerEngine.createLedgerEntry(
        'fr-123',
        LedgerAccount.CASH,
        LedgerSide.DEBIT,
        100000,
        'INR',
        'Payment received',
        'payment',
        'pay-123',
      );

      expect(entry.id).toBeDefined();
      expect(entry.financeRecordId).toBe('fr-123');
      expect(entry.account).toBe(LedgerAccount.CASH);
      expect(entry.side).toBe(LedgerSide.DEBIT);
      expect(entry.amountPaise).toBe(100000);
      expect(entry.currency).toBe('INR');
      expect(entry.description).toBe('Payment received');
      expect(entry.referenceType).toBe('payment');
      expect(entry.referenceId).toBe('pay-123');
      expect(entry.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('createPaymentEntries', () => {
    it('should create double-entry ledger entries for payment', () => {
      const entries = ledgerEngine.createPaymentEntries(
        'fr-123',
        100000, // INR 1000 in paise
        15000, // INR 150 commission in paise
        'INR',
        'pay-123',
      );

      expect(entries.length).toBeGreaterThanOrEqual(2);
      expect(entries[0]?.account).toBe(LedgerAccount.CASH);
      expect(entries[0]?.side).toBe(LedgerSide.DEBIT);
      expect(entries[0]?.amountPaise).toBe(100000);
      if (entries[1]) {
        expect(entries[1].account).toBe(LedgerAccount.SELLER_PAYABLE);
        expect(entries[1].side).toBe(LedgerSide.CREDIT);
        expect(entries[1].amountPaise).toBe(85000); // 100000 - 15000
      }
    });
  });

  describe('createRefundEntries', () => {
    it('should create double-entry ledger entries for refund', () => {
      const entries = ledgerEngine.createRefundEntries(
        'fr-456',
        50000, // INR 500 in paise
        'INR',
        'refund-123',
        'pay-123',
      );

      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0]?.financeRecordId).toBe('fr-456');
      expect(entries[0]?.amountPaise).toBe(50000);
    });
  });

  describe('createSettlementEntries', () => {
    it('should create double-entry ledger entries for settlement', () => {
      const entries = ledgerEngine.createSettlementEntries(
        'fr-789',
        80000, // INR 800 in paise
        'INR',
        'settlement-123',
        'shop-123',
      );

      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0]?.financeRecordId).toBe('fr-789');
      expect(entries[0]?.amountPaise).toBe(80000);
    });
  });

  describe('postFinanceRecord', () => {
    it('should post finance record and update balances', () => {
      const financeRecord = ledgerEngine.createFinanceRecord(
        LedgerEntryType.PAYMENT,
        100000,
        'INR',
        'Payment for order #123',
        'payment',
        'pay-123',
      );

      const entries = ledgerEngine.createPaymentEntries(
        financeRecord.id,
        100000,
        15000,
        'INR',
        'pay-123',
      );

      const result = ledgerEngine.postFinanceRecord(financeRecord.id, entries);

      expect(result).toBe(true);
      expect(financeRecord.status).toBe('posted');
      expect(financeRecord.postedAt).toBeDefined();
    });

    it('should throw error for non-existent finance record', () => {
      expect(() => {
        ledgerEngine.postFinanceRecord('non-existent', []);
      }).toThrow('Finance record not found');
    });

    it('should throw error for double-entry violation', () => {
      const financeRecord = ledgerEngine.createFinanceRecord(
        LedgerEntryType.PAYMENT,
        100000,
        'INR',
        'Payment for order #123',
        'payment',
        'pay-123',
      );

      const entry1 = ledgerEngine.createLedgerEntry(
        financeRecord.id,
        LedgerAccount.CASH,
        LedgerSide.DEBIT,
        100000,
        'INR',
        'Payment received',
      );

      const entry2 = ledgerEngine.createLedgerEntry(
        financeRecord.id,
        LedgerAccount.SELLER_PAYABLE,
        LedgerSide.CREDIT,
        50000, // Not equal to debit
        'INR',
        'Seller payable',
      );

      expect(() => {
        ledgerEngine.postFinanceRecord(financeRecord.id, [entry1, entry2]);
      }).toThrow('Double-entry violation');
    });
  });

  describe('getBalance', () => {
    it('should return zero balance for non-existent account', () => {
      const balance = ledgerEngine.getBalance(LedgerAccount.CASH);
      expect(balance?.balancePaise).toBe(0);
    });

    it('should return correct balance after posting', () => {
      const financeRecord = ledgerEngine.createFinanceRecord(
        LedgerEntryType.PAYMENT,
        100000,
        'INR',
        'Payment for order #123',
        'payment',
        'pay-123',
      );

      const entries = ledgerEngine.createPaymentEntries(
        financeRecord.id,
        100000,
        15000,
        'INR',
        'pay-123',
      );

      ledgerEngine.postFinanceRecord(financeRecord.id, entries);

      const cashBalance = ledgerEngine.getBalance(LedgerAccount.CASH);
      expect(cashBalance?.balancePaise).toBe(100000);

      const sellerPayableBalance = ledgerEngine.getBalance(
        LedgerAccount.SELLER_PAYABLE,
      );
      expect(sellerPayableBalance?.balancePaise).toBe(-85000); // Credit is negative
    });
  });
});
