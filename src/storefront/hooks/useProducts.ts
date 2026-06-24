import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.get<{ product: Record<string, unknown> }>(`/api/products/${slug}`),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: () => api.get<{ products: unknown[]; total: number }>("/api/products", { params: { action: "search", q } }),
    enabled: q.length >= 2,
  });
}

export function useProductListing(params: Record<string, string>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api.get<{ products: Record<string, unknown>[]; pagination: { total: number } }>("/api/products", { params: { ...params, limit: 50 } }),
    staleTime: 1000 * 60 * 5,
  });
}
