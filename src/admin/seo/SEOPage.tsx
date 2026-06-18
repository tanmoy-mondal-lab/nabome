import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api/admin";

interface SEOData {
  globalMetaTitle: string;
  globalMetaDescription: string;
  ogImage: string;
  facebookPixelId: string;
  googleTagManagerId: string;
  canonicalUrl: string;
  robotsTxt: string;
  structuredData: string;
  sitemapEnabled: boolean;
}

export default function SEOPage() {
  const [form, setForm] = useState<SEOData>({
    globalMetaTitle: "", globalMetaDescription: "", ogImage: "",
    facebookPixelId: "", googleTagManagerId: "", canonicalUrl: "",
    robotsTxt: "", structuredData: "", sitemapEnabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const s = res.settings as Record<string, unknown> | undefined;
      if (s?.seo) {
        const seo = s.seo as SEOData;
        setForm({
          globalMetaTitle: seo.globalMetaTitle ?? "",
          globalMetaDescription: seo.globalMetaDescription ?? "",
          ogImage: seo.ogImage ?? "",
          facebookPixelId: seo.facebookPixelId ?? "",
          googleTagManagerId: seo.googleTagManagerId ?? "",
          canonicalUrl: seo.canonicalUrl ?? "",
          robotsTxt: seo.robotsTxt ?? "",
          structuredData: seo.structuredData ?? "",
          sitemapEnabled: seo.sitemapEnabled ?? true,
        });
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const current = await adminApi.getSettings();
      const settings = current.settings as Record<string, unknown> ?? {};
      await adminApi.updateSettings({ ...settings, seo: form });
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">SEO Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage search engine optimization</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded p-6 space-y-5 max-w-4xl">
        <h2 className="font-medium text-sm text-neutral-900">Global Meta</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Global Meta Title</label>
            <input value={form.globalMetaTitle}
              onChange={(e) => setForm({ ...form, globalMetaTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">OG Image URL</label>
            <input value={form.ogImage}
              onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Global Meta Description</label>
          <textarea rows={2} value={form.globalMetaDescription}
            onChange={(e) => setForm({ ...form, globalMetaDescription: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
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
          <button onClick={handleSave} disabled={saving}
            className="bg-neutral-900 text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
            {saving ? "Saving…" : "Save SEO Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
