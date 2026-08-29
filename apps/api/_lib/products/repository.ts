/**
 * Product Repository - Data Access Layer
 * Source: DATABASE_ARCHITECTURE.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides data access operations for Product, ProductVariant, ProductMedia,
 * and ProductAttribute entities following the repository pattern.
 */

import type { Prisma } from '@prisma/client';

import type { ProductStatus, Gender, InventoryStatus } from '@nabome/types';

import { getPrisma } from '../prisma.ts';

const prisma = new Proxy({} as any, {
  get(_target: unknown, prop: string | symbol) {
    return (getPrisma() as any)[prop];
  },
});

// ── Product Repository ───────────────────────────────────────────────────────

export const productRepository = {
  /**
   * Find a product by ID with optional relations
   */
  async findById(id: string, include?: Prisma.ProductInclude) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        shop: false,
        collections: {
          include: {
            collection: true,
          },
        },
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          include: {
            media: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        attributes: true,
        ...include,
      },
    });
  },

  /**
   * Find a product by slug
   */
  async findBySlug(slug: string, include?: Prisma.ProductInclude) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        shop: false,
        collections: {
          include: {
            collection: true,
          },
        },
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          include: {
            media: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        attributes: true,
        ...include,
      },
    });
  },

  /**
   * List products with filtering, sorting, and pagination
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    brandId?: string;
    collectionId?: string;
    shopId?: string;
    status?: ProductStatus;
    gender?: Gender;
    isFeatured?: boolean;
    isNew?: boolean;
    isTrending?: boolean;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    tags?: string[];
    sortBy?:
      'createdAt' | 'price' | 'rating' | 'popularity' | 'name' | 'sortOrder';
    sortOrder?: 'asc' | 'desc';
    include?: Prisma.ProductInclude;
  }) {
    const {
      page = 1,
      limit = 20,
      categoryId,
      brandId,
      collectionId,
      shopId,
      status,
      gender,
      isFeatured,
      isNew,
      isTrending,
      minPrice,
      maxPrice,
      inStock,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      include,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(status && { status: status as any }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(shopId && { shopId }),
      ...(gender && { gender }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isNew !== undefined && { isNew }),
      ...(isTrending !== undefined && { isTrending }),
      ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
      ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
      ...(collectionId && {
        collections: {
          some: {
            collectionId,
          },
        },
      }),
      ...(inStock && {
        variants: {
          some: {
            isActive: true,
            availableStock: { gt: 0 },
          },
        },
      }),
    };

    // Build sort clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'price':
        orderBy.basePrice = sortOrder;
        break;
      case 'rating':
        (orderBy as any).averageRating = sortOrder;
        break;
      case 'popularity':
        (orderBy as any).totalSold = sortOrder;
        break;
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'sortOrder':
        (orderBy as any).sortOrder = sortOrder;
        break;
      case 'createdAt':
      default:
        orderBy.createdAt = sortOrder;
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          brand: true,
          shop: false,
          media: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          ...include,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Create a new product
   */
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      include: {
        category: true,
        brand: true,
        shop: true,
      },
    });
  },

  /**
   * Update a product
   */
  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        shop: true,
      },
    });
  },

  /**
   * Delete a product (soft delete)
   */
  async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Get featured products
   */
  async findFeatured(limit = 10) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        status: 'published',
        isFeatured: true,
      },
      take: limit,
      orderBy: { sortOrder: 'asc' as any },
      include: {
        category: true,
        brand: true,
        shop: false,
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          take: 1,
        },
      },
    });
  },

  async findNew(limit = 10) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        status: 'published',
        isNew: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        brand: true,
        shop: false,
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          take: 1,
        },
      },
    });
  },

  async findTrending(limit = 10) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        status: 'published',
        isTrending: true,
      },
      take: limit,
      orderBy: { totalSold: 'desc' },
      include: {
        category: true,
        brand: true,
        shop: false,
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          take: 1,
        },
      },
    });
  },

  /**
   * Update product denormalized fields (review count, average rating, total sold)
   */
  async updateDenormalizedFields(
    id: string,
    fields: {
      reviewCount?: number;
      averageRating?: number;
      totalSold?: number;
    },
  ) {
    return prisma.product.update({
      where: { id },
      data: fields as any,
    });
  },
};

// ── Product Variant Repository ───────────────────────────────────────────────

