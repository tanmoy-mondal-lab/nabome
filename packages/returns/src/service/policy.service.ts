/**
 * Policy Service - Business Logic Layer
 *
 * This service handles return policy evaluation and eligibility checks.
 * All policy-driven logic for return eligibility belongs here.
 */

import { policiesRepository } from '../repository';
import { ReturnPolicyInput, ReturnPolicy } from '../types';
import { ReturnEligibilityStatus, ReturnIneligibilityReason } from '../enums';

export class PolicyService {
  /**
   * Create a new return policy
   */
  async createPolicy(input: ReturnPolicyInput): Promise<ReturnPolicy> {
    return await policiesRepository.createPolicy(input);
  }

  /**
   * Update return policy
   */
  async updatePolicy(
    policyId: string,
    input: Partial<ReturnPolicyInput>,
  ): Promise<ReturnPolicy> {
    return await policiesRepository.updatePolicy(policyId, input);
  }

  /**
   * Deactivate return policy
   */
  async deactivatePolicy(policyId: string): Promise<ReturnPolicy> {
    return await policiesRepository.deactivatePolicy(policyId);
  }

  /**
   * Get active policy for a shop
   */
  async getActivePolicy(shopId: string): Promise<ReturnPolicy | null> {
    return await policiesRepository.findActiveByShopId(shopId);
  }

  /**
   * Get policy by ID
   */
  async getPolicy(policyId: string): Promise<ReturnPolicy | null> {
    return await policiesRepository.findById(policyId);
  }

  /**
   * Get all policies for a shop
   */
  async getShopPolicies(shopId: string): Promise<ReturnPolicy[]> {
    return await policiesRepository.findByShopId(shopId);
  }

  /**
   * Evaluate return eligibility for an order
   */
  async evaluateEligibility(
    shopId: string,
    orderData: {
      deliveredAt: Date;
      items: Array<{
        categoryId?: string;
        productId: string;
        quantity: number;
      }>;
      customerReturnCount?: number;
    },
  ): Promise<{
    status: ReturnEligibilityStatus;
    ineligibilityReasons: ReturnIneligibilityReason[];
    returnWindowEndsAt?: Date;
    requiresApproval: boolean;
  }> {
    const policy = await this.getActivePolicy(shopId);

    if (!policy) {
      return {
        status: ReturnEligibilityStatus.INELIGIBLE,
        ineligibilityReasons: [ReturnIneligibilityReason.PRODUCT_NOT_ELIGIBLE],
        requiresApproval: false,
      };
    }

    const ineligibilityReasons: ReturnIneligibilityReason[] = [];

    // Check return window
    const returnWindowEndsAt = new Date(orderData.deliveredAt);
    returnWindowEndsAt.setDate(
      returnWindowEndsAt.getDate() + policy.returnWindowDays,
    );

    if (new Date() > returnWindowEndsAt) {
      ineligibilityReasons.push(
        ReturnIneligibilityReason.EXCEEDED_RETURN_WINDOW,
      );
    }

    // Check customer return limits
    if (policy.maxReturnsPerCustomer && orderData.customerReturnCount) {
      if (orderData.customerReturnCount >= policy.maxReturnsPerCustomer) {
        ineligibilityReasons.push(
          ReturnIneligibilityReason.RETURN_LIMIT_EXCEEDED,
        );
      }
    }

    // Check product category eligibility
    for (const item of orderData.items) {
      if (item.categoryId) {
        const categoryCheck = await policiesRepository.isCategoryEligible(
          shopId,
          item.categoryId,
        );
        if (!categoryCheck.eligible) {
          ineligibilityReasons.push(
            ReturnIneligibilityReason.PRODUCT_NOT_ELIGIBLE,
          );
        }
      }
    }

    // Determine overall status
    let status: ReturnEligibilityStatus;
    if (ineligibilityReasons.length === 0) {
      status = policy.requiresApproval
        ? ReturnEligibilityStatus.REQUIRES_APPROVAL
        : ReturnEligibilityStatus.ELIGIBLE;
    } else {
      status = ReturnEligibilityStatus.INELIGIBLE;
    }

    return {
      status,
      ineligibilityReasons,
      returnWindowEndsAt,
      requiresApproval: policy.requiresApproval,
    };
  }

  /**
   * Check if a specific item is eligible for return
   */
  async isItemEligible(
    shopId: string,
    categoryId?: string,
    deliveryDate?: Date,
  ): Promise<{
    eligible: boolean;
    reason?: string;
    returnWindowEndsAt?: Date;
  }> {
    const policy = await this.getActivePolicy(shopId);

    if (!policy) {
      return { eligible: false, reason: 'No active return policy' };
    }

    // Check category eligibility
    if (categoryId) {
      const categoryCheck = await policiesRepository.isCategoryEligible(
        shopId,
        categoryId,
      );
      if (!categoryCheck.eligible) {
        return { eligible: false, reason: categoryCheck.reason };
      }
    }

    // Check return window
    if (deliveryDate) {
      const returnWindowEndsAt = new Date(deliveryDate);
      returnWindowEndsAt.setDate(
        returnWindowEndsAt.getDate() + policy.returnWindowDays,
      );

      if (new Date() > returnWindowEndsAt) {
        return {
          eligible: false,
          reason: 'Return window expired',
          returnWindowEndsAt,
        };
      }

      return { eligible: true, returnWindowEndsAt };
    }

    return { eligible: true };
  }

  /**
   * Calculate refund amount considering policy rules
   */
  calculateRefundAmount(
    itemsTotal: number,
    policy?: ReturnPolicy,
    refundShipping: boolean = false,
    shippingAmount: number = 0,
  ): {
    refundAmount: number;
    restockingFee: number;
    shippingRefund: number;
  } {
    let refundAmount = itemsTotal;
    let restockingFee = 0;
    let shippingRefund = 0;

    // Apply restocking fee if applicable
    if (
      policy &&
      policy.restockingFeePercentage &&
      policy.restockingFeePercentage > 0
    ) {
      restockingFee = (itemsTotal * policy.restockingFeePercentage) / 100;
      refundAmount -= restockingFee;
    }

    // Add shipping refund if applicable and customer doesn't pay return shipping
    if (refundShipping && (!policy || !policy.customerPaysReturnShipping)) {
      shippingRefund = shippingAmount;
      refundAmount += shippingRefund;
    }

    return {
      refundAmount: Math.max(0, refundAmount),
      restockingFee,
      shippingRefund,
    };
  }

  /**
   * Get applicable policy for a specific date
   */
  async getApplicablePolicy(
    shopId: string,
    date: Date = new Date(),
  ): Promise<ReturnPolicy | null> {
    return await policiesRepository.getApplicablePolicy(shopId, date);
  }
}

export const policyService = new PolicyService();
