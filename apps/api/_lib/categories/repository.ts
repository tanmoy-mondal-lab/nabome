/**
 * Category Repository - Data Access Layer
 * Source: DATABASE_ARCHITECTURE.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides data access operations for Category entity following the repository pattern.
 */

import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Category Repository ───────────────────────────────────────────────────────

export const categoryRepository = {
  /**
   * Find a category by ID with optional relations
   */
  async findById(id: string, include?: Prisma.CategoryInclude) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { isActive: true, status: 'published' as any },
          take: 10,
          orderBy: { sortOrder: 'asc' as any },
          include: {
            media: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
        ...include,
      },
    });
  },

  /**
   * Find a category by slug
   */
  async findBySlug(slug: string, include?: Prisma.CategoryInclude) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { isActive: true, status: 'published' as any },
          take: 10,
          orderBy: { sortOrder: 'asc' as any },
          include: {
            media: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
        ...include,
      },
    });
  },

  /**
   * List categories with filtering, sorting, and pagination
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    parentId?: string;
    isActive?: boolean;
    isHidden?: boolean;
    include?: Prisma.CategoryInclude;
  }) {
    const {
      page = 1,
      limit = 20,
      parentId,
      isActive,
      isHidden,
      include,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(parentId !== undefined && { parentId }),
      ...(isActive !== undefined && { isActive }),
      ...(isHidden !== undefined && { isHidden }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          ...include,
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get category tree (hierarchical structure)
   */
  async findTree(parentId?: string | null) {
    const categories = await prisma.category.findMany({
      where: {
        parentId,
        isActive: true,
        isHidden: false,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true, isHidden: false },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return categories;
  },

  /**
   * Get root categories (no parent)
   */
  async findRoot() {
    return prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
        isHidden: false,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true, isHidden: false },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  },

  /**
   * Create a new category
   */
  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({
      data,
      include: {
        parent: true,
      },
    });
  },

  /**
   * Update a category
   */
  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
      },
    });
  },

  /**
   * Delete a category (soft delete)
   */
  async delete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Get category by parent ID
   */
  async findByParentId(parentId: string) {
    return prisma.category.findMany({
      where: { parentId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  /**
   * Count products in a category
   */
  async countProducts(categoryId: string) {
    return prisma.product.count({
      where: {
        categoryId,
        isActive: true,
        status: 'published' as any,
      },
    });
  },

  /**
   * Update category sort order
   */
  async updateSortOrder(
    categoryUpdates: Array<{ id: string; sortOrder: number }>,
  ) {
    return prisma.$transaction(
      categoryUpdates.map(({ id, sortOrder }) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder },
        }),
      ),
    );
  },
};
