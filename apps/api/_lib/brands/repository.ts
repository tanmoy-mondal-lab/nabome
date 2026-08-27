/**
 * Brand Repository - Data Access Layer
 * Source: DATABASE_ARCHITECTURE.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides data access operations for Brand entity following the repository pattern.
 */

import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Brand Repository ─────────────────────────────────────────────────────────

export const brandRepository = {
  /**
   * Find a brand by ID with optional relations
   */
  async findById(id: string, include?: Prisma.BrandInclude) {
    return prisma.brand.findUnique({
      where: { id },
      include: {
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
   * Find a brand by slug
   */
  async findBySlug(slug: string, include?: Prisma.BrandInclude) {
    return prisma.brand.findUnique({
      where: { slug },
      include: {
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
   * List brands with filtering, sorting, and pagination
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    include?: Prisma.BrandInclude;
  }) {
    const { page = 1, limit = 20, isActive, include } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = {
      ...(isActive !== undefined && { isActive }),
    };

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          ...include,
        },
      }),
      prisma.brand.count({ where }),
    ]);

    return {
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get active brands (for public display)
   */
  async findActive(limit = 20) {
    return prisma.brand.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Create a new brand
   */
  async create(data: Prisma.BrandCreateInput) {
    return prisma.brand.create({
      data,
    });
  },

  /**
   * Update a brand
   */
  async update(id: string, data: Prisma.BrandUpdateInput) {
    return prisma.brand.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a brand (soft delete)
   */
  async delete(id: string) {
    return prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Count products in a brand
   */
  async countProducts(brandId: string) {
    return prisma.product.count({
      where: {
        brandId,
        isActive: true,
        status: 'published' as any,
      },
    });
  },
};
