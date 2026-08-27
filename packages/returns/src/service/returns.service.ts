/**
 * Returns Service - Business Logic Layer
 *
 * This service contains all business logic for return requests.
 * All business rules and validations belong here, not in repositories or controllers.
 */

import { returnsRepository, policiesRepository } from '../repository';
import {
  ReturnRequest,
  CreateReturnRequestInput,
  UpdateReturnStatusInput,
  ReturnEligibilityCheck,
} from '../types';
import { ReturnStatus, ReturnIneligibilityReason, ActorType } from '../enums';

export class ReturnsService {
  /**
   * Check return eligibility for an order
   */
  async checkEligibility(
    orderId: string,
    profileId: string,
    orderItems: Array<{
      orderItemId: string;
      variantId: string;
      productId: string;
      productName: string;
      variantSku: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      categoryId?: string;
    }>,
  ): Promise<ReturnEligibilityCheck> {
    const ineligibilityReasons: ReturnIneligibilityReason[] = [];
    const eligibleItems: any[] = [];
    const ineligibleItems: any[] = [];

    // Get order details (would integrate with Order module)
    // For now, we'll assume order is delivered and eligible for return
    const orderDelivered = true;
    const orderStatus = 'delivered';

    if (!orderDelivered || orderStatus !== 'delivered') {
      ineligibilityReasons.push(ReturnIneligibilityReason.ORDER_NOT_DELIVERED);
    }

    // Check return policy
    // For now, we'll get a default policy
    const policy =
      await policiesRepository.findActiveByShopId('default-shop-id');

    if (!policy) {
      ineligibilityReasons.push(ReturnIneligibilityReason.PRODUCT_NOT_ELIGIBLE);
    }

    // Check each item
    for (const item of orderItems) {
      const itemIneligibilityReasons: ReturnIneligibilityReason[] = [];

      // Check if category is eligible
      if (item.categoryId && policy) {
        const categoryCheck = await policiesRepository.isCategoryEligible(
          'default-shop-id',
          item.categoryId,
        );
        if (!categoryCheck.eligible) {
          itemIneligibilityReasons.push(
            ReturnIneligibilityReason.PRODUCT_NOT_ELIGIBLE,
          );
        }
      }

      // Check return window (would compare with order delivery date)
      const returnWindowEndsAt = new Date();
      returnWindowEndsAt.setDate(
        returnWindowEndsAt.getDate() + (policy?.returnWindowDays || 30),
      );

      if (itemIneligibilityReasons.length === 0) {
        eligibleItems.push({
          ...item,
          returnableQuantity: item.quantity,
          returnWindowEndsAt,
        });
      } else {
        ineligibleItems.push({
          ...item,
          reason: itemIneligibilityReasons[0],
        });
      }
    }

    const status =
      ineligibilityReasons.length === 0 && ineligibleItems.length === 0
        ? ('eligible' as any)
        : eligibleItems.length > 0
          ? ('partially_eligible' as any)
          : ('ineligible' as any);

    return {
      orderId,
      profileId,
      status,
      ineligibilityReasons,
      eligibleItems,
      ineligibleItems,
      returnWindowEndsAt: policy
        ? new Date(Date.now() + policy.returnWindowDays * 24 * 60 * 60 * 1000)
        : undefined,
      policyId: policy?.id,
      policyName: policy?.name,
      requiresApproval: policy?.requiresApproval || false,
      estimatedRefundAmount: eligibleItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      ),
      checkedAt: new Date(),
    };
  }

  /**
   * Create a new return request
   */
  async createReturnRequest(
    input: CreateReturnRequestInput & {
      orderNumber: string;
      profileId: string;
      shopId: string;
    },
    actorId: string,
  ): Promise<ReturnRequest> {
    // Validate eligibility first
    const eligibility = await this.checkEligibility(
      input.orderId,
      input.profileId,
      input.items.map((item) => ({
        orderItemId: item.orderItemId,
        variantId: item.variantId,
        productId: item.productId,
        productName: item.productName,
        variantSku: item.variantSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    );

    if (eligibility.status === 'ineligible') {
      throw new Error('Return request is not eligible');
    }

    // Calculate total refund amount
    const totalRefundAmount = input.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    // Check if approval is required
    const policy = await policiesRepository.findActiveByShopId(input.shopId);
    const requiresApproval = policy?.requiresApproval || false;

    const returnRequest = await returnsRepository.createReturnRequest({
      ...input,
      totalRefundAmount,
    });

    // Create initial status history
    await returnsRepository.updateStatus(returnRequest.id, {
      returnRequestId: returnRequest.id,
      toStatus: ReturnStatus.RETURN_REQUESTED,
      reason: 'Return request created',
      metadata: { requiresApproval },
      actorId,
      actorType: 'system',
    });

    // If auto-approval is enabled, approve immediately
    if (!requiresApproval) {
      await this.approveReturnRequest(
        returnRequest.id,
        actorId,
        'Auto-approved by policy',
      );
    }

    return returnRequest;
  }

  /**
   * Approve a return request
   */
  async approveReturnRequest(
    returnRequestId: string,
    actorId: string,
    reason?: string,
  ): Promise<ReturnRequest> {
    const returnRequest = await returnsRepository.findById(returnRequestId);

    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.RETURN_REQUESTED) {
      throw new Error('Return request is not in requested state');
    }

    const updated = await returnsRepository.updateStatus(returnRequestId, {
      returnRequestId,
      toStatus: ReturnStatus.RETURN_APPROVED,
      reason: reason || 'Return request approved',
      actorId,
      actorType: 'shop_owner',
    });

    // Initialize reverse logistics
    await this.initializeReverseLogistics(returnRequestId);

    return updated;
  }

  /**
   * Reject a return request
   */
  async rejectReturnRequest(
    returnRequestId: string,
    actorId: string,
    reason: string,
  ): Promise<ReturnRequest> {
    const returnRequest = await returnsRepository.findById(returnRequestId);

    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.RETURN_REQUESTED) {
      throw new Error('Return request is not in requested state');
    }

    return await returnsRepository.updateStatus(returnRequestId, {
      returnRequestId,
      toStatus: ReturnStatus.RETURN_REJECTED,
      reason,
      actorId,
      actorType: 'shop_owner',
    });
  }

  /**
   * Update return request status
   */
  async updateStatus(
    returnRequestId: string,
    input: UpdateReturnStatusInput,
    actorId: string,
    actorType: ActorType,
  ): Promise<ReturnRequest> {
    const returnRequest = await returnsRepository.findById(returnRequestId);

    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    // Validate state transition
    const validTransitions = this.getValidTransitions(returnRequest.status);
    if (!validTransitions.includes(input.toStatus)) {
      throw new Error(
        `Invalid status transition from ${returnRequest.status} to ${input.toStatus}`,
      );
    }

    return await returnsRepository.updateStatus(returnRequestId, {
      ...input,
      actorId,
      actorType,
    });
  }

  /**
   * Get valid status transitions
   */
  private getValidTransitions(currentStatus: ReturnStatus): ReturnStatus[] {
    const transitions: Record<ReturnStatus, ReturnStatus[]> = {
      [ReturnStatus.RETURN_REQUESTED]: [
        ReturnStatus.RETURN_APPROVED,
        ReturnStatus.RETURN_REJECTED,
      ],
      [ReturnStatus.RETURN_APPROVED]: [ReturnStatus.PICKUP_SCHEDULED],
      [ReturnStatus.RETURN_REJECTED]: [ReturnStatus.RETURN_CLOSED],
      [ReturnStatus.PICKUP_SCHEDULED]: [ReturnStatus.PICKUP_COMPLETED],
      [ReturnStatus.PICKUP_COMPLETED]: [ReturnStatus.IN_INSPECTION],
      [ReturnStatus.IN_INSPECTION]: [
        ReturnStatus.INSPECTION_PASSED,
        ReturnStatus.INSPECTION_FAILED,
      ],
      [ReturnStatus.INSPECTION_PASSED]: [ReturnStatus.REFUND_PENDING],
      [ReturnStatus.INSPECTION_FAILED]: [ReturnStatus.RETURN_CLOSED],
      [ReturnStatus.REFUND_PENDING]: [ReturnStatus.REFUND_APPROVED],
      [ReturnStatus.REFUND_APPROVED]: [ReturnStatus.REFUND_COMPLETED],
      [ReturnStatus.REFUND_COMPLETED]: [ReturnStatus.RETURN_CLOSED],
      [ReturnStatus.RETURN_CLOSED]: [],
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Initialize reverse logistics for a return
   */
  private async initializeReverseLogistics(
    returnRequestId: string,
  ): Promise<void> {
    // This would be implemented by the Reverse Logistics Service
    // For now, we'll just log that it needs to be done
    console.log(
      `Reverse logistics initialization needed for return: ${returnRequestId}`,
    );
  }

  /**
   * Get return request by ID
   */
  async getReturnRequest(
    returnRequestId: string,
  ): Promise<ReturnRequest | null> {
    return await returnsRepository.findById(returnRequestId);
  }

  /**
   * Get return requests for a profile
   */
  async getProfileReturns(profileId: string): Promise<ReturnRequest[]> {
    return await returnsRepository.findByProfileId(profileId);
  }

  /**
   * Get return requests for a shop
   */
  async getShopReturns(shopId: string): Promise<ReturnRequest[]> {
    return await returnsRepository.findByShopId(shopId);
  }

  /**
   * Query return requests with filters
   */
  async queryReturnRequests(options: any): Promise<any> {
    return await returnsRepository.queryReturnRequests(options);
  }

  /**
   * Add internal notes to a return request
   */
  async addInternalNotes(
    returnRequestId: string,
    notes: string,
  ): Promise<ReturnRequest> {
    return await returnsRepository.addInternalNotes(returnRequestId, notes);
  }

  /**
   * Get return statistics
   */
  async getStatistics(
    shopId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    return await returnsRepository.getStatistics(shopId, startDate, endDate);
  }
}

export const returnsService = new ReturnsService();
