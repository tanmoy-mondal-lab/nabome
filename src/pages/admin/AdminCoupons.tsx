import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Percent, Plus, Edit2, Trash2, Save } from "lucide-react";
import { useToast } from "../../components/Toast";
import { generateMockAdminCoupons } from "../../lib/mockAdminData";
import type { AdminCoupon } from "../../types/admin";

export default function AdminCoupons() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percentage" as AdminCoupon["type"], value: 0, minOrder: 0, maxUses: 100, description: "", expiresAt: "" });

  useEffect(() => { setCoupons(generateMockAdminCoupons()); }, []);

  const handleSave = (id?: string) => {
    if (!form.code.trim()) { showToast("Coupon code is required."); return; }
    if (id) {
      setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, ...form, code: form.code.toUpperCase() } : c));
      showToast("Coupon updated!");
      setEditing(null);
    } else {
      const newC: AdminCoupon = { id: `cup_${Date.now()}`, code: form.code.toUpperCase(), type: form.type, value: form.value, minOrder: form.minOrder, maxUses: form.maxUses, usedCount: 0, expiresAt: form.expiresAt || "2026-12-31", isActive: true, description: form.description };
      setCoupons((prev) => [newC, ...prev]);
      showToast("Coupon created!");
      setCreating(false);
    }
    setForm({ code: "", type: "percentage", value: 0, minOrder: 0, maxUses: 100, description: "", expiresAt: "" });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast("Coupon deleted.");
  };

  const toggleActive = (id: string) => {
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const startEdit = (c: AdminCoupon) => {
    setForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, maxUses: c.maxUses, description: c.description, expiresAt: c.expiresAt });
    setEditing(c.id);
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: ".85rem", outline: "none", borderRadius: "var(--radius)",
  };

  const formContent = (onSave: () => void, onCancel: () => void) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input type="text" placeholder="Coupon Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} style={fieldS} />
        <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AdminCoupon["type"] }))} style={fieldS}>
          <option value="percentage">Percentage Discount</option>
          <option value="flat">Flat Discount</option>
          <option value="free_shipping">Free Shipping</option>
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <input type="number" placeholder={form.type === "percentage" ? "Discount %" : form.type === "free_shipping" ? "0" : "Discount ₹"} value={form.value || ""} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} style={fieldS} disabled={form.type === "free_shipping"} />
        <input type="number" placeholder="Min Order" value={form.minOrder || ""} onChange={(e) => setForm((f) => ({ ...f, minOrder: Number(e.target.value) }))} style={fieldS} />
        <input type="number" placeholder="Max Uses" value={form.maxUses || ""} onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))} style={fieldS} />
      </div>
      <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={fieldS} />
      <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} style={{ ...fieldS, colorScheme: "dark" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 20px", fontSize: ".85rem" }}><Save size={14} /> Save</button>
        <button onClick={onCancel} style={{ padding: "10px 20px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem" }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Percent size={22} style={{ color: "var(--gold)" }} /> Coupons ({coupons.length})
        </h1>
        <button onClick={() => { setCreating(!creating); setEditing(null); }} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 20px", fontSize: ".82rem" }}>
          <Plus size={14} /> {creating ? "Cancel" : "Create Coupon"}
        </button>
      </div>

      {creating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Create New Coupon</h3>
          {formContent(() => handleSave(), () => setCreating(false))}
        </motion.div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {coupons.map((coupon) => (
          <div key={coupon.id} className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}>
            {editing === coupon.id ? (
              <div>
                <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Edit Coupon</h3>
                {formContent(() => handleSave(coupon.id), () => setEditing(null))}
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ padding: "8px 12px", background: coupon.isActive ? "var(--gold-soft)" : "var(--surface-strong)", borderRadius: "var(--radius)" }}>
                    <Percent size={20} style={{ color: coupon.isActive ? "var(--gold)" : "var(--muted)" }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.05em" }}>{coupon.code}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>
                      {coupon.type === "percentage" ? `${coupon.value}% off` : coupon.type === "flat" ? `₹${coupon.value} off` : "Free Shipping"}
                      · Min: ₹{coupon.minOrder.toLocaleString("en-IN")} · Used: {coupon.usedCount}/{coupon.maxUses}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>{coupon.description} · Expires {new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: ".7rem", fontWeight: 600, background: coupon.isActive ? "#2ecc7118" : "#95a5a618", color: coupon.isActive ? "#2ecc71" : "#95a5a6" }}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => toggleActive(coupon.id)} style={{ width: 30, height: 30, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center", fontSize: ".75rem" }}>
                    {coupon.isActive ? "On" : "Off"}
                  </button>
                  <button onClick={() => startEdit(coupon)} style={{ width: 30, height: 30, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}><Edit2 size={12} /></button>
                  <button onClick={() => handleDelete(coupon.id)} style={{ width: 30, height: 30, border: "1px solid var(--line)", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}><Trash2 size={12} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
