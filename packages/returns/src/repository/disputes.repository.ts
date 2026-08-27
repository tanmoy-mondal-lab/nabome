/**
 * Disputes Repository - Data Access Layer
 *
 * This repository handles all database operations for disputes.
 * Business logic belongs in the service layer, not here.
 */

import { PrismaClient, DisputeStatus } from '@prisma/client';
import { Dispute, CreateDisputeInput, UpdateDisputeInput } from '../types';

const prisma = new PrismaClient();

export class DisputesRepository {
  /**
   * Create a new dispute
   */
  async createDispute(
    input: CreateDisputeInput & {
      orderId: string;
      profileId: string;
      shopId: string;
      raisedBy: string;
    },
  ): Promise<Dispute> {
    return await prisma.dispute.create({
      data: input,
      include: {
        messages: true,
      },
    });
  }

  /**
   * Find dispute by ID
   */
  async findById(id: string): Promise<Dispute | null> {
    return await prisma.dispute.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        returnRequest: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  /**
   * Find disputes by return request ID
   */
  async findByReturnRequestId(returnRequestId: string): Promise<Dispute[]> {
    return await prisma.dispute.findMany({
      where: { returnRequestId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { raisedAt: 'desc' },
    });
  }

  /**
   * Find disputes by profile ID
   */
  async findByProfileId(profileId: string): Promise<Dispute[]> {
    return await prisma.dispute.findMany({
      where: { profileId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { raisedAt: 'desc' },
    });
  }

  /**
   * Find disputes by shop ID
   */
  async findByShopId(shopId: string): Promise<Dispute[]> {
    return await prisma.dispute.findMany({
      where: { shopId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { raisedAt: 'desc' },
    });
  }

  /**
   * Update dispute
   */
  async updateDispute(id: string, input: UpdateDisputeInput): Promise<Dispute> {
    return await prisma.dispute.update({
      where: { id },
      data: {
        ...input,
        ...(input.resolution && {
          resolvedAt: new Date(),
          status: DisputeStatus.RESOLVED,
        }),
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Escalate dispute
   */
  async escalateDispute(
    id: string,
    escalatedBy: string,
    escalationReason: string,
  ): Promise<Dispute> {
    return await prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.ESCALATED,
        escalatedBy,
        escalatedAt: new Date(),
        escalationReason,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Add message to dispute
   */
  async addMessage(
    disputeId: string,
    senderId: string,
    senderType: string,
    message: string,
    isInternal: boolean = false,
    attachments: string[] = [],
  ): Promise<any> {
    return await prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId,
        senderType: senderType as any,
        message,
        isInternal,
        attachments,
      },
    });
  }

  /**
   * Get open disputes
   */
  async getOpenDisputes(shopId?: string): Promise<Dispute[]> {
    const where: any = {
      status: DisputeStatus.OPEN,
    };

    if (shopId) {
      where.shopId = shopId;
    }

    return await prisma.dispute.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        returnRequest: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { raisedAt: 'asc' },
    });
  }

  /**
   * Get escalated disputes
   */
  async getEscalatedDisputes(): Promise<Dispute[]> {
    return await prisma.dispute.findMany({
      where: {
        status: DisputeStatus.ESCALATED,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        returnRequest: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { escalatedAt: 'asc' },
    });
  }

  /**
   * Get dispute statistics
   */
  async getStatistics(
    shopId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalDisputes: number;
    openDisputes: number;
    resolvedDisputes: number;
    escalatedDisputes: number;
    customerFavored: number;
    sellerFavored: number;
  }> {
    const where: any = {};

    if (shopId) {
      where.shopId = shopId;
    }

    if (startDate || endDate) {
      where.raisedAt = {};
      if (startDate) {
        where.raisedAt.gte = startDate;
      }
      if (endDate) {
        where.raisedAt.lte = endDate;
      }
    }

    const [total, open, resolved, escalated, customerFavored, sellerFavored] =
      await Promise.all([
        prisma.dispute.count({ where }),
        prisma.dispute.count({
          where: { ...where, status: DisputeStatus.OPEN },
        }),
        prisma.dispute.count({
          where: { ...where, status: DisputeStatus.RESOLVED },
        }),
        prisma.dispute.count({
          where: { ...where, status: DisputeStatus.ESCALATED },
        }),
        prisma.dispute.count({
          where: { ...where, resolution: 'customer_favored' as any },
        }),
        prisma.dispute.count({
          where: { ...where, resolution: 'seller_favored' as any },
        }),
      ]);

    return {
      totalDisputes: total,
      openDisputes: open,
      resolvedDisputes: resolved,
      escalatedDisputes: escalated,
      customerFavored,
      sellerFavored,
    };
  }
}

export const disputesRepository = new DisputesRepository();
