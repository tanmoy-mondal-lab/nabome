import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api.get<{ products: unknown[] }>("/api/products", { params: { action: "featured" } }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ["products", "new-arrivals"],
    queryFn: () => api.get<{ products: unknown[] }>("/api/products", { params: { action: "newArrivals" } }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: () => api.get<{ products: unknown[]; total: number }>("/api/products", { params: { action: "search", q } }),
    enabled: q.length >= 2,
  });
}
