import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPrisma, makeRequest, makeContext, parseResponse } from './test-utils';

vi.mock('../../_lib/prisma', () => ({
  getPrisma: vi.fn(),
}));

import { getPrisma } from '../../_lib/prisma';
import { handleWishlistRequest } from '../wishlist';

const mockPrisma = createMockPrisma();
vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);

describe('wishlist handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);
  });

  describe('handleList', () => {
    it('should return wishlist items', async () => {
      mockPrisma.wishlistItem.findMany.mockResolvedValue([
        { id: 'w1', variantId: 'var-1', variant: { product: { name: 'Test' } } },
      ]);

      const req = makeRequest('GET', '/api/wishlist');
      const ctx = makeContext('user-1');
      const res = await handleWishlistRequest(req, ctx, []);
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.items).toHaveLength(1);
    });

    it('should return 401 if not authenticated', async () => {
      const req = makeRequest('GET', '/api/wishlist');
      const ctx = makeContext();
      const res = await handleWishlistRequest(req, ctx, []);

      expect(res.status).toBe(401);
    });
  });

  describe('handleAdd', () => {
    it('should add item to wishlist', async () => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue(null);
      mockPrisma.wishlistItem.create.mockResolvedValue({
        id: 'w1',
        variantId: 'var-1',
      });

      const req = makeRequest('POST', '/api/wishlist', { variantId: 'var-1' });
      const ctx = makeContext('user-1');
      const res = await handleWishlistRequest(req, ctx, [], 'add');
      const body = await parseResponse(res);

      expect(res.status).toBe(201);
    });

    it('should return success for duplicate add', async () => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue({
        id: 'w1',
        variantId: 'var-1',
      });

      const req = makeRequest('POST', '/api/wishlist', { variantId: 'var-1' });
      const ctx = makeContext('user-1');
      const res = await handleWishlistRequest(req, ctx, [], 'add');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.message).toBe('Already in wishlist');
    });

    it('should reject missing variantId', async () => {
      const req = makeRequest('POST', '/api/wishlist', {});
      const ctx = makeContext('user-1');
      const res = await handleWishlistRequest(req, ctx, [], 'add');

      expect(res.status).toBe(400);
    });
  });

  describe('handleRemove', () => {
    it('should remove item from wishlist', async () => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue({
        id: 'w1',
        variantId: 'var-1',
      });
      mockPrisma.wishlistItem.delete.mockResolvedValue({});

      const req = makeRequest('DELETE', '/api/wishlist/var-1');
      const ctx = makeContext('user-1');
      const res = await handleWishlistRequest(req, ctx, ['var-1'], 'remove');
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.message).toBe('Removed from wishlist');
    });

    it('should return 404 for non-existent item', async () => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue(null);

      const req = makeRequest('DELETE', '/api/wishlist/nonexistent');
      const ctx = makeContext('user-1');
      const res = await handleWishlistRequest(req, ctx, ['nonexistent'], 'remove');

      expect(res.status).toBe(404);
    });
  });
});
