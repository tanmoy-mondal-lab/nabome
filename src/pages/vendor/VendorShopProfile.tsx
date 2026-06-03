import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Store, Camera, Upload, AlertCircle, Loader2, MapPin, Mail, Phone, Check, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getVendorByUserId, updateVendor, type Vendor } from "../../lib/api/vendors";
import { isNeonConnected } from "../../lib/neon";
import { uploadImage } from "../../lib/cloudinary";
import { useToast } from "../../components/Toast";

const CATEGORIES = [
  "Men's Fashion", "Women's Fashion", "Kids Fashion", "Footwear",
  "Accessories", "Jewelry", "Ethnic Wear", "Western Wear",
  "Sportswear", "Winter Wear", "Bags & Luggage", "Other",
];

export default function VendorShopProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    shop_name: "",
    shop_description: "",
    shop_category: "",
    shop_email: "",
    shop_phone: "",
    shop_address: "",
    shop_logo: "",
    shop_banner: "",
  });

  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const loadVendor = async () => {
    if (!user || !await isNeonConnected()) { setLoading(false); return; }
    try {
      const data = await getVendorByUserId(user.id);
      if (data) {
        setVendor(data);
        setForm({
          shop_name: data.shop_name || "",
          shop_description: data.shop_description || "",
          shop_category: data.shop_category || "",
          shop_email: data.shop_email || "",
          shop_phone: data.shop_phone || "",
          shop_address: data.shop_address || "",
          shop_logo: data.shop_logo || "",
          shop_banner: data.shop_banner || "",
        });
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    loadVendor();
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const result = await uploadImage(file, "nabome/shops");
      setForm((f) => ({ ...f, shop_logo: result.secure_url }));
    } catch {
      setError("Failed to upload logo");
    }
    setUploadingLogo(false);
    if (logoRef.current) logoRef.current.value = "";
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const result = await uploadImage(file, "nabome/shops");
      setForm((f) => ({ ...f, shop_banner: result.secure_url }));
    } catch {
      setError("Failed to upload banner");
    }
    setUploadingBanner(false);
    if (bannerRef.current) bannerRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.shop_name.trim()) { setError("Shop name is required."); return; }
    if (!vendor) return;
    setSaving(true);
    setError("");

    const updates: Partial<Vendor> = {
      shop_name: form.shop_name.trim(),
      shop_description: form.shop_description.trim() || undefined,
      shop_category: form.shop_category || undefined,
      shop_email: form.shop_email.trim() || undefined,
      shop_phone: form.shop_phone.trim() || undefined,
      shop_address: form.shop_address.trim() || undefined,
      shop_logo: form.shop_logo || undefined,
      shop_banner: form.shop_banner || undefined,
    };

    try {
      await updateVendor(vendor.id, updates);
      await loadVendor();
      showToast("Shop profile updated!");
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
    setSaving(false);
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "14px 16px", border: "1px solid var(--line)",
    background: "var(--surface)", color: "var(--text)", fontSize: ".9rem",
    outline: "none", borderRadius: "var(--radius)", transition: "border-color var(--transition-fast)",
  };

  const selectS: React.CSSProperties = {
    ...fieldS, cursor: "pointer", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
    paddingRight: 40,
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16, padding: 20 }}>
        <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-xl)" }} />
        <div className="skeleton" style={{ height: 300, borderRadius: "var(--radius-xl)" }} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: 60 }}>
        <Store size={48} style={{ color: "var(--muted)", marginBottom: 16 }} />
        <h2 style={{ fontWeight: 400, marginBottom: 8 }}>No Shop Found</h2>
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Register as a vendor to create your shop.</p>
      </motion.div>
    );
  }

  const statusColor = vendor.approval_status === "approved" ? "#2ecc71" : vendor.approval_status === "rejected" ? "#e74c3c" : "#f39c12";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Store size={22} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: "1.4rem", fontWeight: 400 }}>Shop Profile</h1>
          <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: ".7rem", fontWeight: 600, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, marginLeft: 8 }}>
            {vendor.approval_status.charAt(0).toUpperCase() + vendor.approval_status.slice(1)}
          </span>
        </div>
        {!editing && (
          <button onClick={() => { setEditing(true); setError(""); }} className="premium-button" style={{ padding: "0 24px", fontSize: ".82rem" }}>
            Edit Shop
          </button>
        )}
      </div>

      {/* Banner */}
      <div className="glass" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 24, position: "relative" }}>
        <div style={{ height: 200, background: "var(--surface-strong)", position: "relative", overflow: "hidden" }}>
          {form.shop_banner ? (
            <img src={form.shop_banner} alt="Shop Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)" }}>
              <Camera size={40} />
            </div>
          )}
          {editing && (
            <label htmlFor="shop-banner-upload" style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "8px 14px", borderRadius: "var(--radius)", cursor: "pointer", fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6 }}>
              {uploadingBanner ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
              {uploadingBanner ? "Uploading..." : "Update Banner"}
            </label>
          )}
          <input ref={bannerRef} id="shop-banner-upload" type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: "none" }} />
        </div>
        {/* Logo */}
        <div style={{ padding: "0 24px 24px", marginTop: -50, display: "flex", alignItems: "flex-end", gap: 20 }}>
          <div style={{ position: "relative", width: 100, height: 100, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "3px solid var(--bg)", flexShrink: 0 }}>
            {form.shop_logo ? (
              <img src={form.shop_logo} alt="Shop Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}>
                <Store size={32} style={{ color: "var(--muted)" }} />
              </div>
            )}
            {editing && (
              <label htmlFor="shop-logo-upload" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", cursor: "pointer", opacity: 0, transition: "opacity 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
              >
                {uploadingLogo ? <Loader2 size={24} className="spin" style={{ color: "#fff" }} /> : <Camera size={24} style={{ color: "#fff" }} />}
              </label>
            )}
            <input ref={logoRef} id="shop-logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
          </div>
          <div style={{ paddingBottom: 4, flex: 1 }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600 }}>{vendor.shop_name}</h2>
            <p style={{ color: "var(--muted)", fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Globe size={13} /> {vendor.shop_slug}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)" }}>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <h3 style={{ fontWeight: 500, fontSize: "1rem", color: "var(--gold)", marginBottom: 4 }}>Shop Information</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Shop Name *</label>
                <input type="text" value={form.shop_name} onChange={(e) => setForm((f) => ({ ...f, shop_name: e.target.value }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Shop Category</label>
                <select value={form.shop_category} onChange={(e) => setForm((f) => ({ ...f, shop_category: e.target.value }))} style={selectS}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Shop Description</label>
              <textarea rows={4} value={form.shop_description} onChange={(e) => setForm((f) => ({ ...f, shop_description: e.target.value }))} style={{ ...fieldS, resize: "vertical", fontFamily: "inherit" }} />
            </div>

            <h3 style={{ fontWeight: 500, fontSize: "1rem", color: "var(--gold)", marginTop: 8, marginBottom: 4 }}>Contact Information</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Email</label>
                <input type="email" value={form.shop_email} onChange={(e) => setForm((f) => ({ ...f, shop_email: e.target.value }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Phone</label>
                <input type="tel" value={form.shop_phone} onChange={(e) => setForm((f) => ({ ...f, shop_phone: e.target.value }))} style={fieldS} />
              </div>
            </div>

            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Business Address</label>
              <textarea rows={3} value={form.shop_address} onChange={(e) => setForm((f) => ({ ...f, shop_address: e.target.value }))} style={{ ...fieldS, resize: "vertical", fontFamily: "inherit" }} />
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(231,76,60,0.1)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} style={{ color: "#e74c3c", flexShrink: 0 }} />
                <span style={{ color: "#e74c3c", fontSize: ".85rem" }}>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button onClick={handleSave} disabled={saving} className="premium-button" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 46 }}>
                {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => { setEditing(false); setError(""); loadVendor(); }} style={{ padding: "0 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500 }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gap: 18 }}>
              <Section title="Shop Information">
                <InfoRow icon={<Store size={15} />} label="Shop Name" value={vendor.shop_name} />
                <InfoRow icon={<TagIcon />} label="Category" value={vendor.shop_category || "—"} />
                <InfoRow icon={<FileTextIcon />} label="Description" value={vendor.shop_description || "—"} />
              </Section>
              <Section title="Contact Information">
                <InfoRow icon={<Mail size={15} />} label="Email" value={vendor.shop_email || "—"} />
                <InfoRow icon={<Phone size={15} />} label="Phone" value={vendor.shop_phone || "—"} />
                <InfoRow icon={<MapPin size={15} />} label="Address" value={vendor.shop_address || "—"} />
              </Section>
              <Section title="Performance">
                <InfoRow icon={<Store size={15} />} label="Products" value={String(vendor.total_products)} />
                <InfoRow icon={<ShoppingBagIcon />} label="Orders" value={String(vendor.total_orders)} />
                <InfoRow icon={<StarIcon />} label="Rating" value={`${vendor.rating} / 5`} />
              </Section>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontWeight: 500, fontSize: ".9rem", color: "var(--gold)", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
        {title}
      </h3>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "var(--gold)", display: "flex", width: 16, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 1 }}>{label}</p>
        <p style={{ fontWeight: 500, fontSize: ".9rem" }}>{value}</p>
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/>
      <path d="M7 7h.01"/>
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
