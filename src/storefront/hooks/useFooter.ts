import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export interface FooterSection {
  id: string;
  column: number;
  title: string;
  contentType: string;
  content?: Record<string, unknown>;
  sortOrder: number;
}

interface FooterResponse {
  sections: FooterSection[];
}

export function useFooter() {
  return useQuery({
    queryKey: ["cms", "footer"],
    queryFn: () => api.get<FooterResponse>("/api/cms/footer"),
    select: (data) => data?.sections ?? [],
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
