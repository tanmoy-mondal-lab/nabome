import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Loader2, Globe, Mail, MapPin, Hash, Truck } from "lucide-react";
import { useToast } from "../../components/Toast";
import { getSettings, updateSetting, type SiteSetting } from "../../lib/api/settings";

interface FormState {
  brandName: string;
  currency: string;
  contactEmail: string;
  supportEmail: string;
  contactPhone: string;
  address: string;
  taxRate: number;
  shippingCharge: number;
  freeShippingAbove: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  footerText: string;
  footerDescription: string;
}

export default function AdminSettings() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    brandName: "নবME", currency: "INR", contactEmail: "", supportEmail: "",
    contactPhone: "", address: "", taxRate: 5, shippingCharge: 49, freeShippingAbove: 499,
    seoTitle: "নবME — Premium Fashion Marketplace", seoDescription: "", seoKeywords: "",
    footerText: "© 2026 নবME", footerDescription: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      const map: Record<string, string> = {};
      settings.forEach((s: SiteSetting) => { map[s.key] = s.value; });
      setForm((prev) => ({ ...prev, ...map }));
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(form);
    for (const [key, value] of entries) {
      await updateSetting(key, String(value));
    }
    showToast("Settings saved!");
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading...</div>;

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: ".9rem", outline: "none", borderRadius: "var(--radius)",
  };

  const sectionS: React.CSSProperties = {
    background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 20,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Settings size={22} style={{ color: "var(--gold)" }} /> Website Settings
        </h1>
        <button onClick={handleSave} disabled={saving} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 24px", fontSize: ".85rem" }}>
          {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save All
        </button>
      </div>

      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={16} style={{ color: "var(--gold)" }} /> Brand
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Brand Name</label>
            <input type="text" value={form.brandName} onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Currency</label>
            <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} style={fieldS}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Mail size={16} style={{ color: "var(--gold)" }} /> Contact Details
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Support Email</label>
            <input type="email" value={form.supportEmail} onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Phone</label>
            <input type="tel" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={fieldS} />
          </div>
        </div>
      </div>

      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Truck size={16} style={{ color: "var(--gold)" }} /> Tax & Shipping
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Tax Rate (%)</label>
            <input type="number" value={form.taxRate} onChange={(e) => setForm((f) => ({ ...f, taxRate: Number(e.target.value) }))} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Shipping Charge (₹)</label>
            <input type="number" value={form.shippingCharge} onChange={(e) => setForm((f) => ({ ...f, shippingCharge: Number(e.target.value) }))} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Free Shipping Above (₹)</label>
            <input type="number" value={form.freeShippingAbove} onChange={(e) => setForm((f) => ({ ...f, freeShippingAbove: Number(e.target.value) }))} style={fieldS} />
          </div>
        </div>
      </div>

      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Hash size={16} style={{ color: "var(--gold)" }} /> SEO Settings
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>SEO Title</label>
            <input type="text" value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>SEO Description</label>
            <textarea rows={2} value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>SEO Keywords</label>
            <input type="text" value={form.seoKeywords} onChange={(e) => setForm((f) => ({ ...f, seoKeywords: e.target.value }))} style={fieldS} />
          </div>
        </div>
      </div>

      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={16} style={{ color: "var(--gold)" }} /> Footer
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Footer Text</label>
            <input type="text" value={form.footerText} onChange={(e) => setForm((f) => ({ ...f, footerText: e.target.value }))} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Footer Description</label>
            <textarea rows={2} value={form.footerDescription} onChange={(e) => setForm((f) => ({ ...f, footerDescription: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
