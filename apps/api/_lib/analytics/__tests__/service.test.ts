/**
 * Analytics Service Tests
 *
 * Unit tests for AnalyticsService
 */

import { describe, it, expect } from 'vitest';

import { AnalyticsService } from '../service';

describe('AnalyticsService', () => {
  const mockShopOwnerId = 'shop-123';

  describe('getSalesAnalytics', () => {
    it('returns sales analytics structure', async () => {
      const result = await AnalyticsService.getSalesAnalytics(mockShopOwnerId, {
        period: '7d',
      });

      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('totalOrders');
      expect(result).toHaveProperty('averageOrderValue');
      expect(result).toHaveProperty('conversionRate');
      expect(result).toHaveProperty('revenueByPeriod');
      expect(result).toHaveProperty('topProducts');
      expect(result).toHaveProperty('salesByCategory');
    });

    it('returns revenueByPeriod with daily, weekly, monthly', async () => {
      const result = await AnalyticsService.getSalesAnalytics(mockShopOwnerId, {
        period: '7d',
      });

      expect(result.revenueByPeriod).toHaveProperty('daily');
      expect(result.revenueByPeriod).toHaveProperty('weekly');
      expect(result.revenueByPeriod).toHaveProperty('monthly');
    });
  });

  describe('getProductAnalytics', () => {
    it('returns product analytics structure', async () => {
      const result = await AnalyticsService.getProductAnalytics(
        mockShopOwnerId,
        {
          period: '7d',
        },
      );

      expect(result).toHaveProperty('totalProducts');
      expect(result).toHaveProperty('activeProducts');
      expect(result).toHaveProperty('topSellingProducts');
      expect(result).toHaveProperty('lowPerformingProducts');
      expect(result).toHaveProperty('productViewsByPeriod');
    });

    it('returns productViewsByPeriod with daily and weekly', async () => {
      const result = await AnalyticsService.getProductAnalytics(
        mockShopOwnerId,
        {
          period: '7d',
        },
      );

      expect(result.productViewsByPeriod).toHaveProperty('daily');
      expect(result.productViewsByPeriod).toHaveProperty('weekly');
    });
  });

  describe('getInventoryAnalytics', () => {
    it('returns inventory analytics structure', async () => {
      const result =
        await AnalyticsService.getInventoryAnalytics(mockShopOwnerId);

      expect(result).toHaveProperty('totalInventoryValue');
      expect(result).toHaveProperty('totalProductsInStock');
      expect(result).toHaveProperty('lowStockProducts');
      expect(result).toHaveProperty('outOfStockProducts');
      expect(result).toHaveProperty('inventoryTurnover');
      expect(result).toHaveProperty('stockMovement');
    });
  });

  describe('getPaymentAnalytics', () => {
    it('returns payment analytics structure', async () => {
      const result = await AnalyticsService.getPaymentAnalytics(
        mockShopOwnerId,
        {
          period: '7d',
        },
      );

      expect(result).toHaveProperty('totalPayments');
      expect(result).toHaveProperty('successfulPayments');
      expect(result).toHaveProperty('failedPayments');
      expect(result).toHaveProperty('refundedPayments');
      expect(result).toHaveProperty('paymentMethods');
      expect(result).toHaveProperty('paymentTrends');
    });

    it('returns paymentTrends with daily and weekly', async () => {
      const result = await AnalyticsService.getPaymentAnalytics(
        mockShopOwnerId,
        {
          period: '7d',
        },
      );

      expect(result.paymentTrends).toHaveProperty('daily');
      expect(result.paymentTrends).toHaveProperty('weekly');
    });
  });

  describe('getShippingAnalytics', () => {
    it('returns shipping analytics structure', async () => {
      const result = await AnalyticsService.getShippingAnalytics(
        mockShopOwnerId,
        {
          period: '7d',
        },
      );

      expect(result).toHaveProperty('totalShipments');
      expect(result).toHaveProperty('inTransitShipments');
      expect(result).toHaveProperty('deliveredShipments');
      expect(result).toHaveProperty('exceptionShipments');
      expect(result).toHaveProperty('averageDeliveryTime');
      expect(result).toHaveProperty('carrierPerformance');
    });
  });

  describe('getReturnsAnalytics', () => {
    it('returns returns analytics structure', async () => {
      const result = await AnalyticsService.getReturnsAnalytics(
        mockShopOwnerId,
        {
          period: '7d',
        },
      );

      expect(result).toHaveProperty('totalReturns');
      expect(result).toHaveProperty('returnRate');
      expect(result).toHaveProperty('returnReasons');
      expect(result).toHaveProperty('returnsByCategory');
      expect(result).toHaveProperty('refundAmount');
    });
  });

  describe('getCustomerAnalytics', () => {
    it('returns customer analytics structure', async () => {
      const result = await AnalyticsService.getCustomerAnalytics(
        mockShopOwnerId,
        {
          period: '7d',
        },
      );

      expect(result).toHaveProperty('totalCustomers');
      expect(result).toHaveProperty('activeCustomers');
      expect(result).toHaveProperty('newCustomers');
      expect(result).toHaveProperty('repeatCustomers');
      expect(result).toHaveProperty('customerLifetimeValue');
      expect(result).toHaveProperty('averageOrderFrequency');
      expect(result).toHaveProperty('customerSegments');
    });
  });
});
