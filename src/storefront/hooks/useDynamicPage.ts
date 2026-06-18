import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { type ContentPage, type PageSection } from "../../cms/core/cms-types";
import { sectionRegistry } from "../../cms/core/section-registry";

interface DynamicPageData {
  page: ContentPage | null;
  sections: PageSection[];
  loading: boolean;
  error: string | null;
}

export function useDynamicPage(slug: string): DynamicPageData {
  const [data, setData] = useState<DynamicPageData>({
    page: null,
    sections: [],
    loading: true,
    error: null,
  });

  const fetchPage = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await adminApi.getPages();
      const all = (res.pages as Array<Record<string, unknown>>) ?? [];
      const match = all.find((p) => p.slug === slug);

      if (!match) {
        setData({ page: null, sections: [], loading: false, error: "Page not found" });
        return;
      }

      const content = match.content as Record<string, unknown> ?? {};
      const page: ContentPage = {
        id: match.id as string,
        title: match.title as string,
        slug: match.slug as string,
        type: (match.type as ContentPage["type"]) ?? "page",
        status: (match.status as ContentPage["status"]) ?? "draft",
        sections: [],
        seo: {
          metaTitle: (match.metaTitle as string) ?? (match.title as string) ?? "",
          metaDescription: (match.metaDescription as string) ?? "",
          metaImage: (match.metaImage as string) ?? "",
          ogTitle: "",
          ogDescription: "",
          ogImage: "",
          canonicalUrl: "",
          robots: "index,follow",
          structuredData: "",
        },
        createdAt: match.createdAt as string,
        updatedAt: match.updatedAt as string,
        version: 1,
      };

      const rawSections = (content.sections as Array<Record<string, unknown>>) ?? [];
      const sections: PageSection[] = rawSections.map((s, i) => ({
        id: s.id as string ?? `${Date.now()}-${i}`,
        type: s.type as PageSection["type"],
        pageId: page.id,
        sortOrder: (s.sortOrder as number) ?? i,
        config: sectionRegistry.mergeConfig(s.type as PageSection["type"], (s.config as Record<string, unknown>) ?? {}),
        styles: s.styles as Record<string, unknown> | undefined,
        visibility: (s.visibility as PageSection["visibility"]) ?? { isVisible: true },
        createdAt: "",
        updatedAt: "",
      })).filter((s) => sectionRegistry.get(s.type));

      setData({ page, sections, loading: false, error: null });
    } catch {
      setData({ page: null, sections: [], loading: false, error: "Failed to load page" });
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchPage();
  }, [slug, fetchPage]);

  return data;
}

export async function fetchActiveTheme() {
  try {
    const res = await adminApi.getSettings();
    const settings = res.settings as Record<string, unknown> ?? {};
    return (settings.theme as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}
