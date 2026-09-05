/**
 * useSearch Hook
 * Source: SEARCH_ENGINE_ARCHITECTURE.md, ENGINEERING_HANDBOOK.md
 *
 * React hook for search functionality with debouncing, caching, and analytics.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';

import { appConfig } from '@/lib/config';

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
  updatedAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  nextCursor: string | null;
  facets: Record<string, Record<string, number>>;
}

export interface AutocompleteSuggestion {
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
  createdAt: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

const API_BASE = `${appConfig.PUBLIC_API_URL}/api/v1`;

async function search(params: {
  query?: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  limit?: number;
  cursor?: string;
}): Promise<SearchResponse> {
  const queryParams = new URLSearchParams();

  if (params.query) queryParams.set('q', params.query);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.cursor) queryParams.set('cursor', params.cursor);

  if (params.filters) {
    if (params.filters.category)
      queryParams.set('category', params.filters.category.join(','));
    if (params.filters.brand)
      queryParams.set('brand', params.filters.brand.join(','));
    if (params.filters.minPrice)
      queryParams.set('minPrice', params.filters.minPrice.toString());
    if (params.filters.maxPrice)
      queryParams.set('maxPrice', params.filters.maxPrice.toString());
    if (params.filters.minRating)
      queryParams.set('minRating', params.filters.minRating.toString());
    if (params.filters.inStock !== undefined)
      queryParams.set('inStock', params.filters.inStock.toString());
    if (params.filters.tags)
      queryParams.set('tags', params.filters.tags.join(','));
    if (params.filters.gender)
      queryParams.set('gender', params.filters.gender.join(','));
    if (params.filters.isNew !== undefined)
      queryParams.set('isNew', params.filters.isNew.toString());
    if (params.filters.isFeatured !== undefined)
      queryParams.set('isFeatured', params.filters.isFeatured.toString());
    if (params.filters.isTrending !== undefined)
      queryParams.set('isTrending', params.filters.isTrending.toString());
  }

  if (params.sort) {
    queryParams.set('sort', params.sort.field);
    queryParams.set('order', params.sort.order);
  }

  const response = await fetch(`${API_BASE}/search?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}

async function autocomplete(
  query: string,
  limit = 8,
): Promise<{ suggestions: AutocompleteSuggestion[] }> {
  const queryParams = new URLSearchParams();
  queryParams.set('q', query);
  queryParams.set('limit', limit.toString());

  const response = await fetch(
    `${API_BASE}/search/autocomplete?${queryParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error('Autocomplete failed');
  }

  return response.json();
}

async function getTrendingSearches(
  limit = 10,
): Promise<{ trending: TrendingSearch[] }> {
  const queryParams = new URLSearchParams();
  queryParams.set('limit', limit.toString());

  const response = await fetch(
    `${API_BASE}/search/trending?${queryParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch trending searches');
  }

  return response.json();
}

async function getSearchHistory(
  limit = 10,
): Promise<{ history: SearchHistoryItem[] }> {
  const queryParams = new URLSearchParams();
  queryParams.set('limit', limit.toString());

  const response = await fetch(
    `${API_BASE}/search/history?${queryParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch search history');
  }

  return response.json();
}

async function clearSearchHistory(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/search/history`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to clear search history');
  }

  return response.json();
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useSearch() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sort, setSort] = useState<SearchSort>({
    field: 'relevance',
    order: 'desc',
  });
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search query
  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery, filters, sort],
    queryFn: () => search({ query: debouncedQuery, filters, sort, limit: 24 }),
    enabled: debouncedQuery.length >= 2 || Object.keys(filters).length > 0,
    staleTime: 60000, // 1 minute
  });

  // Autocomplete query
  const autocompleteQuery = useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => autocomplete(query),
    enabled: query.length >= 2,
    staleTime: 300000, // 5 minutes
  });

  // Trending searches query
  const trendingQuery = useQuery({
    queryKey: ['trending-searches'],
    queryFn: () => getTrendingSearches(),
    staleTime: 300000, // 5 minutes
  });

  // Search history query
  const historyQuery = useQuery({
    queryKey: ['search-history'],
    queryFn: () => getSearchHistory(),
    staleTime: 60000, // 1 minute
  });

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: clearSearchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });

  const updateFilter = useCallback(
    (key: keyof SearchFilters, value: unknown) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const updateSort = useCallback(
    (field: SearchSort['field'], order: SearchSort['order']) => {
      setSort({ field, order });
    },
    [],
  );

  const loadMore = useCallback(() => {
    if (searchQuery.data?.nextCursor) {
      queryClient.fetchQuery({
        queryKey: [
          'search',
          debouncedQuery,
          filters,
          sort,
          searchQuery.data.nextCursor,
        ],
        queryFn: () =>
          search({
            query: debouncedQuery,
            filters,
            sort,
            limit: 24,
            cursor: searchQuery.data.nextCursor || undefined,
          }),
      });
    }
  }, [
    debouncedQuery,
    filters,
    sort,
    searchQuery.data?.nextCursor,
    queryClient,
  ]);

  return {
    // State
    query,
    setQuery,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    sort,
    setSort,
    updateSort,

    // Search results
    results: searchQuery.data?.results || [],
    total: searchQuery.data?.total || 0,
    facets: searchQuery.data?.facets || {},
    nextCursor: searchQuery.data?.nextCursor,
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    loadMore,

    // Autocomplete
    suggestions: autocompleteQuery.data?.suggestions || [],
    isAutocompleteLoading: autocompleteQuery.isLoading,

    // Trending
    trending: trendingQuery.data?.trending || [],
    isTrendingLoading: trendingQuery.isLoading,

    // History
    history: historyQuery.data?.history || [],
    isHistoryLoading: historyQuery.isLoading,
    clearHistory: clearHistoryMutation.mutate,
    isClearingHistory: clearHistoryMutation.isPending,
  };
}
