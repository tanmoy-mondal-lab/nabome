import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  collection?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  size?: string;
  color?: string;
  material?: string;
  brand?: string;
  label?: string;
  availability?: string;
  q?: string;
}

async function fetchProducts(params: ProductListParams) {
  return api.get<{ products: unknown[]; total: number; page: number; totalPages: number }>("/api/products", {
    params: { action: "list", ...params },
  });
}

async function fetchFeatured() {
  return api.get<{ products: unknown[] }>("/api/products", { params: { action: "featured" } });
}

async function fetchNewArrivals() {
  return api.get<{ products: unknown[] }>("/api/products", { params: { action: "newArrivals" } });
}

async function fetchProduct(slug: string) {
  return api.get<{ product: Record<string, unknown> }>("/api/products", { params: { action: "detail", slug } });
}

async function searchProducts(q: string, page = 1) {
  return api.get<{ products: unknown[]; total: number; page: number; totalPages: number }>("/api/products", {
    params: { action: "search", q, page },
  });
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: fetchFeatured,
    staleTime: 1000 * 60 * 5,
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ["products", "new-arrivals"],
    queryFn: fetchNewArrivals,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });
}

export function useSearch(q: string, page = 1) {
  return useQuery({
    queryKey: ["search", q, page],
    queryFn: () => searchProducts(q, page),
    enabled: q.length >= 2,
  });
}
