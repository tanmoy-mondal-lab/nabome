/**
 * Reverse Logistics Repository - Data Access Layer
 *
 * This repository handles all database operations for reverse logistics.
 * Business logic belongs in the service layer, not here.
 */

import { PrismaClient, ReverseLogisticsStatus } from '@prisma/client';
import { ReverseLogistics, SchedulePickupInput } from '../types';

const prisma = new PrismaClient();

export class ReverseLogisticsRepository {
  /**
   * Create a new reverse logistics record
   */
  async createReverseLogistics(
    returnRequestId: string,
    pickupAddress: SchedulePickupInput['pickupAddress'],
  ): Promise<ReverseLogistics> {
    return await prisma.reverseLogistics.create({
      data: {
        returnRequestId,
        status: ReverseLogisticsStatus.AWAITING_PICKUP,
        pickupAddress: pickupAddress as any,
      },
    });
  }

  /**
   * Find reverse logistics by ID
   */
  async findById(id: string): Promise<ReverseLogistics | null> {
    return await prisma.reverseLogistics.findUnique({
      where: { id },
      include: {
        returnRequest: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  /**
   * Find reverse logistics by return request ID
   */
  async findByReturnRequestId(
    returnRequestId: string,
  ): Promise<ReverseLogistics | null> {
    return await prisma.reverseLogistics.findUnique({
      where: { returnRequestId },
    });
  }

  /**
   * Update reverse logistics status
   */
  async updateStatus(
    id: string,
    status: ReverseLogisticsStatus,
    updates: Partial<{
      pickupScheduledAt: Date;
      pickupCompletedAt: Date;
      pickupCourier: string;
      trackingNumber: string;
      warehouseId: string;
      warehouseReceivedAt: Date;
      inspectionQueuedAt: Date;
      inspectionStartedAt: Date;
      inspectionCompletedAt: Date;
      restockingStartedAt: Date;
      restockingCompletedAt: Date;
      disposalCompletedAt: Date;
      completedAt: Date;
    }> = {},
  ): Promise<ReverseLogistics> {
    return await prisma.reverseLogistics.update({
      where: { id },
      data: {
        status,
        ...updates,
      },
    });
  }

  /**
   * Schedule pickup
   */
  async schedulePickup(
    id: string,
    pickupCourier: string,
    trackingNumber: string,
    scheduledAt: Date,
  ): Promise<ReverseLogistics> {
    return await this.updateStatus(
      id,
      ReverseLogisticsStatus.PICKUP_SCHEDULED,
      {
        pickupCourier,
        trackingNumber,
        pickupScheduledAt: scheduledAt,
      },
    );
  }

  /**
   * Mark pickup as completed
   */
  async completePickup(id: string): Promise<ReverseLogistics> {
    return await this.updateStatus(
      id,
      ReverseLogisticsStatus.PICKUP_COMPLETED,
      {
        pickupCompletedAt: new Date(),
      },
    );
  }

  /**
   * Mark warehouse receipt
   */
  async markWarehouseReceipt(
    id: string,
    warehouseId: string,
  ): Promise<ReverseLogistics> {
    return await this.updateStatus(
      id,
      ReverseLogisticsStatus.WAREHOUSE_RECEIVED,
      {
        warehouseId,
        warehouseReceivedAt: new Date(),
      },
    );
  }

  /**
   * Queue for inspection
   */
  async queueForInspection(id: string): Promise<ReverseLogistics> {
    return await this.updateStatus(
      id,
      ReverseLogisticsStatus.INSPECTION_QUEUED,
      {
        inspectionQueuedAt: new Date(),
      },
    );
  }

  /**
   * Start inspection
   */
  async startInspection(id: string): Promise<ReverseLogistics> {
    return await this.updateStatus(
      id,
      ReverseLogisticsStatus.INSPECTION_IN_PROGRESS,
      {
        inspectionStartedAt: new Date(),
      },
    );
  }

  /**
   * Complete inspection
   */
  async completeInspection(id: string): Promise<ReverseLogistics> {
    return await this.updateStatus(
      id,
      ReverseLogisticsStatus.INSPECTION_COMPLETED,
      {
        inspectionCompletedAt: new Date(),
      },
    );
  }

  /**
   * Start restocking
   */
  async startRestocking(id: string): Promise<ReverseLogistics> {
    return await this.updateStatus(id, ReverseLogisticsStatus.RESTOCKING, {
      restockingStartedAt: new Date(),
    });
  }

  /**
   * Complete restocking
   */
  async completeRestocking(id: string): Promise<ReverseLogistics> {
    return await this.updateStatus(id, ReverseLogisticsStatus.COMPLETED, {
      restockingCompletedAt: new Date(),
      completedAt: new Date(),
    });
  }

  /**
   * Get pending pickups
   */
  async getPendingPickups(): Promise<ReverseLogistics[]> {
    return await prisma.reverseLogistics.findMany({
      where: {
        status: {
          in: [
            ReverseLogisticsStatus.AWAITING_PICKUP,
            ReverseLogisticsStatus.PICKUP_SCHEDULED,
          ],
        },
      },
      include: {
        returnRequest: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get in-transit returns
   */
  async getInTransitReturns(): Promise<ReverseLogistics[]> {
    return await prisma.reverseLogistics.findMany({
      where: {
        status: ReverseLogisticsStatus.IN_TRANSIT,
      },
      include: {
        returnRequest: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get warehouse pending receipts
   */
  async getWarehousePendingReceipts(
    warehouseId?: string,
  ): Promise<ReverseLogistics[]> {
    const where: any = {
      status: {
        in: [
          ReverseLogisticsStatus.PICKUP_COMPLETED,
          ReverseLogisticsStatus.IN_TRANSIT,
        ],
      },
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    return await prisma.reverseLogistics.findMany({
      where,
      include: {
        returnRequest: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get reverse logistics statistics
   */
  async getStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalReturns: number;
    pendingPickups: number;
    inTransit: number;
    warehouseReceived: number;
    inspectionCompleted: number;
    restockingCompleted: number;
  }> {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [
      total,
      pendingPickups,
      inTransit,
      warehouseReceived,
      inspectionCompleted,
      restockingCompleted,
    ] = await Promise.all([
      prisma.reverseLogistics.count({ where }),
      prisma.reverseLogistics.count({
        where: {
          ...where,
          status: {
            in: [
              ReverseLogisticsStatus.AWAITING_PICKUP,
              ReverseLogisticsStatus.PICKUP_SCHEDULED,
            ],
          },
        },
      }),
      prisma.reverseLogistics.count({
        where: { ...where, status: ReverseLogisticsStatus.IN_TRANSIT },
      }),
      prisma.reverseLogistics.count({
        where: { ...where, status: ReverseLogisticsStatus.WAREHOUSE_RECEIVED },
      }),
      prisma.reverseLogistics.count({
        where: {
          ...where,
          status: ReverseLogisticsStatus.INSPECTION_COMPLETED,
        },
      }),
      prisma.reverseLogistics.count({
        where: { ...where, status: ReverseLogisticsStatus.COMPLETED },
      }),
    ]);

    return {
      totalReturns: total,
      pendingPickups,
      inTransit,
      warehouseReceived,
      inspectionCompleted,
      restockingCompleted,
    };
  }
}

export const reverseLogisticsRepository = new ReverseLogisticsRepository();
