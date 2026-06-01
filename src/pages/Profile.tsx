import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import {
  loadProfile,
  saveProfileLocally,
  saveProfileToSupabase,
  loadProfileFromSupabase,
} from "../lib/db";
import type { ProfileData } from "../lib/db";
import { getUserRole } from "../lib/db";

export default function Profile() {
  const [user, setUser] = useState<{ name?: string; email?: string }>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState("customer");
  const [form, setForm] = useState<ProfileData>({
    name: "", phone: "", email: "",
    address: "", city: "", state: "", pincode: "",
    customerUpi: "", role: "customer",
  });

  useEffect(() => {
    async function init() {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          const session = data.session;
          if (session?.user) {
            const meta = session.user.user_metadata;
            const info = {
              name: (meta?.name as string) || session.user.email?.split("@")[0] || "Customer",
              email: session.user.email || "Not Provided",
            };
            setUser(info);
            localStorage.setItem("nabome-user", JSON.stringify(info));

            const dbProfile = await loadProfileFromSupabase();
            if (dbProfile) {
              setForm(dbProfile);
            } else {
              const local = loadProfile();
              if (!local.name) {
                local.name = info.name;
                local.email = info.email;
              }
              setForm(local);
            }

            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Session error, falling back to localStorage:", err);
      }

      const local = JSON.parse(localStorage.getItem("nabome-user") || "{}");
      setUser(local);
      const saved = loadProfile();
      if (!saved.name && local.name) {
        saved.name = local.name;
        saved.email = local.email || "";
      }
      setForm(saved);
      setLoading(false);
    }

    init();
    getUserRole().then(setUserRole);
  }, []);

  const update = (key: keyof ProfileData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    saveProfileLocally(form);
    await saveProfileToSupabase(form);
    setEditing(false);
    setSaving(false);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("nabome-user");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <>
        <SEO title="My Profile | নবME" description="Manage your নবME account profile." path="/profile" />
        <Navbar />
        <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  const inputS = {
    width: "100%",
    padding: "14px",
    border: "1px solid var(--line)",
    background: editing ? "rgba(255,255,255,0.06)" : "transparent",
    color: "var(--text)",
    outline: "none",
    fontSize: ".95rem",
  } as const;

  const labelS = {
    color: "var(--muted)",
    fontSize: ".8rem",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: "6px",
  };

  return (
    <>
      <SEO title="My Profile | নবME" description="Manage your নবME account profile." path="/profile" />
      <Navbar />

      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        <section style={{ padding: "100px 6% 60px", borderBottom: "1px solid var(--line)" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "4px", color: "var(--muted)", fontSize: ".85rem" }}>
            Account
          </p>
          <h1 style={{ fontSize: "clamp(3rem,6vw,5rem)", fontWeight: 300, marginTop: "15px" }}>
            My Profile
          </h1>
        </section>

        <section style={{ padding: "80px 6%" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ border: "1px solid var(--line)", padding: "50px", background: "var(--surface)" }}>
              {/* AVATAR + NAME */}
              <div style={{ display: "flex", alignItems: "center", gap: "25px", flexWrap: "wrap", marginBottom: "40px" }}>
                <div style={{ width: "90px", height: "90px", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 600 }}>
                  {(form.name || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontWeight: 400, marginBottom: "8px", display: "flex", alignItems: "center", gap: 12 }}>
                    {form.name || "Customer"}
                    {userRole === "admin" && (
                      <span style={{ fontSize: ".7rem", background: "var(--gold)", color: "#050505", padding: "3px 10px", fontWeight: 700, letterSpacing: "0.08em", borderRadius: 3 }}>ADMIN</span>
                    )}
                  </h2>
                  <p style={{ color: "var(--muted)" }}>{user.email || "Not Provided"}</p>
                </div>
              </div>

              {/* EDITABLE FIELDS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "24px" }}>
                <div>
                  <p style={labelS}>Full Name</p>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} disabled={!editing} style={inputS} />
                </div>
                <div>
                  <p style={labelS}>Phone</p>
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value)} disabled={!editing} style={inputS} />
                </div>
                <div>
                  <p style={labelS}>Email</p>
                  <input value={form.email} onChange={(e) => update("email", e.target.value)} disabled={!editing} style={inputS} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={labelS}>Address</p>
                  <textarea rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} disabled={!editing} style={{ ...inputS, resize: "none" }} />
                </div>
                <div>
                  <p style={labelS}>City</p>
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} disabled={!editing} style={inputS} />
                </div>
                <div>
                  <p style={labelS}>State</p>
                  <input value={form.state} onChange={(e) => update("state", e.target.value)} disabled={!editing} style={inputS} />
                </div>
                <div>
                  <p style={labelS}>Pincode</p>
                  <input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} disabled={!editing} style={inputS} />
                </div>
                <div>
                  <p style={labelS}>UPI ID</p>
                  <input value={form.customerUpi} onChange={(e) => update("customerUpi", e.target.value)} disabled={!editing} style={inputS} />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "40px", paddingTop: "30px", borderTop: "1px solid var(--line)" }}>
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} style={{
                      padding: "16px 30px", border: "none", background: "var(--gold)", color: "#050505", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600,
                    }}>
                      {saving ? "Saving..." : "Save Details"}
                    </button>
                    <button onClick={() => setEditing(false)} style={{
                      padding: "16px 30px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600,
                    }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditing(true)} style={{
                      padding: "16px 30px", border: "none", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 600,
                    }}>
                      Edit Details
                    </button>
                    <Link to="/checkout">
                      <button style={{
                        padding: "16px 30px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 600,
                      }}>
                        Go to Checkout
                      </button>
                    </Link>
                    {userRole === "admin" && (
                      <Link to="/admin">
                        <button style={{
                          padding: "16px 30px", border: "1px solid var(--gold)", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 600,
                        }}>
                          Admin Panel
                        </button>
                      </Link>
                    )}
                    <button onClick={logout} style={{
                      padding: "16px 30px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600,
                    }}>
                      Logout
                    </button>
                  </>
                )}
              </div>

              <div style={{ marginTop: "20px", fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.7 }}>
                <p>✓ Saved details auto-fill at checkout</p>
                <p>✓ Updated across all devices when logged in</p>
              </div>
            </div>

            {/* ORDER HISTORY LINK */}
            <div style={{ marginTop: "40px", textAlign: "center" }}>
              <Link to="/order-tracking" style={{ color: "var(--gold)", textDecoration: "underline" }}>
                View Order History
              </Link>
            </div>
          </div>
        </section>

        <section style={{ background: "var(--surface)", padding: "100px 6%" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 300 }}>Member Benefits</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "25px" }}>
            {[
              { title: "Saved Details", text: "Your address and UPI are remembered for faster checkout." },
              { title: "Wishlist", text: "Save your favourite products across visits." },
              { title: "Exclusive Updates", text: "Stay informed about new collections." },
              { title: "Order Tracking", text: "Track orders when available." },
            ].map((item) => (
              <div key={item.title} style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "35px" }}>
                <h3 style={{ marginBottom: "15px" }}>{item.title}</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
