import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Home, Briefcase, Trash2, Star, Pencil, Loader2, AlertCircle, X } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, type Address } from "../lib/db";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

const STATE_LIST = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const emptyForm = {
  label: "", name: "", phone: "", altPhone: "",
  address: "", address2: "", landmark: "",
  state: "", district: "", city: "", pincode: "",
};

export default function AccountAddresses() {
  const { customer } = useCustomer();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!customer) return;
    getAddresses(customer.id).then((data) => { setAddresses(data || []); setLoading(false); }).catch(() => setLoading(false));
  }, [customer]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(""); };
  const openEdit = (a: Address) => {
    setForm({
      label: a.label || "", name: a.name || "", phone: a.phone || "", altPhone: "",
      address: a.address || "", address2: "", landmark: "",
      state: a.state || "", district: a.district || "", city: a.city || "", pincode: a.pincode || "",
    });
    setEditingId(a.id);
    setShowForm(true);
    setError("");
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setError(""); };

  const handleSave = async () => {
    setError("");
    if (!customer || !supabase) { setError("Database not configured"); return; }
    if (!form.name || !form.phone || !form.address || !form.city || !form.district || !form.state || !form.pincode) {
      setError("Name, phone, address, city, district, state, and pincode are required.");
      return;
    }
    setSaving(true);
    if (editingId) {
      await updateAddress(editingId, {
        label: form.label || "Home", name: form.name, phone: form.phone,
        address: form.address, city: form.city, district: form.district, state: form.state, pincode: form.pincode,
        customer_id: customer.id,
      });
    } else {
      await createAddress({
        customer_id: customer.id, label: form.label || "Home", name: form.name, phone: form.phone,
        address: form.address, city: form.city, district: form.district, state: form.state, pincode: form.pincode,
      });
    }
    const data = await getAddresses(customer.id);
    setAddresses(data || []);
    setSaving(false);
    cancelForm();
    showToast(editingId ? "Address updated!" : "Address added!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await deleteAddress(id);
    if (!customer) return;
    const data = await getAddresses(customer.id);
    setAddresses(data || []);
    showToast("Address deleted.");
  };

  const handleSetDefault = async (id: string) => {
    if (!customer) return;
    await setDefaultAddress(id, customer.id);
    const data = await getAddresses(customer.id);
    setAddresses(data || []);
    showToast("Default address updated.");
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid var(--line)",
    background: "var(--surface)", color: "var(--text)", fontSize: ".9rem",
    outline: "none", borderRadius: "var(--radius)",
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}><div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto" }} /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <MapPin size={22} style={{ color: "var(--gold)" }} /> Addresses
        </h1>
        {!showForm && (
          <button onClick={openAdd} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", fontSize: ".82rem" }}>
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
          <MapPin size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>No saved addresses.</p>
          <button onClick={openAdd} className="premium-button" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Plus size={16} /> Add Your First Address
          </button>
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {addresses.map((addr) => (
          <div key={addr.id} className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)", position: "relative", border: addr.is_default ? "1px solid var(--gold)" : "1px solid var(--line)" }}>
            {addr.is_default && (
              <span style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, color: "var(--gold)", fontSize: ".7rem", fontWeight: 700, letterSpacing: "1px" }}>
                <Star size={12} fill="var(--gold)" /> DEFAULT
              </span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {addr.label?.toLowerCase() === "home" ? <Home size={16} style={{ color: "var(--gold)" }} /> : <Briefcase size={16} style={{ color: "var(--muted)" }} />}
              <span style={{ fontWeight: 600 }}>{addr.label || "Address"}</span>
            </div>
            <p style={{ fontSize: ".9rem", lineHeight: 1.7, color: "var(--muted)" }}>
              <strong style={{ color: "var(--text)" }}>{addr.name}</strong><br />
              {addr.address}<br />
              {addr.city}, {addr.district && `${addr.district}, `}{addr.state} — {addr.pincode}<br />
              {addr.phone}{addr.email ? ` · ${addr.email}` : ""}
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <button onClick={() => openEdit(addr)} style={{ color: "var(--gold)", cursor: "pointer", background: "none", border: "none", fontSize: ".82rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <Pencil size={14} /> Edit
              </button>
              <button onClick={() => handleDelete(addr.id)} style={{ color: "var(--error)", cursor: "pointer", background: "none", border: "none", fontSize: ".82rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <Trash2 size={14} /> Delete
              </button>
              {!addr.is_default && (
                <button onClick={() => handleSetDefault(addr.id)} style={{ color: "var(--muted)", cursor: "pointer", background: "none", border: "none", fontSize: ".82rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <Star size={14} /> Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Address Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 500, fontSize: "1rem" }}>{editingId ? "Edit Address" : "New Address"}</h3>
            <button onClick={cancelForm} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {/* Label */}
            <div style={{ display: "flex", gap: 8 }}>
              {["Home", "Office", "Other"].map((lbl) => (
                <button key={lbl} type="button" onClick={() => setForm((f) => ({ ...f, label: lbl }))}
                  style={{
                    flex: 1, padding: "10px 14px", border: `1px solid ${form.label === lbl ? "var(--gold)" : "var(--line)"}`,
                    background: form.label === lbl ? "var(--gold-soft)" : "transparent",
                    color: form.label === lbl ? "var(--gold)" : "var(--muted)",
                    cursor: "pointer", borderRadius: "var(--radius)", fontWeight: form.label === lbl ? 600 : 400, fontSize: ".82rem",
                  }}
                >{lbl === "Home" ? <Home size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> : lbl === "Office" ? <Briefcase size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> : null} {lbl}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Full Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={fieldS} />
              <input placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={fieldS} />
            </div>
            <input placeholder="Alternate Phone (optional)" value={form.altPhone} onChange={(e) => setForm((f) => ({ ...f, altPhone: e.target.value }))} style={fieldS} />
            <textarea placeholder="Address Line 1 *" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={{ ...fieldS, resize: "vertical", minHeight: 60 }} />
            <input placeholder="Address Line 2 (optional)" value={form.address2} onChange={(e) => setForm((f) => ({ ...f, address2: e.target.value }))} style={fieldS} />
            <input placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} style={fieldS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} style={{ ...fieldS, cursor: "pointer" }}>
                <option value="">Select State *</option>
                {STATE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input placeholder="District *" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} style={fieldS} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="City *" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} style={fieldS} />
              <input placeholder="Pincode *" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} style={fieldS} />
            </div>
            {error && <p style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> {error}</p>}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button onClick={handleSave} disabled={saving} className="premium-button" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
              </button>
              <button onClick={cancelForm} style={{ padding: "0 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
