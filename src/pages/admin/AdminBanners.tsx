import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Image, Plus, Edit2, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { useToast } from "../../components/Toast";
import { getBanners, createBanner, updateBanner, deleteBanner, type Banner } from "../../lib/api/banners";

export default function AdminBanners() {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", linkUrl: "", linkText: "", position: "hero" as Banner["position"], sortOrder: 0, imageUrl: "", description: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBanners().then((data) => { setBanners(data); setLoading(false); });
  }, []);

  const handleSave = async (id?: string) => {
    if (!form.title.trim()) { showToast("Title is required."); return; }
    if (id) {
      await updateBanner(id, form);
      setBanners((prev) => prev.map((b) => b.id === id ? { ...b, ...form } : b));
      showToast("Banner updated!");
      setEditing(null);
    } else {
      await createBanner({ ...form, isActive: true, imageUrl: form.imageUrl || "https://placehold.co/1200x400/1a1a2e/d4af37?text=Nabome" });
      const updated = await getBanners();
      setBanners(updated);
      showToast("Banner created!");
      setCreating(false);
    }
    setForm({ title: "", subtitle: "", linkUrl: "", linkText: "", position: "hero", sortOrder: 0, imageUrl: "", description: "" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this banner?")) return;
    await deleteBanner(id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
    showToast("Banner deleted.");
  };

  const toggleActive = async (id: string) => {
    const b = banners.find((b) => b.id === id);
    if (!b) return;
    await updateBanner(id, { isActive: !b.isActive });
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b));
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: ".85rem", outline: "none", borderRadius: "var(--radius)",
  };

  const renderForm = (onSave: () => void, onCancel: () => void) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input type="text" placeholder="Banner Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={fieldS} />
      <input type="text" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} style={fieldS} />
      <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={fieldS} />
      <input type="text" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} style={fieldS} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input type="text" placeholder="Link URL" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} style={fieldS} />
        <input type="text" placeholder="Link Text" value={form.linkText} onChange={(e) => setForm((f) => ({ ...f, linkText: e.target.value }))} style={fieldS} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as Banner["position"] }))} style={fieldS}>
          <option value="hero">Hero Banner</option>
          <option value="promo">Promotional Banner</option>
          <option value="sidebar">Sidebar Banner</option>
        </select>
        <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} style={fieldS} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 20px", fontSize: ".85rem" }}><Save size={14} /> Save</button>
        <button onClick={onCancel} style={{ padding: "10px 20px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem" }}>Cancel</button>
      </div>
    </div>
  );

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Image size={22} style={{ color: "var(--gold)" }} /> Banner Management
        </h1>
        <button onClick={() => { setCreating(!creating); setEditing(null); }} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 20px", fontSize: ".82rem" }}>
          <Plus size={14} /> {creating ? "Cancel" : "Add Banner"}
        </button>
      </div>

      {creating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Create New Banner</h3>
          {renderForm(() => handleSave(), () => setCreating(false))}
        </motion.div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {banners.map((banner) => (
          <motion.div key={banner.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}
          >
            <div style={{ height: 200, position: "relative", overflow: "hidden", background: "var(--surface-strong)" }}>
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: ".85rem" }}>
                  <div style={{ textAlign: "center" }}><Image size={32} style={{ marginBottom: 8 }} /><br />No image</div>
                </div>
              )}
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: ".7rem", fontWeight: 600, background: "rgba(0,0,0,0.6)", color: "#fff", textTransform: "capitalize" }}>{banner.position}</span>
                <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: ".7rem", fontWeight: 600, background: banner.isActive ? "rgba(46,204,113,0.8)" : "rgba(149,165,166,0.8)", color: "#fff" }}>{banner.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
            {editing === banner.id ? (
              <div style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Edit Banner</h3>
                {renderForm(() => handleSave(banner.id), () => setEditing(null))}
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: ".95rem" }}>{banner.title}</p>
                    {banner.subtitle && <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{banner.subtitle}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleActive(banner.id)} style={{ width: 32, height: 32, border: "1px solid var(--line)", background: "transparent", color: banner.isActive ? "#2ecc71" : "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
                      {banner.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => { setEditing(banner.id); setForm({ title: banner.title, subtitle: banner.subtitle || "", linkUrl: banner.linkUrl || "", linkText: banner.linkText || "", position: banner.position, sortOrder: banner.sortOrder, imageUrl: banner.imageUrl, description: banner.description || "" }); setCreating(false); }} style={{ width: 32, height: 32, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(banner.id)} style={{ width: 32, height: 32, border: "1px solid var(--line)", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
