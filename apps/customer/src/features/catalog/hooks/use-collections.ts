/**
 * Collection React Hooks
 * Source: CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides React hooks for collection data fetching and state management.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { Collection } from '@nabome/types';

const API_BASE = (import.meta.env.VITE_PUBLIC_API_URL as string | undefined)
  ? `${import.meta.env.VITE_PUBLIC_API_URL}/api/v1`
  : '/api/v1';
function unwrap<T>(j: any): T {
  return j && typeof j === 'object' && 'success' in j && 'data' in j
    ? (j.data as T)
    : (j as T);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CollectionListParams {
  page?: number;
  limit?: number;
  type?: 'manual' | 'dynamic' | 'smart';
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface CollectionListResponse {
  collections: Collection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Collection Hooks ────────────────────────────────────────────────────────────

/**
 * Fetch a single collection by ID
 */
export function useCollection(id: string, enabled = true) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async (): Promise<Collection> => {
      const response = await fetch(`${API_BASE}/collections/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch collection');
      const json = await response.json();
      return unwrap(json as any);
    },
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch a single collection by slug
 */
export function useCollectionBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: ['collection', 'slug', slug],
    queryFn: async (): Promise<Collection> => {
      const response = await fetch(`${API_BASE}/collections/slug/${slug}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch collection');
      const json = await response.json();
      return unwrap(json as any);
    },
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch collections with filtering and pagination
 */
export function useCollections(
  params: CollectionListParams = {},
  enabled = true,
) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['collections', params],
    queryFn: async (): Promise<CollectionListResponse> => {
      const response = await fetch(
        `${API_BASE}/collections?${queryParams.toString()}`,
        { credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to fetch collections');
      const json = await response.json();
      return unwrap(json as any);
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch featured collections
 */
export function useFeaturedCollections(limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['collections', 'featured', limit],
    queryFn: async (): Promise<{ collections: Collection[] }> => {
      const response = await fetch(
        `${API_BASE}/collections/featured?limit=${limit}`,
        { credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to fetch featured collections');
      const json = await response.json();
      return unwrap(json as any);
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Fetch active collections (for public display)
 */
export function useActiveCollections(limit = 20, enabled = true) {
  return useQuery({
    queryKey: ['collections', 'active', limit],
    queryFn: async (): Promise<{ collections: Collection[] }> => {
      const response = await fetch(
        `${API_BASE}/collections/active?limit=${limit}`,
        { credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to fetch active collections');
      const json = await response.json();
      return unwrap(json as any);
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Prefetch collection data for optimistic updates
 */
export function usePrefetchCollection() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['collection', id],
      queryFn: async (): Promise<Collection> => {
        const response = await fetch(`${API_BASE}/collections/${id}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch collection');
        }
        return response.json();
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Invalidate collection queries
 */
export function useInvalidateCollections() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['collections'] });
    queryClient.invalidateQueries({ queryKey: ['collection'] });
  };
}
