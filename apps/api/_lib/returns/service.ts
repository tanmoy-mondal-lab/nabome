/**
 * Returns Service
 *
 * Business logic for return and refund operations.
 * Handles return requests, approvals, rejections, and refund processing.
 */

import { ApiError } from '../http/errors.ts';
import { getPrisma } from '../prisma.ts';

const prisma = getPrisma() as any;

const RETURN_WINDOW_DAYS = 30;

export class ReturnsService {
  /**
   * Request a return for an order
   */
  static async requestReturn(data: {
    orderId: string;
    userId: string;
    items: Array<{
      orderItemId: string;
      quantity: number;
      reason: string;
    }>;
    reason: string;
    reasonDetail?: string;
  }): Promise<any> {
    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id: data.orderId, isActive: true },
      include: {
        items: true,
        shop: true,
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Verify user owns this order
    if (order.userId !== data.userId) {
      throw ApiError.forbidden(
        'You can only request returns for your own orders',
      );
    }

    // Check if order is eligible for return
    if (order.status !== 'delivered') {
      throw ApiError.validation(
        'Returns can only be requested for delivered orders',
      );
    }

    // Check return window (30 days from delivery)
    const deliveredDate = order.updatedAt; // Using updatedAt as delivery date for now
    const daysSinceDelivery = Math.floor(
      (Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      throw ApiError.validation(
        `Return window has expired. Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery`,
      );
    }

    // Validate return items
    const orderItemIds = order.items.map((item: any) => item.id);
    for (const returnItem of data.items) {
      if (!orderItemIds.includes(returnItem.orderItemId)) {
        throw ApiError.validation(
          `Order item ${returnItem.orderItemId} not found in this order`,
        );
      }

      const orderItem = order.items.find(
        (item: any) => item.id === returnItem.orderItemId,
      );
      if (returnItem.quantity > orderItem.quantity) {
        throw ApiError.validation(
          `Cannot return more items than ordered. Ordered: ${orderItem.quantity}, Requested: ${returnItem.quantity}`,
        );
      }
    }

    // Calculate total refund amount
    let totalRefundAmount = 0;
    const returnItemsData = [];

    for (const returnItem of data.items) {
      const orderItem = order.items.find(
        (item: any) => item.id === returnItem.orderItemId,
      );
      const itemRefundAmount =
        Number(orderItem.unitPrice) * returnItem.quantity;
      totalRefundAmount += itemRefundAmount;

      returnItemsData.push({
        orderItemId: returnItem.orderItemId,
        variantId: orderItem.variantId,
        productId: orderItem.productId,
        productName: orderItem.productName,
        variantSku: orderItem.sku,
        quantity: returnItem.quantity,
        unitPrice: orderItem.unitPrice,
        totalPrice: itemRefundAmount,
        reason: returnItem.reason,
      });
    }

    // Generate return request ID
    const returnId = crypto.randomUUID();

    // Create return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        id: returnId,
        orderNumber: order.orderNumber,
        orderId: data.orderId,
        profileId: data.userId,
        shopId: order.shopId,
        status: 'return_requested',
        returnType: 'refund',
        reason: data.reason as any,
        reasonDetail: data.reasonDetail,
        totalRefundAmount,
        refundMethod: 'original',
        refundStatus: 'pending',
        items: {
          create: returnItemsData,
        },
      },
    });

    // Create status history
    await prisma.returnStatusHistory.create({
      data: {
        returnRequestId: returnId,
        fromStatus: 'return_requested',
        toStatus: 'return_requested',
        actorId: data.userId,
        actorType: 'customer',
        reason: 'Return request initiated',
      },
    });

    return returnRequest;
  }

  /**
   * Get returns for an order
   */
  static async getOrderReturns(
    orderId: string,
    userId: string,
  ): Promise<any[]> {
    const order = await prisma.order.findUnique({
      where: { id: orderId, isActive: true },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.userId !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    const returns = await prisma.returnRequest.findMany({
      where: {
        orderId,
        isActive: true,
      },
      include: {
        items: true,
        refunds: true,
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return returns;
  }

  /**
   * List all returns (admin)
   */
  static async listReturns(options: {
    status?: string;
    page: number;
    limit: number;
  }): Promise<{ returns: any[]; pagination: any }> {
    const { status, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (status) {
      where.status = status;
    }

    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        include: {
          items: true,
          refunds: true,
          order: {
            select: {
              orderNumber: true,
              userId: true,
            },
          },
        },
        orderBy: {
          requestedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.returnRequest.count({ where }),
    ]);

    return {
      returns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get return details (admin)
   */
  static async getReturn(returnId: string): Promise<any> {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId, isActive: true },
      include: {
        items: true,
        refunds: true,
        statusHistory: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        order: {
          include: {
            items: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!returnRequest) {
      throw ApiError.notFound('Return request not found');
    }

    return returnRequest;
  }

  /**
   * Update return status (admin)
   */
  static async updateReturnStatus(
    returnId: string,
    data: {
      status: string;
      reason?: string;
      adminId: string;
    },
  ): Promise<Record<string, unknown>> {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId, isActive: true },
      include: {
        order: true,
      },
    });

    if (!returnRequest) {
      throw ApiError.notFound('Return request not found');
    }

    const validTransitions: Record<string, string[]> = {
      return_requested: ['approved', 'rejected'],
      approved: ['received', 'cancelled'],
      received: ['refunded', 'rejected'],
      refunded: ['completed'],
      rejected: [],
      completed: [],
      cancelled: [],
    };

    const allowedNextStates = validTransitions[returnRequest.status] || [];
    if (!allowedNextStates.includes(data.status)) {
      throw ApiError.validation(
        `Cannot transition from ${returnRequest.status} to ${data.status}`,
      );
    }

    // Update return request
    const updatedReturn = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: data.status as any,
        ...(data.status === 'approved' && {
          approvedAt: new Date(),
          approvedBy: data.adminId,
        }),
        ...(data.status === 'rejected' && {
          rejectedAt: new Date(),
          rejectedBy: data.adminId,
          rejectedReason: data.reason,
        }),
        ...(data.status === 'refunded' && {
          refundStatus: 'completed',
          refundCompletedAt: new Date(),
        }),
      },
    });

    // Create status history
    await prisma.returnStatusHistory.create({
      data: {
        returnRequestId: returnId,
        fromStatus: returnRequest.status,
        toStatus: data.status as any,
        actorId: data.adminId,
        actorType: 'admin',
        reason: data.reason || `Status changed to ${data.status}`,
      },
    });

    // If approved, trigger refund process
    if (data.status === 'approved') {
      // Refund will be processed when items are received
      // For now, we just mark it as approved
    }

    // If refunded, process the actual refund
    if (data.status === 'refunded') {
      await this.processRefund(returnId, returnRequest.orderId, data.adminId);
    }

    return updatedReturn;
  }

  /**
   * Process refund for a return
   */
  private static async processRefund(
    returnId: string,
    orderId: string,
    _adminId: string,
  ): Promise<void> {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        order: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!returnRequest) {
      throw ApiError.notFound('Return request not found');
    }

    // Get the original payment
    const payment = returnRequest.order.payments[0];
    if (!payment) {
      throw ApiError.validation('No payment found for this order');
    }

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        orderId,
        paymentId: payment.id,
        amount: returnRequest.totalRefundAmount,
        currency: returnRequest.order.currency,
        reason: `Return request ${returnId}`,
        status: 'pending',
      },
    });

    // Create return refund record
    await prisma.returnRefund.create({
      data: {
        returnRequestId: returnId,
        paymentId: payment.id,
        refundId: refund.id,
        amount: returnRequest.totalRefundAmount,
        status: 'pending',
      },
    });

    // TODO: Integrate with actual payment gateway (Razorpay) to process refund
    // For now, we'll mark it as completed
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: 'completed',
        processedAt: new Date(),
      },
    });

    await prisma.returnRefund.update({
      where: { id: refund.id },
      data: {
        status: 'completed',
      },
    });

    // Update order status if this is a full refund
    const orderTotal = Number(returnRequest.order.grandTotal);
    const refundAmount = Number(returnRequest.totalRefundAmount);

    if (refundAmount >= orderTotal) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'refunded',
          customerVisibleStatus: 'refunded',
        },
      });
    }

    // Restock inventory
    await prisma.returnRequest.update({
      where: { id: returnId },
      include: { items: true },
      data: {
        items: {
          updateMany: {
            where: {},
            data: {
              restockStatus: 'pending',
            },
          },
        },
      },
    });
  }
}
