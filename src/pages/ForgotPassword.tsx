import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      alert("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profile`,
        });
        if (error) {
          alert(error.message);
          setLoading(false);
          return;
        }
      }
      setSent(true);
    } catch {
      alert("Connection error. Check your Supabase config.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <>
        <SEO title="Reset Password | নবME" description="Password reset email sent." path="/forgot-password" />
        <Navbar />
        <main className="page" style={{ display: "grid", minHeight: "70vh", placeItems: "center" }}>
          <div className="glass" style={{ padding: 48, textAlign: "center", maxWidth: 480 }}>
            <h1 className="heading" style={{ marginBottom: 16 }}>Check Your Email</h1>
            <p className="lede">If an account exists for <strong>{email}</strong>, we've sent a password reset link.</p>
            <Link to="/login" className="premium-button" style={{ display: "inline-flex", marginTop: 24, padding: "0 28px", alignItems: "center" }}>
              Back to Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title="Reset Password | নবME" description="Reset your নবME account password." path="/forgot-password" />
      <Navbar />
      <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
        <section style={{ padding: "100px 6% 60px", textAlign: "center", borderBottom: "1px solid var(--line)" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "4px", color: "var(--muted)", fontSize: ".85rem" }}>Account</p>
          <h1 style={{ fontSize: "clamp(3rem,6vw,5rem)", fontWeight: 300, marginTop: 15 }}>Reset Password</h1>
        </section>
        <section style={{ padding: "80px 6%", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 500, border: "1px solid var(--line)", padding: 40, background: "var(--surface)" }}>
            <h2 style={{ marginBottom: 30, fontWeight: 400 }}>Enter your email</h2>
            <div style={{ display: "grid", gap: 18 }}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: 16, border: "1px solid var(--line)", background: "rgba(255,255,255,0.06)", color: "var(--text)", outline: "none", fontSize: "1rem" }}
              />
              <button
                onClick={handleReset}
                disabled={loading}
                style={{ padding: 18, border: "none", background: loading ? "var(--surface-strong)" : "var(--gold)", color: loading ? "var(--muted)" : "#050505", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "1rem", marginTop: 10 }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
            <p style={{ marginTop: 25, color: "var(--muted)", textAlign: "center" }}>
              Remember your password?{" "}
              <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600 }}>Login</Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
