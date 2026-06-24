import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

interface CategoriesResponse {
  categories: Category[];
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<CategoriesResponse>("/api/categories"),
    select: (data) => data?.categories ?? [],
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
