import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { sendNewPasswordEmail, sendWhatsAppPassword } from "../lib/email";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [emailStatus, setEmailStatus] = useState<"" | "sent" | "failed">("");
  const [whatsappStatus, setWhatsappStatus] = useState<"" | "sent" | "not-found" | "failed">("");

  const handleReset = async () => {
    if (!email) {
      alert("Enter your email address.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // 1. Call serverless API to generate and set new password
      const origin = window.location.origin;
      const res = await fetch(`${origin}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      const password = data.password;
      setNewPassword(password);

      // 2. Send the new password via Brevo email
      const emailResult = await sendNewPasswordEmail(email, password);
      setEmailStatus(emailResult.ok ? "sent" : "failed");

      // 3. Look up user's phone and send via WhatsApp
      let phoneFound = false;
      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone, name")
          .eq("email", email)
          .single();
        if (profile?.phone) {
          phoneFound = true;
          const ok = await sendWhatsAppPassword(profile.phone, password, profile.name || undefined);
          setWhatsappStatus(ok ? "sent" : "failed");
        } else {
          const { data: customer } = await supabase
            .from("customers")
            .select("phone, name")
            .eq("email", email)
            .single();
          if (customer?.phone) {
            phoneFound = true;
            const ok = await sendWhatsAppPassword(customer.phone, password, customer.name || undefined);
            setWhatsappStatus(ok ? "sent" : "failed");
          }
        }
      }
      if (!phoneFound) setWhatsappStatus("not-found");

      setSent(true);
    } catch {
      setError("Connection error. Check your network and try again.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <>
        <SEO title="Password Reset | নবME" description="New password sent." path="/forgot-password" />
        <Navbar />
        <main className="page" style={{ display: "grid", minHeight: "70vh", placeItems: "center" }}>
          <div className="glass" style={{ padding: 48, textAlign: "center", maxWidth: 500 }}>
            <h1 className="heading" style={{ marginBottom: 16 }}>Password Reset</h1>
            <p className="lede" style={{ marginBottom: 20 }}>
              Your new password has been sent to <strong>{email}</strong>.
            </p>

            <div style={{ background: "var(--surface)", border: "1px solid var(--gold)", padding: "20px", marginBottom: 20 }}>
              <p style={{ color: "var(--muted)", fontSize: ".8rem", marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Your new password</p>
              <p style={{ fontFamily: "'Courier New',monospace", fontSize: "1.4rem", fontWeight: 700, color: "var(--gold)", letterSpacing: "3px", wordBreak: "break-all" }}>{newPassword}</p>
              <p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 8 }}>Save this — it won't be shown again</p>
            </div>

            {emailStatus === "sent" && <p className="lede" style={{ color: "var(--gold)", marginBottom: 8 }}>✓ Password sent to your email</p>}
            {emailStatus === "failed" && <p className="lede" style={{ color: "#e74c3c", marginBottom: 8 }}>✗ Email delivery unavailable — copy the password above</p>}

            {whatsappStatus === "sent" && <p className="lede" style={{ color: "var(--gold)", marginBottom: 8 }}>✓ Password also sent via WhatsApp</p>}
            {whatsappStatus === "not-found" && (
              <p className="lede" style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: 8 }}>
                No phone number on file — add one in your profile for WhatsApp delivery
              </p>
            )}
            {whatsappStatus === "failed" && <p className="lede" style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: 8 }}>WhatsApp unavailable — your password is in the email and above</p>}

            <Link to="/login" className="premium-button" style={{ display: "inline-flex", marginTop: 24, padding: "0 28px", alignItems: "center" }}>
              Log In Now
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
              {error && <p style={{ color: "#e74c3c", fontSize: ".9rem" }}>{error}</p>}
              <button
                onClick={handleReset}
                disabled={loading}
                style={{ padding: 18, border: "none", background: loading ? "var(--surface-strong)" : "var(--gold)", color: loading ? "var(--muted)" : "#050505", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "1rem", marginTop: 10 }}
              >
                {loading ? "Generating & Sending..." : "Send New Password"}
              </button>
            </div>
            <p style={{ marginTop: 12, color: "var(--muted)", textAlign: "center", fontSize: ".85rem", lineHeight: 1.6 }}>
              A new password will be generated and sent to your email and WhatsApp.
            </p>
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
