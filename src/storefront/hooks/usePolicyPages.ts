import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

interface PolicyPage {
  id: string;
  title: string;
  slug: string;
}

interface PagesResponse {
  pages: PolicyPage[];
}

const DEFAULT_POLICY_SLUGS = ["privacy", "terms", "faq", "shipping-returns"];

export function usePolicyPages() {
  return useQuery({
    queryKey: ["cms", "policyPages"],
    queryFn: async () => {
      const res = await api.get<PagesResponse>("/api/cms/pages");
      const pages = res.pages ?? [];
      const defaultPages = pages.filter((p) => DEFAULT_POLICY_SLUGS.includes(p.slug));
      if (defaultPages.length > 0) return defaultPages;
      return pages.filter((p) => p.slug && !p.slug.startsWith("lookbook-"));
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });
}
