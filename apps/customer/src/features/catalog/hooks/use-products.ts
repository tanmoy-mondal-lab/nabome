/**
 * Product React Hooks
 * Source: CATALOG_ARCHITECTURE.md, FRONTEND_FORMS_VALIDATION_SPECIFICATION.md (binding)
 *
 * Provides React hooks for product data fetching and state management.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { Product } from '@nabome/types';

const API_BASE =
  (import.meta.env.VITE_PUBLIC_API_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  '/api/v1';

function unwrap<T>(json: any): T {
  if (json && typeof json === 'object' && 'success' in json && 'data' in json)
    return json.data as T;
  return json as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  collection?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex';
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  tags?: string[];
  sort?: 'createdAt' | 'price' | 'rating' | 'popularity' | 'name' | 'sortOrder';
  order?: 'asc' | 'desc';
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Product Hooks ───────────────────────────────────────────────────────────────

/**
 * Fetch a single product by ID
 */
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch product');
      const json = await response.json();
      return unwrap<Product>(json);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single product by slug
 */
export function useProductBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(`${API_BASE}/products/slug/${slug}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch product');
      const json = await response.json();
      return unwrap<Product>(json);
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch products with filtering, sorting, and pagination
 */
export function useProducts(params: ProductListParams = {}, enabled = true) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        queryParams.set(key, value.join(','));
      } else {
        queryParams.set(key, String(value));
      }
    }
  });

  return useQuery({
    queryKey: ['products', params],
    queryFn: async (): Promise<ProductListResponse> => {
      const response = await fetch(
        `${API_BASE}/products?${queryParams.toString()}`,
        { credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const json = await response.json();
      return unwrap<ProductListResponse>(json);
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch featured products
 */
export function useFeaturedProducts(limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async (): Promise<{ products: Product[] }> => {
      const response = await fetch(
        `${API_BASE}/products/featured?limit=${limit}`,
        { credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to fetch featured products');
      const json = await response.json();
      return unwrap<{ products: Product[] }>(json);
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch new arrivals
 */
export function useNewArrivals(limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['products', 'new', limit],
    queryFn: async (): Promise<{ products: Product[] }> => {
      const response = await fetch(`${API_BASE}/products/new?limit=${limit}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch new arrivals');
      const json = await response.json();
      return unwrap<{ products: Product[] }>(json);
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch trending products
 */
export function useTrendingProducts(limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['products', 'trending', limit],
    queryFn: async (): Promise<{ products: Product[] }> => {
      const response = await fetch(
        `${API_BASE}/products/trending?limit=${limit}`,
        { credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to fetch trending products');
      const json = await response.json();
      return unwrap<{ products: Product[] }>(json);
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Prefetch product data for optimistic updates
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', id],
      queryFn: async (): Promise<Product> => {
        const response = await fetch(`${API_BASE}/products/${id}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch product');
        const json = await response.json();
        return unwrap<Product>(json);
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Invalidate product queries
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
  };
}
