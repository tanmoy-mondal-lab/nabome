import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => api.get<{ collections: Record<string, unknown>[] }>("/api/collections", { params: { action: "list" } }),
    staleTime: 1000 * 60 * 10,
  });
}
