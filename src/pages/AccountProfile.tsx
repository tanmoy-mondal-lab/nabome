import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Lock, Mail, Phone, MapPin, MapPinned, Building2, Hash, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { useToast } from "../components/Toast";
import { supabase } from "../lib/supabase";
import { neon, isNeonConnected } from "../lib/neon";
import { uploadImage } from "../lib/cloudinary";
import { useNavigate } from "react-router-dom";

const GENDERS = ["Male", "Female", "Other"];

const STATE_LIST = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export default function AccountProfile() {
  const { customer, refresh } = useCustomer();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    gender: customer?.gender || "",
    state: customer?.state || "",
    district: customer?.district || "",
    city: customer?.city || "",
    pincode: customer?.pincode || "",
    avatar_url: customer?.avatar_url || "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setForm({
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      gender: customer?.gender || "",
      state: customer?.state || "",
      district: customer?.district || "",
      city: customer?.city || "",
      pincode: customer?.pincode || "",
      avatar_url: customer?.avatar_url || "",
    });
    setEditing(true);
    setError("");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !customer) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadImage(file, "nabome/avatars");
      setForm((f) => ({ ...f, avatar_url: result.secure_url }));
    } catch {
      setError("Failed to upload image");
    }
    setUploadingAvatar(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim() || !form.gender || !form.phone.trim()) {
      setError("Name, gender, and phone are required.");
      return;
    }
    if (!customer) return;
    setSaving(true);

    const updates: Record<string, any> = {
      name: form.name.trim(), phone: form.phone.trim(),
      email: form.email.trim() || null, gender: form.gender,
      avatar_url: form.avatar_url || null,
      state: form.state.trim() || null, district: form.district.trim() || null,
      city: form.city.trim() || null, pincode: form.pincode.trim() || null,
    };
    let saveErr: any = null;
    if (await isNeonConnected()) {
      const res = await neon.update("users", updates, { id: customer.id });
      saveErr = res.error;
    } else if (supabase) {
      // @ts-ignore
      const res = await supabase.from("users").update(updates).eq("id", customer.id);
      saveErr = res.error;
    }
    if (saveErr) { setError(saveErr.message); setSaving(false); return; }
    if (await isNeonConnected() || supabase) {
      await refresh();
    }

    showToast("Profile updated!");
    setEditing(false);
    setSaving(false);
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    border: "1px solid var(--line)", background: "var(--surface)",
    color: "var(--text)", fontSize: ".95rem", outline: "none",
    borderRadius: "var(--radius)", transition: "border-color var(--transition-fast)",
  };

  const selectS: React.CSSProperties = {
    ...fieldS, cursor: "pointer", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
    paddingRight: 40,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, marginBottom: 24 }}>Profile</h1>

      {/* Photo card */}
      <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--gold)", flexShrink: 0 }}>
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}>
              <User size={32} style={{ color: "var(--muted)" }} />
            </div>
          )}
          {editing && (
            <>
              <label htmlFor="account-photo-upload" style={{ position: "absolute", bottom: 0, right: 0, background: "var(--gold)", color: "#050505", borderRadius: "50%", width: 28, height: 28, display: "grid", placeItems: "center", cursor: uploadingAvatar ? "not-allowed" : "pointer" }}>
                {uploadingAvatar ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
              </label>
              <input ref={fileRef} id="account-photo-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
            </>
          )}
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
            {/* Row 1: Name + Gender */}
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Full Name *</label>
                <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Gender *</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {GENDERS.map((g) => (
                    <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, gender: g }))}
                      style={{ flex: 1, padding: "12px 12px", border: `1px solid ${form.gender === g ? "var(--gold)" : "var(--line)"}`, background: form.gender === g ? "var(--gold-soft)" : "transparent", color: form.gender === g ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: form.gender === g ? 600 : 400, fontSize: ".85rem", transition: "all .2s" }}
                    >{g}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Phone + Email */}
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Phone *</label>
                <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Email</label>
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={fieldS} />
              </div>
            </div>

            {/* Row 3: State + District */}
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>State</label>
                <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} style={selectS}>
                  <option value="">Select State</option>
                  {STATE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>District</label>
                <input type="text" placeholder="District" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} style={fieldS} />
              </div>
            </div>

            {/* Row 4: City + Pincode */}
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>City</label>
                <input type="text" placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Pincode</label>
                <input type="text" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} style={fieldS} />
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(231,76,60,0.1)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} style={{ color: "#e74c3c", flexShrink: 0 }} />
                <span style={{ color: "#e74c3c", fontSize: ".85rem" }}>{error}</span>
              </div>
            )}

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
              <ProfileRow label="Gender" value={customer?.gender || "Not set"} icon={<User size={15} />} />
              <ProfileRow label="Phone" value={customer?.phone || ""} icon={<Phone size={15} />} />
              <ProfileRow label="Email" value={customer?.email || "Not provided"} icon={<Mail size={15} />} />
              <ProfileRow label="State" value={customer?.state || "Not set"} icon={<MapPin size={15} />} />
              <ProfileRow label="District" value={customer?.district || "Not set"} icon={<Building2 size={15} />} />
              <ProfileRow label="City" value={customer?.city || "Not set"} icon={<MapPinned size={15} />} />
              <ProfileRow label="Pincode" value={customer?.pincode || "Not set"} icon={<Hash size={15} />} />
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
