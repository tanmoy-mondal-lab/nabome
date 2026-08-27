/**
 * Category Service Tests
 * Tests for category business logic layer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { categoryRepository } from '../repository';
import { categoryService } from '../service';

// Mock repository
vi.mock('../repository', () => ({
  categoryRepository: {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findMany: vi.fn(),
    findTree: vi.fn(),
    findRoot: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countProducts: vi.fn(),
    findByParentId: vi.fn(),
  },
}));

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getById', () => {
    it('should return category by ID', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        isActive: true,
      };

      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any,
      );

      const result = await categoryService.getById('cat-1');

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.findById).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('getBySlug', () => {
    it('should return category by slug', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        isActive: true,
      };

      vi.mocked(categoryRepository.findBySlug).mockResolvedValue(
        mockCategory as any,
      );

      const result = await categoryService.getBySlug('electronics');

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.findBySlug).toHaveBeenCalledWith('electronics');
    });
  });

  describe('list', () => {
    it('should return paginated categories', async () => {
      const mockResult = {
        categories: [
          { id: 'cat-1', name: 'Electronics' },
          { id: 'cat-2', name: 'Clothing' },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      vi.mocked(categoryRepository.findMany).mockResolvedValue(
        mockResult as any,
      );

      const result = await categoryService.list({ page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(categoryRepository.findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getTree', () => {
    it('should return category tree', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Electronics' },
        { id: 'cat-2', name: 'Phones' },
      ];

      vi.mocked(categoryRepository.findTree).mockResolvedValue(
        mockCategories as any,
      );

      const result = await categoryService.getTree();

      expect(result).toEqual(mockCategories);
      expect(categoryRepository.findTree).toHaveBeenCalledWith();
    });
  });

  describe('getRoot', () => {
    it('should return root categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Electronics' },
        { id: 'cat-2', name: 'Clothing' },
      ];

      vi.mocked(categoryRepository.findRoot).mockResolvedValue(
        mockCategories as any,
      );

      const result = await categoryService.getRoot();

      expect(result).toEqual(mockCategories);
      expect(categoryRepository.findRoot).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
      };

      vi.mocked(categoryRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(categoryRepository.create).mockResolvedValue(
        mockCategory as any,
      );

      const result = await categoryService.create({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        sortOrder: 0,
        isActive: true,
        isHidden: false,
      });

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.create).toHaveBeenCalled();
    });

    it('should throw error if slug already exists', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
      };

      vi.mocked(categoryRepository.findBySlug).mockResolvedValue(
        mockCategory as any,
      );

      await expect(
        categoryService.create({
          name: 'Electronics',
          slug: 'electronics',
          sortOrder: 0,
          isActive: true,
          isHidden: false,
        }),
      ).rejects.toThrow('Category with this slug already exists');
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
      };

      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any,
      );
      vi.mocked(categoryRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(categoryRepository.update).mockResolvedValue(
        mockCategory as any,
      );

      const result = await categoryService.update('cat-1', {
        name: 'Electronics Updated',
      });

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.update).toHaveBeenCalled();
    });

    it('should throw error if category not found', async () => {
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      await expect(
        categoryService.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow('Category not found');
    });
  });

  describe('delete', () => {
    it('should soft delete a category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        isActive: false,
      };

      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any,
      );
      vi.mocked(categoryRepository.findByParentId).mockResolvedValue([]);
      vi.mocked(categoryRepository.delete).mockResolvedValue(
        mockCategory as any,
      );

      const result = await categoryService.delete('cat-1');

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.delete).toHaveBeenCalledWith('cat-1');
    });

    it('should throw error if category not found', async () => {
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      await expect(categoryService.delete('non-existent')).rejects.toThrow(
        'Category not found',
      );
    });

    it('should throw error if category has children', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
      };

      vi.mocked(categoryRepository.findById).mockResolvedValue(
        mockCategory as any,
      );
      vi.mocked(categoryRepository.findByParentId).mockResolvedValue([
        { id: 'cat-2', name: 'Phones' },
      ] as any);

      await expect(categoryService.delete('cat-1')).rejects.toThrow(
        'Cannot delete category with child categories',
      );
    });
  });
});