export const productVariantRepository = {
  async findById(id: string) {
    return prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  },

  async findBySku(sku: string) {
    return prisma.productVariant.findUnique({
      where: { sku },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  },

  async findByProductId(productId: string) {
    return prisma.productVariant.findMany({
      where: { productId, isActive: true },
      include: {
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  },

  async create(data: Prisma.ProductVariantCreateInput) {
    return prisma.productVariant.create({
      data,
      include: {
        product: true,
      },
    });
  },

  async update(id: string, data: Prisma.ProductVariantUpdateInput) {
    return prisma.productVariant.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.productVariant.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Update inventory status based on available stock
   */
  async updateInventoryStatus(id: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) return null;

    const availableStock = variant.availableStock - variant.reservedStock;
    let inventoryStatus: InventoryStatus = 'out_of_stock';

    if (availableStock === 0) {
      inventoryStatus = 'out_of_stock';
    } else if (availableStock <= variant.lowStockThreshold) {
      inventoryStatus = 'low_stock';
    } else {
      inventoryStatus = 'in_stock';
    }

    return prisma.productVariant.update({
      where: { id },
      data: { inventoryStatus },
    });
  },
};

// ── Product Media Repository ──────────────────────────────────────────────────

export const productMediaRepository = {
  async findById(id: string) {
    return prisma.productMedia.findUnique({
      where: { id },
      include: {
        product: true,
        variant: true,
      },
    });
  },

  async findByProductId(productId: string) {
    return prisma.productMedia.findMany({
      where: { productId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findByVariantId(variantId: string) {
    return prisma.productMedia.findMany({
      where: { variantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async create(data: Prisma.ProductMediaCreateInput) {
    return prisma.productMedia.create({
      data,
    });
  },

  async update(id: string, data: Prisma.ProductMediaUpdateInput) {
    return prisma.productMedia.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.productMedia.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async updateSortOrder(
    productId: string,
    mediaUpdates: Array<{ id: string; sortOrder: number }>,
  ) {
    return prisma.$transaction(
      mediaUpdates.map(({ id, sortOrder }) =>
        prisma.productMedia.update({
          where: { id },
          data: { sortOrder },
        }),
      ),
    );
  },
};

// ── Product Attribute Repository ─────────────────────────────────────────────

export const productAttributeRepository = {
  async findById(id: string) {
    return prisma.productAttribute.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
  },

  async findByProductId(productId: string) {
    return prisma.productAttribute.findMany({
      where: { productId },
      orderBy: { name: 'asc' },
    });
  },

  async deleteByProductId(productId: string) {
    return prisma.productAttribute.deleteMany({
      where: { productId },
    });
  },

  async create(data: Prisma.ProductAttributeCreateInput) {
    return prisma.productAttribute.create({
      data,
    });
  },

  async update(id: string, data: Prisma.ProductAttributeUpdateInput) {
    return prisma.productAttribute.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.productAttribute.delete({
      where: { id },
    });
  },

  async upsert(
    productId: string,
    attributes: Array<{ name: string; value: string }>,
  ) {
    return prisma.$transaction(
      attributes.map(({ name, value }) =>
        prisma.productAttribute.create({
          data: {
            productId,
            name,
            value,
          },
        }),
      ),
    );
  },
};

// ── Product Collection Repository ────────────────────────────────────────────

export const productCollectionRepository = {
  async findById(productId: string, collectionId: string) {
    return prisma.productCollection.findUnique({
      where: {
        productId_collectionId: {
          productId,
          collectionId,
        },
      },
      include: {
        product: true,
        collection: true,
      },
    });
  },

  async findByProductId(productId: string) {
    return prisma.productCollection.findMany({
      where: { productId },
      include: {
        collection: true,
      },
    });
  },

  async findByCollectionId(collectionId: string) {
    return prisma.productCollection.findMany({
      where: { collectionId },
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
    });
  },

  async create(data: Prisma.ProductCollectionCreateInput) {
    return prisma.productCollection.create({
      data,
      include: {
        product: true,
        collection: true,
      },
    });
  },

  async delete(productId: string, collectionId: string) {
    return prisma.productCollection.delete({
      where: {
        productId_collectionId: {
          productId,
          collectionId,
        },
      },
    });
  },

  async addProductToCollection(productId: string, collectionId: string) {
    return prisma.productCollection.create({
      data: {
        productId,
        collectionId,
      },
    });
  },

  async removeProductFromCollection(productId: string, collectionId: string) {
    return prisma.productCollection.deleteMany({
      where: {
        productId,
        collectionId,
      },
    });
  },
};
