/**
 * Return Policies Repository - Data Access Layer
 *
 * This repository handles all database operations for return policies.
 * Business logic belongs in the service layer, not here.
 */

import { PrismaClient } from '@prisma/client';
import { ReturnPolicy, ReturnPolicyInput } from '../types';

const prisma = new PrismaClient();

export class PoliciesRepository {
  /**
   * Create a new return policy
   */
  async createPolicy(input: ReturnPolicyInput): Promise<ReturnPolicy> {
    return await prisma.returnPolicy.create({
      data: input,
    });
  }

  /**
   * Find policy by ID
   */
  async findById(id: string): Promise<ReturnPolicy | null> {
    return await prisma.returnPolicy.findUnique({
      where: { id },
    });
  }

  /**
   * Find active policy for a shop
   */
  async findActiveByShopId(shopId: string): Promise<ReturnPolicy | null> {
    const now = new Date();
    return await prisma.returnPolicy.findFirst({
      where: {
        shopId,
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * Find all policies for a shop
   */
  async findByShopId(shopId: string): Promise<ReturnPolicy[]> {
    return await prisma.returnPolicy.findMany({
      where: { shopId },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * Update policy
   */
  async updatePolicy(
    id: string,
    input: Partial<ReturnPolicyInput>,
  ): Promise<ReturnPolicy> {
    return await prisma.returnPolicy.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Deactivate policy
   */
  async deactivatePolicy(id: string): Promise<ReturnPolicy> {
    return await prisma.returnPolicy.update({
      where: { id },
      data: {
        isActive: false,
        effectiveUntil: new Date(),
      },
    });
  }

  /**
   * Get applicable policy for a shop at a given date
   */
  async getApplicablePolicy(
    shopId: string,
    date: Date = new Date(),
  ): Promise<ReturnPolicy | null> {
    return await prisma.returnPolicy.findFirst({
      where: {
        shopId,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: date } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * Check if product category is eligible for returns
   */
  async isCategoryEligible(
    shopId: string,
    categoryId: string,
  ): Promise<{ eligible: boolean; reason?: string }> {
    const policy = await this.findActiveByShopId(shopId);

    if (!policy) {
      return { eligible: false, reason: 'No active return policy found' };
    }

    const ineligible = policy.ineligibleProductCategories || [];
    const eligible = policy.eligibleProductCategories || [];

    if (ineligible.includes(categoryId)) {
      return {
        eligible: false,
        reason: 'Product category is not eligible for returns',
      };
    }

    if (eligible.length > 0 && !eligible.includes(categoryId)) {
      return {
        eligible: false,
        reason: 'Product category is not in eligible list',
      };
    }

    return { eligible: true };
  }
}

export const policiesRepository = new PoliciesRepository();
