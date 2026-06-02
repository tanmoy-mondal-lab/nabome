import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Bell, Lock, UserX, ChevronRight, AlertTriangle, Eye, Loader2 } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
  useCustomer();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDeleteRequest = () => {
    setSubmitting(true);
    // TODO: send delete request to DB
    setTimeout(() => {
      showToast("Account deletion request submitted. We'll reach out to confirm.");
      setDeleteConfirm(false);
      setSubmitting(false);
    }, 1500);
  };

  const sectionS: React.CSSProperties = {
    background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 20,
  };

  const toggleS = (on: boolean): React.CSSProperties => ({
    width: 44, height: 24, borderRadius: 12, border: "none",
    background: on ? "var(--gold)" : "var(--surface-strong)",
    cursor: "pointer", position: "relative", transition: "background var(--transition-fast)",
    flexShrink: 0,
  });

  const toggleDot: React.CSSProperties = {
    width: 18, height: 18, borderRadius: "50%", background: "#fff",
    position: "absolute", top: 3, transition: "left var(--transition-fast)",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
        <Shield size={22} style={{ color: "var(--gold)" }} /> Settings
      </h1>

      {/* Notification Preferences */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={16} style={{ color: "var(--gold)" }} /> Notification Preferences
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Email Notifications", desc: "Order updates, offers, and alerts via email", val: notifEmail, set: setNotifEmail },
            { label: "SMS Notifications", desc: "Order confirmation and shipping updates via SMS", val: notifSms, set: setNotifSms },
            { label: "WhatsApp Updates", desc: "Receive order status and promotional messages", val: notifWhatsApp, set: setNotifWhatsApp },
          ].map(({ label, desc, val, set }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: ".9rem" }}>{label}</p>
                <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{desc}</p>
              </div>
              <button onClick={() => set(!val)} style={toggleS(val)}>
                <div style={{ ...toggleDot, left: val ? 23 : 3 }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Password */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <Lock size={16} style={{ color: "var(--gold)" }} /> Password
        </h3>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 16 }}>
          Update your password regularly to keep your account secure.
        </p>
        <button onClick={() => navigate("/change-password")} className="ghost-button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 20px", fontSize: ".85rem" }}>
          Change Password <ChevronRight size={14} />
        </button>
      </div>

      {/* Privacy */}
      <div style={sectionS}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <Eye size={16} style={{ color: "var(--gold)" }} /> Privacy
        </h3>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 16 }}>
          Your profile information is only visible to you and নবME administration.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <PrivacyRow label="Show email in orders" />
          <PrivacyRow label="Allow recommendation emails" />
        </div>
      </div>

      {/* Delete Account */}
      <div style={{ ...sectionS, borderColor: "rgba(231,76,60,0.3)" }}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, color: "var(--error)" }}>
          <UserX size={16} /> Delete Account
        </h3>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 16 }}>
          Request permanent deletion of your account and all associated data. This action cannot be undone.
        </p>
        {deleteConfirm ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={handleDeleteRequest} disabled={submitting} style={{ padding: "12px 24px", border: "none", background: "#e74c3c", color: "#fff", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem" }}>
              {submitting ? <Loader2 size={16} className="spin" /> : <AlertTriangle size={16} />}
              {submitting ? "Submitting..." : "Confirm Delete Request"}
            </button>
            <button onClick={() => setDeleteConfirm(false)} style={{ padding: "12px 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500, fontSize: ".85rem" }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setDeleteConfirm(true)} style={{ padding: "12px 24px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8, fontSize: ".85rem" }}>
            <UserX size={16} /> Request Account Deletion
          </button>
        )}
      </div>
    </motion.div>
  );
}

function PrivacyRow({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>{label}</span>
      <button onClick={() => setOn(!on)} style={{
        width: 40, height: 22, borderRadius: 11, border: "none",
        background: on ? "var(--gold)" : "var(--surface-strong)",
        cursor: "pointer", position: "relative", transition: "background var(--transition-fast)",
      }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 21 : 3, transition: "left var(--transition-fast)" }} />
      </button>
    </div>
  );
}
