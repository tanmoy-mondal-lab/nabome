import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { getUserRole, seedAdminRole } from "../lib/db";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Enter admin email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (supabase) {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) {
          setError(signInErr.message);
          setLoading(false);
          return;
        }
        localStorage.setItem("nabome-user", JSON.stringify({ email }));
        if (data?.session?.user?.id) {
          await seedAdminRole(data.session.user.id, email);
        }
        const role = await getUserRole();
        navigate(role === "admin" ? "/admin" : "/account?tab=profile");
      } else {
        setError("Supabase not configured");
      }
    } catch (err) {
      setError("Connection error.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <SEO title="Admin Login | নবME" description="Admin login." path="/admin-login" />
      <Navbar />
      <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
        <section style={{ padding: "100px 6% 60px", textAlign: "center", borderBottom: "1px solid var(--line)" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "4px", color: "var(--muted)", fontSize: ".85rem" }}>Admin</p>
          <h1 style={{ fontSize: "clamp(3rem,6vw,5rem)", fontWeight: 300, marginTop: 15 }}>Admin Login</h1>
        </section>
        <section style={{ padding: "80px 6%", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 500, border: "1px solid var(--line)", padding: 40, background: "var(--surface)" }}>
            <h2 style={{ marginBottom: 30, fontWeight: 400 }}>Admin Credentials</h2>
            <div style={{ display: "grid", gap: 18 }}>
              <input
                type="email"
                placeholder="Admin Login ID (Email)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.06)", color: "var(--text)", outline: "none", fontSize: "1rem" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.06)", color: "var(--text)", outline: "none", fontSize: "1rem" }}
              />
              {error && <p style={{ color: "#e74c3c", fontSize: ".9rem" }}>{error}</p>}
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  padding: 18, border: "none", background: loading ? "var(--surface-strong)" : "var(--gold)",
                  color: loading ? "var(--muted)" : "#050505", cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: "1rem", marginTop: 10,
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <p style={{ textAlign: "right" }}>
                <Link to="/forgot-password" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "underline" }}>
                  Forgot password?
                </Link>
              </p>
            </div>
            <p style={{ marginTop: 25, color: "var(--muted)", textAlign: "center" }}>
              <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600 }}>← Customer Login</Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
