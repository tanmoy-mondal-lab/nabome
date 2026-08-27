/**
 * Product Service Tests
 * Tests for product business logic layer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { productRepository } from '../repository';
import { productService } from '../service';

// Mock repository
vi.mock('../repository', () => ({
  productRepository: {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateDenormalizedFields: vi.fn(),
  },
}));

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getById', () => {
    it('should return product by ID', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
        isActive: true,
      };

      vi.mocked(productRepository.findById).mockResolvedValue(
        mockProduct as any,
      );

      const result = await productService.getById('prod-1');

      expect(result).toEqual(mockProduct);
      expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    });
  });

  describe('getBySlug', () => {
    it('should return product by slug', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
        isActive: true,
      };

      vi.mocked(productRepository.findBySlug).mockResolvedValue(
        mockProduct as any,
      );

      const result = await productService.getBySlug('test-product');

      expect(result).toEqual(mockProduct);
      expect(productRepository.findBySlug).toHaveBeenCalledWith('test-product');
    });
  });

  describe('list', () => {
    it('should return paginated products', async () => {
      const mockResult = {
        products: [
          { id: 'prod-1', name: 'Product 1' },
          { id: 'prod-2', name: 'Product 2' },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      vi.mocked(productRepository.findMany).mockResolvedValue(
        mockResult as any,
      );

      const result = await productService.list({ page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(productRepository.findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getFeatured', () => {
    it('should return featured products', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', isFeatured: true },
        { id: 'prod-2', name: 'Product 2', isFeatured: true },
      ];

      vi.mocked(productRepository.findMany).mockResolvedValue({
        products: mockProducts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      } as any);

      const result = await productService.getFeatured(10);

      expect(result).toEqual(mockProducts);
      expect(productRepository.findMany).toHaveBeenCalledWith({
        isFeatured: true,
        limit: 10,
        sortBy: 'sortOrder',
      });
    });
  });

  describe('getNew', () => {
    it('should return new products', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', isNew: true },
        { id: 'prod-2', name: 'Product 2', isNew: true },
      ];

      vi.mocked(productRepository.findMany).mockResolvedValue({
        products: mockProducts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      } as any);

      const result = await productService.getNew(10);

      expect(result).toEqual(mockProducts);
      expect(productRepository.findMany).toHaveBeenCalledWith({
        isNew: true,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });
  });

  describe('getTrending', () => {
    it('should return trending products', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', isTrending: true },
        { id: 'prod-2', name: 'Product 2', isTrending: true },
      ];

      vi.mocked(productRepository.findMany).mockResolvedValue({
        products: mockProducts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      } as any);

      const result = await productService.getTrending(10);

      expect(result).toEqual(mockProducts);
      expect(productRepository.findMany).toHaveBeenCalledWith({
        isTrending: true,
        limit: 10,
        sortBy: 'popularity',
        sortOrder: 'desc',
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

      vi.mocked(productRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(productRepository.create).mockResolvedValue(mockProduct as any);

      const result = await productService.create({
        name: 'Test Product',
        slug: 'test-product',
        basePrice: 1000,
        categoryId: 'cat-1',
      } as any);

      expect(result).toEqual(mockProduct);
      expect(productRepository.create).toHaveBeenCalled();
    });

    it('should throw error if slug already exists', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
      };

      vi.mocked(productRepository.findBySlug).mockResolvedValue(
        mockProduct as any,
      );

      await expect(
        productService.create({
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 1000,
          categoryId: 'cat-1',
        } as any),
      ).rejects.toThrow('Product with this slug already exists');
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
      };

      vi.mocked(productRepository.findById).mockResolvedValue(
        mockProduct as any,
      );
      vi.mocked(productRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(productRepository.update).mockResolvedValue(mockProduct as any);

      const result = await productService.update('prod-1', {
        name: 'Updated Product',
      });

      expect(result).toEqual(mockProduct);
      expect(productRepository.update).toHaveBeenCalled();
    });

    it('should throw error if product not found', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue(null);

      await expect(
        productService.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow('Product not found');
    });
  });

  describe('delete', () => {
    it('should soft delete a product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        isActive: false,
      };

      vi.mocked(productRepository.findById).mockResolvedValue(
        mockProduct as any,
      );
      vi.mocked(productRepository.delete).mockResolvedValue(mockProduct as any);

      const result = await productService.delete('prod-1');

      expect(result).toEqual(mockProduct);
      expect(productRepository.delete).toHaveBeenCalledWith('prod-1');
    });

    it('should throw error if product not found', async () => {
      vi.mocked(productRepository.findById).mockResolvedValue(null);

      await expect(productService.delete('non-existent')).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('publish', () => {
    it('should publish a product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        status: 'published',
      };

      vi.mocked(productRepository.findById).mockResolvedValue(
        mockProduct as any,
      );
      vi.mocked(productRepository.update).mockResolvedValue(mockProduct as any);

      const result = await productService.publish('prod-1');

      expect(result).toEqual(mockProduct);
      expect(productRepository.update).toHaveBeenCalledWith('prod-1', {
        status: 'published',
      });
    });
  });

  describe('archive', () => {
    it('should archive a product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        status: 'archived',
      };

      vi.mocked(productRepository.findById).mockResolvedValue(
        mockProduct as any,
      );
      vi.mocked(productRepository.update).mockResolvedValue(mockProduct as any);

      const result = await productService.archive('prod-1');

      expect(result).toEqual(mockProduct);
      expect(productRepository.update).toHaveBeenCalledWith('prod-1', {
        status: 'archived',
      });
    });
  });
});
