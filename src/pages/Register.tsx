import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { useCustomer } from "../context/CustomerContext";

const GENDERS = ["Male", "Female", "Other"];

function initForm(): { name: string; phone: string; email: string; gender: string } {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("identifier") || "";
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
  return { name: "", phone: isEmail ? "" : id, email: isEmail ? id : "", gender: "" };
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useCustomer();

  const [form, setForm] = useState(initForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    if (!form.name.trim()) { setError("Full name is required"); return; }
    if (!form.gender) { setError("Please select your gender"); return; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) { setError("Valid 10-digit phone number is required"); return; }

    setLoading(true);
    setError("");

    try {
      const result = await register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        gender: form.gender,
      });

      if (result.ok) {
        navigate("/profile");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <SEO title="Register | নবME" description="Create your নবME account." path="/register" />
      <Navbar />
      <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
        <section style={{ padding: "100px 6% 60px", textAlign: "center", borderBottom: "1px solid var(--line)" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "4px", color: "var(--muted)", fontSize: ".85rem" }}>Account</p>
          <h1 style={{ fontSize: "clamp(3rem,6vw,5rem)", fontWeight: 300, marginTop: 15 }}>Create Account</h1>
        </section>
        <section style={{ padding: "80px 6%", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 520, border: "1px solid var(--line)", padding: 40, background: "var(--surface)" }}>
            <h2 style={{ marginBottom: 30, fontWeight: 400 }}>Your Details</h2>
            <div style={{ display: "grid", gap: 18 }}>
              <input
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                style={{ width: "100%", padding: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.06)", color: "var(--text)", outline: "none", fontSize: "1rem" }}
                autoFocus
              />

              {/* Gender selector */}
              <div style={{ display: "flex", gap: 12 }}>
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update("gender", g)}
                    style={{
                      flex: 1, padding: "14px", cursor: "pointer",
                      border: form.gender === g ? "1px solid var(--gold)" : "1px solid var(--line)",
                      background: form.gender === g ? "var(--gold-soft)" : "transparent",
                      color: form.gender === g ? "var(--gold)" : "var(--muted)",
                      fontWeight: form.gender === g ? 600 : 400,
                      fontSize: ".95rem",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <input
                type="tel"
                placeholder="Phone Number *"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                style={{ width: "100%", padding: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.06)", color: "var(--text)", outline: "none", fontSize: "1rem" }}
              />

              <input
                type="email"
                placeholder="Email Address (optional)"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                style={{ width: "100%", padding: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.06)", color: "var(--text)", outline: "none", fontSize: "1rem" }}
              />

              {error && <p style={{ color: "#e74c3c", fontSize: ".9rem" }}>{error}</p>}

              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  padding: 18, border: "none", background: loading ? "var(--surface-strong)" : "var(--gold)",
                  color: loading ? "var(--muted)" : "#050505", cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: "1rem", marginTop: 10,
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            <p style={{ marginTop: 25, textAlign: "center", color: "var(--muted)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600 }}>Login</Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
