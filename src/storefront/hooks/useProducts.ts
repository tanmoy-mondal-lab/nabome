import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: ({ signal }) => api.get<{ product: Record<string, unknown> }>(`/products/${slug}`, { signal }),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useSearch(q: string, page = 1) {
  return useQuery({
    queryKey: ["search", q, page],
    queryFn: ({ signal }) => api.get<{ products: unknown[]; pagination: { total: number; totalPages: number } }>("/products/search", { params: { q, page: String(page) }, signal }),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
    retry: 2,
  });
}

export function useProductListing(params: Record<string, string>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: ({ signal }) => api.get<{ products: Record<string, unknown>[]; pagination: { total: number } }>("/products", { params: { ...params, limit: 50 }, signal }),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
