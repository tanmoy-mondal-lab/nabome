import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { useCustomer } from "../context/CustomerContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useCustomer();

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    const val = identifier.trim();
    if (!val) {
      setError("Enter your phone number or email address");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await login(val);
      if (result.found) {
        navigate("/profile");
      } else {
        navigate(`/register?identifier=${encodeURIComponent(val)}`);
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <SEO title="Login | নবME" description="Log in to your নবME account." path="/login" />
      <Navbar />
      <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
        <section style={{ padding: "100px 6% 60px", textAlign: "center", borderBottom: "1px solid var(--line)" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "4px", color: "var(--muted)", fontSize: ".85rem" }}>Account</p>
          <h1 style={{ fontSize: "clamp(3rem,6vw,5rem)", fontWeight: 300, marginTop: 15 }}>Welcome Back</h1>
        </section>
        <section style={{ padding: "80px 6%", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 500, border: "1px solid var(--line)", padding: 40, background: "var(--surface)" }}>
            <h2 style={{ marginBottom: 30, fontWeight: 400 }}>Identify Yourself</h2>
            <div style={{ display: "grid", gap: 18 }}>
              <input
                type="text"
                placeholder="Phone Number or Email Address"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                style={{ width: "100%", padding: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.06)", color: "var(--text)", outline: "none", fontSize: "1rem" }}
                autoFocus
              />
              {error && <p style={{ color: "#e74c3c", fontSize: ".9rem" }}>{error}</p>}
              <button
                onClick={handleContinue}
                disabled={loading}
                style={{
                  padding: 18, border: "none", background: loading ? "var(--surface-strong)" : "var(--gold)",
                  color: loading ? "var(--muted)" : "#050505", cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: "1rem", marginTop: 10,
                }}
              >
                {loading ? "Looking up..." : "Continue"}
              </button>
            </div>
            <p style={{ marginTop: 12, color: "var(--muted)", textAlign: "center", fontSize: ".85rem", lineHeight: 1.6 }}>
              No password needed. Just enter your phone or email to get started.
            </p>
            <p style={{ marginTop: 20, color: "var(--muted)", textAlign: "center", fontSize: ".85rem" }}>
              <Link to="/admin-login" style={{ color: "var(--gold)", fontWeight: 600 }}>Admin Login →</Link>
            </p>
            <p style={{ marginTop: 25, color: "var(--muted)", textAlign: "center" }}>
              New to নবME?{" "}
              <Link to="/register" style={{ color: "var(--gold)", fontWeight: 600 }}>Create Account</Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
