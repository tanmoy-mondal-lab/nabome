import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPrisma, makeRequest, makeContext, parseResponse } from './test-utils';

vi.mock('../../_lib/prisma', () => ({
  getPrisma: vi.fn(),
}));

import { getPrisma } from '../../_lib/prisma';
import { handleCouponRequest } from '../coupons';

const mockPrisma = createMockPrisma();
vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);

describe('coupons handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);
  });

  describe('handleValidate', () => {
    it('should validate a valid coupon', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
        usageLimit: null,
        usedCount: 0,
        perUserLimit: 1,
        minOrderValue: null,
        maxDiscount: null,
        applicableGender: null,
      });
      mockPrisma.couponRedemption.count.mockResolvedValue(0);

      const req = makeRequest('POST', '/api/coupons/validate', {
        code: 'SAVE10',
        subtotal: '1000',
      });
      const ctx = makeContext('user-1');
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.valid).toBe(true);
      expect(body.data.coupon.discountType).toBe('percentage');
      expect(body.data.coupon.discountAmount).toBe(100);
    });

    it('should reject non-existent coupon', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue(null);

      const req = makeRequest('POST', '/api/coupons/validate', {
        code: 'NONEXISTENT',
      });
      const ctx = makeContext();
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.valid).toBe(false);
      expect(body.data.message).toBe('Invalid coupon code');
    });

    it('should reject inactive coupon', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'OLD',
        isActive: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
      });

      const req = makeRequest('POST', '/api/coupons/validate', { code: 'OLD' });
      const ctx = makeContext();
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(body.data.valid).toBe(false);
      expect(body.data.message).toContain('no longer active');
    });

    it('should reject expired coupon', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'EXPIRED',
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
      });

      const req = makeRequest('POST', '/api/coupons/validate', { code: 'EXPIRED' });
      const ctx = makeContext();
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(body.data.valid).toBe(false);
      expect(body.data.message).toContain('expired');
    });

    it('should reject coupon at usage limit', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'LIMITED',
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
        usageLimit: 10,
        usedCount: 10,
        perUserLimit: 1,
      });

      const req = makeRequest('POST', '/api/coupons/validate', { code: 'LIMITED' });
      const ctx = makeContext();
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(body.data.valid).toBe(false);
      expect(body.data.message).toContain('usage limit');
    });

    it('should reject coupon below minimum order value', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'MINORDER',
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
        usageLimit: null,
        usedCount: 0,
        perUserLimit: 1,
        minOrderValue: 500,
        discountType: 'percentage',
        discountValue: 10,
      });
      mockPrisma.couponRedemption.count.mockResolvedValue(0);

      const req = makeRequest('POST', '/api/coupons/validate', {
        code: 'MINORDER',
        subtotal: '200',
      });
      const ctx = makeContext('user-1');
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(body.data.valid).toBe(false);
      expect(body.data.message).toContain('Minimum order');
    });

    it('should calculate fixed discount', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'FLAT100',
        discountType: 'fixed',
        discountValue: 100,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
        usageLimit: null,
        usedCount: 0,
        perUserLimit: 1,
        minOrderValue: null,
        maxDiscount: null,
        applicableGender: null,
      });
      mockPrisma.couponRedemption.count.mockResolvedValue(0);

      const req = makeRequest('POST', '/api/coupons/validate', {
        code: 'FLAT100',
        subtotal: '1000',
      });
      const ctx = makeContext('user-1');
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(body.data.valid).toBe(true);
      expect(body.data.coupon.discountAmount).toBe(100);
    });

    it('should cap percentage discount at maxDiscount', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'CAPPED',
        discountType: 'percentage',
        discountValue: 50,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
        usageLimit: null,
        usedCount: 0,
        perUserLimit: 1,
        minOrderValue: null,
        maxDiscount: 200,
        applicableGender: null,
      });
      mockPrisma.couponRedemption.count.mockResolvedValue(0);

      const req = makeRequest('POST', '/api/coupons/validate', {
        code: 'CAPPED',
        subtotal: '1000',
      });
      const ctx = makeContext('user-1');
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(body.data.valid).toBe(true);
      expect(body.data.coupon.discountAmount).toBe(200);
    });

    it('should reject coupon exceeding per-user limit', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'USED',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
        usageLimit: null,
        usedCount: 0,
        perUserLimit: 1,
        minOrderValue: null,
      });
      mockPrisma.couponRedemption.count.mockResolvedValue(1);

      const req = makeRequest('POST', '/api/coupons/validate', {
        code: 'USED',
        subtotal: '1000',
      });
      const ctx = makeContext('user-1');
      const res = await handleCouponRequest(req, ctx, [], 'validate');
      const body = await parseResponse(res);

      expect(body.data.valid).toBe(false);
      expect(body.data.message).toContain('already used');
    });

    it('should uppercase coupon code before lookup', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue(null);

      const req = makeRequest('POST', '/api/coupons/validate', {
        code: 'lowercase',
      });
      const ctx = makeContext();
      await handleCouponRequest(req, ctx, [], 'validate');

      expect(mockPrisma.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: 'LOWERCASE' },
      });
    });
  });

  describe('unknown action', () => {
    it('should return 400 for unknown action', async () => {
      const req = makeRequest('POST', '/api/coupons');
      const ctx = makeContext();
      const res = await handleCouponRequest(req, ctx, [], 'unknown');

      expect(res.status).toBe(400);
    });
  });
});
