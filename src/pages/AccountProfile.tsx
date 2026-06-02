import { useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Lock, Mail, Phone, Venus, Mars, Loader2, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { useToast } from "../components/Toast";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const GENDERS = ["Male", "Female", "Other"];

export default function AccountProfile() {
  const { customer, refresh } = useCustomer();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    gender: customer?.gender || "",
    dob: "",
  });
  const [photo, setPhoto] = useState<string | null>(null);

  const startEditing = () => {
    setForm({
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      gender: customer?.gender || "",
      dob: "",
    });
    setEditing(true);
    setError("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim() || !form.gender || !form.phone.trim()) {
      setError("Name, gender, and phone are required.");
      return;
    }
    if (!customer) return;
    setSaving(true);

    if (supabase) {
      const { error: err } = await supabase.from("customers").update({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        gender: form.gender,
      }).eq("id", customer.id);
      if (err) { setError(err.message); setSaving(false); return; }
      await refresh();
    }

    showToast("Profile updated!");
    setEditing(false);
    setSaving(false);
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "14px 16px 14px 44px",
    border: "1px solid var(--line)", background: "var(--surface)",
    color: "var(--text)", fontSize: ".95rem", outline: "none",
    borderRadius: "var(--radius)", transition: "border-color var(--transition-fast)",
  };

  const iconWrap: React.CSSProperties = {
    position: "absolute", left: 14, top: "50%",
    transform: "translateY(-50%)", color: "var(--muted)",
    pointerEvents: "none", display: "flex",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, marginBottom: 24 }}>Profile</h1>

      {/* Photo card */}
      <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--gold)", flexShrink: 0 }}>
          {photo ? (
            <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}>
              <User size={32} style={{ color: "var(--muted)" }} />
            </div>
          )}
          <label htmlFor="photo-upload" style={{ position: "absolute", bottom: 0, right: 0, background: "var(--gold)", color: "#050505", borderRadius: "50%", width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <Camera size={14} />
          </label>
          <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>{customer?.name}</p>
          <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{customer?.phone}</p>
          <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{customer?.email || "No email"}</p>
        </div>
        {!editing && (
          <button onClick={startEditing} className="premium-button" style={{ marginLeft: "auto", padding: "0 24px", fontSize: ".82rem" }}>
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile form */}
      <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)" }}>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ position: "relative" }}>
              <User size={16} style={iconWrap} />
              <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={fieldS} />
            </div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 8, display: "block" }}>Gender *</label>
              <div style={{ display: "flex", gap: 8 }}>
                {GENDERS.map((g) => (
                  <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, gender: g }))}
                    style={{
                      flex: 1, padding: "12px 16px", border: `1px solid ${form.gender === g ? "var(--gold)" : "var(--line)"}`,
                      background: form.gender === g ? "var(--gold-soft)" : "transparent",
                      color: form.gender === g ? "var(--gold)" : "var(--muted)", cursor: "pointer",
                      borderRadius: "var(--radius)", fontWeight: form.gender === g ? 600 : 400,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: ".85rem",
                    }}
                  >
                    {g === "Male" ? <Mars size={16} /> : g === "Female" ? <Venus size={16} /> : <User size={16} />} {g}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <Phone size={16} style={iconWrap} />
              <input type="tel" placeholder="Phone *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={fieldS} />
            </div>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={iconWrap} />
              <input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={fieldS} />
            </div>
            <div style={{ position: "relative" }}>
              <Calendar size={16} style={iconWrap} />
              <input type="date" placeholder="Date of Birth" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} style={{
                ...fieldS, colorScheme: "dark",
              }} />
            </div>
            {error && <p style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> {error}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleSave} disabled={saving} className="premium-button" style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 46 }}>
                {saving ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)} style={{ padding: "0 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gap: 16 }}>
              <ProfileRow label="Name" value={customer?.name || ""} icon={<User size={15} />} />
              <ProfileRow label="Gender" value={customer?.gender || "Not set"} icon={<Venus size={15} />} />
              <ProfileRow label="Phone" value={customer?.phone || ""} icon={<Phone size={15} />} />
              <ProfileRow label="Email" value={customer?.email || "Not provided"} icon={<Mail size={15} />} />
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/change-password")} style={{ padding: "12px 24px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem" }}>
                <Lock size={16} /> Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProfileRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
      <div style={{ color: "var(--gold)", display: "flex" }}>{icon}</div>
      <div>
        <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 2 }}>{label}</p>
        <p style={{ fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}
