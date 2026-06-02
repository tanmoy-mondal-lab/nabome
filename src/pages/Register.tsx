import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Loader2, Venus, Mars } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Register() {
  const { registerCustomer, validatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialForm = useMemo(() => {
    const prefill = searchParams.get("identifier");
    if (prefill) {
      if (prefill.includes("@")) return { name: "", phone: "", email: prefill, gender: "", password: "", confirmPassword: "" };
      return { name: "", phone: prefill, email: "", gender: "", password: "", confirmPassword: "" };
    }
    return { name: "", phone: "", email: "", gender: "", password: "", confirmPassword: "" };
  }, [searchParams]);

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const validation = form.password ? validatePassword(form.password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return void setError("Full name is required.");
    if (!form.phone || form.phone.length < 10) return void setError("Enter a valid phone number.");
    if (!form.gender) return void setError("Please select your gender.");

    if (!form.password) return void setError("Create a password.");
    const v = validatePassword(form.password);
    if (!v.valid) return void setError(v.errors[0]);

    if (form.password !== form.confirmPassword) return void setError("Passwords do not match.");

    setLoading(true);
    const result = await registerCustomer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      gender: form.gender,
      password: form.password,
    });
    setLoading(false);

    if (result.success) {
      if (result.needsEmailConfirm) {
        showToast("Check your email to confirm your account.");
        navigate("/login");
      } else {
        showToast("Account created successfully!");
        navigate("/profile");
      }
    } else {
      setError(result.error || "Registration failed.");
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px 14px 46px",
    border: "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: ".95rem",
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

  const genderStyle = (g: string): React.CSSProperties => ({
    flex: 1,
    padding: "12px 16px",
    border: `1px solid ${form.gender === g ? "var(--gold)" : "var(--line)"}`,
    background: form.gender === g ? "var(--gold-soft)" : "transparent",
    color: form.gender === g ? "var(--gold)" : "var(--muted)",
    cursor: "pointer",
    borderRadius: "var(--radius)",
    fontWeight: 600,
    fontSize: ".85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all var(--transition-fast)",
  });

  const strengthColor = validation
    ? validation.strength === "very-strong" ? "#2ecc71"
      : validation.strength === "strong" ? "#27ae60"
      : validation.strength === "medium" ? "#f39c12"
      : "#e74c3c"
    : "transparent";

  return (
    <>
      <SEO title="Create Account | নবME" description="Register your নবME account." />
      <Navbar />
      <main className="page" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "120px 6%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%", maxWidth: 480 }}
        >
          <div className="glass" style={{ padding: 40, borderRadius: "var(--radius-xl)" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12, color: "var(--gold)" }}>
                <UserPlus size={36} style={{ display: "inline" }} />
              </div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 300, marginBottom: 6 }}>Create Account</h1>
              <p className="lede" style={{ color: "var(--muted)", fontSize: ".9rem", margin: 0 }}>
                Join the নবME community
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ position: "relative" }}>
                <User size={16} style={iconWrap} />
                <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => update("name", e.target.value)} style={fieldStyle} autoFocus autoComplete="name" />
              </div>

              <div style={{ position: "relative" }}>
                <Phone size={16} style={iconWrap} />
                <input type="tel" placeholder="Phone Number *" value={form.phone} onChange={(e) => update("phone", e.target.value)} style={fieldStyle} autoComplete="tel" />
              </div>

              <div style={{ position: "relative" }}>
                <Mail size={16} style={iconWrap} />
                <input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => update("email", e.target.value)} style={fieldStyle} autoComplete="email" />
              </div>

              {/* Gender */}
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 8, display: "block" }}>Gender *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {([["Male", "male", <Mars size={16} key="ma" />], ["Female", "female", <Venus size={16} key="fe" />], ["Other", "other", <User size={16} key="ot" />]] as [string, string, React.ReactNode][]).map(([label, value, icon]) => (
                    <button key={value} type="button" onClick={() => update("gender", value as string)} style={genderStyle(value as string)}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <Lock size={16} style={iconWrap} />
                <input type={showPassword ? "text" : "password"} placeholder="Password *" value={form.password} onChange={(e) => update("password", e.target.value)} style={fieldStyle} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, display: "flex" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {validation && form.password.length > 0 && (
                <div style={{ marginTop: -8 }}>
                  <div style={{ height: 4, background: "var(--surface-strong)", borderRadius: 2, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: validation.strength === "weak" ? "25%" : validation.strength === "medium" ? "50%" : validation.strength === "strong" ? "75%" : "100%" }}
                      style={{ height: "100%", background: strengthColor, borderRadius: 2 }}
                    />
                  </div>
                  <p style={{ fontSize: ".78rem", color: strengthColor, marginTop: 4, textTransform: "capitalize" }}>{validation.strength.replace("-", " ")}</p>
                  {validation.errors.length > 0 && (
                    <ul style={{ margin: "6px 0 0", padding: "0 0 0 16px", fontSize: ".78rem", color: "var(--muted)" }}>
                      {validation.errors.map((err) => <li key={err}>{err}</li>)}
                    </ul>
                  )}
                </div>
              )}

              <div style={{ position: "relative" }}>
                <CheckCircle size={16} style={iconWrap} />
                <input type={showPassword ? "text" : "password"} placeholder="Confirm Password *" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} style={{
                  ...fieldStyle,
                  borderColor: form.confirmPassword && form.password !== form.confirmPassword ? "var(--error)" : form.confirmPassword && form.password === form.confirmPassword ? "#2ecc71" : "var(--line)",
                }} autoComplete="new-password" />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#2ecc71" }} />
                )}
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                  <AlertCircle size={14} /> {error}
                </motion.p>
              )}

              <button type="submit" className="premium-button" disabled={loading} style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 48, marginTop: 4 }}>
                {loading ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 24, color: "var(--muted)", fontSize: ".85rem" }}>
              Already have an account? <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600 }}>Log in</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </>
  );
}
