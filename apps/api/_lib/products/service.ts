/**
 * Product Service - Business Logic Layer
 * Source: PRODUCT_ENGINE_ARCHITECTURE.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides business logic for Product, ProductVariant, ProductMedia,
 * and ProductAttribute operations following the service pattern.
 */

import type { ProductStatus } from '@nabome/types';
import {
  createProductSchema,
  updateProductSchema,
  createProductVariantSchema,
  updateProductVariantSchema,
} from '@nabome/validation';
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from '@nabome/validation';

import {
  productRepository,
  productVariantRepository,
  productMediaRepository,
  productAttributeRepository,
} from './repository';

// ── Product Service ───────────────────────────────────────────────────────────

export const productService = {
  /**
   * Get a product by ID
   */
  async getById(id: string) {
    return productRepository.findById(id);
  },

  /**
   * Get a product by slug (for public facing pages)
   */
  async getBySlug(slug: string) {
    return productRepository.findBySlug(slug);
  },

  /**
   * List products with filtering and pagination
   */
  async list(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    brandId?: string;
    collectionId?: string;
    shopId?: string;
    status?: ProductStatus;
    gender?: 'men' | 'women' | 'unisex';
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
  }) {
    return productRepository.findMany(params);
  },

  /**
   * Get featured products
   */
  async getFeatured(limit = 10) {
    return productRepository.findFeatured(limit);
  },

  /**
   * Get new arrivals
   */
  async getNew(limit = 10) {
    return productRepository.findNew(limit);
  },

  /**
   * Get trending products
   */
  async getTrending(limit = 10) {
    return productRepository.findTrending(limit);
  },

  /**
   * Create a new product
   */
  async create(input: CreateProductInput) {
    // Validate input
    const validated = createProductSchema.parse(input);

    // Check if slug already exists
    const existing = await productRepository.findBySlug(validated.slug);
    if (existing) {
      throw new Error('Product with this slug already exists');
    }

    // Create product
    return productRepository.create({
      ...validated,
      basePrice: validated.basePrice.toString(),
      compareAtPrice: validated.compareAtPrice?.toString(),
      costPrice: validated.costPrice?.toString(),
      status: validated.status as any,
      category: {
        connect: { id: validated.categoryId },
      },
      ...(validated.brandId && {
        brand: {
          connect: { id: validated.brandId },
        },
      }),
    } as any);
  },

  /**
   * Update a product
   */
  async update(id: string, input: UpdateProductInput) {
    // Validate input
    const validated = updateProductSchema.parse(input);

    // Check if product exists
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    // If slug is being changed, check if new slug already exists
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await productRepository.findBySlug(validated.slug);
      if (slugExists) {
        throw new Error('Product with this slug already exists');
      }
    }

    // Update product
    return productRepository.update(id, {
      ...validated,
      basePrice: validated.basePrice?.toString(),
      compareAtPrice: validated.compareAtPrice?.toString(),
      costPrice: validated.costPrice?.toString(),
      status: validated.status as any,
    } as any);
  },

  /**
   * Delete a product (soft delete)
   */
  async delete(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    return productRepository.delete(id);
  },

  /**
   * Publish a product
   */
  async publish(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    if (existing.status === 'published') {
      throw new Error('Product is already published');
    }

    return productRepository.update(id, { status: 'published' as any });
  },

  /**
   * Archive a product
   */
  async archive(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    return productRepository.update(id, { status: 'archived' as any });
  },

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    return productRepository.update(id, { isFeatured: !existing.isFeatured });
  },

  /**
   * Update denormalized fields (called by review/order services)
   */
  async updateDenormalizedFields(
    id: string,
    fields: {
      reviewCount?: number;
      averageRating?: number;
      totalSold?: number;
    },
  ) {
    return productRepository.updateDenormalizedFields(id, fields);
  },
};

// ── Product Variant Service ───────────────────────────────────────────────────

