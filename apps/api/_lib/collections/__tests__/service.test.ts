/**
 * Collection Service Tests
 * Tests for collection business logic layer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { collectionRepository } from '../repository';
import { collectionService } from '../service';

// Mock repository
vi.mock('../repository', () => ({
  collectionRepository: {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findMany: vi.fn(),
    findFeatured: vi.fn(),
    findActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countProducts: vi.fn(),
  },
}));

describe('CollectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getById', () => {
    it('should return collection by ID', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        slug: 'summer-sale',
        type: 'manual',
        isActive: true,
      };

      vi.mocked(collectionRepository.findById).mockResolvedValue(
        mockCollection as any,
      );

      const result = await collectionService.getById('col-1');

      expect(result).toEqual(mockCollection);
      expect(collectionRepository.findById).toHaveBeenCalledWith('col-1');
    });
  });

  describe('getBySlug', () => {
    it('should return collection by slug', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        slug: 'summer-sale',
        type: 'manual',
        isActive: true,
      };

      vi.mocked(collectionRepository.findBySlug).mockResolvedValue(
        mockCollection as any,
      );

      const result = await collectionService.getBySlug('summer-sale');

      expect(result).toEqual(mockCollection);
      expect(collectionRepository.findBySlug).toHaveBeenCalledWith(
        'summer-sale',
      );
    });
  });

  describe('list', () => {
    it('should return paginated collections', async () => {
      const mockResult = {
        collections: [
          { id: 'col-1', name: 'Summer Sale' },
          { id: 'col-2', name: 'Winter Sale' },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      vi.mocked(collectionRepository.findMany).mockResolvedValue(
        mockResult as any,
      );

      const result = await collectionService.list({ page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(collectionRepository.findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getFeatured', () => {
    it('should return featured collections', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Summer Sale', isFeatured: true },
        { id: 'col-2', name: 'Winter Sale', isFeatured: true },
      ];

      vi.mocked(collectionRepository.findFeatured).mockResolvedValue(
        mockCollections as any,
      );

      const result = await collectionService.getFeatured(10);

      expect(result).toEqual(mockCollections);
      expect(collectionRepository.findFeatured).toHaveBeenCalledWith(10);
    });
  });

  describe('getActive', () => {
    it('should return active collections', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Summer Sale', isActive: true },
        { id: 'col-2', name: 'Winter Sale', isActive: true },
      ];

      vi.mocked(collectionRepository.findActive).mockResolvedValue(
        mockCollections as any,
      );

      const result = await collectionService.getActive(20);

      expect(result).toEqual(mockCollections);
      expect(collectionRepository.findActive).toHaveBeenCalledWith(20);
    });
  });

  describe('create', () => {
    it('should create a new collection', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        slug: 'summer-sale',
        type: 'manual',
      };

      vi.mocked(collectionRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(collectionRepository.create).mockResolvedValue(
        mockCollection as any,
      );

      const result = await collectionService.create({
        name: 'Summer Sale',
        slug: 'summer-sale',
        type: 'manual',
        sortOrder: 0,
        isActive: true,
        isFeatured: false,
      });

      expect(result).toEqual(mockCollection);
      expect(collectionRepository.create).toHaveBeenCalled();
    });

    it('should throw error if slug already exists', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        slug: 'summer-sale',
      };

      vi.mocked(collectionRepository.findBySlug).mockResolvedValue(
        mockCollection as any,
      );

      await expect(
        collectionService.create({
          name: 'Summer Sale',
          slug: 'summer-sale',
          type: 'manual',
          sortOrder: 0,
          isActive: true,
          isFeatured: false,
        }),
      ).rejects.toThrow('Collection with this slug already exists');
    });
  });

  describe('update', () => {
    it('should update an existing collection', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        slug: 'summer-sale',
      };

      vi.mocked(collectionRepository.findById).mockResolvedValue(
        mockCollection as any,
      );
      vi.mocked(collectionRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(collectionRepository.update).mockResolvedValue(
        mockCollection as any,
      );

      const result = await collectionService.update('col-1', {
        name: 'Summer Sale Updated',
      });

      expect(result).toEqual(mockCollection);
      expect(collectionRepository.update).toHaveBeenCalled();
    });

    it('should throw error if collection not found', async () => {
      vi.mocked(collectionRepository.findById).mockResolvedValue(null);

      await expect(
        collectionService.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow('Collection not found');
    });
  });

  describe('delete', () => {
    it('should soft delete a collection', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        isActive: false,
      };

      vi.mocked(collectionRepository.findById).mockResolvedValue(
        mockCollection as any,
      );
      vi.mocked(collectionRepository.delete).mockResolvedValue(
        mockCollection as any,
      );

      const result = await collectionService.delete('col-1');

      expect(result).toEqual(mockCollection);
      expect(collectionRepository.delete).toHaveBeenCalledWith('col-1');
    });

    it('should throw error if collection not found', async () => {
      vi.mocked(collectionRepository.findById).mockResolvedValue(null);

      await expect(collectionService.delete('non-existent')).rejects.toThrow(
        'Collection not found',
      );
    });
  });
});
