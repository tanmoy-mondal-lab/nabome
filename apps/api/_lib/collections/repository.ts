/**
 * Collection Repository - Data Access Layer
 * Source: DATABASE_ARCHITECTURE.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides data access operations for Collection entity following the repository pattern.
 */

import type { Prisma } from '@prisma/client';

import type { CollectionType } from '@nabome/types';

import { getPrisma } from '../prisma.ts';

const prisma = new Proxy({} as any, {
  get(_t: any, prop: string | symbol) {
    return (getPrisma() as any)[prop];
  },
});

// ── Collection Repository ─────────────────────────────────────────────────────

export const collectionRepository = {
  /**
   * Find a collection by ID with optional relations
   */
  async findById(id: string, include?: Prisma.CollectionInclude) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                media: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
        ...include,
      },
    });
  },

  /**
   * Find a collection by slug
   */
  async findBySlug(slug: string, include?: Prisma.CollectionInclude) {
    return prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                media: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
        ...include,
      },
    });
  },

  /**
   * List collections with filtering, sorting, and pagination
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    type?: CollectionType;
    isActive?: boolean;
    isFeatured?: boolean;
    include?: Prisma.CollectionInclude;
  }) {
    const {
      page = 1,
      limit = 20,
      type,
      isActive,
      isFeatured,
      include,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.CollectionWhereInput = {
      ...(type && { type: type as any }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
    };

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' as any },
        include: {
          products: {
            include: {
              product: {
                include: {
                  category: true,
                  brand: true,
                  media: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
          ...include,
        },
      }),
      prisma.collection.count({ where }),
    ]);

    return {
      collections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get featured collections
   */
  async findFeatured(limit = 10) {
    return prisma.collection.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: limit,
      orderBy: { sortOrder: 'asc' as any },
      include: {
        products: {
          take: 4,
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                media: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  },

  /**
   * Get active collections (for public display)
   */
  async findActive(limit = 20) {
    const now = new Date();

    return prisma.collection.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      take: limit,
      orderBy: { sortOrder: 'asc' as any },
    });
  },

  /**
   * Create a new collection
   */
  async create(data: Prisma.CollectionCreateInput) {
    return prisma.collection.create({
      data,
    });
  },

  /**
   * Update a collection
   */
  async update(id: string, data: Prisma.CollectionUpdateInput) {
    return prisma.collection.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a collection (soft delete)
   */
  async delete(id: string) {
    return prisma.collection.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Count products in a collection
   */
  async countProducts(collectionId: string) {
    return prisma.productCollection.count({
      where: { collectionId },
    });
  },

  /**
   * Update collection sort order
   */
  async updateSortOrder(
    collectionUpdates: Array<{ id: string; sortOrder: number }>,
  ) {
    return prisma.$transaction(
      collectionUpdates.map(({ id, sortOrder }) =>
        prisma.collection.update({
          where: { id },
          data: { sortOrder },
        }),
      ),
    );
  },
};
