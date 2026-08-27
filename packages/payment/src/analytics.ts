/**
 * Payment Analytics - Track payment success rate, failure rate, refund rate, settlement time, provider performance, revenue
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §15 (Analytics),
 * ANALYTICS_ARCHITECTURE.md (if exists)
 *
 * This module provides analytics and metrics tracking for payment operations:
 * - Payment success rate
 * - Payment failure rate
 * - Refund rate
 * - Settlement time
 * - Average transaction value
 * - Provider performance
 * - Revenue tracking
 * - Platform fees tracking
 */

import { PaymentStatus, RefundStatus, SettlementStatus } from './enums';
import type { PaymentRepository } from './repository';

/**
 * Time period for analytics
 */
export enum AnalyticsPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

/**
 * Payment metrics
 */
export interface PaymentMetrics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  successRate: number;
  failureRate: number;
  totalAmount: number;
  averageTransactionValue: number;
  currency: string;
}

/**
 * Refund metrics
 */
export interface RefundMetrics {
  totalRefunds: number;
  completedRefunds: number;
  pendingRefunds: number;
  failedRefunds: number;
  refundRate: number;
  totalRefundAmount: number;
  averageRefundAmount: number;
  currency: string;
}

/**
 * Settlement metrics
 */
export interface SettlementMetrics {
  totalSettlements: number;
  completedSettlements: number;
  pendingSettlements: number;
  failedSettlements: number;
  totalSettlementAmount: number;
  averageSettlementAmount: number;
  averageSettlementTime: number; // in hours
  currency: string;
}

/**
 * Provider performance metrics
 */
export interface ProviderPerformanceMetrics {
  provider: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  successRate: number;
  averageResponseTime: number; // in milliseconds
  totalAmount: number;
  currency: string;
}

/**
 * Revenue metrics
 */
export interface RevenueMetrics {
  totalRevenue: number;
  platformFees: number;
  netRevenue: number;
  currency: string;
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
}

/**
 * Analytics query filters
 */
export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  shopId?: string;
  provider?: string;
  currency?: string;
  status?: PaymentStatus | RefundStatus | SettlementStatus;
}

/**
 * Payment Analytics Service class
 */
export class PaymentAnalyticsService {
  constructor(private repository: PaymentRepository) {}

