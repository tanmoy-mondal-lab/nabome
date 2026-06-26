import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPrisma, makeRequest, makeContext, parseResponse } from './test-utils';

vi.mock('../../_lib/prisma', () => ({
  getPrisma: vi.fn(),
}));

import { getPrisma } from '../../_lib/prisma';
import { handleProductRequest } from '../products';

const mockPrisma = createMockPrisma();
vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);

describe('products handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);
  });

  describe('handleList', () => {
    it('should return paginated products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: '1', name: 'Test Product', slug: 'test-product' },
      ]);
      mockPrisma.product.count.mockResolvedValue(1);

      const req = makeRequest('GET', '/api/products');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, [], 'list');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.products).toHaveLength(1);
      expect(body.data.pagination.total).toBe(1);
    });

    it('should handle empty results', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const req = makeRequest('GET', '/api/products');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, [], 'list');
      const body = await parseResponse(res);

      expect(body.data.products).toHaveLength(0);
      expect(body.data.pagination.totalPages).toBe(0);
    });

    it('should apply category filter', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const req = makeRequest('GET', '/api/products?category=men');
      const ctx = makeContext();
      await handleProductRequest(req, ctx, [], 'list');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'men' },
          }),
        })
      );
    });

    it('should apply price range filter', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const req = makeRequest('GET', '/api/products?minPrice=500&maxPrice=2000');
      const ctx = makeContext();
      await handleProductRequest(req, ctx, [], 'list');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            basePrice: { gte: 500, lte: 2000 },
          }),
        })
      );
    });

    it('should apply sort by price_asc', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const req = makeRequest('GET', '/api/products?sort=price_asc');
      const ctx = makeContext();
      await handleProductRequest(req, ctx, [], 'list');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { basePrice: 'asc' },
        })
      );
    });

    it('should apply pagination', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const req = makeRequest('GET', '/api/products?page=2&limit=6');
      const ctx = makeContext();
      await handleProductRequest(req, ctx, [], 'list');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 6,
          take: 6,
        })
      );
    });
  });

  describe('handleFeatured', () => {
    it('should return featured products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: '1', name: 'Featured Product', isFeatured: true },
      ]);

      const req = makeRequest('GET', '/api/products/featured');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, [], 'featured');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.products).toHaveLength(1);
    });
  });

  describe('handleNewArrivals', () => {
    it('should return new arrivals', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: '1', name: 'New Product', isNew: true },
      ]);

      const req = makeRequest('GET', '/api/products/new');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, [], 'newArrivals');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.products).toHaveLength(1);
    });
  });

  describe('handleSearch', () => {
    it('should return search results', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: '1', name: 'Blue Shirt' },
      ]);
      mockPrisma.product.count.mockResolvedValue(1);

      const req = makeRequest('GET', '/api/products/search?q=shirt');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, [], 'search');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.query).toBe('shirt');
      expect(body.data.products).toHaveLength(1);
    });

    it('should reject short queries', async () => {
      const req = makeRequest('GET', '/api/products/search?q=a');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, [], 'search');
      const body = await parseResponse(res);

      expect(res.status).toBe(400);
    });

    it('should reject empty queries', async () => {
      const req = makeRequest('GET', '/api/products/search');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, [], 'search');
      const body = await parseResponse(res);

      expect(res.status).toBe(400);
    });
  });

  describe('handleDetail', () => {
    it('should return product detail', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
      });
      mockPrisma.relatedProduct.findMany.mockResolvedValue([]);

      const req = makeRequest('GET', '/api/products/test-product');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, ['test-product'], 'detail');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.product.name).toBe('Test Product');
    });

    it('should return 404 for missing product', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      const req = makeRequest('GET', '/api/products/nonexistent');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, ['nonexistent'], 'detail');
      const body = await parseResponse(res);

      expect(res.status).toBe(404);
    });
  });

  describe('handleVariants', () => {
    it('should return product variants', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.productVariant.findMany.mockResolvedValue([
        { id: 'var-1', size: 'M', color: 'Blue' },
      ]);

      const req = makeRequest('GET', '/api/products/test/variants');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, ['test'], 'variants');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.variants).toHaveLength(1);
    });

    it('should return 404 for missing product', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      const req = makeRequest('GET', '/api/products/nonexistent/variants');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, ['nonexistent'], 'variants');

      expect(res.status).toBe(404);
    });
  });

  describe('handleProductReviews', () => {
    it('should return reviews with stats', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.review.findMany.mockResolvedValue([
        { id: 'r1', rating: 5, profile: { firstName: 'John' } },
        { id: 'r2', rating: 3, profile: { firstName: 'Jane' } },
      ]);

      const req = makeRequest('GET', '/api/products/test/reviews');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, ['test'], 'reviews');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.reviews).toHaveLength(2);
      expect(body.data.stats.total).toBe(2);
      expect(body.data.stats.averageRating).toBe(4);
    });

    it('should return 404 for missing product', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      const req = makeRequest('GET', '/api/products/nonexistent/reviews');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, ['nonexistent'], 'reviews');

      expect(res.status).toBe(404);
    });
  });

  describe('unknown action', () => {
    it('should return 400 for unknown action', async () => {
      const req = makeRequest('GET', '/api/products');
      const ctx = makeContext();
      const res = await handleProductRequest(req, ctx, [], 'unknown');
      const body = await parseResponse(res);

      expect(res.status).toBe(400);
    });
  });
});
