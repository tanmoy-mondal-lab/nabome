import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, User, Building2, Tag, Phone, Mail, Lock, MapPin, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft, Shield } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function VendorRegister() {
  const { registerVendor, validatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ownerName: "",
    businessName: "",
    shopName: "",
    shopCategory: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessAddress: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validation = form.password ? validatePassword(form.password) : null;

  const inputStyle: React.CSSProperties = {
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

  const handleNext = () => {
    setError("");
    if (!form.ownerName.trim()) return void setError("Owner name is required.");
    if (!form.businessName.trim()) return void setError("Business name is required.");
    if (!form.shopName.trim()) return void setError("Shop name is required.");
    if (!form.shopCategory.trim()) return void setError("Shop category is required.");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.phone || form.phone.length < 10) {
      setError("Enter a valid phone number (at least 10 digits).");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    const v = validatePassword(form.password);
    if (!v.valid) {
      setError(v.errors[0]);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.businessAddress.trim()) {
      setError("Business address is required.");
      return;
    }

    setLoading(true);
    const result = await registerVendor({
      ownerName: form.ownerName,
      businessName: form.businessName,
      shopName: form.shopName,
      shopCategory: form.shopCategory,
      phone: form.phone,
      email: form.email,
      password: form.password,
      businessAddress: form.businessAddress,
    });
    setLoading(false);

    if (result.success) {
      showToast("Vendor registration submitted! Awaiting approval.");
      navigate("/vendor");
    } else {
      setError(result.error || "Registration failed.");
    }
  };

  const strengthColor = validation
    ? validation.strength === "very-strong" ? "#2ecc71"
      : validation.strength === "strong" ? "#27ae60"
      : validation.strength === "medium" ? "#f39c12"
      : "#e74c3c"
    : "transparent";

  return (
    <>
      <SEO title="Become a Vendor | নবME" description="Register your shop on নবME marketplace." />
      <Navbar />
      <main className="page" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "120px 6%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%", maxWidth: 520 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Store size={28} style={{ color: "var(--gold)" }} />
            <h1 style={{ fontSize: "clamp(1.6rem,4vw,2rem)", fontWeight: 300 }}>Become a Vendor</h1>
          </div>
          <p className="lede" style={{ marginBottom: 32, color: "var(--muted)", fontSize: ".9rem" }}>
            Register your shop. Applications are reviewed by the admin team.
          </p>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? "var(--gold)" : "var(--surface-strong)", transition: "background 0.3s" }} />
            ))}
          </div>

          <div className="glass" style={{ padding: 40, borderRadius: "var(--radius-xl)" }}>
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 4 }}>Shop Details</h2>

                <div style={{ position: "relative" }}>
                  <User size={16} style={iconWrap} />
                  <input type="text" placeholder="Owner Name *" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} style={inputStyle} />
                </div>
                <div style={{ position: "relative" }}>
                  <Building2 size={16} style={iconWrap} />
                  <input type="text" placeholder="Business Name *" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} style={inputStyle} />
                </div>
                <div style={{ position: "relative" }}>
                  <Store size={16} style={iconWrap} />
                  <input type="text" placeholder="Shop Name *" value={form.shopName} onChange={(e) => update("shopName", e.target.value)} style={inputStyle} />
                </div>
                <div style={{ position: "relative" }}>
                  <Tag size={16} style={iconWrap} />
                  <input type="text" placeholder="Shop Category (e.g. Men, Women, Accessories) *" value={form.shopCategory} onChange={(e) => update("shopCategory", e.target.value)} style={inputStyle} />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertCircle size={14} /> {error}
                  </motion.p>
                )}

                <button onClick={handleNext} className="premium-button" style={{ width: "100%", justifyContent: "center", minHeight: 48, marginTop: 8 }}>
                  Next Step
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, display: "flex" }}>
                    <ArrowLeft size={20} />
                  </button>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Contact & Login</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={iconWrap} />
                    <input type="tel" placeholder="Phone Number *" value={form.phone} onChange={(e) => update("phone", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={iconWrap} />
                    <input type="email" placeholder="Email Address *" value={form.email} onChange={(e) => update("email", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={iconWrap} />
                    <input type={showPassword ? "text" : "password"} placeholder="Password *" value={form.password} onChange={(e) => update("password", e.target.value)} style={inputStyle} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, display: "flex" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Shield size={16} style={iconWrap} />
                    <input type={showPassword ? "text" : "password"} placeholder="Confirm Password *" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} style={{
                      ...inputStyle,
                      borderColor: form.confirmPassword && form.password !== form.confirmPassword ? "var(--error)" : form.confirmPassword && form.password === form.confirmPassword ? "#2ecc71" : "var(--line)",
                    }} />
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <CheckCircle size={16} style={{ position: "absolute", right: 46, top: "50%", transform: "translateY(-50%)", color: "#2ecc71" }} />
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <MapPin size={16} style={iconWrap} />
                    <textarea placeholder="Business Address *" value={form.businessAddress} onChange={(e) => update("businessAddress", e.target.value)} style={{ ...inputStyle, resize: "none", minHeight: 80 }} />
                  </div>

                  {validation && form.password.length > 0 && (
                    <div>
                      <div style={{ height: 4, background: "var(--surface-strong)", borderRadius: 2, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: validation.strength === "weak" ? "25%" : validation.strength === "medium" ? "50%" : validation.strength === "strong" ? "75%" : "100%" }} style={{ height: "100%", background: strengthColor, borderRadius: 2 }} />
                      </div>
                      <p style={{ fontSize: ".78rem", color: strengthColor, marginTop: 4, textTransform: "capitalize" }}>{validation.strength.replace("-", " ")}</p>
                    </div>
                  )}

                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertCircle size={14} /> {error}
                    </motion.p>
                  )}

                  <p style={{ fontSize: ".78rem", color: "var(--muted)", background: "var(--surface-strong)", padding: "12px 16px", borderRadius: "var(--radius)", margin: "4px 0" }}>
                    <Store size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    Your application will be reviewed. You'll receive a notification once approved.
                  </p>

                  <button type="submit" className="premium-button" disabled={loading} style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 48 }}>
                    {loading ? <Loader2 size={18} className="spin" /> : <Store size={18} />}
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              </motion.div>
            )}
          </div>

          <p style={{ textAlign: "center", marginTop: 24, color: "var(--muted)", fontSize: ".85rem" }}>
            Already a vendor? <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600 }}>Log in</Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
