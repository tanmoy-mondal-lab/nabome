/**
 * Settlement Engine Tests
 *
 * Tests for settlement calculation, eligibility, state transitions, commission, tax, and payout processing.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { SettlementEngine } from '../settlement';

describe('SettlementEngine', () => {
  let settlementEngine: SettlementEngine;

  beforeEach(() => {
    settlementEngine = new SettlementEngine({
      shopId: 'shop-123',
      commissionRate: 15, // 15%
      taxRate: 18, // 18% GST
      platformFeeRate: 2, // 2%
      holdDays: 7,
      minSettlementAmount: 10000, // INR 100 in paise
    });
  });

  describe('calculateSettlement', () => {
    it('should calculate settlement correctly with commission and tax', () => {
      const payments = [
        {
          orderId: 'order1',
          paymentId: 'pay1',
          amount: 1000000, // INR 10000 in paise
          refundAmount: 0,
          commissionRate: 15,
          taxRate: 18,
          platformFeeRate: 2,
        },
        {
          orderId: 'order2',
          paymentId: 'pay2',
          amount: 500000, // INR 5000 in paise
          refundAmount: 0,
          commissionRate: 15,
          taxRate: 18,
          platformFeeRate: 2,
        },
      ];

      const result = settlementEngine.calculateSettlement(payments);

      expect(result.totalAmount).toBe(1500000); // INR 15000 in paise
      expect(result.commissionAmount).toBe(225000); // 15% of 15000
      expect(result.taxAmount).toBe(40500); // 18% of 225000
      expect(result.platformFeeAmount).toBe(30000); // 2% of 15000
      expect(result.netAmount).toBe(1204500); // 15000 - 2250 - 405 - 300 = 12045 in paise
    });

    it('should handle zero payments', () => {
      const result = settlementEngine.calculateSettlement([]);

      expect(result.totalAmount).toBe(0);
      expect(result.commissionAmount).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.platformFeeAmount).toBe(0);
      expect(result.netAmount).toBe(0);
    });

    it('should handle single payment', () => {
      const payments = [
        {
          orderId: 'order1',
          paymentId: 'pay1',
          amount: 1000000, // INR 10000 in paise
          refundAmount: 0,
          commissionRate: 15,
          taxRate: 18,
          platformFeeRate: 2,
        },
      ];

      const result = settlementEngine.calculateSettlement(payments);

      expect(result.totalAmount).toBe(1000000);
      expect(result.commissionAmount).toBe(150000); // 15% of 10000
      expect(result.taxAmount).toBe(27000); // 18% of 150000
      expect(result.platformFeeAmount).toBe(20000); // 2% of 10000
      expect(result.netAmount).toBe(803000); // 10000 - 1500 - 270 - 200 = 8030 in paise
    });
  });

  describe('checkSettlementEligibility', () => {
    it('should return eligible when amount meets minimum', () => {
      const result = settlementEngine.checkSettlementEligibility(100000); // INR 1000 in paise

      expect(result.eligible).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return ineligible when amount below minimum', () => {
      const result = settlementEngine.checkSettlementEligibility(5000); // INR 50 in paise

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('below minimum');
    });

    it('should return eligible when amount exactly equals minimum', () => {
      const result = settlementEngine.checkSettlementEligibility(10000); // INR 100 in paise

      expect(result.eligible).toBe(true);
    });
  });

  describe('calculateCommission', () => {
    it('should calculate commission correctly', () => {
      const result = settlementEngine.calculateCommission(1000000, 'platform');

      expect(result).toBe(20000); // 2% of 10000 in paise
    });

    it('should handle zero amount', () => {
      const result = settlementEngine.calculateCommission(0, 'platform');

      expect(result).toBe(0);
    });

    it('should handle small amounts', () => {
      const result = settlementEngine.calculateCommission(10000, 'platform');

      expect(result).toBe(200); // 2% of 100 in paise
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      const result = settlementEngine.calculateTax(975000, 'IN'); // INR 9750 in paise

      expect(result).toBe(175500); // 18% of 9750 in paise
    });

    it('should handle zero amount', () => {
      const result = settlementEngine.calculateTax(0, 'IN');

      expect(result).toBe(0);
    });
  });

  describe('generateSettlementNumber', () => {
    it('should generate unique settlement numbers', () => {
      const number1 = settlementEngine.generateSettlementNumber();
      const number2 = settlementEngine.generateSettlementNumber();

      expect(number1).not.toBe(number2);
      expect(number1).toMatch(/^NAB-STL-\d{8}-[A-Z0-9]{4}$/);
      expect(number2).toMatch(/^NAB-STL-\d{8}-[A-Z0-9]{4}$/);
    });
  });
});
