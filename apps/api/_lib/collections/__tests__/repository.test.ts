/**
 * Collection Repository Tests
 * Tests for collection data access layer
 */

import { PrismaClient } from '@prisma/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { collectionRepository } from '../repository';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    collection: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    productCollection: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  })),
}));

describe('CollectionRepository', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findById', () => {
    it('should return collection by ID', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        slug: 'summer-sale',
        description: 'Summer collection',
        type: 'manual',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection);

      const result = await collectionRepository.findById('col-1');

      expect(result).toEqual(mockCollection);
      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: 'col-1' },
        include: { products: { include: { product: true } } },
      });
    });

    it('should return null if collection not found', async () => {
      mockPrisma.collection.findUnique.mockResolvedValue(null);

      const result = await collectionRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return collection by slug', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        slug: 'summer-sale',
        type: 'manual',
        isActive: true,
      };

      mockPrisma.collection.findUnique.mockResolvedValue(mockCollection);

      const result = await collectionRepository.findBySlug('summer-sale');

      expect(result).toEqual(mockCollection);
      expect(mockPrisma.collection.findUnique).toHaveBeenCalledWith({
        where: { slug: 'summer-sale' },
        include: { products: { include: { product: true } } },
      });
    });
  });

  describe('findMany', () => {
    it('should return paginated list of collections', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Summer Sale', slug: 'summer-sale' },
        { id: 'col-2', name: 'Winter Sale', slug: 'winter-sale' },
      ];

      mockPrisma.collection.findMany.mockResolvedValue(mockCollections);
      mockPrisma.collection.count.mockResolvedValue(2);

      const result = await collectionRepository.findMany({
        page: 1,
        limit: 10,
      });

      expect(result.collections).toEqual(mockCollections);
      expect(result.pagination.total).toBe(2);
      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter by type', async () => {
      mockPrisma.collection.findMany.mockResolvedValue([]);
      mockPrisma.collection.count.mockResolvedValue(0);

      await collectionRepository.findMany({ type: 'manual' });

      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { type: 'manual' },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter by isActive', async () => {
      mockPrisma.collection.findMany.mockResolvedValue([]);
      mockPrisma.collection.count.mockResolvedValue(0);

      await collectionRepository.findMany({ isActive: true });

      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findFeatured', () => {
    it('should return featured collections', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Summer Sale', isFeatured: true },
        { id: 'col-2', name: 'Winter Sale', isFeatured: true },
      ];

      mockPrisma.collection.findMany.mockResolvedValue(mockCollections);

      const result = await collectionRepository.findFeatured(10);

      expect(result).toEqual(mockCollections);
      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isFeatured: true },
        take: 10,
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findActive', () => {
    it('should return active collections', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Summer Sale', isActive: true },
        { id: 'col-2', name: 'Winter Sale', isActive: true },
      ];

      mockPrisma.collection.findMany.mockResolvedValue(mockCollections);

      const result = await collectionRepository.findActive(20);

      expect(result).toEqual(mockCollections);
      expect(mockPrisma.collection.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isActive: true,
        }),
        take: 20,
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new collection', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
        slug: 'summer-sale',
        type: 'manual',
        isActive: true,
        isFeatured: false,
      };

      mockPrisma.collection.create.mockResolvedValue(mockCollection);

      const result = await collectionRepository.create({
        name: 'Summer Sale',
        slug: 'summer-sale',
        type: 'manual',
      });

      expect(result).toEqual(mockCollection);
      expect(mockPrisma.collection.create).toHaveBeenCalledWith({
        data: {
          name: 'Summer Sale',
          slug: 'summer-sale',
          type: 'manual',
          isActive: true,
          isFeatured: false,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing collection', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale Updated',
        slug: 'summer-sale',
      };

      mockPrisma.collection.update.mockResolvedValue(mockCollection);

      const result = await collectionRepository.update('col-1', {
        name: 'Summer Sale Updated',
      });

      expect(result).toEqual(mockCollection);
      expect(mockPrisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'col-1' },
        data: {
          name: 'Summer Sale Updated',
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete a collection', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'Summer Sale',
      };

      mockPrisma.collection.update.mockResolvedValue(mockCollection);

      const result = await collectionRepository.delete('col-1');

      expect(result).toEqual(mockCollection);
      expect(mockPrisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'col-1' },
        data: { isActive: false },
      });
    });
  });

  describe('countProducts', () => {
    it('should count products in a collection', async () => {
      mockPrisma.productCollection.count.mockResolvedValue(5);

      const result = await collectionRepository.countProducts('col-1');

      expect(result).toBe(5);
      expect(mockPrisma.productCollection.count).toHaveBeenCalledWith({
        where: { collectionId: 'col-1' },
      });
    });
  });

  describe('updateSortOrder', () => {
    it('should update sort order for collections', async () => {
      const updates = [
        { id: 'col-1', sortOrder: 0 },
        { id: 'col-2', sortOrder: 1 },
      ];

      mockPrisma.$transaction.mockResolvedValue(updates);

      const result = await collectionRepository.updateSortOrder(updates);

      expect(result).toEqual(updates);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
