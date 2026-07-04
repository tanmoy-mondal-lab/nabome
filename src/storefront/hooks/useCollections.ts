import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: ({ signal }) => api.get<{ collections: Record<string, unknown>[] }>("/collections", { params: { action: "list" }, signal }),
    staleTime: 1000 * 60 * 10,
  });
}
