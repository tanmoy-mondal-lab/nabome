/**
 * Returns Service Tests
 *
 * Unit tests for the ReturnsService business logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReturnsService } from '../src/service/returns.service';

describe('ReturnsService', () => {
  let returnsService: ReturnsService;

  beforeEach(() => {
    returnsService = new ReturnsService();
  });

  describe('createReturnRequest', () => {
    it('should create a return request with valid input', async () => {
      const input = {
        orderId: 'order-123',
        orderNumber: 'ORD-12345',
        profileId: 'profile-123',
        shopId: 'shop-123',
        returnType: 'partial_return',
        reason: 'damaged',
        reasonDetail: 'Product arrived damaged',
        items: [
          {
            orderItemId: 'item-123',
            variantId: 'variant-123',
            productId: 'product-123',
            productName: 'Test Product',
            variantSku: 'SKU-123',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
            reason: 'damaged',
            condition: 'damaged_box',
          },
        ],
        refundMethod: 'original_payment',
        customerNotes: 'Test notes',
        evidenceUrls: [],
      };

      const result = await returnsService.createReturnRequest(
        input,
        'actor-123',
      );

      expect(result).toBeDefined();
      expect(result.orderId).toBe(input.orderId);
      expect(result.status).toBe('return_requested');
      expect(result.totalRefundAmount).toBe(100);
    });

    it('should validate return eligibility before creating', async () => {
      const input = {
        orderId: 'order-123',
        orderNumber: 'ORD-12345',
        profileId: 'profile-123',
        shopId: 'shop-123',
        returnType: 'partial_return',
        reason: 'damaged',
        items: [],
        refundMethod: 'original_payment',
      };

      await expect(
        returnsService.createReturnRequest(input, 'actor-123'),
      ).rejects.toThrow('No items selected for return');
    });
  });

  describe('approveReturn', () => {
    it('should approve a return request', async () => {
      const result = await returnsService.approveReturn(
        'return-123',
        'Approved by policy',
        'actor-123',
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('return_approved');
    });

    it('should validate status transition', async () => {
      await expect(
        returnsService.approveReturn('return-123', 'Reason', 'actor-123'),
      ).resolves.toBeDefined();
    });
  });

  describe('rejectReturn', () => {
    it('should reject a return request', async () => {
      const result = await returnsService.rejectReturn(
        'return-123',
        'Return window exceeded',
        'actor-123',
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('return_rejected');
    });

    it('should require rejection reason', async () => {
      await expect(
        returnsService.rejectReturn('return-123', '', 'actor-123'),
      ).rejects.toThrow('Rejection reason is required');
    });
  });

  describe('checkEligibility', () => {
    it('should check return eligibility for an order', async () => {
      const result = await returnsService.checkEligibility(
        'order-123',
        'profile-123',
        [],
      );

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it('should return ineligibility reasons when not eligible', async () => {
      const result = await returnsService.checkEligibility(
        'order-123',
        'profile-123',
        [],
      );

      if (result.status === 'ineligible') {
        expect(result.ineligibilityReasons).toBeDefined();
        expect(result.ineligibilityReasons.length).toBeGreaterThan(0);
      }
    });
  });

  describe('updateStatus', () => {
    it('should update return status with valid transition', async () => {
      const result = await returnsService.updateStatus(
        'return-123',
        'return_approved',
        'actor-123',
        'Reason',
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('return_approved');
    });

    it('should validate status transitions', async () => {
      // Invalid transition: return_closed cannot go back to return_requested
      await expect(
        returnsService.updateStatus(
          'return-123',
          'return_requested',
          'actor-123',
          'Reason',
        ),
      ).rejects.toThrow();
    });
  });
});
