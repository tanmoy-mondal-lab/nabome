import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Shield, AlertCircle, CheckCircle, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function ChangePassword() {
  const { changePassword, validatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validation = newPassword ? validatePassword(newPassword) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!oldPassword) {
      setError("Enter your current password.");
      return;
    }

    const v = validatePassword(newPassword);
    if (!v.valid) {
      setError(v.errors[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    const ok = await changePassword(oldPassword, newPassword);
    setLoading(false);

    if (ok) {
      setSuccess(true);
      showToast("Password changed successfully!");
      setTimeout(() => navigate("/account?tab=profile"), 2000);
    } else {
      setError("Current password is incorrect.");
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 46px 14px 46px",
    border: error ? "1px solid var(--error)" : "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: "1rem",
    outline: "none",
    borderRadius: "var(--radius)",
    transition: "border-color var(--transition-fast)",
  };

  const toggleStyle: React.CSSProperties = {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "var(--muted)",
    cursor: "pointer",
    padding: 4,
    display: "flex",
  };

  const strengthColor = validation
    ? validation.strength === "very-strong" ? "#2ecc71"
      : validation.strength === "strong" ? "#27ae60"
      : validation.strength === "medium" ? "#f39c12"
      : "#e74c3c"
    : "transparent";

  return (
    <>
      <SEO title="Change Password | নবME" description="Update your account password." />
      <Navbar />
      <main className="page" style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "120px 6%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <button onClick={() => navigate("/account?tab=profile")} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: ".85rem", marginBottom: 24 }}>
            <ArrowLeft size={16} /> Back to Profile
          </button>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
              <CheckCircle size={48} style={{ color: "#2ecc71", marginBottom: 16 }} />
              <h1 style={{ fontSize: "1.4rem", fontWeight: 400, marginBottom: 8 }}>Password Updated</h1>
              <p className="lede" style={{ color: "var(--muted)" }}>Redirecting to your profile...</p>
            </motion.div>
          ) : (
            <div className="glass" style={{ padding: 40, borderRadius: "var(--radius-xl)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <Lock size={24} style={{ color: "var(--gold)" }} />
                <h1 style={{ fontSize: "1.4rem", fontWeight: 400 }}>Change Password</h1>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Current Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                    <input type={showOld ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={fieldStyle} placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowOld(!showOld)} style={toggleStyle} aria-label={showOld ? "Hide password" : "Show password"}>
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <Shield size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                    <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={fieldStyle} placeholder="Enter new password" />
                    <button type="button" onClick={() => setShowNew(!showNew)} style={toggleStyle} aria-label={showNew ? "Hide password" : "Show password"}>
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {validation && newPassword.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ height: 4, background: "var(--surface-strong)", borderRadius: 2, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: validation.strength === "weak" ? "25%" : validation.strength === "medium" ? "50%" : validation.strength === "strong" ? "75%" : "100%" }} style={{ height: "100%", background: strengthColor, borderRadius: 2 }} />
                      </div>
                      <p style={{ fontSize: ".78rem", color: strengthColor, marginTop: 4, textTransform: "capitalize" }}>{validation.strength.replace("-", " ")}</p>
                      {validation.errors.length > 0 && (
                        <ul style={{ margin: "6px 0 0", padding: "0 0 0 16px", fontSize: ".78rem", color: "var(--muted)" }}>
                          {validation.errors.map((err) => <li key={err}>{err}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                    <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{
                      ...fieldStyle,
                      borderColor: confirmPassword && newPassword !== confirmPassword ? "var(--error)" : confirmPassword && newPassword === confirmPassword ? "#2ecc71" : fieldStyle.borderColor,
                    }} placeholder="Confirm new password" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={toggleStyle} aria-label={showConfirm ? "Hide password" : "Show password"}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {confirmPassword && newPassword === confirmPassword && (
                      <CheckCircle size={16} style={{ position: "absolute", right: 46, top: "50%", transform: "translateY(-50%)", color: "#2ecc71" }} />
                    )}
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertCircle size={14} /> {error}
                  </motion.p>
                )}

                <button type="submit" className="premium-button" disabled={loading} style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 48 }}>
                  {loading ? <Loader2 size={18} className="spin" /> : <Shield size={18} />}
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
