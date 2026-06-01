import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { sendPasswordResetViaBrevo, sendWhatsAppResetLink } from "../lib/email";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<"" | "sent" | "not-found" | "failed">("");

  const handleReset = async () => {
    if (!email) {
      alert("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      // Send password reset via Supabase Auth (covers email)
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

      // Also send via Brevo email as backup
      await sendPasswordResetViaBrevo(email);

      // Look up user's phone to send WhatsApp reset link
      let phoneFound = false;
      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone, name")
          .eq("email", email)
          .single();
        if (profile?.phone) {
          phoneFound = true;
          const sent = await sendWhatsAppResetLink(profile.phone, profile.name || undefined);
          setWhatsappStatus(sent ? "sent" : "failed");
        } else {
          // Also check customers table
          const { data: customer } = await supabase
            .from("customers")
            .select("phone, name")
            .eq("email", email)
            .single();
          if (customer?.phone) {
            phoneFound = true;
            const sent = await sendWhatsAppResetLink(customer.phone, customer.name || undefined);
            setWhatsappStatus(sent ? "sent" : "failed");
          }
        }
      }
      if (!phoneFound) setWhatsappStatus("not-found");

      setSent(true);
    } catch {
      alert("Connection error. Check your Supabase config.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <>
        <SEO title="Reset Password | নবME" description="Password reset link sent." path="/forgot-password" />
        <Navbar />
        <main className="page" style={{ display: "grid", minHeight: "70vh", placeItems: "center" }}>
          <div className="glass" style={{ padding: 48, textAlign: "center", maxWidth: 480 }}>
            <h1 className="heading" style={{ marginBottom: 16 }}>Reset Link Sent</h1>
            <p className="lede" style={{ marginBottom: 16 }}>
              A password reset link has been sent to <strong>{email}</strong>.
            </p>
            {whatsappStatus === "sent" && (
              <p className="lede" style={{ color: "var(--gold)", marginBottom: 16 }}>
                ✓ Reset link also sent via WhatsApp.
              </p>
            )}
            {whatsappStatus === "not-found" && (
              <p className="lede" style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: 16 }}>
                No phone number found for this account. To receive reset links via WhatsApp, add your phone in your profile settings.
              </p>
            )}
            {whatsappStatus === "failed" && (
              <p className="lede" style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: 16 }}>
                WhatsApp delivery unavailable. Please check your email for the reset link.
              </p>
            )}
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
            <p style={{ marginTop: 12, color: "var(--muted)", textAlign: "center", fontSize: ".85rem", lineHeight: 1.6 }}>
              The reset link will be sent to your email and also via WhatsApp if your phone number is on file.
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
