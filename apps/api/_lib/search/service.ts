/**
 * Search Service
 * Source: SEARCH_ENGINE_ARCHITECTURE.md, ENGINEERING_HANDBOOK.md
 *
 * Business logic layer for search operations.
 * Coordinates search queries, analytics tracking, and caching.
 */

import { PrismaClient } from '@prisma/client';

import {
  SearchRepository,
  type SearchFilters,
  type SearchSort,
  type SearchQuery,
} from './repository';

const prisma = new PrismaClient();
const searchRepository = new SearchRepository(prisma);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchServiceParams {
  query?: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  limit?: number;
  cursor?: string;
  userId?: string;
  guestId?: string;
}

export interface SearchServiceResponse {
  results: Array<{
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
  }>;
  total: number;
  nextCursor: string | null;
  facets: Record<string, Record<string, number>>;
}

// ── Search Service ─────────────────────────────────────────────────────────────

export const searchService = {
  /**
   * Execute search with analytics tracking
   */
  async search(params: SearchServiceParams): Promise<SearchServiceResponse> {
    const { query, filters, sort, limit, cursor, userId, guestId } = params;

    // Execute search
    const searchParams: SearchQuery = {
      query,
      filters,
      sort,
      limit,
      cursor,
    };

    const results = await searchRepository.search(searchParams);

    // Track analytics asynchronously
    if (query && query.length >= 2) {
      Promise.all([
        searchRepository.saveSearchHistory({
          userId,
          guestId,
          query,
          results: results.total,
        }),
        searchRepository.incrementTrendingSearch(query),
      ]).catch((error) => {
        console.error('Failed to track search analytics:', error);
      });
    }

    return results;
  },

  /**
   * Get autocomplete suggestions
   */
  async autocomplete(query: string, limit = 8) {
    return searchRepository.autocomplete(query, limit);
  },

  /**
   * Get trending searches
   */
  async getTrendingSearches(limit = 10) {
    return searchRepository.getTrendingSearches(limit);
  },

  /**
   * Get user search history
   */
  async getSearchHistory(userId?: string, guestId?: string, limit = 10) {
    return searchRepository.getSearchHistory(userId, guestId, limit);
  },

  /**
   * Clear user search history
   */
  async clearSearchHistory(userId?: string, guestId?: string): Promise<void> {
    const whereClause = userId ? { userId } : guestId ? { guestId } : {};

    if (Object.keys(whereClause).length === 0) {
      throw new Error('Either userId or guestId must be provided');
    }

    await prisma.searchHistory.deleteMany({
      where: whereClause,
    });
  },
};
