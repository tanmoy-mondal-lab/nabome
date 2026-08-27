// @ts-nocheck
/**
 * Shipping Analytics Service
 *
 * Tracks shipping metrics and performance analytics.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

// @ts-ignore - Prisma client will be available in runtime
import type { PrismaClient } from '@prisma/client';

import type { Id } from '@nabome/types';

import { ShipmentStatus } from './enums';

/**
 * Shipping Analytics Metrics
 */
export interface ShippingAnalytics {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  failedDeliveries: number;
  averageTransitTime: number; // in days
  onTimeDeliveryRate: number; // percentage
  fulfillmentTime: number; // average time to fulfillment in hours
  carrierPerformance: Record<
    string,
    {
      totalShipments: number;
      onTimeDeliveries: number;
      averageTransitTime: number;
      successRate: number;
    }
  >;
}

/**
 * Shipping Analytics Service
 *
 * Tracks and calculates shipping metrics for analytics and reporting.
 */
export class ShippingAnalyticsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get overall shipping analytics
   */
  async getShippingAnalytics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ShippingAnalytics> {
    const where = this.buildDateFilter(startDate, endDate);

    const [
      totalShipments,
      inTransit,
      delivered,
      failedDeliveries,
      allDeliveredShipments,
    ] = await Promise.all([
      this.prisma.shipment.count({ where }),
      this.prisma.shipment.count({
        where: { ...where, status: ShipmentStatus.IN_TRANSIT },
      }),
      this.prisma.shipment.count({
        where: { ...where, status: ShipmentStatus.DELIVERED },
      }),
      this.prisma.shipment.count({
        where: { ...where, status: ShipmentStatus.DELIVERY_FAILED },
      }),
      this.prisma.shipment.findMany({
        where: {
          ...where,
          status: ShipmentStatus.DELIVERED,
          createdAt: { not: null },
          deliveredAt: { not: null },
        },
        select: {
          createdAt: true,
          deliveredAt: true,
          carrierCode: true,
          estimatedDeliveryDate: true,
        },
      }),
    ]);

    const averageTransitTime = this.calculateAverageTransitTime(
      allDeliveredShipments,
    );
    const onTimeDeliveryRate = this.calculateOnTimeDeliveryRate(
      allDeliveredShipments,
    );
    const fulfillmentTime = await this.calculateAverageFulfillmentTime(where);
    const carrierPerformance = await this.calculateCarrierPerformance(
      allDeliveredShipments,
    );

    return {
      totalShipments,
      inTransit,
      delivered,
      failedDeliveries,
      averageTransitTime,
      onTimeDeliveryRate,
      fulfillmentTime,
      carrierPerformance,
    };
  }

  /**
   * Track shipment creation for analytics
   */
  async trackShipmentCreated(shipmentId: Id, orderId: Id): Promise<void> {
    // In a real implementation, this would send metrics to an analytics system
    console.log(
      `[Analytics] Shipment created: ${shipmentId} for order ${orderId}`,
    );
  }

  /**
   * Track shipment delivery for analytics
   */
  async trackShipmentDelivered(
    shipmentId: Id,
    transitTime: number,
    onTime: boolean,
  ): Promise<void> {
    // In a real implementation, this would send metrics to an analytics system
    console.log(
      `[Analytics] Shipment delivered: ${shipmentId}, Transit time: ${transitTime} days, On time: ${onTime}`,
    );
  }

  /**
   * Track delivery failure for analytics
   */
  async trackDeliveryFailed(shipmentId: Id, reason: string): Promise<void> {
    // In a real implementation, this would send metrics to an analytics system
    console.log(
      `[Analytics] Delivery failed: ${shipmentId}, Reason: ${reason}`,
    );
  }

  /**
   * Track carrier performance
   */
  async trackCarrierPerformance(
    carrierCode: string,
    success: boolean,
    transitTime?: number,
  ): Promise<void> {
    // In a real implementation, this would send metrics to an analytics system
    console.log(
      `[Analytics] Carrier performance: ${carrierCode}, Success: ${success}, Transit time: ${transitTime}`,
    );
  }

  /**
   * Get fulfillment time statistics
   */
  async getFulfillmentStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    averageTime: number;
    medianTime: number;
    p95Time: number;
    p99Time: number;
  }> {
    const where = this.buildDateFilter(startDate, endDate);

    const fulfillmentItems = await this.prisma.fulfillmentQueue.findMany({
      where: {
        ...where,
        status: 'completed',
        createdAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        createdAt: true,
        completedAt: true,
      },
    });

    const times = fulfillmentItems
      .map((item: any) => {
        if (item.createdAt && item.completedAt) {
          return (
            (item.completedAt.getTime() - item.createdAt.getTime()) /
            (1000 * 60 * 60)
          ); // hours
        }
        return 0;
      })
      .filter((time: number) => time > 0);

    if (times.length === 0) {
      return { averageTime: 0, medianTime: 0, p95Time: 0, p99Time: 0 };
    }

    times.sort((a: number, b: number) => a - b);

    const averageTime =
      times.reduce((sum: number, time: number) => sum + time, 0) / times.length;
    const medianTime = times[Math.floor(times.length / 2)];
    const p95Time = times[Math.floor(times.length * 0.95)];
    const p99Time = times[Math.floor(times.length * 0.99)];

    return { averageTime, medianTime, p95Time, p99Time };
  }

  /**
   * Build date filter for queries
   */
  private buildDateFilter(startDate?: Date, endDate?: Date) {
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
    return where;
  }

  /**
   * Calculate average transit time in days
   */
  private calculateAverageTransitTime(
    shipments: Array<{
      createdAt: Date;
      deliveredAt: Date;
    }>,
  ): number {
    if (shipments.length === 0) return 0;

    const transitTimes = shipments
      .map((shipment) => {
        if (shipment.createdAt && shipment.deliveredAt) {
          return (
            (shipment.deliveredAt.getTime() - shipment.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
          );
        }
        return 0;
      })
      .filter((time) => time > 0);

    if (transitTimes.length === 0) return 0;

    return (
      transitTimes.reduce((sum, time) => sum + time, 0) / transitTimes.length
    );
  }

  /**
   * Calculate on-time delivery rate as percentage
   */
  private calculateOnTimeDeliveryRate(
    shipments: Array<{
      estimatedDeliveryDate: Date | null;
      deliveredAt: Date;
    }>,
  ): number {
    if (shipments.length === 0) return 0;

    const onTimeCount = shipments.filter((shipment) => {
      if (!shipment.estimatedDeliveryDate || !shipment.deliveredAt)
        return false;
      return shipment.deliveredAt <= shipment.estimatedDeliveryDate;
    }).length;

    return (onTimeCount / shipments.length) * 100;
  }

  /**
   * Calculate average fulfillment time in hours
   */
  private async calculateAverageFulfillmentTime(where: any): Promise<number> {
    const fulfillmentItems = await this.prisma.fulfillmentQueue.findMany({
      where: {
        ...where,
        status: 'completed',
        createdAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        createdAt: true,
        completedAt: true,
      },
    });

    const times = fulfillmentItems
      .map((item: any) => {
        if (item.createdAt && item.completedAt) {
          return (
            (item.completedAt.getTime() - item.createdAt.getTime()) /
            (1000 * 60 * 60)
          ); // hours
        }
        return 0;
      })
      .filter((time: number) => time > 0);

    if (times.length === 0) return 0;

    return (
      times.reduce((sum: number, time: number) => sum + time, 0) / times.length
    );
  }

  /**
   * Calculate carrier performance metrics
   */
  private async calculateCarrierPerformance(
    shipments: Array<{
      carrierCode: string | null;
      createdAt: Date;
      deliveredAt: Date;
      estimatedDeliveryDate: Date | null;
    }>,
  ): Promise<
    Record<
      string,
      {
        totalShipments: number;
        onTimeDeliveries: number;
        averageTransitTime: number;
        successRate: number;
      }
    >
  > {
    const carrierMap = new Map<
      string,
      {
        totalShipments: number;
        onTimeDeliveries: number;
        transitTimes: number[];
      }
    >();

    for (const shipment of shipments) {
      const carrierCode = shipment.carrierCode || 'unknown';
      if (!carrierMap.has(carrierCode)) {
        carrierMap.set(carrierCode, {
          totalShipments: 0,
          onTimeDeliveries: 0,
          transitTimes: [],
        });
      }

      const data = carrierMap.get(carrierCode)!;
      data.totalShipments++;

      const transitTime =
        (shipment.deliveredAt.getTime() - shipment.createdAt.getTime()) /
        (1000 * 60 * 60 * 24);
      data.transitTimes.push(transitTime);

      if (
        shipment.estimatedDeliveryDate &&
        shipment.deliveredAt <= shipment.estimatedDeliveryDate
      ) {
        data.onTimeDeliveries++;
      }
    }

    const result: Record<
      string,
      {
        totalShipments: number;
        onTimeDeliveries: number;
        averageTransitTime: number;
        successRate: number;
      }
    > = {};

    for (const [carrierCode, data] of carrierMap.entries()) {
      const averageTransitTime =
        data.transitTimes.length > 0
          ? data.transitTimes.reduce((sum, time) => sum + time, 0) /
            data.transitTimes.length
          : 0;
      const successRate =
        data.totalShipments > 0
          ? (data.onTimeDeliveries / data.totalShipments) * 100
          : 0;

      result[carrierCode] = {
        totalShipments: data.totalShipments,
        onTimeDeliveries: data.onTimeDeliveries,
        averageTransitTime,
        successRate,
      };
    }

    return result;
  }
}

/**
 * Factory function to create a ShippingAnalyticsService instance
 */
export function createShippingAnalyticsService(
  prisma: PrismaClient,
): ShippingAnalyticsService {
  return new ShippingAnalyticsService(prisma);
}
