/**
 * Product Repository Tests
 * Tests for product data access layer
 */

import { PrismaClient } from '@prisma/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { productRepository } from '../repository';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    productVariant: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productMedia: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productAttribute: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productCollection: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  })),
}));

describe('ProductRepository', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findById', () => {
    it('should return product by ID', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
        basePrice: { amount: '1000', currency: 'INR' },
        isActive: true,
        status: 'published',
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await productRepository.findById('prod-1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        include: expect.objectContaining({
          variants: true,
          media: true,
          attributes: true,
          category: true,
          brand: true,
        }),
      });
    });

    it('should return null if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const result = await productRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return product by slug', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
        isActive: true,
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await productRepository.findBySlug('test-product');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
        include: expect.any(Object),
      });
    });
  });

  describe('findMany', () => {
    it('should return paginated list of products', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1' },
        { id: 'prod-2', name: 'Product 2' },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      const result = await productRepository.findMany({ page: 1, limit: 10 });

      expect(result.products).toEqual(mockProducts);
      expect(result.pagination.total).toBe(2);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter by categoryId', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await productRepository.findMany({ categoryId: 'cat-1' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { categoryId: 'cat-1' },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter by status', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await productRepository.findMany({ status: 'published' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { status: 'published' },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findFeatured', () => {
    it('should return featured products', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', isFeatured: true },
        { id: 'prod-2', name: 'Product 2', isFeatured: true },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const result = await productRepository.findMany({
        isFeatured: true,
        limit: 10,
      });

      expect(result.products).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { isActive: true, isFeatured: true },
        orderBy: expect.any(Object),
      });
    });
  });

  describe('findNew', () => {
    it('should return new products', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', isNew: true },
        { id: 'prod-2', name: 'Product 2', isNew: true },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      const result = await productRepository.findMany({
        isNew: true,
        limit: 10,
        sortBy: 'createdAt',
      });

      expect(result.products).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { isActive: true, isNew: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findTrending', () => {
    it('should return trending products', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', isTrending: true },
        { id: 'prod-2', name: 'Product 2', isTrending: true },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      const result = await productRepository.findMany({
        isTrending: true,
        limit: 10,
        sortBy: 'popularity',
      });

      expect(result.products).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { isActive: true, isTrending: true },
        orderBy: expect.any(Object),
      });
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
      };

      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await productRepository.create({
        name: 'Test Product',
        slug: 'test-product',
        basePrice: 1000,
        categoryId: 'cat-1',
      } as any);

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Product',
          slug: 'test-product',
        }),
      });
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Updated Product',
        slug: 'test-product',
      };

      mockPrisma.product.update.mockResolvedValue(mockProduct);

      const result = await productRepository.update('prod-1', {
        name: 'Updated Product',
      });

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { name: 'Updated Product' },
      });
    });
  });

  describe('delete', () => {
    it('should soft delete a product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        isActive: false,
      };

      mockPrisma.product.update.mockResolvedValue(mockProduct);

      const result = await productRepository.delete('prod-1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { isActive: false },
      });
    });
  });
});
