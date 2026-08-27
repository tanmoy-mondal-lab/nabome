/**
 * Inspections Repository - Data Access Layer
 *
 * This repository handles all database operations for inspections.
 * Business logic belongs in the service layer, not here.
 */

import { PrismaClient } from '@prisma/client';
import { Inspection, InspectionInput } from '../types';

const prisma = new PrismaClient();

export class InspectionsRepository {
  /**
   * Create a new inspection record
   */
  async createInspection(
    input: InspectionInput & {
      returnRequestId: string;
      inspectedBy: string;
    },
  ): Promise<Inspection> {
    return await prisma.inspection.create({
      data: input,
    });
  }

  /**
   * Find inspection by ID
   */
  async findById(id: string): Promise<Inspection | null> {
    return await prisma.inspection.findUnique({
      where: { id },
      include: {
        returnItem: true,
      },
    });
  }

  /**
   * Find inspections by return request ID
   */
  async findByReturnRequestId(returnRequestId: string): Promise<Inspection[]> {
    return await prisma.inspection.findMany({
      where: { returnRequestId },
      include: {
        returnItem: true,
      },
      orderBy: { inspectedAt: 'desc' },
    });
  }

  /**
   * Find inspections by return item ID
   */
  async findByReturnItemId(returnItemId: string): Promise<Inspection[]> {
    return await prisma.inspection.findMany({
      where: { returnItemId },
      orderBy: { inspectedAt: 'desc' },
    });
  }

  /**
   * Update inspection result
   */
  async updateInspection(
    id: string,
    data: Partial<InspectionInput>,
  ): Promise<Inspection> {
    return await prisma.inspection.update({
      where: { id },
      data,
    });
  }

  /**
   * Get pending inspections for a warehouse
   */
  async getPendingInspections(warehouseId?: string): Promise<Inspection[]> {
    const where: any = {
      result: 'pending' as any,
    };

    if (warehouseId) {
      // Need to join with reverse logistics to filter by warehouse
      // This is a simplified version - in production you'd use a more complex query
    }

    return await prisma.inspection.findMany({
      where,
      include: {
        returnItem: true,
      },
      orderBy: { inspectedAt: 'asc' },
    });
  }

  /**
   * Get inspection statistics
   */
  async getStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalInspections: number;
    passedInspections: number;
    failedInspections: number;
    partialInspections: number;
    restockableCount: number;
    refurbishableCount: number;
    repairableCount: number;
  }> {
    const where: any = {};

    if (startDate || endDate) {
      where.inspectedAt = {};
      if (startDate) {
        where.inspectedAt.gte = startDate;
      }
      if (endDate) {
        where.inspectedAt.lte = endDate;
      }
    }

    const [
      total,
      passed,
      failed,
      partial,
      restockable,
      refurbishable,
      repairable,
    ] = await Promise.all([
      prisma.inspection.count({ where }),
      prisma.inspection.count({ where: { ...where, result: 'passed' as any } }),
      prisma.inspection.count({ where: { ...where, result: 'failed' as any } }),
      prisma.inspection.count({
        where: { ...where, result: 'partial' as any },
      }),
      prisma.inspection.count({ where: { ...where, restockable: true } }),
      prisma.inspection.count({ where: { ...where, refurbishable: true } }),
      prisma.inspection.count({ where: { ...where, repairable: true } }),
    ]);

    return {
      totalInspections: total,
      passedInspections: passed,
      failedInspections: failed,
      partialInspections: partial,
      restockableCount: restockable,
      refurbishableCount: refurbishable,
      repairableCount: repairable,
    };
  }
}

export const inspectionsRepository = new InspectionsRepository();
