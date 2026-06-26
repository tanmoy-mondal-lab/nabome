import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPrisma, makeRequest, makeContext, parseResponse } from './test-utils';

vi.mock('../../_lib/prisma', () => ({
  getPrisma: vi.fn(),
}));

import { getPrisma } from '../../_lib/prisma';
import { handleReviewRequest } from '../reviews';

const mockPrisma = createMockPrisma();
vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);

describe('reviews handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);
  });

  describe('handleCreate', () => {
    it('should create a review', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.review.create.mockResolvedValue({
        id: 'rev-1',
        productId: 'prod-1',
        rating: 5,
        body: 'Great product!',
      });

      const req = makeRequest('POST', '/api/reviews', {
        productId: 'prod-1',
        rating: 5,
        body: 'Great product!',
      });
      const ctx = makeContext('user-1');
      const res = await handleReviewRequest(req, ctx, [], 'create');
      const body = await parseResponse(res);

      expect(res.status).toBe(201);
      expect(body.data.rating).toBe(5);
    });

    it('should return 401 if not authenticated', async () => {
      const req = makeRequest('POST', '/api/reviews', {
        productId: 'prod-1',
        rating: 5,
      });
      const ctx = makeContext();
      const res = await handleReviewRequest(req, ctx, [], 'create');

      expect(res.status).toBe(401);
    });

    it('should reject missing productId', async () => {
      const req = makeRequest('POST', '/api/reviews', {
        rating: 5,
      });
      const ctx = makeContext('user-1');
      const res = await handleReviewRequest(req, ctx, [], 'create');

      expect(res.status).toBe(400);
    });

    it('should reject missing rating', async () => {
      const req = makeRequest('POST', '/api/reviews', {
        productId: 'prod-1',
      });
      const ctx = makeContext('user-1');
      const res = await handleReviewRequest(req, ctx, [], 'create');

      expect(res.status).toBe(400);
    });

    it('should reject rating below 1', async () => {
      const req = makeRequest('POST', '/api/reviews', {
        productId: 'prod-1',
        rating: 0,
      });
      const ctx = makeContext('user-1');
      const res = await handleReviewRequest(req, ctx, [], 'create');

      expect(res.status).toBe(400);
    });

    it('should reject rating above 5', async () => {
      const req = makeRequest('POST', '/api/reviews', {
        productId: 'prod-1',
        rating: 6,
      });
      const ctx = makeContext('user-1');
      const res = await handleReviewRequest(req, ctx, [], 'create');

      expect(res.status).toBe(400);
    });

    it('should reject review for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const req = makeRequest('POST', '/api/reviews', {
        productId: 'nonexistent',
        rating: 5,
        body: 'Great product!',
      });
      const ctx = makeContext('user-1');
      const res = await handleReviewRequest(req, ctx, [], 'create');

      expect(res.status).toBe(400);
    });

    it('should reject duplicate review for same order', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'existing-review',
        productId: 'prod-1',
      });

      const req = makeRequest('POST', '/api/reviews', {
        productId: 'prod-1',
        orderId: 'order-1',
        rating: 5,
        body: 'Great product!',
      });
      const ctx = makeContext('user-1');
      const res = await handleReviewRequest(req, ctx, [], 'create');

      expect(res.status).toBe(400);
    });

    it('should accept all valid ratings 1-5', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.review.create.mockResolvedValue({});

      for (let rating = 1; rating <= 5; rating++) {
        vi.clearAllMocks();
        vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);
        mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });
        mockPrisma.review.create.mockResolvedValue({ id: 'rev-1', rating });

        const req = makeRequest('POST', '/api/reviews', {
          productId: 'prod-1',
          rating,
          body: `Rating ${rating} review body`,
        });
        const ctx = makeContext('user-1');
        const res = await handleReviewRequest(req, ctx, [], 'create');

        expect(res.status).toBe(201);
      }
    });
  });

  describe('unknown action', () => {
    it('should return 400 for unknown action', async () => {
      const req = makeRequest('POST', '/api/reviews');
      const ctx = makeContext('user-1');
      const res = await handleReviewRequest(req, ctx, [], 'unknown');

      expect(res.status).toBe(400);
    });
  });
});
