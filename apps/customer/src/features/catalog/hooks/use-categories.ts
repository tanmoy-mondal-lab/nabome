/**
 * Category React Hooks
 * Source: CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides React hooks for category data fetching and state management.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { Category } from '@nabome/types';

const API_BASE =
  (import.meta.env.VITE_PUBLIC_API_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  '/api/v1';
function unwrap<T>(j: any): T {
  return j && typeof j === 'object' && 'success' in j && 'data' in j
    ? (j.data as T)
    : (j as T);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CategoryListParams {
  page?: number;
  limit?: number;
  parentId?: string;
  isActive?: boolean;
  isHidden?: boolean;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Category Hooks ─────────────────────────────────────────────────────────────

/**
 * Fetch a single category by ID
 */
export function useCategory(id: string, enabled = true) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async (): Promise<Category> => {
      const response = await fetch(`${API_BASE}/categories/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      return response.json();
    },
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch a single category by slug
 */
export function useCategoryBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: ['category', 'slug', slug],
    queryFn: async (): Promise<Category> => {
      const response = await fetch(`${API_BASE}/categories/slug/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      return response.json();
    },
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch categories with filtering and pagination
 */
export function useCategories(params: CategoryListParams = {}, enabled = true) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['categories', params],
    queryFn: async (): Promise<CategoryListResponse> => {
      const response = await fetch(
        `${API_BASE}/categories?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch category tree (hierarchical structure)
 */
export function useCategoryTree(parentId?: string | null, enabled = true) {
  const queryParams =
    parentId !== undefined && parentId !== null ? `?parentId=${parentId}` : '';

  return useQuery({
    queryKey: ['categories', 'tree', parentId],
    queryFn: async (): Promise<{ categories: Category[] }> => {
      const response = await fetch(`${API_BASE}/categories/tree${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category tree');
      }
      return response.json();
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Fetch root categories (no parent)
 */
export function useRootCategories(enabled = true) {
  return useQuery({
    queryKey: ['categories', 'root'],
    queryFn: async (): Promise<{ categories: Category[] }> => {
      const response = await fetch(`${API_BASE}/categories/root`);
      if (!response.ok) {
        throw new Error('Failed to fetch root categories');
      }
      return response.json();
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Prefetch category data for optimistic updates
 */
export function usePrefetchCategory() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['category', id],
      queryFn: async (): Promise<Category> => {
        const response = await fetch(`${API_BASE}/categories/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }
        return response.json();
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Invalidate category queries
 */
export function useInvalidateCategories() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['category'] });
  };
}
