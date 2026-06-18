import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api/admin";

interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  taxRate: number;
  shippingEnabled: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  orderEmailNotifications: boolean;
  lowStockThreshold: number;
  autoPublishReviews: boolean;
  maxWishlistItems: number;
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({
    storeName: "NABOME", storeEmail: "", storePhone: "", storeAddress: "",
    currency: "INR", taxRate: 18, shippingEnabled: true,
    freeShippingThreshold: 5000, shippingCost: 199,
    orderEmailNotifications: true, lowStockThreshold: 5,
    autoPublishReviews: false, maxWishlistItems: 50,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const s = res.settings as Settings | undefined;
      if (s) setForm((prev) => ({ ...prev, ...s }));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(form);
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
        <h1 className="font-display text-2xl text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">General store configuration</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Store Info */}
        <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Store Name</label>
              <input value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Store Email</label>
              <input type="email" value={form.storeEmail}
                onChange={(e) => setForm({ ...form, storeEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Store Phone</label>
              <input value={form.storePhone}
                onChange={(e) => setForm({ ...form, storePhone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Currency</label>
              <select value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Store Address</label>
            <textarea rows={2} value={form.storeAddress}
              onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
        </section>

        {/* Tax & Shipping */}
        <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Tax & Shipping</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Tax Rate (%)</label>
              <input type="number" value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Shipping Cost (₹)</label>
              <input type="number" value={form.shippingCost}
                onChange={(e) => setForm({ ...form, shippingCost: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Free Shipping Threshold (₹)</label>
              <input type="number" value={form.freeShippingThreshold}
                onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.shippingEnabled}
              onChange={(e) => setForm({ ...form, shippingEnabled: e.target.checked })}
              className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Enable Shipping</span>
          </label>
        </section>

        {/* Notifications & Preferences */}
        <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Low Stock Threshold</label>
              <input type="number" value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Max Wishlist Items</label>
              <input type="number" value={form.maxWishlistItems}
                onChange={(e) => setForm({ ...form, maxWishlistItems: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.orderEmailNotifications}
                onChange={(e) => setForm({ ...form, orderEmailNotifications: e.target.checked })}
                className="accent-brand-500" />
              <span className="text-xs text-neutral-600">Email notifications for new orders</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.autoPublishReviews}
                onChange={(e) => setForm({ ...form, autoPublishReviews: e.target.checked })}
                className="accent-brand-500" />
              <span className="text-xs text-neutral-600">Auto-publish customer reviews</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="bg-neutral-900 text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
