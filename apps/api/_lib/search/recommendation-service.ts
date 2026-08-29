/**
 * Recommendation Service
 * Source: SEARCH_ENGINE_ARCHITECTURE.md, PRODUCT_ENGINE_ARCHITECTURE.md
 *
 * Rule-based recommendation engine for MVP.
 * Provides related products, similar products, and personalized recommendations.
 */

import { getPrisma } from '../prisma.ts';

const prisma = new Proxy({} as any, {
  get(_t: any, prop: string | symbol) {
    return (getPrisma() as any)[prop];
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RecommendationParams {
  productId?: string;
  userId?: string;
  category?: string | null;
  limit?: number;
}

export interface RecommendationResult {
  id: string;
  productId: string | null;
  name: string;
  categoryName: string | null;
  brand: string | null;
  price: number | null;
  rating: number | null;
  imageUrl?: string;
  score: number;
  reason: string;
}

// ── Recommendation Service ─────────────────────────────────────────────────────

export const recommendationService = {
  /**
   * Get related products (same category, similar attributes)
   */
  async getRelatedProducts(
    params: RecommendationParams,
  ): Promise<RecommendationResult[]> {
    const { productId, category, limit = 8 } = params;

    if (!productId && !category) {
      return [];
    }

    // Get product details if productId provided
    let productCategory = category;
    let productTags: string[] = [];
    let productBrand: string | null = null;

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          category: { select: { name: true } },
          tags: true,
          brand: { select: { name: true } },
        },
      });

      if (product) {
        productCategory = product.category?.name ?? null;
        productTags = product.tags;
        productBrand = product.brand?.name ?? null;
      }
    }

    // Query search documents for related products
    const whereClause: Record<string, unknown> = {
      productId: { not: productId }, // Exclude current product
      stockStatus: 'in_stock',
    };

    if (productCategory) {
      whereClause.categoryName = productCategory;
    }

    const related = await prisma.searchDocument.findMany({
      where: whereClause,
      take: limit * 2, // Fetch more for scoring
      orderBy: {
        popularityScore: 'desc',
      },
    });

    // Score and rank recommendations
    const scored = related.map((doc: (typeof related)[number]) => {
      let score = 0;
      const reasons: string[] = [];

      // Same category boost
      if (doc.categoryName === productCategory) {
        score += 3;
        reasons.push('Same category');
      }

      // Same brand boost
      if (doc.brand === productBrand) {
        score += 2;
        reasons.push('Same brand');
      }

      // Tag overlap boost
      if (doc.tags && productTags.length > 0) {
        const overlap = doc.tags.filter((tag: string) =>
          productTags.includes(tag),
        ).length;
        if (overlap > 0) {
          score += overlap;
          reasons.push('Similar style');
        }
      }

      // Rating boost
      if (doc.rating && parseFloat(doc.rating.toString()) >= 4) {
        score += 1;
        reasons.push('Highly rated');
      }

      // Popularity boost
      if (parseFloat(doc.popularityScore.toString()) > 5) {
        score += 1;
        reasons.push('Popular');
      }

      return {
        id: doc.id,
        productId: doc.productId,
        name: doc.name,
        categoryName: doc.categoryName,
        brand: doc.brand,
        price: doc.price ? parseFloat(doc.price.toString()) : null,
        rating: doc.rating ? parseFloat(doc.rating.toString()) : null,
        imageUrl: undefined, // Would need to fetch from product media
        score,
        reason: reasons[0] || 'Recommended',
      };
    });

    // Sort by score and return top results
    return scored
      .sort(
        (a: (typeof scored)[number], b: (typeof scored)[number]) =>
          b.score - a.score,
      )
      .slice(0, limit);
  },

  /**
   * Get similar products (based on attributes and price range)
   */
  async getSimilarProducts(
    params: RecommendationParams,
  ): Promise<RecommendationResult[]> {
    const { productId, limit = 8 } = params;

    if (!productId) {
      return [];
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        basePrice: true,
        category: { select: { name: true } },
        gender: true,
        tags: true,
      },
    });

    if (!product) {
      return [];
    }

    const priceRange = 0.2; // 20% price range
    const minPrice =
      parseFloat(product.basePrice.toString()) * (1 - priceRange);
    const maxPrice =
      parseFloat(product.basePrice.toString()) * (1 + priceRange);

    // Query search documents
    const similar = await prisma.searchDocument.findMany({
      where: {
        productId: { not: productId },
        categoryName: product.category?.name,
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
        stockStatus: 'in_stock',
      },
      take: limit * 2,
      orderBy: {
        rating: 'desc',
      },
    });

    // Score recommendations
    const scored = similar.map((doc: (typeof similar)[number]) => {
      let score = 0;
      const reasons: string[] = [];

      // Same gender
      const docGender = doc.attributes as { gender?: string };
      if (docGender?.gender === product.gender) {
        score += 2;
        reasons.push('Same style');
      }

      // Price proximity
      if (doc.price) {
        const priceDiff = Math.abs(
          parseFloat(doc.price.toString()) -
            parseFloat(product.basePrice.toString()),
        );
        const priceScore = Math.max(0, 5 - priceDiff / 100);
        score += priceScore;
        reasons.push('Similar price');
      }

      // Rating
      if (doc.rating) {
        const ratingValue = parseFloat(doc.rating.toString());
        score += ratingValue / 2;
        if (ratingValue >= 4) {
          reasons.push('Highly rated');
        }
      }

      return {
        id: doc.id,
        productId: doc.productId,
        name: doc.name,
        categoryName: doc.categoryName,
        brand: doc.brand,
        price: doc.price ? parseFloat(doc.price.toString()) : null,
        rating: doc.rating ? parseFloat(doc.rating.toString()) : null,
        imageUrl: undefined,
        score,
        reason: reasons[0] || 'Similar',
      };
    });

    return scored
      .sort(
        (a: (typeof scored)[number], b: (typeof scored)[number]) =>
          b.score - a.score,
      )
      .slice(0, limit);
  },

  /**
   * Get personalized recommendations (based on user history - MVP placeholder)
   */
  async getPersonalizedRecommendations(
    params: RecommendationParams,
  ): Promise<RecommendationResult[]> {
    const { limit = 8 } = params;

    // MVP: Return trending products as personalized recommendations
    // In production, this would use user's browsing history, purchase history, etc.

    const trending = await prisma.searchDocument.findMany({
      where: {
        stockStatus: 'in_stock',
      },
      take: limit,
      orderBy: {
        popularityScore: 'desc',
      },
    });

    return trending.map((doc: (typeof trending)[number]) => ({
      id: doc.id,
      productId: doc.productId,
      name: doc.name,
      categoryName: doc.categoryName,
      brand: doc.brand,
      price: doc.price ? parseFloat(doc.price.toString()) : null,
      rating: doc.rating ? parseFloat(doc.rating.toString()) : null,
      imageUrl: undefined,
      score: parseFloat(doc.popularityScore.toString()),
      reason: 'Trending',
    }));
  },

  /**
   * Get frequently bought together (placeholder for MVP)
   */
  async getFrequentlyBoughtTogether(
    params: RecommendationParams,
  ): Promise<RecommendationResult[]> {
    const { productId, limit = 4 } = params;

    if (!productId) {
      return [];
    }

    // MVP: Return products from same category
    // In production, this would use order history to find products frequently bought together

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        category: { select: { name: true } },
      },
    });

    if (!product) {
      return [];
    }

    const together = await prisma.searchDocument.findMany({
      where: {
        productId: { not: productId },
        categoryName: product.category?.name,
        stockStatus: 'in_stock',
      },
      take: limit,
      orderBy: {
        popularityScore: 'desc',
      },
    });

    return together.map((doc: (typeof together)[number]) => ({
      id: doc.id,
      productId: doc.productId,
      name: doc.name,
      categoryName: doc.categoryName,
      brand: doc.brand,
      price: doc.price ? parseFloat(doc.price.toString()) : null,
      rating: doc.rating ? parseFloat(doc.rating.toString()) : null,
      imageUrl: undefined,
      score: parseFloat(doc.popularityScore.toString()),
      reason: 'Frequently bought together',
    }));
  },
};
