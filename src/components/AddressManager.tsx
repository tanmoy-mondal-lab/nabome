import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Home, Briefcase, Trash2, Star, Pencil, Loader2, AlertCircle, X, Check } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, type Address } from "../lib/db";
import { useToast } from "./Toast";

const STATE_LIST = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

type AddressManagerMode = "manage" | "select";

type AddressManagerProps = {
  mode: AddressManagerMode;
  onSelect?: (address: Address) => void;
  selectedId?: string | null;
};

const emptyForm = {
  label: "Home",
  name: "",
  phone: "",
  address: "",
  district: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressManager({ mode, onSelect, selectedId }: AddressManagerProps) {
  const { customer } = useCustomer();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    if (!customer) return;
    setLoading(true);
    try {
      const data = await getAddresses(customer.id);
      setAddresses(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [customer]);

  useEffect(() => {
    if (customer) load();
    else setLoading(false);
  }, [customer, load]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (a: Address) => {
    setForm({
      label: a.label || "Home",
      name: a.name || "",
      phone: a.phone || "",
      address: a.address || "",
      district: a.district || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || "",
    });
    setEditingId(a.id);
    setShowForm(true);
    setError("");
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Receiver name is required.";
    if (!form.phone.trim() || !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) return "Valid phone number is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.district.trim()) return "District is required.";
    if (!form.state) return "State is required.";
    if (!form.pincode.trim() || !/^[0-9]{6}$/.test(form.pincode.trim())) return "Valid 6-digit pincode is required.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    if (!customer) { setError("Please log in first."); return; }

    setSaving(true);
    setError("");

    const addrData = {
      customer_id: customer.id,
      label: form.label,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      state: form.state,
      pincode: form.pincode.trim(),
    };

    if (editingId) {
      await updateAddress(editingId, { ...addrData, customer_id: customer.id });
    } else {
      await createAddress(addrData);
    }

    await load();
    setSaving(false);
    cancelForm();
    showToast(editingId ? "Address updated!" : "Address added!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await deleteAddress(id);
    await load();
    showToast("Address deleted.");
  };

  const handleSetDefault = async (id: string) => {
    if (!customer) return;
    await setDefaultAddress(id, customer.id);
    await load();
    showToast("Default address updated.");
  };

  const handleSelect = (addr: Address) => {
    onSelect?.(addr);
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid var(--line)",
    background: "var(--surface)", color: "var(--text)", fontSize: ".9rem",
    outline: "none", borderRadius: "var(--radius)", transition: "border-color .2s",
  };

  const selectS: React.CSSProperties = {
    ...fieldS, cursor: "pointer", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
    paddingRight: 40,
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 12, padding: 20 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius)" }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        {mode === "manage" && (
          <h3 style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={18} style={{ color: "var(--gold)" }} /> Saved Addresses
          </h3>
        )}
        {!showForm && (
          <button onClick={openAdd} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", fontSize: ".82rem", minHeight: 40 }}>
            <Plus size={16} /> {mode === "select" ? "New Address" : "Add Address"}
          </button>
        )}
      </div>

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div style={{ padding: 48, textAlign: "center" }}>
          <MapPin size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>No saved addresses.</p>
          <button onClick={openAdd} className="premium-button" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Plus size={16} /> Add Your First Address
          </button>
        </div>
      )}

      {/* Address list */}
      <div style={{ display: "grid", gap: 14 }}>
        <AnimatePresence mode="popLayout">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => mode === "select" ? handleSelect(addr) : undefined}
              style={{
                padding: 18,
                borderRadius: "var(--radius-lg)",
                position: "relative",
                cursor: mode === "select" ? "pointer" : "default",
                border: mode === "select" && selectedId === addr.id
                  ? "2px solid var(--gold)"
                  : addr.is_default
                    ? "1px solid var(--gold)"
                    : "1px solid var(--line)",
                background: mode === "select" && selectedId === addr.id
                  ? "var(--gold-soft)"
                  : "var(--surface)",
                transition: "all .2s",
              }}
            >
              {/* Default badge */}
              {addr.is_default && (
                <span style={{
                  position: "absolute", top: 12, right: 12,
                  display: "flex", alignItems: "center", gap: 4,
                  color: "var(--gold)", fontSize: ".7rem", fontWeight: 700, letterSpacing: "1px",
                }}>
                  <Star size={12} fill="var(--gold)" /> DEFAULT
                </span>
              )}

              {/* Select indicator */}
              {mode === "select" && selectedId === addr.id && (
                <div style={{
                  position: "absolute", top: 12, left: 12,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "var(--gold)", color: "#050505",
                  display: "grid", placeItems: "center",
                }}>
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingLeft: mode === "select" ? 32 : 0 }}>
                {addr.label?.toLowerCase() === "home"
                  ? <Home size={16} style={{ color: "var(--gold)" }} />
                  : <Briefcase size={16} style={{ color: "var(--muted)" }} />
                }
                <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{addr.label || "Address"}</span>
              </div>

              <div style={{ paddingLeft: mode === "select" ? 32 : 0 }}>
                <p style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 2 }}>{addr.name}</p>
                <p style={{ color: "var(--muted)", fontSize: ".85rem", lineHeight: 1.6 }}>
                  {addr.address}<br />
                  {addr.city}, {addr.district && `${addr.district}, `}{addr.state} — {addr.pincode}<br />
                  {addr.phone}
                </p>
              </div>

              {/* Actions */}
              {mode === "manage" && (
                <div style={{ display: "flex", gap: 16, marginTop: 12, paddingLeft: 0 }}>
                  <button onClick={() => openEdit(addr)}
                    style={{ color: "var(--gold)", cursor: "pointer", background: "none", border: "none", fontSize: ".82rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)}
                    style={{ color: "var(--error)", cursor: "pointer", background: "none", border: "none", fontSize: ".82rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    <Trash2 size={14} /> Delete
                  </button>
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.id)}
                      style={{ color: "var(--muted)", cursor: "pointer", background: "none", border: "none", fontSize: ".82rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      <Star size={14} /> Set Default
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Address Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{ border: "1px solid var(--line)", padding: 24, borderRadius: "var(--radius-lg)", marginTop: 24, background: "var(--surface)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h4 style={{ fontWeight: 500, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={18} style={{ color: "var(--gold)" }} />
                {editingId ? "Edit Address" : "New Address"}
              </h4>
              <button onClick={cancelForm} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {/* Label */}
              <div style={{ display: "flex", gap: 8 }}>
                {["Home", "Office", "Other"].map((lbl) => (
                  <button key={lbl} type="button" onClick={() => setForm((f) => ({ ...f, label: lbl }))}
                    style={{
                      flex: 1, padding: "10px 14px",
                      border: `1px solid ${form.label === lbl ? "var(--gold)" : "var(--line)"}`,
                      background: form.label === lbl ? "var(--gold-soft)" : "transparent",
                      color: form.label === lbl ? "var(--gold)" : "var(--muted)",
                      cursor: "pointer", borderRadius: "var(--radius)",
                      fontWeight: form.label === lbl ? 600 : 400, fontSize: ".82rem",
                      transition: "all .2s",
                    }}
                  >
                    {lbl === "Home" ? <Home size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> : null}
                    {lbl === "Office" ? <Briefcase size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> : null}
                    {lbl}
                  </button>
                ))}
              </div>

              {/* Receiver Name + Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Receiver Name *</label>
                  <input placeholder="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={fieldS} />
                </div>
                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Phone *</label>
                  <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={fieldS} />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Address *</label>
                <textarea placeholder="Street / Area / Landmark" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  style={{ ...fieldS, resize: "vertical", minHeight: 60, fontFamily: "inherit" }} />
              </div>

              {/* State + District */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>State *</label>
                  <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} style={selectS}>
                    <option value="">Select State</option>
                    {STATE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>District *</label>
                  <input placeholder="District" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} style={fieldS} />
                </div>
              </div>

              {/* City + Pincode */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>City *</label>
                  <input placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} style={fieldS} />
                </div>
                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4, display: "block" }}>Pincode *</label>
                  <input placeholder="6-digit Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} style={fieldS} maxLength={6} />
                </div>
              </div>

              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(231,76,60,0.1)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={16} style={{ color: "#e74c3c", flexShrink: 0 }} />
                  <span style={{ color: "#e74c3c", fontSize: ".85rem" }}>{error}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button onClick={handleSave} disabled={saving}
                  className="premium-button" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                  {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                  {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                </button>
                <button onClick={cancelForm}
                  style={{ padding: "0 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500 }}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
