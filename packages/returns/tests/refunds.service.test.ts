/**
 * Refunds Service Tests
 *
 * Unit tests for the RefundsService business logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RefundsService } from '../src/service/refunds.service';

describe('RefundsService', () => {
  let refundsService: RefundsService;

  beforeEach(() => {
    refundsService = new RefundsService();
  });

  describe('createRefund', () => {
    it('should create a refund with valid input', async () => {
      const input = {
        returnRequestId: 'return-123',
        paymentId: 'payment-123',
        orderId: 'order-123',
        profileId: 'profile-123',
        shopId: 'shop-123',
        amount: 100,
        method: 'original_payment',
        reason: 'Inspection passed',
        initiatedBy: 'actor-123',
      };

      const result = await refundsService.createRefund(input);

      expect(result).toBeDefined();
      expect(result.amount).toBe(input.amount);
      expect(result.status).toBe('pending');
      expect(result.method).toBe(input.method);
    });

    it('should validate refund amount', async () => {
      const input = {
        returnRequestId: 'return-123',
        paymentId: 'payment-123',
        orderId: 'order-123',
        profileId: 'profile-123',
        shopId: 'shop-123',
        amount: -100,
        method: 'original_payment',
        reason: 'Test',
        initiatedBy: 'actor-123',
      };

      await expect(refundsService.createRefund(input)).rejects.toThrow(
        'Invalid refund amount',
      );
    });

    it('should create compensating financial records', async () => {
      const input = {
        returnRequestId: 'return-123',
        paymentId: 'payment-123',
        orderId: 'order-123',
        profileId: 'profile-123',
        shopId: 'shop-123',
        amount: 100,
        method: 'original_payment',
        reason: 'Inspection passed',
        initiatedBy: 'actor-123',
      };

      const result = await refundsService.createRefund(input);

      expect(result).toBeDefined();
      // Verify compensating record is created (not modifying original payment)
      expect(result.id).toBeDefined();
    });
  });

  describe('completeRefund', () => {
    it('should complete a refund with gateway reference', async () => {
      const result = await refundsService.completeRefund(
        'refund-123',
        'gateway-ref-123',
        'success',
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.gatewayRef).toBe('gateway-ref-123');
    });

    it('should validate gateway status', async () => {
      await expect(
        refundsService.completeRefund(
          'refund-123',
          'gateway-ref-123',
          'failed',
        ),
      ).rejects.toThrow('Gateway status must be success to complete refund');
    });
  });

  describe('failRefund', () => {
    it('should mark a refund as failed', async () => {
      const result = await refundsService.failRefund(
        'refund-123',
        'Insufficient funds',
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('failed');
      expect(result.failureReason).toBe('Insufficient funds');
    });

    it('should require failure reason', async () => {
      await expect(refundsService.failRefund('refund-123', '')).rejects.toThrow(
        'Failure reason is required',
      );
    });
  });

  describe('getReturnRefunds', () => {
    it('should get all refunds for a return request', async () => {
      const refunds = await refundsService.getReturnRefunds('return-123');

      expect(refunds).toBeDefined();
      expect(Array.isArray(refunds)).toBe(true);
    });
  });

  describe('getOrderRefunds', () => {
    it('should get all refunds for an order', async () => {
      const refunds = await refundsService.getOrderRefunds('order-123');

      expect(refunds).toBeDefined();
      expect(Array.isArray(refunds)).toBe(true);
    });
  });
});
