import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

async function fetchCollections() {
  return api.get<{ collections: Record<string, unknown>[] }>("/api/collections", { params: { action: "list" } });
}

async function fetchCollection(slug: string) {
  return api.get<{ collection: Record<string, unknown> }>("/api/collections", { params: { action: "detail", slug } });
}

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCollection(slug: string) {
  return useQuery({
    queryKey: ["collection", slug],
    queryFn: () => fetchCollection(slug),
    enabled: !!slug,
  });
}
