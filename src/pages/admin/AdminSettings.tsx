import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Loader2, Globe, Mail, MapPin, Hash, Truck } from "lucide-react";
import { useToast } from "../../components/Toast";
import { generateMockSiteSettings } from "../../lib/mockAdminData";
import type { AdminSiteSettings } from "../../types/admin";

export default function AdminSettings() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdminSiteSettings | null>(null);

  useEffect(() => { setForm(generateMockSiteSettings()); }, []);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    showToast("Settings saved!");
    setSaving(false);
  };

  if (!form) return null;

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

      {/* Brand */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={16} style={{ color: "var(--gold)" }} /> Brand
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Brand Name</label>
            <input type="text" value={form.brandName} onChange={(e) => setForm((f) => f ? { ...f, brandName: e.target.value } : f)} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Currency</label>
            <select value={form.currency} onChange={(e) => setForm((f) => f ? { ...f, currency: e.target.value } : f)} style={fieldS}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Mail size={16} style={{ color: "var(--gold)" }} /> Contact Details
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => f ? { ...f, contactEmail: e.target.value } : f)} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Support Email</label>
            <input type="email" value={form.supportEmail} onChange={(e) => setForm((f) => f ? { ...f, supportEmail: e.target.value } : f)} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Phone</label>
            <input type="tel" value={form.contactPhone} onChange={(e) => setForm((f) => f ? { ...f, contactPhone: e.target.value } : f)} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm((f) => f ? { ...f, address: e.target.value } : f)} style={fieldS} />
          </div>
        </div>
      </div>

      {/* Tax & Shipping */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Truck size={16} style={{ color: "var(--gold)" }} /> Tax & Shipping
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Tax Rate (%)</label>
            <input type="number" value={form.taxRate} onChange={(e) => setForm((f) => f ? { ...f, taxRate: Number(e.target.value) } : f)} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Shipping Charge (₹)</label>
            <input type="number" value={form.shippingCharge} onChange={(e) => setForm((f) => f ? { ...f, shippingCharge: Number(e.target.value) } : f)} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Free Shipping Above (₹)</label>
            <input type="number" value={form.freeShippingAbove} onChange={(e) => setForm((f) => f ? { ...f, freeShippingAbove: Number(e.target.value) } : f)} style={fieldS} />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Hash size={16} style={{ color: "var(--gold)" }} /> SEO Settings
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>SEO Title</label>
            <input type="text" value={form.seoTitle} onChange={(e) => setForm((f) => f ? { ...f, seoTitle: e.target.value } : f)} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>SEO Description</label>
            <textarea rows={2} value={form.seoDescription} onChange={(e) => setForm((f) => f ? { ...f, seoDescription: e.target.value } : f)} style={{ ...fieldS, resize: "vertical" }} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>SEO Keywords</label>
            <input type="text" value={form.seoKeywords} onChange={(e) => setForm((f) => f ? { ...f, seoKeywords: e.target.value } : f)} style={fieldS} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={16} style={{ color: "var(--gold)" }} /> Footer
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Footer Text</label>
            <input type="text" value={form.footerText} onChange={(e) => setForm((f) => f ? { ...f, footerText: e.target.value } : f)} style={fieldS} />
          </div>
          <div>
            <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Footer Description</label>
            <textarea rows={2} value={form.footerDescription} onChange={(e) => setForm((f) => f ? { ...f, footerDescription: e.target.value } : f)} style={{ ...fieldS, resize: "vertical" }} />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={16} style={{ color: "var(--gold)" }} /> Social Media Links
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {form.socialLinks.map((link, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: "var(--muted)", fontSize: ".82rem", minWidth: 100 }}>{link.platform}</span>
              <input type="url" value={link.url} onChange={(e) => {
                const newLinks = [...form.socialLinks];
                newLinks[i] = { ...newLinks[i], url: e.target.value };
                setForm((f) => f ? { ...f, socialLinks: newLinks } : f);
              }} style={fieldS} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
