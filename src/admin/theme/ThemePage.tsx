import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api/admin";

interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  buttonStyle: string;
  layoutWidth: string;
  customCSS: string;
  logoUrl: string;
  faviconUrl: string;
}

export default function ThemePage() {
  const [form, setForm] = useState<ThemeConfig>({
    primaryColor: "#000000", accentColor: "#d4a853", fontFamily: "Playfair Display",
    backgroundColor: "#ffffff", textColor: "#1a1a1a",
    buttonStyle: "solid", layoutWidth: "boxed", customCSS: "", logoUrl: "", faviconUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const s = res.settings as Record<string, unknown> | undefined;
      if (s?.theme) {
        const t = s.theme as ThemeConfig;
        setForm((prev) => ({ ...prev, ...t }));
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const current = await adminApi.getSettings();
      const settings = current.settings as Record<string, unknown> ?? {};
      await adminApi.updateSettings({ ...settings, theme: form });
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
        <h1 className="font-display text-2xl text-neutral-900">Theme Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Customize the look and feel of your store</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Branding */}
        <div className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Branding</h2>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Logo URL</label>
            <input value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Favicon URL</label>
            <input value={form.faviconUrl}
              onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Font Family</label>
            <select value={form.fontFamily}
              onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
              <option value="Playfair Display">Playfair Display</option>
              <option value="Inter">Inter</option>
              <option value="Georgia">Georgia</option>
              <option value="Helvetica Neue">Helvetica Neue</option>
              <option value="Cormorant Garamond">Cormorant Garamond</option>
            </select>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-10 p-0.5 border border-neutral-200 rounded cursor-pointer" />
                <input value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm font-mono border border-neutral-200 rounded" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Accent / Gold</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-10 h-10 p-0.5 border border-neutral-200 rounded cursor-pointer" />
                <input value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm font-mono border border-neutral-200 rounded" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Background</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.backgroundColor}
                  onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                  className="w-10 h-10 p-0.5 border border-neutral-200 rounded cursor-pointer" />
                <input value={form.backgroundColor}
                  onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm font-mono border border-neutral-200 rounded" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Text Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.textColor}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  className="w-10 h-10 p-0.5 border border-neutral-200 rounded cursor-pointer" />
                <input value={form.textColor}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm font-mono border border-neutral-200 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Layout</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Button Style</label>
              <select value={form.buttonStyle}
                onChange={(e) => setForm({ ...form, buttonStyle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
                <option value="rounded">Rounded</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Layout Width</label>
              <select value={form.layoutWidth}
                onChange={(e) => setForm({ ...form, layoutWidth: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                <option value="full">Full Width</option>
                <option value="boxed">Boxed (1280px)</option>
                <option value="narrow">Narrow (960px)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <div className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="font-medium text-sm text-neutral-900">Custom CSS</h2>
          <textarea rows={8} value={form.customCSS}
            onChange={(e) => setForm({ ...form, customCSS: e.target.value })}
            className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded"
            placeholder="/* Custom styles */" />
        </div>
      </div>

      <div className="mt-6 flex justify-end max-w-4xl">
        <button onClick={handleSave} disabled={saving}
          className="bg-neutral-900 text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
          {saving ? "Saving…" : "Save Theme"}
        </button>
      </div>
    </div>
  );
}
