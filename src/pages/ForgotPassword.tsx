import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Send, KeyRound, CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    const ok = await forgotPassword(email);
    setLoading(false);

    if (ok) {
      setSent(true);
      showToast("Reset code sent to your email (check mock console)");
    } else {
      setError("No account found with that email.");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const ok = await resetPassword(token, newPassword);
    setLoading(false);

    if (ok) {
      setResetDone(true);
      showToast("Password reset successful!");
    } else {
      setError("Invalid or expired reset code. Try again.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    paddingLeft: 46,
    border: error ? "1px solid var(--error)" : "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: "1rem",
    outline: "none",
    borderRadius: "var(--radius)",
    transition: "border-color var(--transition-fast)",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--muted)",
    pointerEvents: "none",
  };

  return (
    <>
      <SEO title="Forgot Password | নবME" description="Reset your নবME account password." />
      <Navbar />
      <main className="page" style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "120px 6%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", textDecoration: "none", fontSize: ".85rem", marginBottom: 24 }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <AnimatePresence mode="wait">
            {resetDone ? (
              <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
                  <CheckCircle size={48} style={{ color: "#2ecc71", marginBottom: 16 }} />
                  <h1 style={{ fontSize: "1.6rem", fontWeight: 400, marginBottom: 12 }}>Password Reset</h1>
                  <p className="lede" style={{ marginBottom: 24 }}>Your password has been updated successfully.</p>
                  <Link to="/login" className="premium-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px" }}>
                    <KeyRound size={16} /> Log In
                  </Link>
                </div>
              </motion.div>
            ) : sent ? (
              <motion.div key="reset" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="glass" style={{ padding: 40, borderRadius: "var(--radius-xl)" }}>
                  <h1 style={{ fontSize: "1.6rem", fontWeight: 400, marginBottom: 8 }}>Reset Code Sent</h1>
                  <p className="lede" style={{ marginBottom: 28, color: "var(--muted)", fontSize: ".9rem" }}>
                    A reset code has been sent to <strong style={{ color: "var(--gold)" }}>{email}</strong>. In mock mode, use code: <code style={{ background: "var(--surface-strong)", padding: "2px 8px", borderRadius: 4, color: "var(--gold)" }}>reset_{"<random>"}</code> (check console/localStorage).
                  </p>
                  <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ position: "relative" }}>
                      <KeyRound size={18} style={iconStyle} />
                      <input
                        type="text"
                        placeholder="Reset code"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div style={{ position: "relative" }}>
                      <Lock size={18} style={iconStyle} />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div style={{ position: "relative" }}>
                      <Lock size={18} style={iconStyle} />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}>
                        <AlertCircle size={14} /> {error}
                      </motion.p>
                    )}
                    <button type="submit" className="premium-button" disabled={loading} style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 48 }}>
                      {loading ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div key="email" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="glass" style={{ padding: 40, borderRadius: "var(--radius-xl)" }}>
                  <h1 style={{ fontSize: "1.6rem", fontWeight: 400, marginBottom: 8 }}>Forgot Password</h1>
                  <p className="lede" style={{ marginBottom: 28, color: "var(--muted)", fontSize: ".9rem" }}>
                    Enter your registered email and we'll send a reset code.
                  </p>
                  <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ position: "relative" }}>
                      <Mail size={18} style={iconStyle} />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}>
                        <AlertCircle size={14} /> {error}
                      </motion.p>
                    )}
                    <button type="submit" className="premium-button" disabled={loading} style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 48 }}>
                      {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                      {loading ? "Sending..." : "Send Reset Code"}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </>
  );
}


