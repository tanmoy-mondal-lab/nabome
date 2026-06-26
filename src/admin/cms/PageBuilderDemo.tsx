import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageBuilder } from "./components/PageBuilder";
import { type ContentPage, type PageSection } from "../../cms/core/cms-types";
import { adminApi } from "../../lib/api/admin";
import { useToast } from "../../components/ui/Toast";

interface ExistingPage {
  id: string;
  title: string;
  slug: string;
  content?: string | { sections?: PageSection[]; seo?: ContentPage["seo"] };
  template?: string;
  metaTitle?: string;
  metaDesc?: string;
  ogImage?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export function PageBuilderDemo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isNew = !id || id === "new";
  const [sections, setSections] = useState<PageSection[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [savedPageId, setSavedPageId] = useState<string | null>(id && id !== "new" ? id : null);

  const { data: existingPage, isLoading: loadingPage } = useQuery<ExistingPage | null>({
    queryKey: ["admin", "cmsPage", id],
    queryFn: async () => {
      if (!id || id === "new") return null;
      const res = await adminApi.getPage(id);
      return (res.page as ExistingPage) ?? null;
    },
    enabled: !!id && id !== "new",
  });

  useEffect(() => {
    if (existingPage) {
      setPageTitle(existingPage.title);
      setPageSlug(existingPage.slug);
      if (existingPage.content && typeof existingPage.content === "object") {
        const content = existingPage.content as { sections?: PageSection[] };
        if (content.sections && Array.isArray(content.sections)) {
          setSections(content.sections);
        }
      }
    }
  }, [existingPage]);

  const saveMutation = useMutation({
    mutationFn: async (payload: { title: string; slug: string; sections: PageSection[]; isPublished: boolean }) => {
      const pageData = {
        title: payload.title,
        slug: payload.slug,
        content: JSON.stringify({ sections: payload.sections }),
        isPublished: payload.isPublished,
      };
      if (savedPageId) {
        return adminApi.updatePage(savedPageId, pageData);
      }
      return adminApi.createPage(pageData);
    },
    onSuccess: (res) => {
      const result = res as { id?: string } | unknown;
      if (!savedPageId && result && typeof result === "object" && "id" in result) {
        const newId = (result as { id: string }).id;
        setSavedPageId(newId);
        navigate(`/admin/cms/page-builder/${newId}`, { replace: true });
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "cmsPages"] });
      toast(savedPageId ? "Page updated" : "Page created", "success");
    },
    onError: () => {
      toast("Failed to save page", "error");
    },
  });

  const handleSave = () => {
    if (!pageTitle.trim()) {
      toast("Page title is required", "error");
      return;
    }
    saveMutation.mutate({
      title: pageTitle,
      slug: pageSlug || pageTitle.toLowerCase().replace(/\s+/g, "-"),
      sections,
      isPublished: existingPage?.isPublished ?? false,
    });
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const page: ContentPage = {
    id: savedPageId ?? id ?? "new",
    title: pageTitle || "Untitled Page",
    slug: pageSlug || "untitled",
    type: "page",
    status: existingPage?.isPublished ? "published" : "draft",
    sections,
    seo: {
      metaTitle: existingPage?.metaTitle ?? "",
      metaDescription: existingPage?.metaDesc ?? "",
      metaImage: existingPage?.ogImage ?? "",
      ogTitle: "",
      ogDescription: "",
      ogImage: existingPage?.ogImage ?? "",
      canonicalUrl: "",
      robots: "index,follow",
      structuredData: "",
    },
    createdAt: existingPage?.createdAt ?? new Date().toISOString(),
    updatedAt: existingPage?.updatedAt ?? new Date().toISOString(),
    version: 1,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Page Builder</h1>
        <p className="text-sm text-neutral-500 mt-1">Drag and drop to build your page. Add, reorder, and configure sections.</p>
      </div>
      <div className="mb-4 bg-white border border-neutral-200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Page Title *</label>
            <input
              value={pageTitle}
              onChange={(e) => {
                setPageTitle(e.target.value);
                if (!pageSlug || pageSlug === pageTitle.toLowerCase().replace(/\s+/g, "-")) {
                  setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }
              }}
              placeholder="Enter page title"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Slug</label>
            <input
              value={pageSlug}
              onChange={(e) => setPageSlug(e.target.value)}
              placeholder="page-url-slug"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>
      <PageBuilder page={page} sections={sections} onSectionsChange={setSections} onSave={handleSave} />
    </div>
  );
}
