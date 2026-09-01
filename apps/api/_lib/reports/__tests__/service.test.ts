/**
 * Reports Service Tests
 *
 * Unit tests for ReportsService
 */

import { describe, it, expect } from 'vitest';

import { ReportsService } from '../service';

describe('ReportsService', () => {
  const mockShopOwnerId = 'shop-123';

  describe('generateSalesReport', () => {
    it('returns sales report structure', async () => {
      const result = await ReportsService.generateSalesReport(mockShopOwnerId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toHaveProperty('reportId');
      expect(result).toHaveProperty('reportType', 'sales');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('data');
    });

    it('generates unique report ID', async () => {
      const result1 = await ReportsService.generateSalesReport(
        mockShopOwnerId,
        {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      );
      const result2 = await ReportsService.generateSalesReport(
        mockShopOwnerId,
        {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      );

      expect(result1.reportId).not.toBe(result2.reportId);
    });
  });

  describe('generateInventoryReport', () => {
    it('returns inventory report structure', async () => {
      const result =
        await ReportsService.generateInventoryReport(mockShopOwnerId);

      expect(result).toHaveProperty('reportId');
      expect(result).toHaveProperty('reportType', 'inventory');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('data');
    });
  });

  describe('generateReturnsReport', () => {
    it('returns returns report structure', async () => {
      const result = await ReportsService.generateReturnsReport(
        mockShopOwnerId,
        {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      );

      expect(result).toHaveProperty('reportId');
      expect(result).toHaveProperty('reportType', 'returns');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('data');
    });
  });

  describe('generatePaymentReport', () => {
    it('returns payment report structure', async () => {
      const result = await ReportsService.generatePaymentReport(
        mockShopOwnerId,
        {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      );

      expect(result).toHaveProperty('reportId');
      expect(result).toHaveProperty('reportType', 'payment');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('data');
    });
  });

  describe('generateShippingReport', () => {
    it('returns shipping report structure', async () => {
      const result = await ReportsService.generateShippingReport(
        mockShopOwnerId,
        {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      );

      expect(result).toHaveProperty('reportId');
      expect(result).toHaveProperty('reportType', 'shipping');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('data');
    });
  });

  describe('generateTaxReport', () => {
    it('returns tax report structure', async () => {
      const result = await ReportsService.generateTaxReport(mockShopOwnerId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toHaveProperty('reportId');
      expect(result).toHaveProperty('reportType', 'tax');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('data');
    });
  });

  describe('exportToCSV', () => {
    it('returns CSV string', async () => {
      const result = await ReportsService.exportToCSV({
        reportId: 'test',
        summary: { total: 0 },
        data: [],
      });
      expect(typeof result).toBe('string');
    });
  });

  describe('exportToPDF', () => {
    it('returns buffer with content', async () => {
      const result = await ReportsService.exportToPDF({
        reportId: 'test',
        reportType: 'sales',
        summary: {},
        data: [],
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
