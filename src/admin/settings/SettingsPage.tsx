import { MediaPicker } from "../common/MediaPicker";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { useToast } from "../../components/ui/Toast";

interface Settings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  logoPublicId: string;
  faviconUrl: string;
  faviconPublicId: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  preferences: {
    shippingEnabled: boolean;
    shippingCost: number;
    orderEmailNotifications: boolean;
    lowStockThreshold: number;
    autoPublishReviews: boolean;
    maxWishlistItems: number;
    newsletterTitle: string;
    newsletterSubtitle: string;
    promoText: string;
    promoTagline: string;
    footerLinks: { label: string; url: string }[];
  };
}

const DEFAULT_SETTINGS: Settings = {
  siteName: "नबME", tagline: "", logoUrl: "", logoPublicId: "", faviconUrl: "", faviconPublicId: "",
  contactEmail: "", contactPhone: "", address: "",
  currency: "INR", taxRate: 18, freeShippingThreshold: 5000,
  preferences: {
    shippingEnabled: true, shippingCost: 199,
    orderEmailNotifications: true, lowStockThreshold: 5,
    autoPublishReviews: false, maxWishlistItems: 50,
    newsletterTitle: "Stay Connected", newsletterSubtitle: "Join the नबME Inner Circle",
    promoText: "Free shipping on orders above ₹999 · Easy 30-day returns · Secure checkout", promoTagline: "New Season Now Available",
    footerLinks: [{ label: "Privacy", url: "/privacy" }, { label: "Terms", url: "/terms" }, { label: "FAQ", url: "/faq" }, { label: "Shipping & Returns", url: "/shipping" }],
  },
};

function buildSettings(raw: Record<string, unknown>, fallback: Settings): Settings {
  return {
    ...fallback,
    siteName: (raw.siteName as string) ?? fallback.siteName,
    tagline: (raw.tagline as string) ?? "",
    logoUrl: (raw.logoUrl as string) ?? "",
    logoPublicId: (raw.logoPublicId as string) ?? "",
    faviconUrl: (raw.faviconUrl as string) ?? "",
    faviconPublicId: (raw.faviconPublicId as string) ?? "",
    contactEmail: (raw.contactEmail as string) ?? "",
    contactPhone: (raw.contactPhone as string) ?? "",
    address: (raw.address as string) ?? "",
    currency: (raw.currency as string) ?? fallback.currency,
    taxRate: Number(raw.taxRate ?? fallback.taxRate),
    freeShippingThreshold: Number(raw.freeShippingThreshold ?? fallback.freeShippingThreshold),
    preferences: { ...fallback.preferences, ...((raw.preferences as Partial<Settings["preferences"]>) ?? {}) },
  };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await adminApi.getSettings();
      const s = res.settings as Record<string, unknown> | undefined;
      return s ? buildSettings(s, DEFAULT_SETTINGS) : DEFAULT_SETTINGS;
    },
  });

  const [form, setForm] = useState<Settings>(DEFAULT_SETTINGS);
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    if (settings && !formInitialized) {
      setForm(settings);
      setFormInitialized(true);
    }
  }, [settings, formInitialized]);

  const handleSave = async () => {
    if (!form.siteName.trim()) {
      toast("Store name is required", "error");
      return;
    }
    if (form.taxRate < 0 || form.taxRate > 100) {
      toast("Tax rate must be between 0 and 100", "error");
      return;
    }
    if (form.freeShippingThreshold < 0) {
      toast("Free shipping threshold must be a positive number", "error");
      return;
    }
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      toast("Invalid contact email format", "error");
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateSettings(form);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      window.dispatchEvent(new Event("settings:updated"));
      toast("Settings saved successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast(`Save failed: ${message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading settings…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">General store configuration</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Store Info */}
        <section className="premium-card rounded-2xl p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Store Name</label>
              <input value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Tagline</label>
              <input value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <MediaPicker value={form.logoUrl} onChange={(url, publicId) => setForm({ ...form, logoUrl: url, logoPublicId: publicId ?? "" })} label="Logo URL" folder="branding" />
            </div>
            <div>
              <MediaPicker value={form.faviconUrl} onChange={(url, publicId) => setForm({ ...form, faviconUrl: url, faviconPublicId: publicId ?? "" })} label="Favicon URL" folder="branding" accept="image/png,image/x-icon,image/svg+xml" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Contact Email</label>
              <input type="email" value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Contact Phone</label>
              <input value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Currency</label>
              <select value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Address</label>
            <textarea rows={2} value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
          </div>
        </section>

        {/* Tax & Shipping */}
        <section className="premium-card rounded-2xl p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Tax & Shipping</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Tax Rate (%)</label>
              <input type="number" value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Default Shipping Cost (₹)</label>
              <input type="number" value={form.preferences.shippingCost}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, shippingCost: Number(e.target.value) } })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Free Shipping Threshold (₹)</label>
              <input type="number" value={form.freeShippingThreshold}
                onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.preferences.shippingEnabled}
              onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, shippingEnabled: e.target.checked } })}
              className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Enable Shipping</span>
          </label>
        </section>

        {/* Notifications & Preferences */}
        <section className="premium-card rounded-2xl p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Low Stock Threshold</label>
              <input type="number" value={form.preferences.lowStockThreshold}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, lowStockThreshold: Number(e.target.value) } })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Max Wishlist Items</label>
              <input type="number" value={form.preferences.maxWishlistItems}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, maxWishlistItems: Number(e.target.value) } })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.preferences.orderEmailNotifications}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, orderEmailNotifications: e.target.checked } })}
                className="accent-brand-500" />
              <span className="text-xs text-neutral-600">Email notifications for new orders</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.preferences.autoPublishReviews}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, autoPublishReviews: e.target.checked } })}
                className="accent-brand-500" />
              <span className="text-xs text-neutral-600">Auto-publish customer reviews</span>
            </label>
          </div>
        </section>

        {/* Footer & Promo */}
        <section className="premium-card rounded-2xl p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Footer &amp; Promo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Newsletter Title</label>
              <input value={form.preferences.newsletterTitle}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, newsletterTitle: e.target.value } })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Newsletter Subtitle</label>
              <input value={form.preferences.newsletterSubtitle}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, newsletterSubtitle: e.target.value } })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Promo Bar Text</label>
              <input value={form.preferences.promoText}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, promoText: e.target.value } })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Promo Tagline</label>
              <input value={form.preferences.promoTagline}
                onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, promoTagline: e.target.value } })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Footer Legal Links (JSON)</label>
              <textarea
                value={JSON.stringify(form.preferences.footerLinks, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value) as { label: string; url: string }[];
                    setForm({ ...form, preferences: { ...form.preferences, footerLinks: parsed } });
                  } catch (error) {
                    // invalid JSON, ignore
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors font-mono text-xs"
                rows={4}
              />
          </div>
        </section>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="btn-primary">
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
      </div>
    </div>
  );
}