export const productVariantService = {
  /**
   * Get a variant by ID
   */
  async getById(id: string) {
    return productVariantRepository.findById(id);
  },

  /**
   * Get a variant by SKU
   */
  async getBySku(sku: string) {
    return productVariantRepository.findBySku(sku);
  },

  /**
   * Get variants for a product
   */
  async getByProductId(productId: string) {
    return productVariantRepository.findByProductId(productId);
  },

  /**
   * Create a new variant
   */
  async create(productId: string, input: CreateProductVariantInput) {
    // Validate input
    const validated = createProductVariantSchema.parse(input);

    // Check if product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if SKU already exists
    const existing = await productVariantRepository.findBySku(validated.sku);
    if (existing) {
      throw new Error('Variant with this SKU already exists');
    }

    // Create variant
    return productVariantRepository.create({
      ...validated,
      product: {
        connect: { id: productId },
      },
      price: validated.price.toString(),
      compareAtPrice: validated.compareAtPrice?.toString(),
    } as any);
  },

  /**
   * Update a variant
   */
  async update(id: string, input: UpdateProductVariantInput) {
    // Validate input
    const validated = updateProductVariantSchema.parse(input);

    // Check if variant exists
    const existing = await productVariantRepository.findById(id);
    if (!existing) {
      throw new Error('Variant not found');
    }

    // If SKU is being changed, check if new SKU already exists
    if (validated.sku && validated.sku !== existing.sku) {
      const skuExists = await productVariantRepository.findBySku(validated.sku);
      if (skuExists) {
        throw new Error('Variant with this SKU already exists');
      }
    }

    // Update variant
    return productVariantRepository.update(id, {
      ...validated,
      price: validated.price?.toString(),
      compareAtPrice: validated.compareAtPrice?.toString(),
      attributes: validated.attributes as any,
    } as any);
  },

  /**
   * Delete a variant (soft delete)
   */
  async delete(id: string) {
    const existing = await productVariantRepository.findById(id);
    if (!existing) {
      throw new Error('Variant not found');
    }

    return productVariantRepository.delete(id);
  },

  /**
   * Update inventory
   */
  async updateInventory(
    id: string,
    changes: {
      availableStock?: number;
      reservedStock?: number;
    },
  ) {
    const existing = await productVariantRepository.findById(id);
    if (!existing) {
      throw new Error('Variant not found');
    }

    const updated = await productVariantRepository.update(id, changes);

    // Update inventory status
    await productVariantRepository.updateInventoryStatus(id);

    return updated;
  },

  /**
   * Update inventory status based on stock levels
   */
  async updateInventoryStatus(id: string) {
    return productVariantRepository.updateInventoryStatus(id);
  },
};

// ── Product Media Service ────────────────────────────────────────────────────

export const productMediaService = {
  /**
   * Get media by ID
   */
  async getById(id: string) {
    return productMediaRepository.findById(id);
  },

  /**
   * Get media for a product
   */
  async getByProductId(productId: string) {
    return productMediaRepository.findByProductId(productId);
  },

  /**
   * Get media for a variant
   */
  async getByVariantId(variantId: string) {
    return productMediaRepository.findByVariantId(variantId);
  },

  /**
   * Add media to product
   */
  async create(
    productId: string,
    data: {
      type: string;
      url: string;
      altText?: string;
      variantId?: string;
      sortOrder?: number;
    },
  ) {
    return productMediaRepository.create({
      product: {
        connect: { id: productId },
      },
      variant: data.variantId
        ? {
            connect: { id: data.variantId },
          }
        : undefined,
      type: data.type,
      url: data.url,
      altText: data.altText,
      sortOrder: data.sortOrder || 0,
    } as any);
  },

  /**
   * Update media
   */
  async update(
    id: string,
    data: {
      url?: string;
      altText?: string;
      sortOrder?: number;
    },
  ) {
    return productMediaRepository.update(id, data);
  },

  /**
   * Delete media
   */
  async delete(id: string) {
    return productMediaRepository.delete(id);
  },

  /**
   * Update sort order for product media
   */
  async updateSortOrder(
    productId: string,
    mediaUpdates: Array<{ id: string; sortOrder: number }>,
  ) {
    return productMediaRepository.updateSortOrder(productId, mediaUpdates);
  },
};

// ── Product Attribute Service ───────────────────────────────────────────────

export const productAttributeService = {
  /**
   * Get attribute by ID
   */
  async getById(id: string) {
    return productAttributeRepository.findById(id);
  },

  /**
   * Get attributes for a product
   */
  async getByProductId(productId: string) {
    return productAttributeRepository.findByProductId(productId);
  },

  /**
   * Add attribute to product
   */
  async create(
    productId: string,
    data: {
      name: string;
      value: string;
    },
  ) {
    return productAttributeRepository.create({
      product: {
        connect: { id: productId },
      },
      name: data.name,
      value: data.value,
    } as any);
  },

  /**
   * Update attribute
   */
  async update(
    id: string,
    data: {
      name?: string;
      value?: string;
    },
  ) {
    return productAttributeRepository.update(id, data);
  },

  /**
   * Delete attribute
   */
  async delete(id: string) {
    return productAttributeRepository.delete(id);
  },

  /**
   * Upsert attributes for a product
   */
  async upsert(
    productId: string,
    attributes: Array<{ name: string; value: string }>,
  ) {
    // Delete existing attributes
    await productAttributeRepository.deleteByProductId(productId);

    // Create new attributes
    return productAttributeRepository.upsert(productId, attributes);
  },
};
