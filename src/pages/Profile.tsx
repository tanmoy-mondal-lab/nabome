import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { Lock, User, Phone, Mail, MapPin, MapPinned, Building2, Hash, Camera, Loader2, Check, AlertCircle, LogOut } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { neon, isNeonConnected } from "../lib/neon";
import { uploadImage } from "../lib/cloudinary";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, getOrdersByCustomer, type Address } from "../lib/db";

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

const GENDERS = ["Male", "Female", "Other"];

type Tab = "profile" | "orders" | "addresses";

type OrderRow = {
  id: string;
  bill_no: string;
  created_at: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  total: number;
};

const inputS: React.CSSProperties = {
  width: "100%", padding: "14px 16px", border: "1px solid var(--line)",
  background: "var(--surface)", color: "var(--text)", outline: "none",
  fontSize: ".95rem", borderRadius: "var(--radius)", transition: "border-color .2s",
};

const selectS: React.CSSProperties = {
  ...inputS, cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
  paddingRight: 40,
};

export default function Profile() {
  const { customer, logout, refresh } = useCustomer();
  const { logout: authLogout } = useAuth();

  const [tab, setTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("tab") === "orders") return "orders";
    if (p.get("tab") === "addresses") return "addresses";
    return "profile";
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", gender: "",
    state: "", district: "", city: "", pincode: "",
    avatar_url: "",
  });
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Partial<Address> & { isEditing?: string }>({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!customer) return;
    getOrdersByCustomer(customer.id).then((data) => setOrders(data || [])).catch(() => {});
    getAddresses(customer.id).then((data) => setAddresses(data || [])).catch(() => {});
  }, [customer]);

  useEffect(() => {
    if (!customer) return;
    setForm({
      name: customer.name, phone: customer.phone, email: customer.email || "",
      gender: customer.gender || "",
      state: customer.state || "", district: customer.district || "",
      city: customer.city || "", pincode: customer.pincode || "",
      avatar_url: customer.avatar_url || "",
    });
  }, [customer, editing]);

  const startEditing = () => {
    if (!customer) return;
    setEditing(true);
    setError("");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !customer) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadImage(file, "nabome/avatars");
      setForm((f) => ({ ...f, avatar_url: result.secure_url }));
    } catch {
      setError("Failed to upload image");
    }
    setUploadingAvatar(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    if (!form.name.trim() || !form.gender || !form.phone.trim()) {
      setError("Name, gender, and phone are required");
      return;
    }
    setSaving(true);
    setError("");
    const updates: Record<string, any> = {
      name: form.name.trim(), phone: form.phone.trim(),
      email: form.email.trim() || null, gender: form.gender,
      avatar_url: form.avatar_url || null,
      state: form.state.trim() || null, district: form.district.trim() || null,
      city: form.city.trim() || null, pincode: form.pincode.trim() || null,
    };
    let err: any = null;
    if (await isNeonConnected()) {
      const res = await neon.update("users", updates, { id: customer.id });
      err = res.error;
    } else if (supabase) {
      // @ts-ignore
      const res = await supabase.from("users").update(updates).eq("id", customer.id);
      err = res.error;
    } else {
      err = new Error("Database not configured");
    }
    if (err) { setError(err.message); setSaving(false); return; }
    await refresh();
    setEditing(false);
    setSaving(false);
  };

  const handleSaveAddress = async () => {
    if (!customer || !supabase) return;
    const a = addressForm;
    if (!a.label || !a.name || !a.phone || !a.address || !a.city || !a.district || !a.state || !a.pincode) {
      setError("All address fields except email are required");
      return;
    }
    setSaving(true);
    setError("");
    if (a.isEditing) {
      await updateAddress(a.isEditing, {
        label: a.label, name: a.name, phone: a.phone, email: a.email,
        address: a.address, city: a.city, district: a.district, state: a.state, pincode: a.pincode,
        customer_id: customer.id,
      });
    } else {
      await createAddress({
        customer_id: customer.id, label: a.label || "Home", name: a.name, phone: a.phone,
        email: a.email || undefined, address: a.address, city: a.city, district: a.district, state: a.state, pincode: a.pincode,
      });
    }
    if (!customer) return;
    const data = await getAddresses(customer.id);
    setAddresses(data || []);
    setShowAddressForm(false);
    setAddressForm({});
    setSaving(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await deleteAddress(id);
    if (!customer) return;
    const data = await getAddresses(customer.id);
    setAddresses(data || []);
  };

  const handleSetDefault = async (id: string) => {
    if (!customer) return;
    await setDefaultAddress(id, customer.id);
    const data = await getAddresses(customer.id);
    setAddresses(data || []);
  };

  const handleLogout = () => {
    authLogout();
    logout();
  };

  if (!customer) {
    return (
      <>
        <SEO title="Profile | নবME" description="Your profile." path="/profile" />
        <Navbar />
        <main className="page" style={{ display: "grid", minHeight: "70vh", placeItems: "center", padding: "0 6%" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 48, textAlign: "center", maxWidth: 480, borderRadius: "var(--radius-xl)" }}>
            <User size={48} style={{ color: "var(--gold)", marginBottom: 16 }} />
            <h1 className="heading" style={{ marginBottom: 8 }}>Not Logged In</h1>
            <p className="lede" style={{ marginBottom: 24 }}>
              Log in or create an account to view your profile.
            </p>
            <Link to="/login" className="premium-button" style={{ display: "inline-flex", padding: "0 28px", alignItems: "center" }}>
              Login
            </Link>
          </motion.div>
        </main>
      </>
    );
  }

  const handleLogoutAll = () => {
    handleLogout();
  };

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: "12px 24px", cursor: "pointer", border: "none",
        background: tab === t ? "var(--gold)" : "transparent",
        color: tab === t ? "#050505" : "var(--muted)",
        fontWeight: 600, fontSize: ".9rem",
        borderBottom: tab === t ? "none" : "1px solid var(--line)",
        transition: "all .2s", whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  const fieldRow = (icon: React.ReactNode, content: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
      <div style={{ color: "var(--gold)", display: "flex", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>{content}</div>
    </div>
  );

  const fieldLabel = (label: string) => (
    <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 3 }}>{label}</p>
  );

  const fieldValue = (value: string) => (
    <p style={{ fontWeight: 500, fontSize: ".95rem" }}>{value || <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Not set</span>}</p>
  );

  return (
    <>
      <SEO title="Profile | নবME" description="Your নবME profile." path="/profile" />
      <Navbar />
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        {/* Header */}
        <section style={{ padding: "80px 6% 30px", borderBottom: "1px solid var(--line)" }}>
          <p className="eyebrow">Account</p>
          <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", fontWeight: 300, marginTop: 8 }}>
            Hello, <span style={{ color: "var(--gold)" }}>{customer.name}</span>
          </h1>
        </section>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "20px 6%", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
          {tabBtn("profile", "Profile")}
          {tabBtn("orders", "Orders")}
          {tabBtn("addresses", "Addresses")}
        </div>

        <section style={{ padding: "40px 6%" }}>

          {/* ══════════════════ PROFILE TAB ══════════════════ */}
          {tab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 720 }}>
              {!editing ? (
                <div>
                  {/* Avatar + Name Card */}
                  <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--gold)", flexShrink: 0 }}>
                      {form.avatar_url ? (
                        <img src={form.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}>
                          <User size={32} style={{ color: "var(--muted)" }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: "1.2rem" }}>{customer.name}</p>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{customer.phone}</p>
                      <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{customer.email || "No email"}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={startEditing} className="premium-button" style={{ padding: "0 24px", fontSize: ".82rem" }}>
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 500, marginBottom: 20, fontSize: "1.05rem", color: "var(--gold)" }}>Personal Information</h3>
                    <div style={{ display: "grid", gap: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                        {fieldRow(<User size={15} />, <>{fieldLabel("Full Name")}{fieldValue(customer.name)}</>)}
                        {fieldRow(<div style={{ display: "flex" }}><span style={{ fontSize: 15 }}>♂</span></div>, <>{fieldLabel("Gender")}{fieldValue(customer.gender || "Not set")}</>)}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                        {fieldRow(<Phone size={15} />, <>{fieldLabel("Phone")}{fieldValue(customer.phone)}</>)}
                        {fieldRow(<Mail size={15} />, <>{fieldLabel("Email")}{fieldValue(customer.email || "Not provided")}</>)}
                      </div>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 500, marginBottom: 20, fontSize: "1.05rem", color: "var(--gold)" }}>Location</h3>
                    <div style={{ display: "grid", gap: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                        {fieldRow(<MapPin size={15} />, <>{fieldLabel("State")}{fieldValue(customer.state || "")}</>)}
                        {fieldRow(<Building2 size={15} />, <>{fieldLabel("District")}{fieldValue(customer.district || "")}</>)}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                        {fieldRow(<MapPinned size={15} />, <>{fieldLabel("City")}{fieldValue(customer.city || "")}</>)}
                        {fieldRow(<Hash size={15} />, <>{fieldLabel("Pincode")}{fieldValue(customer.pincode || "")}</>)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link to="/change-password" style={{ padding: "12px 24px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, borderRadius: "var(--radius)", fontSize: ".85rem" }}>
                      <Lock size={16} /> Change Password
                    </Link>
                    <button onClick={handleLogoutAll} style={{ padding: "12px 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontWeight: 500, borderRadius: "var(--radius)", display: "inline-flex", alignItems: "center", gap: 8, fontSize: ".85rem" }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Edit Form */}
                  <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 500, marginBottom: 20, fontSize: "1.05rem", color: "var(--gold)" }}>Edit Profile</h3>

                    {/* Avatar Upload */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
                      <div style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--gold)", flexShrink: 0 }}>
                        {form.avatar_url ? (
                          <img src={form.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}>
                            <User size={32} style={{ color: "var(--muted)" }} />
                          </div>
                        )}
                        {uploadingAvatar && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center" }}>
                            <Loader2 size={20} className="spin" style={{ color: "#fff" }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => fileRef.current?.click()}
                          disabled={uploadingAvatar}
                          style={{ padding: "10px 20px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: uploadingAvatar ? "not-allowed" : "pointer", borderRadius: "var(--radius)", display: "inline-flex", alignItems: "center", gap: 8, fontSize: ".85rem", fontWeight: 500 }}
                        >
                          <Camera size={16} /> {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                        </button>
                        <p style={{ color: "var(--muted)", fontSize: ".75rem", marginTop: 6 }}>JPG, PNG or WebP. Max 5MB.</p>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
                    </div>

                    {/* Form Fields */}
                    <div style={{ display: "grid", gap: 16 }}>
                      {/* Row 1: Name + Gender */}
                      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                        <div>
                          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Full Name *</label>
                          <input placeholder="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputS} />
                        </div>
                        <div>
                          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Gender *</label>
                          <div style={{ display: "flex", gap: 6 }}>
                            {GENDERS.map((g) => (
                              <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, gender: g }))}
                                style={{ flex: 1, padding: "12px 12px", border: `1px solid ${form.gender === g ? "var(--gold)" : "var(--line)"}`, background: form.gender === g ? "var(--gold-soft)" : "transparent", color: form.gender === g ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: form.gender === g ? 600 : 400, fontSize: ".85rem", transition: "all .2s" }}
                              >{g}</button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Phone + Email */}
                      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                        <div>
                          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Phone *</label>
                          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={inputS} />
                        </div>
                        <div>
                          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Email</label>
                          <input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputS} />
                        </div>
                      </div>

                      {/* Row 3: State + District */}
                      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                        <div>
                          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>State</label>
                          <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} style={selectS}>
                            <option value="">Select State</option>
                            {STATE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>District</label>
                          <input placeholder="District" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} style={inputS} />
                        </div>
                      </div>

                      {/* Row 4: City + Pincode */}
                      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                        <div>
                          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>City</label>
                          <input placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} style={inputS} />
                        </div>
                        <div>
                          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Pincode</label>
                          <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} style={inputS} />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(231,76,60,0.1)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 8 }}>
                        <AlertCircle size={16} style={{ color: "#e74c3c", flexShrink: 0 }} />
                        <span style={{ color: "#e74c3c", fontSize: ".85rem" }}>{error}</span>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                      <button onClick={handleSaveProfile} disabled={saving}
                        style={{ padding: "14px 32px", border: "none", background: saving ? "var(--surface-strong)" : "var(--gold)", color: saving ? "var(--muted)" : "#050505", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, borderRadius: "var(--radius)", display: "inline-flex", alignItems: "center", gap: 8, fontSize: ".9rem", transition: "all .2s" }}>
                        {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                        {saving ? "Saving..." : "Save Profile"}
                      </button>
                      <button onClick={() => { setEditing(false); setError(""); }}
                        style={{ padding: "14px 28px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontWeight: 500, borderRadius: "var(--radius)", fontSize: ".9rem" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══════════════════ ORDERS TAB ══════════════════ */}
          {tab === "orders" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 720 }}>
              {orders.length === 0 ? (
                <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
                  <p style={{ color: "var(--muted)", marginBottom: 16 }}>No orders yet.</p>
                  <Link to="/shop" className="premium-button" style={{ display: "inline-flex", padding: "0 28px", alignItems: "center" }}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {orders.map((order, i) => (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ border: "1px solid var(--line)", padding: 20, background: "var(--surface)", borderRadius: "var(--radius)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Order #</span>
                          <span style={{ fontWeight: 600, marginLeft: 6, fontSize: ".95rem" }}>{order.bill_no}</span>
                        </div>
                        <span style={{
                          padding: "4px 12px", fontSize: ".8rem", fontWeight: 600, borderRadius: 4,
                          background: order.order_status === "delivered" ? "rgba(46,204,113,0.15)" : order.order_status === "cancelled" ? "rgba(231,76,60,0.15)" : "rgba(212,175,55,0.15)",
                          color: order.order_status === "delivered" ? "#2ecc71" : order.order_status === "cancelled" ? "#e74c3c" : "var(--gold)",
                        }}>
                          {order.order_status?.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                        <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>
                          {order.payment_method} · {order.payment_status}
                        </span>
                        <span style={{ fontWeight: 700, color: "var(--gold)", fontSize: "1.1rem" }}>
                          ₹{order.total?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════ ADDRESSES TAB ══════════════════ */}
          {tab === "addresses" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 640 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ fontWeight: 500 }}>Saved Addresses</h3>
                <button
                  onClick={() => { setShowAddressForm(true); setAddressForm({}); setError(""); }}
                  className="premium-button" style={{ padding: "0 20px", fontSize: ".85rem" }}
                >
                  + Add New Address
                </button>
              </div>

              {addresses.length === 0 && !showAddressForm && (
                <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
                  <p style={{ color: "var(--muted)" }}>No saved addresses. Add one above.</p>
                </div>
              )}

              <div style={{ display: "grid", gap: 16 }}>
                {addresses.map((addr) => (
                  <div key={addr.id} style={{ border: "1px solid var(--line)", padding: 20, background: "var(--surface)", borderRadius: "var(--radius)", position: "relative" }}>
                    {addr.is_default && (
                      <span style={{ position: "absolute", top: 12, right: 12, fontSize: ".7rem", color: "var(--gold)", fontWeight: 600, letterSpacing: "1px" }}>
                        DEFAULT
                      </span>
                    )}
                    <p style={{ fontWeight: 600, marginBottom: 6, fontSize: ".95rem" }}>
                      {addr.label}
                    </p>
                    <p style={{ color: "var(--text)", fontSize: ".9rem", lineHeight: 1.6 }}>
                      {addr.name}<br />
                      {addr.address}<br />
                      {addr.city}, {addr.district && `${addr.district}, `}{addr.state} — {addr.pincode}<br />
                      {addr.phone}
                    </p>
                    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                      <button onClick={() => {
                        setAddressForm({ ...addr, isEditing: addr.id });
                        setShowAddressForm(true);
                        setError("");
                      }} style={{ fontSize: ".85rem", color: "var(--gold)", cursor: "pointer", background: "none", border: "none", fontWeight: 500 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteAddress(addr.id)} style={{ fontSize: ".85rem", color: "#e74c3c", cursor: "pointer", background: "none", border: "none", fontWeight: 500 }}>
                        Delete
                      </button>
                      {!addr.is_default && (
                        <button onClick={() => handleSetDefault(addr.id)} style={{ fontSize: ".85rem", color: "var(--muted)", cursor: "pointer", background: "none", border: "none", fontWeight: 500 }}>
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showAddressForm && (
                <div style={{ border: "1px solid var(--line)", padding: 24, background: "var(--surface)", borderRadius: "var(--radius)", marginTop: 20 }}>
                  <h4 style={{ fontWeight: 500, marginBottom: 18 }}>
                    {addressForm.isEditing ? "Edit Address" : "New Address"}
                  </h4>
                  <div style={{ display: "grid", gap: 12 }}>
                    <input placeholder="Label (e.g. Home, Office) *" value={addressForm.label || ""} onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))} style={inputS} />
                    <input placeholder="Receiver Name *" value={addressForm.name || ""} onChange={(e) => setAddressForm((f) => ({ ...f, name: e.target.value }))} style={inputS} />
                    <input placeholder="Receiver Phone *" value={addressForm.phone || ""} onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))} style={inputS} />
                    <input placeholder="Email (optional)" value={addressForm.email || ""} onChange={(e) => setAddressForm((f) => ({ ...f, email: e.target.value }))} style={inputS} />
                    <textarea placeholder="Full Address *" value={addressForm.address || ""} onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))} style={{ ...inputS, resize: "vertical", minHeight: 60 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <input placeholder="City *" value={addressForm.city || ""} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} style={inputS} />
                      <input placeholder="District *" value={addressForm.district || ""} onChange={(e) => setAddressForm((f) => ({ ...f, district: e.target.value }))} style={inputS} />
                    </div>
                    <select value={addressForm.state || ""} onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))} style={selectS}>
                      <option value="">Select State *</option>
                      {STATE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="Pincode *" value={addressForm.pincode || ""} onChange={(e) => setAddressForm((f) => ({ ...f, pincode: e.target.value }))} style={inputS} />
                    {error && <p style={{ color: "#e74c3c", fontSize: ".9rem" }}>{error}</p>}
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <button onClick={handleSaveAddress} disabled={saving}
                        style={{ padding: "14px 28px", border: "none", background: saving ? "var(--surface-strong)" : "var(--gold)", color: saving ? "var(--muted)" : "#050505", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, borderRadius: "var(--radius)" }}>
                        {saving ? "Saving..." : "Save Address"}
                      </button>
                      <button onClick={() => { setShowAddressForm(false); setAddressForm({}); setError(""); }}
                        style={{ padding: "14px 28px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontWeight: 500, borderRadius: "var(--radius)" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </section>
      </div>
    </>
  );
}
