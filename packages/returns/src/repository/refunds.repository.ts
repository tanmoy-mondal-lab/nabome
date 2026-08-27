/**
 * Refunds Repository - Data Access Layer
 *
 * This repository handles all database operations for refunds.
 * Business logic belongs in the service layer, not here.
 */

import { PrismaClient, RefundStatus } from '@prisma/client';
import { ReturnRefund, CreateRefundInput } from '../types';

const prisma = new PrismaClient();

export class RefundsRepository {
  /**
   * Create a new refund record
   */
  async createRefund(
    input: CreateRefundInput & {
      returnRequestId: string;
      paymentId: string;
      orderId: string;
      profileId: string;
      shopId: string;
      initiatedBy: string;
    },
  ): Promise<ReturnRefund> {
    return await prisma.returnRefund.create({
      data: input,
    });
  }

  /**
   * Find refund by ID
   */
  async findById(id: string): Promise<ReturnRefund | null> {
    return await prisma.returnRefund.findUnique({
      where: { id },
    });
  }

  /**
   * Find refunds by return request ID
   */
  async findByReturnRequestId(
    returnRequestId: string,
  ): Promise<ReturnRefund[]> {
    return await prisma.returnRefund.findMany({
      where: { returnRequestId },
      orderBy: { initiatedAt: 'desc' },
    });
  }

  /**
   * Find refunds by order ID
   */
  async findByOrderId(orderId: string): Promise<ReturnRefund[]> {
    return await prisma.returnRefund.findMany({
      where: { orderId },
      orderBy: { initiatedAt: 'desc' },
    });
  }

  /**
   * Update refund status
   */
  async updateStatus(
    id: string,
    status: RefundStatus,
    gatewayRef?: string,
    gatewayStatus?: string,
    completedAt?: Date,
    failedAt?: Date,
    failureReason?: string,
    completedBy?: string,
  ): Promise<ReturnRefund> {
    return await prisma.returnRefund.update({
      where: { id },
      data: {
        status,
        gatewayRef,
        gatewayStatus,
        completedAt,
        failedAt,
        failureReason,
        completedBy,
      },
    });
  }

  /**
   * Get total refund amount for a return request
   */
  async getTotalRefundAmount(returnRequestId: string): Promise<number> {
    const result = await prisma.returnRefund.aggregate({
      where: {
        returnRequestId,
        status: RefundStatus.COMPLETED,
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  /**
   * Get pending refunds for a shop
   */
  async getPendingRefundsByShop(shopId: string): Promise<ReturnRefund[]> {
    return await prisma.returnRefund.findMany({
      where: {
        shopId,
        status: RefundStatus.PENDING,
      },
      include: {
        returnRequest: true,
      },
      orderBy: { initiatedAt: 'asc' },
    });
  }

  /**
   * Get refund statistics
   */
  async getStatistics(
    shopId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRefunds: number;
    completedRefunds: number;
    failedRefunds: number;
    pendingRefunds: number;
    totalRefundAmount: number;
  }> {
    const where: any = {};

    if (shopId) {
      where.shopId = shopId;
    }

    if (startDate || endDate) {
      where.initiatedAt = {};
      if (startDate) {
        where.initiatedAt.gte = startDate;
      }
      if (endDate) {
        where.initiatedAt.lte = endDate;
      }
    }

    const [total, completed, failed, pending, amountSum] = await Promise.all([
      prisma.returnRefund.count({ where }),
      prisma.returnRefund.count({
        where: { ...where, status: RefundStatus.COMPLETED },
      }),
      prisma.returnRefund.count({
        where: { ...where, status: RefundStatus.FAILED },
      }),
      prisma.returnRefund.count({
        where: { ...where, status: RefundStatus.PENDING },
      }),
      prisma.returnRefund.aggregate({
        where: { ...where, status: RefundStatus.COMPLETED },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalRefunds: total,
      completedRefunds: completed,
      failedRefunds: failed,
      pendingRefunds: pending,
      totalRefundAmount: amountSum._sum.amount || 0,
    };
  }
}

export const refundsRepository = new RefundsRepository();
