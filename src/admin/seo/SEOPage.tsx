import { MediaPicker } from "../common/MediaPicker";
import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { useToast } from "../../components/ui/Toast";

interface SEOData {
  globalMetaTitle: string;
  globalMetaDescription: string;
  ogImage: string;
  ogImagePublicId?: string;
  facebookPixelId: string;
  googleTagManagerId: string;
  canonicalUrl: string;
  robotsTxt: string;
  structuredData: string;
  sitemapEnabled: boolean;
}

const defaultForm: SEOData = {
  globalMetaTitle: "", globalMetaDescription: "", ogImage: "", ogImagePublicId: "",
  facebookPixelId: "", googleTagManagerId: "", canonicalUrl: "",
  robotsTxt: "", structuredData: "", sitemapEnabled: true,
};

function extractSEO(settings: Record<string, unknown> | undefined): SEOData {
  const s = settings?.seo as Partial<SEOData> | undefined;
  return {
    globalMetaTitle: s?.globalMetaTitle ?? "",
    globalMetaDescription: s?.globalMetaDescription ?? "",
    ogImage: s?.ogImage ?? "",
    ogImagePublicId: s?.ogImagePublicId ?? "",
    facebookPixelId: s?.facebookPixelId ?? "",
    googleTagManagerId: s?.googleTagManagerId ?? "",
    canonicalUrl: s?.canonicalUrl ?? "",
    robotsTxt: s?.robotsTxt ?? "",
    structuredData: s?.structuredData ?? "",
    sitemapEnabled: s?.sitemapEnabled ?? true,
  };
}

export default function SEOPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<SEOData>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "seo"],
    queryFn: async () => {
      const res = await adminApi.getSettings();
      return res.settings as Record<string, unknown> | undefined;
    },
  });

  useEffect(() => {
    if (data) setForm(extractSEO(data));
  }, [data]);

  const handleSave = async () => {
    if (form.structuredData.trim()) {
      try {
        JSON.parse(form.structuredData);
      } catch {
        toast("Invalid JSON in Structured Data field", "error");
        return;
      }
    }
    try {
      const current = await adminApi.getSettings();
      const settings = current.settings as Record<string, unknown> ?? {};
      await adminApi.updateSettings({ ...settings, seo: form });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "seo"] });
      toast("SEO settings saved", "success");
    } catch {
      toast("Failed to save SEO settings", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading SEO settings…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">SEO Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage search engine optimization</p>
      </div>

      <div className="premium-card rounded-2xl p-6 space-y-5 max-w-4xl">
        <h2 className="font-medium text-sm text-neutral-900">Global Meta</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Global Meta Title</label>
            <input value={form.globalMetaTitle}
              onChange={(e) => setForm({ ...form, globalMetaTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            <p className={`text-xs mt-1 ${form.globalMetaTitle.length > 60 ? 'text-amber-500' : 'text-neutral-400'}`}>
              {form.globalMetaTitle.length}/60 characters
            </p>
          </div>
            <div>
              <MediaPicker value={form.ogImage} onChange={(url, publicId) => setForm({ ...form, ogImage: url, ogImagePublicId: publicId ?? "" })} label="OG Image URL" folder="seo" />
            </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Global Meta Description</label>
          <textarea rows={2} value={form.globalMetaDescription}
            onChange={(e) => setForm({ ...form, globalMetaDescription: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          <p className={`text-xs mt-1 ${form.globalMetaDescription.length > 160 ? 'text-amber-500' : 'text-neutral-400'}`}>
            {form.globalMetaDescription.length}/160 characters
          </p>
        </div>

        <hr className="border-neutral-100" />
        <h2 className="font-medium text-sm text-neutral-900">Tracking & Analytics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Facebook Pixel ID</label>
            <input value={form.facebookPixelId}
              onChange={(e) => setForm({ ...form, facebookPixelId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Google Tag Manager ID</label>
            <input value={form.googleTagManagerId}
              onChange={(e) => setForm({ ...form, googleTagManagerId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
        </div>

        <hr className="border-neutral-100" />
        <h2 className="font-medium text-sm text-neutral-900">Technical</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Canonical URL</label>
            <input value={form.canonicalUrl}
              onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.sitemapEnabled}
                onChange={(e) => setForm({ ...form, sitemapEnabled: e.target.checked })} className="accent-brand-500" />
              <span className="text-xs text-neutral-600">Enable Sitemap</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">robots.txt</label>
          <textarea rows={4} value={form.robotsTxt}
            onChange={(e) => setForm({ ...form, robotsTxt: e.target.value })}
            className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded"
            placeholder="User-agent: *&#10;Allow: /" />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Structured Data (JSON-LD)</label>
          <textarea rows={6} value={form.structuredData}
            onChange={(e) => setForm({ ...form, structuredData: e.target.value })}
            className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded"
            placeholder='{"@context":"https://schema.org","@type":"Organization"}' />
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={isLoading}
          className="btn-primary disabled:opacity-50">
          Save SEO Settings
        </button>
      </div>
      </div>
    </div>
  );
}
