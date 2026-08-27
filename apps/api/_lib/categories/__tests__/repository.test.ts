/**
 * Category Repository Tests
 * Tests for category data access layer
 */

import { PrismaClient } from '@prisma/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { categoryRepository } from '../repository';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  })),
}));

describe('CategoryRepository', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findById', () => {
    it('should return category by ID', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        isActive: true,
        isHidden: false,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryRepository.findById('cat-1');

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: { parent: true, children: true },
      });
    });

    it('should return null if category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const result = await categoryRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        isActive: true,
        isHidden: false,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryRepository.findBySlug('electronics');

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'electronics' },
        include: { parent: true, children: true },
      });
    });
  });

  describe('findMany', () => {
    it('should return paginated list of categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
        { id: 'cat-2', name: 'Clothing', slug: 'clothing' },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.category.count.mockResolvedValue(2);

      const result = await categoryRepository.findMany({ page: 1, limit: 10 });

      expect(result.categories).toEqual(mockCategories);
      expect(result.pagination.total).toBe(2);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter by parentId', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.category.count.mockResolvedValue(0);

      await categoryRepository.findMany({ parentId: 'parent-1' });

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { parentId: 'parent-1' },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter by isActive', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.category.count.mockResolvedValue(0);

      await categoryRepository.findMany({ isActive: true });

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findTree', () => {
    it('should return category tree structure', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Electronics', parentId: null },
        { id: 'cat-2', name: 'Phones', parentId: 'cat-1' },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await categoryRepository.findTree();

      expect(result).toEqual(mockCategories);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isHidden: false },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter tree by parentId', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);

      await categoryRepository.findTree('parent-1');

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { parentId: 'parent-1', isActive: true, isHidden: false },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findRoot', () => {
    it('should return root categories (no parent)', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Electronics', parentId: null },
        { id: 'cat-2', name: 'Clothing', parentId: null },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await categoryRepository.findRoot();

      expect(result).toEqual(mockCategories);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { parentId: null, isActive: true, isHidden: false },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('countProducts', () => {
    it('should count products in category', async () => {
      mockPrisma.product.count.mockResolvedValue(5);

      const result = await categoryRepository.countProducts('cat-1');

      expect(result).toBe(5);
      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: {
          categoryId: 'cat-1',
          isActive: true,
          status: 'published',
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        isActive: true,
        isHidden: false,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.create.mockResolvedValue(mockCategory);

      const result = await categoryRepository.create({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
      });

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic products',
          isActive: true,
          isHidden: false,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics Updated',
        slug: 'electronics',
        description: 'Updated description',
        isActive: true,
        isHidden: false,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.update.mockResolvedValue(mockCategory);

      const result = await categoryRepository.update('cat-1', {
        name: 'Electronics Updated',
        description: 'Updated description',
      });

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: {
          name: 'Electronics Updated',
          description: 'Updated description',
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
      };

      mockPrisma.category.delete.mockResolvedValue(mockCategory);

      const result = await categoryRepository.delete('cat-1');

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });
  });
});
