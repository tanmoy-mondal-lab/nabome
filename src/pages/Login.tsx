import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, UserPlus, Store, Shield } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/profile";

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const identifier = mode === "email" ? email.trim() : phone.trim();
    if (!identifier) {
      setError(mode === "email" ? "Enter your email address." : "Enter your phone number.");
      return;
    }
    if (mode === "email" && !identifier.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setLoading(true);
    const result = await login(
      mode === "email" ? { email: identifier, password } : { phone: identifier, password }
    );
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || "Login failed. Check your credentials.");
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "12px 16px",
    border: "none",
    background: active ? "var(--gold)" : "transparent",
    color: active ? "#050505" : "var(--muted)",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: ".82rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderRadius: "var(--radius)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all var(--transition-fast)",
  });

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px 14px 46px",
    border: error ? "1px solid var(--error)" : "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: "1rem",
    outline: "none",
    borderRadius: "var(--radius)",
    transition: "border-color var(--transition-fast)",
  };

  const iconWrap: React.CSSProperties = {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--muted)",
    pointerEvents: "none",
    display: "flex",
  };

  return (
    <>
      <SEO title="Log In | নবME" description="Log in to your নবME account." />
      <Navbar />
      <main className="page" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "120px 6%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <div className="glass" style={{ padding: 40, borderRadius: "var(--radius-xl)" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12, color: "var(--gold)" }}>
                <LogIn size={36} style={{ display: "inline" }} />
              </div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 300, marginBottom: 6 }}>Welcome Back</h1>
              <p className="lede" style={{ color: "var(--muted)", fontSize: ".9rem", margin: 0 }}>
                Log in to your নবME account
              </p>
            </div>

            {/* Tab toggle */}
            <div style={{ display: "flex", background: "var(--surface-strong)", borderRadius: "var(--radius)", padding: 4, marginBottom: 24 }}>
              <button onClick={() => setMode("email")} style={tabStyle(mode === "email")}>
                <Mail size={16} /> Email
              </button>
              <button onClick={() => setMode("phone")} style={tabStyle(mode === "phone")}>
                <Phone size={16} /> Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <AnimatePresence mode="wait">
                {mode === "email" ? (
                  <motion.div key="email-field" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ position: "relative" }}>
                    <Mail size={18} style={iconWrap} />
                    <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} autoFocus autoComplete="email" />
                  </motion.div>
                ) : (
                  <motion.div key="phone-field" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ position: "relative" }}>
                    <Phone size={18} style={iconWrap} />
                    <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldStyle} autoFocus autoComplete="tel" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ position: "relative" }}>
                <Lock size={18} style={iconWrap} />
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, display: "flex" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link to="/forgot-password" style={{ color: "var(--gold)", fontSize: ".82rem", textDecoration: "none", fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                  <AlertCircle size={14} /> {error}
                </motion.p>
              )}

              <button type="submit" className="premium-button" disabled={loading} style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 48, marginTop: 4 }}>
                {loading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div style={{ marginTop: 28, borderTop: "1px solid var(--line)", paddingTop: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Link to="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 24px", border: "1px solid var(--line)", borderRadius: "var(--radius)", color: "var(--text)", textDecoration: "none", fontSize: ".85rem", fontWeight: 600, transition: "all var(--transition-fast)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--gold-soft)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <UserPlus size={16} /> Create Customer Account
                </Link>
                <Link to="/vendor-register" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 24px", border: "1px solid var(--line)", borderRadius: "var(--radius)", color: "var(--text)", textDecoration: "none", fontSize: ".85rem", fontWeight: 600, transition: "all var(--transition-fast)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--gold-soft)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Store size={16} /> Become a Vendor
                </Link>
              </div>
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <Link to="/admin-login" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: ".78rem", textDecoration: "none" }}>
                  <Shield size={14} /> Admin Login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
