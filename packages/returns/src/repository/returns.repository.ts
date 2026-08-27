/**
 * Returns Repository - Data Access Layer
 *
 * This repository handles all database operations for return requests.
 * Business logic belongs in the service layer, not here.
 */

import {
  PrismaClient,
  ReturnRequest,
  ReturnRequestStatus,
} from '@prisma/client';
import {
  ReturnRequest as ReturnType,
  ReturnQueryFilters,
  ReturnQueryOptions,
  ReturnQueryResult,
  CreateReturnRequestInput,
  UpdateReturnStatusInput,
} from '../types';

const prisma = new PrismaClient();

export class ReturnsRepository {
  /**
   * Create a new return request
   */
  async createReturnRequest(
    input: CreateReturnRequestInput & {
      orderNumber: string;
      profileId: string;
      shopId: string;
    },
  ): Promise<ReturnType> {
    const { items, ...requestData } = input;

    return await prisma.returnRequest.create({
      data: {
        ...requestData,
        items: {
          create: items.map((item) => ({
            orderItemId: item.orderItemId,
            variantId: item.variantId,
            productId: item.productId,
            productName: item.productName,
            variantSku: item.variantSku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            reason: item.reason,
            reasonDetail: item.reasonDetail,
            condition: item.condition,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  /**
   * Find return request by ID
   */
  async findById(id: string): Promise<ReturnType | null> {
    return await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        refunds: true,
        reverseLogistics: true,
        disputes: {
          include: {
            messages: true,
          },
        },
      },
    });
  }

  /**
   * Find return request by order ID
   */
  async findByOrderId(orderId: string): Promise<ReturnType[]> {
    return await prisma.returnRequest.findMany({
      where: { orderId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * Find return requests by profile ID
   */
  async findByProfileId(profileId: string): Promise<ReturnType[]> {
    return await prisma.returnRequest.findMany({
      where: { profileId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * Find return requests by shop ID
   */
  async findByShopId(shopId: string): Promise<ReturnType[]> {
    return await prisma.returnRequest.findMany({
      where: { shopId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * Query return requests with filters and pagination
   */
  async queryReturnRequests(
    options: ReturnQueryOptions = {},
  ): Promise<ReturnQueryResult> {
    const {
      filters = {},
      page = 1,
      limit = 20,
      sort = 'requestedAt',
      order = 'desc',
    } = options;

    const where = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        include: {
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.returnRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Update return request status
   */
  async updateStatus(
    id: string,
    input: UpdateReturnStatusInput & { actorId: string; actorType: string },
  ): Promise<ReturnType> {
    const { toStatus, reason, metadata, actorId, actorType } = input;

    const currentReturn = await this.findById(id);
    if (!currentReturn) {
      throw new Error('Return request not found');
    }

    // Create status history entry
    await prisma.returnStatusHistory.create({
      data: {
        returnRequestId: id,
        fromStatus: currentReturn.status,
        toStatus,
        actorId,
        actorType: actorType as any,
        reason,
        metadata,
      },
    });

    // Update return request status
    return await prisma.returnRequest.update({
      where: { id },
      data: {
        status: toStatus,
        ...(toStatus === ReturnRequestStatus.RETURN_APPROVED && {
          approvedAt: new Date(),
          approvedBy: actorId,
        }),
        ...(toStatus === ReturnRequestStatus.RETURN_REJECTED && {
          rejectedAt: new Date(),
          rejectedBy: actorId,
          rejectedReason: reason,
        }),
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Update refund status
   */
  async updateRefundStatus(
    id: string,
    refundStatus: string,
    completedAt?: Date,
  ): Promise<ReturnType> {
    return await prisma.returnRequest.update({
      where: { id },
      data: {
        refundStatus: refundStatus as any,
        refundCompletedAt: completedAt,
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Add internal notes
   */
  async addInternalNotes(id: string, notes: string): Promise<ReturnType> {
    return await prisma.returnRequest.update({
      where: { id },
      data: { internalNotes: notes },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Soft delete return request
   */
  async softDelete(id: string): Promise<ReturnType> {
    return await prisma.returnRequest.update({
      where: { id },
      data: { isActive: false },
      include: {
        items: true,
      },
    });
  }

  /**
   * Build where clause from filters
   */
  private buildWhereClause(filters: ReturnQueryFilters): any {
    const where: any = { isActive: true };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.profileId) {
      where.profileId = filters.profileId;
    }

    if (filters.shopId) {
      where.shopId = filters.shopId;
    }

    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    if (filters.reason) {
      where.reason = filters.reason;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.requestedAt = {};
      if (filters.dateFrom) {
        where.requestedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.requestedAt.lte = filters.dateTo;
      }
    }

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { reason: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Get return statistics
   */
  async getStatistics(
    shopId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalReturns: number;
    approvedReturns: number;
    rejectedReturns: number;
    pendingReturns: number;
    totalRefundAmount: number;
  }> {
    const where: any = { isActive: true };

    if (shopId) {
      where.shopId = shopId;
    }

    if (startDate || endDate) {
      where.requestedAt = {};
      if (startDate) {
        where.requestedAt.gte = startDate;
      }
      if (endDate) {
        where.requestedAt.lte = endDate;
      }
    }

    const [total, approved, rejected, pending, refundSum] = await Promise.all([
      prisma.returnRequest.count({ where }),
      prisma.returnRequest.count({
        where: { ...where, status: ReturnRequestStatus.RETURN_APPROVED },
      }),
      prisma.returnRequest.count({
        where: { ...where, status: ReturnRequestStatus.RETURN_REJECTED },
      }),
      prisma.returnRequest.count({
        where: { ...where, status: ReturnRequestStatus.RETURN_REQUESTED },
      }),
      prisma.returnRequest.aggregate({
        where: { ...where, status: ReturnRequestStatus.REFUND_COMPLETED },
        _sum: { totalRefundAmount: true },
      }),
    ]);

    return {
      totalReturns: total,
      approvedReturns: approved,
      rejectedReturns: rejected,
      pendingReturns: pending,
      totalRefundAmount: refundSum._sum.totalRefundAmount || 0,
    };
  }
}

export const returnsRepository = new ReturnsRepository();
