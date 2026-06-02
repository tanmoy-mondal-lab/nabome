import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { Lock } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { supabase } from "../lib/supabase";
import { neon, isNeonConnected } from "../lib/neon";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, getOrdersByCustomer, type Address } from "../lib/db";

const GENDERS = ["Male", "Female", "Other"];
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

export default function Profile() {
  const { customer, logout, refresh } = useCustomer();

  const [tab, setTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("tab") === "orders") return "orders";
    if (p.get("tab") === "addresses") return "addresses";
    return "profile";
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", gender: "" });
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Partial<Address> & { isEditing?: string }>({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;
    getOrdersByCustomer(customer.id).then((data) => setOrders(data || [])).catch(() => {});
    getAddresses(customer.id).then((data) => setAddresses(data || [])).catch(() => {});
  }, [customer]);

  const startEditing = () => {
    if (!customer) return;
    setForm({ name: customer.name, phone: customer.phone, email: customer.email || "", gender: customer.gender || "" });
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    if (!form.name.trim() || !form.gender || !form.phone.trim()) {
      setError("Name, gender, and phone are required");
      return;
    }
    setSaving(true);
    setError("");
    const updates = { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null, gender: form.gender };
    let err: any = null;
    if (await isNeonConnected()) {
      const res = await neon.update("users", updates, { id: customer.id });
      err = res.error;
    } else if (supabase) {
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

  if (!customer) {
    return (
      <>
        <SEO title="Profile | নবME" description="Your profile." path="/profile" />
        <Navbar />
        <main className="page" style={{ display: "grid", minHeight: "70vh", placeItems: "center" }}>
          <div className="glass" style={{ padding: 48, textAlign: "center", maxWidth: 480 }}>
            <h1 className="heading" style={{ marginBottom: 16 }}>Not Logged In</h1>
            <p className="lede" style={{ marginBottom: 24 }}>
              Log in or create an account to view your profile.
            </p>
            <Link to="/login" className="premium-button" style={{ display: "inline-flex", padding: "0 28px", alignItems: "center" }}>
              Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: "12px 24px", cursor: "pointer", border: "none",
        background: tab === t ? "var(--gold)" : "transparent",
        color: tab === t ? "#050505" : "var(--muted)",
        fontWeight: 600, fontSize: ".9rem", borderBottom: tab === t ? "none" : "1px solid var(--line)",
      }}
    >
      {label}
    </button>
  );

  const inputS = {
    width: "100%", padding: "14px", border: "1px solid var(--line)",
    background: "rgba(255,255,255,0.06)", color: "var(--text)", outline: "none", fontSize: ".95rem",
  };

  return (
    <>
      <SEO title="Profile | নবME" description="Your নবME profile." path="/profile" />
      <Navbar />
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        <section style={{ padding: "80px 6% 30px", borderBottom: "1px solid var(--line)" }}>
          <p className="eyebrow">Account</p>
          <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 300, marginTop: 8 }}>Hello, {customer.name}</h1>
        </section>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "20px 6%", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
          {tabBtn("profile", "Profile")}
          {tabBtn("orders", "Orders")}
          {tabBtn("addresses", "Addresses")}
        </div>

        <section style={{ padding: "40px 6%" }}>
          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (
            <div style={{ maxWidth: 560 }}>
              {!editing ? (
                <div>
                  <div style={{ display: "grid", gap: 16 }}>
                    <ProfileRow label="Name" value={customer.name} />
                    <ProfileRow label="Gender" value={customer.gender || "Not set"} />
                    <ProfileRow label="Phone" value={customer.phone} />
                    <ProfileRow label="Email" value={customer.email || "Not provided"} />
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <button onClick={startEditing} className="premium-button" style={{ padding: "0 24px" }}>
                      Edit Profile
                    </button>
                    <Link to="/change-password" style={{ padding: "12px 24px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Lock size={16} /> Change Password
                    </Link>
                    <button onClick={logout} style={{ padding: "12px 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontWeight: 500 }}>
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <input placeholder="Full Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputS} />
                  <div style={{ display: "flex", gap: 10 }}>
                    {GENDERS.map((g) => (
                      <button key={g} onClick={() => setForm((f) => ({ ...f, gender: g }))}
                        style={{ flex: 1, padding: 12, cursor: "pointer",
                          border: form.gender === g ? "1px solid var(--gold)" : "1px solid var(--line)",
                          background: form.gender === g ? "var(--gold-soft)" : "transparent",
                          color: form.gender === g ? "var(--gold)" : "var(--muted)", fontWeight: form.gender === g ? 600 : 400,
                        }}
                      >{g}</button>
                    ))}
                  </div>
                  <input placeholder="Phone *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={inputS} />
                  <input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputS} />
                  {error && <p style={{ color: "#e74c3c", fontSize: ".9rem" }}>{error}</p>}
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <button onClick={handleSaveProfile} disabled={saving}
                      style={{ padding: "14px 28px", border: "none", background: saving ? "var(--surface-strong)" : "var(--gold)", color: saving ? "var(--muted)" : "#050505", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
                      {saving ? "Saving..." : "Save Profile"}
                    </button>
                    <button onClick={() => { setEditing(false); setError(""); }}
                      style={{ padding: "14px 28px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontWeight: 500 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === "orders" && (
            <div style={{ maxWidth: 720 }}>
              {orders.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>No orders yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {orders.map((order) => (
                    <div key={order.id} style={{ border: "1px solid var(--line)", padding: 20, background: "var(--surface)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Order #</span>
                          <span style={{ fontWeight: 600, marginLeft: 6, fontSize: ".95rem" }}>{order.bill_no}</span>
                        </div>
                        <span style={{
                          padding: "4px 12px", fontSize: ".8rem", fontWeight: 600,
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ADDRESSES TAB ── */}
          {tab === "addresses" && (
            <div style={{ maxWidth: 640 }}>
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
                <p style={{ color: "var(--muted)" }}>No saved addresses. Add one above.</p>
              )}

              <div style={{ display: "grid", gap: 16 }}>
                {addresses.map((addr) => (
                  <div key={addr.id} style={{ border: "1px solid var(--line)", padding: 20, background: "var(--surface)", position: "relative" }}>
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

              {/* Address Form */}
              {showAddressForm && (
                <div style={{ border: "1px solid var(--line)", padding: 24, background: "var(--surface)", marginTop: 20 }}>
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
                    <select value={addressForm.state || ""} onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))} style={{ ...inputS, cursor: "pointer" }}>
                      <option value="">Select State *</option>
                      {STATE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="Pincode *" value={addressForm.pincode || ""} onChange={(e) => setAddressForm((f) => ({ ...f, pincode: e.target.value }))} style={inputS} />
                    {error && <p style={{ color: "#e74c3c", fontSize: ".9rem" }}>{error}</p>}
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <button onClick={handleSaveAddress} disabled={saving}
                        style={{ padding: "14px 28px", border: "none", background: saving ? "var(--surface-strong)" : "var(--gold)", color: saving ? "var(--muted)" : "#050505", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
                        {saving ? "Saving..." : "Save Address"}
                      </button>
                      <button onClick={() => { setShowAddressForm(false); setAddressForm({}); setError(""); }}
                        style={{ padding: "14px 28px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontWeight: 500 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
      <span style={{ width: 120, color: "var(--muted)", fontSize: ".9rem" }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: ".95rem" }}>{value}</span>
    </div>
  );
}
