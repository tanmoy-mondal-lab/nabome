/**
 * Index Service
 * Source: SEARCH_ENGINE_ARCHITECTURE.md, PRODUCT_ENGINE_ARCHITECTURE.md
 *
 * Manages search index updates from product catalog changes.
 * Called by Product Engine when products are created, updated, or deleted.
 */

import { PrismaClient } from '@prisma/client';

import type { Product, ProductStatus } from '@nabome/types';

const prisma = new PrismaClient();

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IndexProductParams {
  productId: string;
  product: Product;
}

export interface IndexBatchParams {
  products: Product[];
}

export interface IndexResult {
  success: boolean;
  indexed: number;
  errors: string[];
}

// ── Index Service ─────────────────────────────────────────────────────────────

export const indexService = {
  /**
   * Index a single product
   */
  async indexProduct(params: IndexProductParams): Promise<void> {
    const { productId, product } = params;

    // Only index published products
    if (product.status !== 'published') {
      await this.removeProduct(productId);
      return;
    }

    // Calculate stock status
    const hasStock = product.variants?.some(
      (v) => v.availableStock - v.reservedStock > 0,
    );
    const stockStatus = hasStock ? 'in_stock' : 'out_of_stock';

    // Calculate popularity score (based on sales and views)
    const popularityScore = this.calculatePopularityScore(product);

    // Calculate recency score (based on creation date)
    const recencyScore = this.calculateRecencyScore(product.createdAt);

    // Calculate business boost (featured, trending, new)
    const businessBoost = this.calculateBusinessBoost(product);

    // Upsert search document
    await prisma.searchDocument.upsert({
      where: { productId },
      update: {
        name: product.name,
        description: product.shortDescription || product.description,
        categoryName: product.category?.name,
        brand: product.brand?.name,
        tags: product.tags,
        price: product.basePrice as any,
        rating: product.averageRating,
        reviewCount: product.reviewCount,
        stockStatus,
        popularityScore,
        recencyScore,
        businessBoost,
        attributes: {
          gender: product.gender,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isTrending: product.isTrending,
        },
        updatedAt: new Date(),
      },
      create: {
        productId,
        name: product.name,
        description: product.shortDescription || product.description,
        categoryName: product.category?.name,
        brand: product.brand?.name,
        tags: product.tags,
        price: product.basePrice as any,
        rating: product.averageRating,
        reviewCount: product.reviewCount,
        stockStatus,
        popularityScore,
        recencyScore,
        businessBoost,
        attributes: {
          gender: product.gender,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isTrending: product.isTrending,
        },
      },
    });
  },

  /**
   * Index multiple products in batch
   */
  async indexBatch(params: IndexBatchParams): Promise<IndexResult> {
    const { products } = params;
    const errors: string[] = [];
    let indexed = 0;

    for (const product of products) {
      try {
        await this.indexProduct({ productId: product.id, product });
        indexed++;
      } catch (error) {
        errors.push(
          `Failed to index product ${product.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      success: errors.length === 0,
      indexed,
      errors,
    };
  },

  /**
   * Remove a product from search index
   */
  async removeProduct(productId: string): Promise<void> {
    await prisma.searchDocument.deleteMany({
      where: { productId },
    });
  },

  /**
   * Rebuild entire search index
   */
  async rebuildIndex(): Promise<IndexResult> {
    const errors: string[] = [];
    let indexed = 0;

    try {
      // Clear existing index
      await prisma.searchDocument.deleteMany({});

      // Fetch all published products
      const products = await prisma.product.findMany({
        where: { status: 'published' as ProductStatus, isActive: true },
        include: {
          category: true,
          brand: true,
          variants: true,
        },
      });

      // Index all products
      for (const product of products) {
        try {
          await this.indexProduct({
            productId: product.id,
            product: product as unknown as Product,
          });
          indexed++;
        } catch (error) {
          errors.push(
            `Failed to index product ${product.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    } catch (error) {
      errors.push(
        `Failed to rebuild index: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      success: errors.length === 0,
      indexed,
      errors,
    };
  },

  /**
   * Calculate popularity score based on sales, views, and engagement
   */
  calculatePopularityScore(product: Product): number {
    const salesWeight = 0.5;
    const ratingWeight = 0.3;
    const reviewWeight = 0.2;

    const salesScore = Math.min(product.totalSold / 100, 10);
    const ratingScore = (product.averageRating / 5) * 10;
    const reviewScore = Math.min(product.reviewCount / 50, 10);

    return (
      salesScore * salesWeight +
      ratingScore * ratingWeight +
      reviewScore * reviewWeight
    );
  },

  /**
   * Calculate recency score based on creation date
   */
  calculateRecencyScore(createdAt: string | Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    const daysSinceCreation =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

    // Decay score over time (newer products get higher scores)
    const maxScore = 10;
    const decayRate = 0.01;
    const score = maxScore * Math.exp(-decayRate * daysSinceCreation);

    return Math.max(score, 0);
  },

  /**
   * Calculate business boost based on featured, trending, and new flags
   */
  calculateBusinessBoost(product: Product): number {
    let boost = 1.0;

    if (product.isFeatured) {
      boost += 2.0;
    }

    if (product.isTrending) {
      boost += 1.5;
    }

    if (product.isNew) {
      boost += 1.0;
    }

    return boost;
  },
};
