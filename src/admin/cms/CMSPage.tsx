import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import { PageBuilder } from "./components/PageBuilder";
import { type PageSection, type ContentPage } from "../../cms/core/cms-types";

interface CMSPageItem {
  id: string;
  title: string;
  slug: string;
  content?: unknown;
  metaTitle?: string;
  metaDescription?: string;
  metaDesc?: string;
  ogImage?: string;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
}

function parsePageContent(content: unknown): PageSection[] {
  if (!content) return [];
  try {
    const raw = typeof content === "string" ? JSON.parse(content) : content;
    const obj = raw as Record<string, unknown>;
    if (obj.sections && Array.isArray(obj.sections)) return obj.sections as PageSection[];
    return [];
  } catch {
    return [];
  }
}

function isRawHtmlContent(content: unknown): boolean {
  if (typeof content !== "string") return false;
  if (!content.trim()) return false;
  try {
    JSON.parse(content);
    return false;
  } catch {
    return content.trim().startsWith("<");
  }
}

function PagesTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [view, setView] = useState<"list" | "builder">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [isRawHtml, setIsRawHtml] = useState(false);
  const [rawHtmlContent, setRawHtmlContent] = useState("");

  const { data: pages = [], isLoading: loading, error: pagesError } = useQuery<CMSPageItem[]>({
    queryKey: ["admin", "cmsPages"],
    queryFn: async () => {
      const res = await adminApi.getPages();
      return (res.pages as CMSPageItem[]) ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cmsPages"] });
      toast("Page deleted", "success");
    },
    onError: () => toast("Failed to delete page", "error"),
  });

  const handleDelete = (id: string) => {
    const page = pages.find((p) => p.id === id);
    if (!window.confirm(`Delete "${page?.title ?? "this page"}"? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  };

  const convertToVisualBuilder = () => {
    setIsRawHtml(false);
    setRawHtmlContent("");
  };

  const openBuilder = (page?: CMSPageItem) => {
    if (page) {
      const raw = isRawHtmlContent(page.content);
      setEditingId(page.id);
      setPageTitle(page.title);
      setPageSlug(page.slug);
      setIsPublished(page.isPublished);
      setMetaTitle(page.metaTitle ?? "");
      setMetaDescription(page.metaDescription ?? page.metaDesc ?? "");
      setIsRawHtml(raw);
      if (raw) {
        setRawHtmlContent(typeof page.content === "string" ? page.content : "");
        setSections([]);
      } else {
        setRawHtmlContent("");
        setSections(parsePageContent(page.content));
      }
    } else {
      setEditingId(null);
      setPageTitle("");
      setPageSlug("");
      setIsPublished(false);
      setMetaTitle("");
      setMetaDescription("");
      setSections([]);
      setIsRawHtml(false);
      setRawHtmlContent("");
    }
    setView("builder");
  };

  const handleSavePage = async () => {
    if (!pageTitle.trim()) {
      toast("Page title is required", "error");
      return;
    }
    setSaving(true);
    const slug = pageSlug || pageTitle.toLowerCase().replace(/\s+/g, "-");
    const payload: Record<string, unknown> = {
      title: pageTitle,
      slug,
      content: isRawHtml ? rawHtmlContent : JSON.stringify({ sections }),
      isPublished,
      metaTitle: metaTitle || undefined,
      metaDesc: metaDescription || undefined,
    };
    try {
      let pageId = editingId;
      if (editingId) {
        await adminApi.updatePage(editingId, payload);
        pageId = editingId;
      } else {
        await adminApi.createPage(payload);
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "cmsPages"] });
      toast(editingId ? "Page updated" : "Page created", "success");
      setView("list");
      if (slug) {
        queryClient.invalidateQueries({ queryKey: ["cms", "page", slug] });
      }
    } catch {
      toast("Failed to save page", "error");
    } finally {
      setSaving(false);
    }
  };

  if (view === "builder") {
    const editingPage = editingId ? pages.find((p) => p.id === editingId) : undefined;
    const contentPage: ContentPage = {
      id: editingId ?? "new",
      title: pageTitle || "Untitled Page",
      slug: pageSlug || "untitled",
      type: "page",
      status: isPublished ? "published" : "draft",
      sections,
      seo: {
        metaTitle: metaTitle,
        metaDescription: metaDescription,
        metaImage: editingPage?.ogImage ?? "",
        ogTitle: "",
        ogDescription: "",
        ogImage: editingPage?.ogImage ?? "",
        canonicalUrl: "",
        robots: "index,follow",
        structuredData: "",
      },
      createdAt: editingPage?.createdAt ?? new Date().toISOString(),
      updatedAt: editingPage?.updatedAt ?? new Date().toISOString(),
      version: 1,
    };

    return (
      <div>
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Pages
        </button>

        <div className="mb-6">
          <h1 className="font-display text-2xl text-neutral-900">
            {editingId ? "Edit Page" : "New Page"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Drag and drop to build your page. Add, reorder, and configure sections.
          </p>
        </div>

        <div className="mb-4 premium-card rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Page Title *</label>
              <input
                value={pageTitle}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const newAutoSlug = newTitle.toLowerCase().replace(/\s+/g, "-");
                  const oldAutoSlug = pageTitle.toLowerCase().replace(/\s+/g, "-");
                  setPageTitle(newTitle);
                  if (!pageSlug || pageSlug === oldAutoSlug) {
                    setPageSlug(newAutoSlug);
                  }
                }}
                placeholder="Enter page title"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Slug</label>
              <input
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                placeholder="page-url-slug"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="accent-brand-500"
                />
                <span className="text-xs font-medium text-neutral-700">Published</span>
              </label>
            </div>

            <details className="group">
              <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-600 select-none">
                SEO Settings
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Meta Title</label>
                  <input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Page title for search engines"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Meta Description</label>
                  <input
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description for search results"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

        {isRawHtml ? (
          <div className="premium-card rounded-2xl p-4 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-600 text-sm font-medium">Legacy HTML Content</span>
              <p className="text-sm text-amber-700">
                This page uses legacy HTML content that can&apos;t be edited with the visual builder.
                Edit the HTML directly below, or convert to the visual builder (current content will be replaced).
              </p>
            </div>
            <textarea
              value={rawHtmlContent}
              onChange={(e) => setRawHtmlContent(e.target.value)}
              rows={24}
              className="w-full px-4 py-3 text-sm font-mono border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 resize-y"
            />
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (window.confirm("Convert to visual builder? Current HTML content will be lost.")) {
                    convertToVisualBuilder();
                  }
                }}
                className="text-sm text-neutral-500 hover:text-neutral-700 underline"
              >
                Convert to Visual Builder
              </button>
              <button
                onClick={handleSavePage}
                disabled={saving}
                className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save HTML"}
              </button>
            </div>
          </div>
        ) : (
          <PageBuilder
            page={contentPage}
            sections={sections}
            onSectionsChange={setSections}
            onSave={handleSavePage}
            saving={saving}
          />
        )}
      </div>
    );
  }

  if (pagesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle border border-red-200 bg-red-50">
          <span className="text-sm text-red-600">Failed to load CMS pages. Please try again.</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading pages…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-neutral-500">
            {pages.length} page{pages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => openBuilder()} className="btn-primary">
          <Plus size={16} /> Add Page
        </button>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pages yet"
          description="Create pages like About, Contact, etc."
          action={<button onClick={() => openBuilder()} className="btn-primary">Create Page</button>}
        />
      ) : (
        <div className="premium-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Updated</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{page.title}</td>
                  <td className="px-4 py-3 text-neutral-500">/{page.slug}</td>
                  <td className="px-4 py-3"><StatusBadge status={page.isPublished ? "published" : "draft"} /></td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {new Date(page.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openBuilder(page)}
                        className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600"
                        title="Edit with Page Builder"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function CMSPage() {
  return <PagesTab />;
}
