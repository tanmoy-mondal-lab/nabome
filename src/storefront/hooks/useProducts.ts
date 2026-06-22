import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export function useSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: () => api.get<{ products: unknown[]; total: number }>("/api/products", { params: { action: "search", q } }),
    enabled: q.length >= 2,
  });
}
