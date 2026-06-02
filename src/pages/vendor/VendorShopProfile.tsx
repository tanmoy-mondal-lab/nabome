import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Camera, Upload, Save, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "../../components/Toast";
import { getMockShop } from "../../lib/mockVendorData";

export default function VendorShopProfile() {
  const { showToast } = useToast();
  const shop = getMockShop();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    shopName: shop.shopName,
    shopDescription: shop.shopDescription,
    shopCategory: shop.shopCategory,
    businessName: shop.businessName,
    ownerName: shop.ownerName,
    phone: shop.phone,
    email: shop.email,
    address: shop.address,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.shopName.trim() || !form.ownerName.trim()) {
      setError("Shop name and owner name are required.");
      return;
    }
    setSaving(true);
    setError("");
    // TODO: persist to DB
    await new Promise((r) => setTimeout(r, 1000));
    showToast("Shop profile updated!");
    setSaving(false);
    setEditing(false);
  };

  const categories = [
    "Men's Fashion", "Women's Fashion", "Kids Fashion", "Footwear",
    "Accessories", "Jewelry", "Ethnic Wear", "Western Wear",
    "Sportswear", "Winter Wear", "Other",
  ];

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "14px 16px", border: "1px solid var(--line)",
    background: "var(--surface)", color: "var(--text)", fontSize: ".9rem",
    outline: "none", borderRadius: "var(--radius)", transition: "border-color var(--transition-fast)",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Store size={22} style={{ color: "var(--gold)" }} /> Shop Profile
        </h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="premium-button" style={{ padding: "0 24px", fontSize: ".82rem" }}>
            Edit Shop
          </button>
        )}
      </div>

      {/* Banner */}
      <div className="glass" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 24, position: "relative" }}>
        <div style={{ height: 200, background: "var(--surface-strong)", position: "relative", overflow: "hidden" }}>
          {(bannerPreview || shop.shopBanner) ? (
            <img src={bannerPreview || shop.shopBanner} alt="Shop Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)" }}>
              <Camera size={40} />
            </div>
          )}
          {editing && (
            <label htmlFor="banner-upload" style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "8px 14px", borderRadius: "var(--radius)", cursor: "pointer", fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Upload size={14} /> Update Banner
            </label>
          )}
          <input id="banner-upload" type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: "none" }} />
        </div>
        {/* Logo */}
        <div style={{ padding: "0 24px 24px", marginTop: -50, display: "flex", alignItems: "flex-end", gap: 20 }}>
          <div style={{ position: "relative", width: 100, height: 100, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "3px solid var(--bg)", flexShrink: 0 }}>
            {(logoPreview || shop.shopLogo) ? (
              <img src={logoPreview || shop.shopLogo} alt="Shop Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}>
                <Store size={32} style={{ color: "var(--muted)" }} />
              </div>
            )}
            {editing && (
              <label htmlFor="logo-upload" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", cursor: "pointer", opacity: 0, transition: "opacity 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
              >
                <Camera size={24} style={{ color: "#fff" }} />
              </label>
            )}
            <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
          </div>
          <div style={{ paddingBottom: 4 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{shop.shopName}</h2>
            <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{shop.shopCategory} · Since {new Date(shop.createdAt).getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)" }}>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Shop Name *</label>
              <input type="text" value={form.shopName} onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))} style={fieldS} />
            </div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Shop Description</label>
              <textarea rows={4} value={form.shopDescription} onChange={(e) => setForm((f) => ({ ...f, shopDescription: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} />
            </div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Shop Category *</label>
              <select value={form.shopCategory} onChange={(e) => setForm((f) => ({ ...f, shopCategory: e.target.value }))} style={fieldS}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Business Name</label>
                <input type="text" value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Owner Name *</label>
                <input type="text" value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} style={fieldS} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={fieldS} />
              </div>
            </div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Business Address</label>
              <textarea rows={3} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} />
            </div>
            {error && <p style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> {error}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSave} disabled={saving} className="premium-button" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 46 }}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)} style={{ padding: "0 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gap: 16 }}>
              <InfoRow label="Shop Name" value={shop.shopName} />
              <InfoRow label="Category" value={shop.shopCategory} />
              <InfoRow label="Description" value={shop.shopDescription} />
              <InfoRow label="Business Name" value={shop.businessName} />
              <InfoRow label="Owner" value={shop.ownerName} />
              <InfoRow label="Phone" value={shop.phone} />
              <InfoRow label="Email" value={shop.email} />
              <InfoRow label="Address" value={shop.address} />
              <InfoRow label="Status" value={shop.status.charAt(0).toUpperCase() + shop.status.slice(1)} />
              <InfoRow label="Rating" value={`${shop.rating} ★ (${shop.totalCustomers} customers)`} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
      <div style={{ minWidth: 140 }}>
        <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{label}</p>
      </div>
      <p style={{ fontWeight: 500, fontSize: ".9rem" }}>{value}</p>
    </div>
  );
}