  /**
   * Get payment metrics
   */
  async getPaymentMetrics(filters?: AnalyticsFilters): Promise<PaymentMetrics> {
    const payments = await this.repository.listPayments({
      limit: 10000,
    });

    let filteredPayments = payments;

    if (filters?.startDate || filters?.endDate) {
      filteredPayments = filteredPayments.filter((p) => {
        const createdAt = p.createdAt || new Date();
        if (filters.startDate && createdAt < filters.startDate) return false;
        if (filters.endDate && createdAt > filters.endDate) return false;
        return true;
      });
    }

    if (filters?.shopId) {
      filteredPayments = filteredPayments.filter(
        (p) => p.orderId === filters.shopId,
      );
    }

    if (filters?.provider) {
      filteredPayments = filteredPayments.filter(
        (p) => p.provider === filters.provider,
      );
    }

    if (filters?.currency) {
      filteredPayments = filteredPayments.filter(
        (p) => p.currency === filters.currency,
      );
    }

    const totalPayments = filteredPayments.length;
    const successfulPayments = filteredPayments.filter(
      (p) =>
        p.status === PaymentStatus.CAPTURED ||
        p.status === PaymentStatus.COMPLETED,
    ).length;
    const failedPayments = filteredPayments.filter(
      (p) =>
        p.status === PaymentStatus.FAILED ||
        p.status === PaymentStatus.CANCELLED,
    ).length;
    const pendingPayments = filteredPayments.filter(
      (p) =>
        p.status === PaymentStatus.INITIATED ||
        p.status === PaymentStatus.AUTHORIZED,
    ).length;

    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const averageTransactionValue =
      totalPayments > 0 ? totalAmount / totalPayments : 0;
    const successRate =
      totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
    const failureRate =
      totalPayments > 0 ? (failedPayments / totalPayments) * 100 : 0;

    const currency = filteredPayments[0]?.currency || 'INR';

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      successRate,
      failureRate,
      totalAmount,
      averageTransactionValue,
      currency,
    };
  }

  /**
   * Get refund metrics
   */
  async getRefundMetrics(filters?: AnalyticsFilters): Promise<RefundMetrics> {
    const refunds = await this.repository.listRefunds({
      limit: 10000,
    });

    let filteredRefunds = refunds;

    if (filters?.startDate || filters?.endDate) {
      filteredRefunds = filteredRefunds.filter((r) => {
        const createdAt = r.createdAt || new Date();
        if (filters.startDate && createdAt < filters.startDate) return false;
        if (filters.endDate && createdAt > filters.endDate) return false;
        return true;
      });
    }

    if (filters?.currency) {
      filteredRefunds = filteredRefunds.filter(
        (r) => r.currency === filters.currency,
      );
    }

    const totalRefunds = filteredRefunds.length;
    const completedRefunds = filteredRefunds.filter(
      (r) =>
        r.status === RefundStatus.COMPLETED ||
        r.status === RefundStatus.SETTLED,
    ).length;
    const pendingRefunds = filteredRefunds.filter(
      (r) =>
        r.status === RefundStatus.INITIATED ||
        r.status === RefundStatus.PROCESSING,
    ).length;
    const failedRefunds = filteredRefunds.filter(
      (r) => r.status === RefundStatus.FAILED,
    ).length;

    const totalRefundAmount = filteredRefunds.reduce(
      (sum, r) => sum + r.amount,
      0,
    );
    const averageRefundAmount =
      totalRefunds > 0 ? totalRefundAmount / totalRefunds : 0;

    // Calculate refund rate relative to total payments
    const payments = await this.repository.listPayments({ limit: 10000 });
    const totalPayments = payments.length;
    const refundRate =
      totalPayments > 0 ? (totalRefunds / totalPayments) * 100 : 0;

    const currency = filteredRefunds[0]?.currency || 'INR';

    return {
      totalRefunds,
      completedRefunds,
      pendingRefunds,
      failedRefunds,
      refundRate,
      totalRefundAmount,
      averageRefundAmount,
      currency,
    };
  }

  /**
   * Get settlement metrics
   */
  async getSettlementMetrics(
    filters?: AnalyticsFilters,
  ): Promise<SettlementMetrics> {
    const settlements = await this.repository.listSettlements({
      limit: 10000,
    });

    let filteredSettlements = settlements;

    if (filters?.startDate || filters?.endDate) {
      filteredSettlements = filteredSettlements.filter((s) => {
        const createdAt = s.createdAt || new Date();
        if (filters.startDate && createdAt < filters.startDate) return false;
        if (filters.endDate && createdAt > filters.endDate) return false;
        return true;
      });
    }

    if (filters?.shopId) {
      filteredSettlements = filteredSettlements.filter(
        (s) => s.shopId === filters.shopId,
      );
    }

    const totalSettlements = filteredSettlements.length;
    const completedSettlements = filteredSettlements.filter(
      (s) =>
        s.status === SettlementStatus.COMPLETED ||
        s.status === SettlementStatus.PAID,
    ).length;
    const pendingSettlements = filteredSettlements.filter(
      (s) =>
        s.status === SettlementStatus.CREATED ||
        s.status === SettlementStatus.ELIGIBLE ||
        s.status === SettlementStatus.PROCESSING,
    ).length;
    const failedSettlements = filteredSettlements.filter(
      (s) => s.status === SettlementStatus.FAILED,
    ).length;

    const totalSettlementAmount = filteredSettlements.reduce(
      (sum, s) => sum + s.netAmount,
      0,
    );
    const averageSettlementAmount =
      totalSettlements > 0 ? totalSettlementAmount / totalSettlements : 0;

    // Calculate average settlement time
    const completedWithTimes = filteredSettlements.filter(
      (s) => s.createdAt && s.updatedAt,
    );
    const averageSettlementTime =
      completedWithTimes.length > 0
        ? completedWithTimes.reduce((sum, s) => {
            const hours =
              s.updatedAt && s.createdAt
                ? (s.updatedAt.getTime() - s.createdAt.getTime()) /
                  (1000 * 60 * 60)
                : 0;
            return sum + hours;
          }, 0) / completedWithTimes.length
        : 0;

    const currency = filteredSettlements[0]?.currency || 'INR';

    return {
      totalSettlements,
      completedSettlements,
      pendingSettlements,
      failedSettlements,
      totalSettlementAmount,
      averageSettlementAmount,
      averageSettlementTime,
      currency,
    };
  }

  /**
   * Get provider performance metrics
   */
  async getProviderPerformanceMetrics(
    filters?: AnalyticsFilters,
  ): Promise<ProviderPerformanceMetrics[]> {
    const payments = await this.repository.listPayments({
      limit: 10000,
    });

    let filteredPayments = payments;

    if (filters?.startDate || filters?.endDate) {
      filteredPayments = filteredPayments.filter((p) => {
        const createdAt = p.createdAt || new Date();
        if (filters.startDate && createdAt < filters.startDate) return false;
        if (filters.endDate && createdAt > filters.endDate) return false;
        return true;
      });
    }

    // Group by provider
    const providerGroups = new Map<string, typeof filteredPayments>();
    filteredPayments.forEach((p) => {
      const provider = p.provider || 'unknown';
      if (!providerGroups.has(provider)) {
        providerGroups.set(provider, []);
      }
      providerGroups.get(provider)!.push(p);
    });

    const metrics: ProviderPerformanceMetrics[] = [];

    for (const [provider, providerPayments] of providerGroups) {
      const totalTransactions = providerPayments.length;
      const successfulTransactions = providerPayments.filter(
        (p) =>
          p.status === PaymentStatus.CAPTURED ||
          p.status === PaymentStatus.COMPLETED,
      ).length;
      const failedTransactions = providerPayments.filter(
        (p) =>
          p.status === PaymentStatus.FAILED ||
          p.status === PaymentStatus.CANCELLED,
      ).length;

      const successRate =
        totalTransactions > 0
          ? (successfulTransactions / totalTransactions) * 100
          : 0;

      const totalAmount = providerPayments.reduce(
        (sum, p) => sum + p.amount,
        0,
      );

      // Get transactions to calculate response time
      const paymentIds = providerPayments.map((p) => p.id);
      const transactions = await Promise.all(
        paymentIds.map((id) => this.repository.getTransactionsByPaymentId(id)),
      );
      const allTransactions = transactions.flat();

      const averageResponseTime =
        allTransactions.length > 0
          ? allTransactions.reduce((sum, t) => {
              const responseTime = t.metadata?.responseTime as
                number | undefined;
              return sum + (responseTime || 0);
            }, 0) / allTransactions.length
          : 0;

      const currency = providerPayments[0]?.currency || 'INR';

      metrics.push({
        provider,
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        successRate,
        averageResponseTime,
        totalAmount,
        currency,
      });
    }

    return metrics.sort((a, b) => b.totalTransactions - a.totalTransactions);
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(
    period: AnalyticsPeriod,
    startDate: Date,
    endDate: Date,
    filters?: AnalyticsFilters,
  ): Promise<RevenueMetrics> {
    const payments = await this.repository.listPayments({
      limit: 10000,
    });

    const filteredPayments = payments.filter((p) => {
      const createdAt = p.createdAt || new Date();
      if (createdAt < startDate || createdAt > endDate) return false;
      if (filters?.shopId && p.orderId !== filters.shopId) return false;
      if (filters?.currency && p.currency !== filters.currency) return false;
      return (
        p.status === PaymentStatus.CAPTURED ||
        p.status === PaymentStatus.COMPLETED
      );
    });

    const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate platform fees (assuming 2.5% platform fee)
    const platformFeeRate = 0.025;
    const platformFees = totalRevenue * platformFeeRate;
    const netRevenue = totalRevenue - platformFees;

    const currency = filteredPayments[0]?.currency || 'INR';

    return {
      totalRevenue,
      platformFees,
      netRevenue,
      currency,
      period,
      startDate,
      endDate,
    };
  }

  /**
   * Get comprehensive analytics dashboard
   */
  async getAnalyticsDashboard(
    period: AnalyticsPeriod,
    startDate: Date,
    endDate: Date,
    filters?: AnalyticsFilters,
  ): Promise<{
    paymentMetrics: PaymentMetrics;
    refundMetrics: RefundMetrics;
    settlementMetrics: SettlementMetrics;
    providerPerformance: ProviderPerformanceMetrics[];
    revenueMetrics: RevenueMetrics;
  }> {
    const [
      paymentMetrics,
      refundMetrics,
      settlementMetrics,
      providerPerformance,
      revenueMetrics,
    ] = await Promise.all([
      this.getPaymentMetrics({ ...filters, startDate, endDate }),
      this.getRefundMetrics({ ...filters, startDate, endDate }),
      this.getSettlementMetrics({ ...filters, startDate, endDate }),
      this.getProviderPerformanceMetrics({ ...filters, startDate, endDate }),
      this.getRevenueMetrics(period, startDate, endDate, filters),
    ]);

    return {
      paymentMetrics,
      refundMetrics,
      settlementMetrics,
      providerPerformance,
      revenueMetrics,
    };
  }
}

/**
 * Payment analytics service factory
 */
export function createPaymentAnalyticsService(
  repository: PaymentRepository,
): PaymentAnalyticsService {
  return new PaymentAnalyticsService(repository);
}
