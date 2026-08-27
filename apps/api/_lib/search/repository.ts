/**
 * Search Repository
 * Source: SEARCH_ENGINE_ARCHITECTURE.md, DATABASE_ARCHITECTURE.md
 *
 * Provides database access layer for search operations.
 * All search queries use the search_documents table only (never product tables at query time).
 */

import type { PrismaClient } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchFilters {
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  tags?: string[];
  gender?: ('men' | 'women' | 'unisex')[];
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface SearchSort {
  field:
    | 'relevance'
    | 'newest'
    | 'price_asc'
    | 'price_desc'
    | 'rating'
    | 'popularity';
  order: 'asc' | 'desc';
}

export interface SearchQuery {
  query?: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  limit?: number;
  cursor?: string;
}

export interface SearchResult {
  id: string;
  productId: string | null;
  name: string;
  description: string | null;
  categoryName: string | null;
  brand: string | null;
  tags: string[];
  price: number | null;
  rating: number | null;
  reviewCount: number | null;
  stockStatus: string | null;
  popularityScore: number;
  recencyScore: number;
  businessBoost: number;
  attributes: unknown;
  updatedAt: Date;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  nextCursor: string | null;
  facets: Record<string, Record<string, number>>;
}

export interface AutocompleteResult {
  id: string;
  name: string;
  categoryName: string | null;
  type: 'product';
}

export interface TrendingSearch {
  query: string;
  count: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  results: number;
  createdAt: Date;
}

// ── Search Repository Class ─────────────────────────────────────────────────────

export class SearchRepository {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Execute full-text search with filters and sorting
   */
  async search(params: SearchQuery): Promise<SearchResponse> {
    const {
      query,
      filters = {},
      sort = { field: 'relevance', order: 'desc' },
      limit = 24,
      cursor,
    } = params;

    const whereClause = this.buildWhereClause(query, filters);
    const orderByClause = this.buildOrderByClause(sort);

    const [results, total, facets] = await Promise.all([
      this.db.searchDocument.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      }),
      this.db.searchDocument.count({ where: whereClause }),
      this.computeFacets(whereClause),
    ]);

    const hasMore = results.length > limit;
    const finalResults = hasMore ? results.slice(0, limit) : results;
    // @ts-ignore -- finalResults may be empty
    const nextCursor = hasMore
      ? finalResults[finalResults.length - 1]!.id
      : null;

    return {
      results: finalResults as unknown as SearchResult[],
      total,
      nextCursor,
      facets,
    };
  }

  /**
   * Get autocomplete suggestions
   */
  async autocomplete(query: string, limit = 8): Promise<AutocompleteResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const results = await this.db.searchDocument.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        categoryName: true,
      },
      take: limit,
      orderBy: {
        popularityScore: 'desc',
      },
    });

    return results.map(
      (r: { id: string; name: string; categoryName: string | null }) => ({
        id: r.id,
        name: r.name,
        categoryName: r.categoryName,
        type: 'product' as const,
      }),
    );
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(limit = 10): Promise<TrendingSearch[]> {
    const trending = await this.db.trendingSearch.findMany({
      orderBy: {
        count: 'desc',
      },
      take: limit,
    });

    return trending.map((t: { query: string; count: number }) => ({
      query: t.query,
      count: t.count,
    }));
  }

  /**
   * Get user search history
   */
  async getSearchHistory(
    userId?: string,
    guestId?: string,
    limit = 10,
  ): Promise<SearchHistoryItem[]> {
    const whereClause = userId ? { userId } : guestId ? { guestId } : {};

    const history = await this.db.searchHistory.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return history.map(
      (h: { id: string; query: string; results: number; createdAt: Date }) => ({
        id: h.id,
        query: h.query,
        results: h.results,
        createdAt: h.createdAt,
      }),
    );
  }

  /**
   * Save search to history
   */
  async saveSearchHistory(params: {
    userId?: string;
    guestId?: string;
    query: string;
    results: number;
  }): Promise<void> {
    await this.db.searchHistory.create({
      data: params,
    });
  }

  /**
   * Increment trending search count
   */
  async incrementTrendingSearch(query: string): Promise<void> {
    await this.db.trendingSearch.upsert({
      where: { query },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        query,
        count: 1,
      },
    });
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(
    query?: string,
    filters?: SearchFilters,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (filters?.category && filters.category.length > 0) {
      where.categoryName = {
        in: filters.category,
      };
    }

    if (filters?.brand && filters.brand.length > 0) {
      where.brand = {
        in: filters.brand,
      };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        (where.price as Record<string, unknown>).gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (where.price as Record<string, unknown>).lte = filters.maxPrice;
      }
    }

    if (filters?.minRating !== undefined) {
      where.rating = {
        gte: filters.minRating,
      };
    }

    if (filters?.inStock !== undefined) {
      where.stockStatus = filters.inStock ? 'in_stock' : { not: 'in_stock' };
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters?.gender && filters.gender.length > 0) {
      where.attributes = {
        path: ['gender'],
        in: filters.gender,
      };
    }

    if (filters?.isNew !== undefined) {
      where.attributes = {
        path: ['isNew'],
        equals: filters.isNew,
      };
    }

    if (filters?.isFeatured !== undefined) {
      where.attributes = {
        path: ['isFeatured'],
        equals: filters.isFeatured,
      };
    }

    if (filters?.isTrending !== undefined) {
      where.attributes = {
        path: ['isTrending'],
        equals: filters.isTrending,
      };
    }

    return where;
  }

  /**
   * Build ORDER BY clause from sort option
   */
  private buildOrderByClause(sort: SearchSort): Record<string, 'asc' | 'desc'> {
    switch (sort.field) {
      case 'relevance':
        return { popularityScore: sort.order };
      case 'newest':
        return { updatedAt: sort.order };
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'rating':
        return { rating: sort.order };
      case 'popularity':
        return { popularityScore: sort.order };
      default:
        return { popularityScore: 'desc' };
    }
  }

  /**
   * Compute facet counts for current filters
   */
  private async computeFacets(
    whereClause: Record<string, unknown>,
  ): Promise<Record<string, Record<string, number>>> {
    const [categoryFacets, brandFacets] = await Promise.all([
      this.db.searchDocument.groupBy({
        by: ['categoryName'],
        where: whereClause,
        _count: true,
      }),
      this.db.searchDocument.groupBy({
        by: ['brand'],
        where: whereClause,
        _count: true,
      }),
    ]);

    const facets: Record<string, Record<string, number>> = {
      category: {},
      brand: {},
    };

    if (facets.category) {
      for (const facet of categoryFacets) {
        if (facet.categoryName) {
          facets.category[facet.categoryName] = facet._count;
        }
      }
    }

    if (facets.brand) {
      for (const facet of brandFacets) {
        if (facet.brand) {
          facets.brand[facet.brand] = facet._count;
        }
      }
    }

    return facets;
  }
}
