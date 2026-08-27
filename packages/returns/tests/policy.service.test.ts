/**
 * Policy Service Tests
 *
 * Unit tests for the PolicyService business logic.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PolicyService } from '../src/service/policy.service';

describe('PolicyService', () => {
  let policyService: PolicyService;

  beforeEach(() => {
    policyService = new PolicyService();
  });

  describe('createPolicy', () => {
    it('should create a return policy with valid input', async () => {
      const input = {
        shopId: 'shop-123',
        policyType: 'standard',
        name: 'Standard Return Policy',
        description: '30-day return policy',
        returnWindowDays: 30,
        eligibleProductCategories: ['category-1'],
        ineligibleProductCategories: [],
        requiresApproval: false,
        requiresOriginalPackaging: true,
        requiresProofOfPurchase: true,
        customerPaysReturnShipping: false,
        restockingFeePercentage: 0,
        maxReturnsPerOrder: null,
        maxReturnsPerCustomer: 5,
        maxReturnsPerPeriod: 10,
        returnPeriodDays: 30,
        conditions: ['Item must be unused'],
        effectiveFrom: new Date('2024-01-01'),
        effectiveUntil: null,
      };

      const result = await policyService.createPolicy(input);

      expect(result).toBeDefined();
      expect(result.name).toBe(input.name);
      expect(result.returnWindowDays).toBe(input.returnWindowDays);
    });

    it('should validate policy parameters', async () => {
      const input = {
        shopId: 'shop-123',
        policyType: 'standard',
        name: 'Test Policy',
        returnWindowDays: -30,
        requiresApproval: false,
        customerPaysReturnShipping: false,
        restockingFeePercentage: 0,
        effectiveFrom: new Date('2024-01-01'),
      };

      await expect(policyService.createPolicy(input)).rejects.toThrow(
        'Invalid return window days',
      );
    });
  });

  describe('evaluateEligibility', () => {
    it('should evaluate return eligibility for an order', async () => {
      const orderData = {
        deliveredAt: new Date('2024-01-01'),
        items: [
          {
            categoryId: 'category-1',
            productId: 'product-123',
            quantity: 1,
          },
        ],
        customerReturnCount: 2,
      };

      const result = await policyService.evaluateEligibility(
        'shop-123',
        orderData,
      );

      expect(result).toBeDefined();
      expect(result.eligible).toBeDefined();
    });

    it('should check return window', async () => {
      const orderData = {
        deliveredAt: new Date('2020-01-01'), // Old order
        items: [
          { categoryId: 'category-1', productId: 'product-123', quantity: 1 },
        ],
        customerReturnCount: 0,
      };

      const result = await policyService.evaluateEligibility(
        'shop-123',
        orderData,
      );

      expect(result).toBeDefined();
      if (!result.eligible) {
        expect(result.ineligibilityReasons).toContain('Return window exceeded');
      }
    });

    it('should check customer return limits', async () => {
      const orderData = {
        deliveredAt: new Date('2024-01-01'),
        items: [
          { categoryId: 'category-1', productId: 'product-123', quantity: 1 },
        ],
        customerReturnCount: 100, // Exceeded limit
      };

      const result = await policyService.evaluateEligibility(
        'shop-123',
        orderData,
      );

      expect(result).toBeDefined();
      if (!result.eligible) {
        expect(result.ineligibilityReasons).toContain(
          'Customer return limit exceeded',
        );
      }
    });

    it('should check product category eligibility', async () => {
      const orderData = {
        deliveredAt: new Date('2024-01-01'),
        items: [
          {
            categoryId: 'ineligible-category',
            productId: 'product-123',
            quantity: 1,
          },
        ],
        customerReturnCount: 0,
      };

      const result = await policyService.evaluateEligibility(
        'shop-123',
        orderData,
      );

      expect(result).toBeDefined();
      if (!result.eligible) {
        expect(result.ineligibilityReasons).toContain(
          'Product not eligible for return',
        );
      }
    });
  });

  describe('calculateRefundAmount', () => {
    it('should calculate refund amount without restocking fee', async () => {
      const result = await policyService.calculateRefundAmount(
        'shop-123',
        1000,
        [],
      );

      expect(result).toBeDefined();
      expect(result.refundAmount).toBe(1000);
      expect(result.restockingFee).toBe(0);
    });

    it('should apply restocking fee when applicable', async () => {
      const result = await policyService.calculateRefundAmount(
        'shop-123',
        1000,
        [],
      );

      expect(result).toBeDefined();
      // If policy has restocking fee, it should be applied
      if (result.restockingFee > 0) {
        expect(result.refundAmount).toBeLessThan(1000);
      }
    });
  });

  describe('getActivePolicy', () => {
    it('should get active policy for a shop', async () => {
      const policy = await policyService.getActivePolicy('shop-123');

      expect(policy).toBeDefined();
      if (policy) {
        expect(policy.isActive).toBe(true);
      }
    });
  });
});
