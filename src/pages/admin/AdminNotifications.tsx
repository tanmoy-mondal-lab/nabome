import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Send, Loader2, AlertCircle, Megaphone, ShoppingBag, ShieldAlert } from "lucide-react";
import { useToast } from "../../components/Toast";
import { generateMockAdminNotifications } from "../../lib/mockAdminData";
import type { AdminNotification } from "../../types/admin";

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  system: { icon: <ShieldAlert size={14} />, color: "#3498db" },
  offer: { icon: <Megaphone size={14} />, color: "#f39c12" },
  order: { icon: <ShoppingBag size={14} />, color: "#2ecc71" },
  alert: { icon: <AlertCircle size={14} />, color: "#e74c3c" },
};

export default function AdminNotifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "system" as AdminNotification["type"], audience: "all_customers" as AdminNotification["audience"], recipientName: "" });

  useEffect(() => { setNotifications(generateMockAdminNotifications()); }, []);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) { showToast("Title and message are required."); return; }
    if ((form.audience === "single_vendor" || form.audience === "single_customer") && !form.recipientName.trim()) { showToast("Recipient name is required."); return; }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newN: AdminNotification = {
      id: `an_${Date.now()}`, title: form.title, message: form.message, type: form.type, audience: form.audience,
      recipientName: form.recipientName || undefined, sentAt: new Date().toISOString(), readCount: 0,
    };
    setNotifications((prev) => [newN, ...prev]);
    showToast("Notification sent!");
    setForm({ title: "", message: "", type: "system", audience: "all_customers", recipientName: "" });
    setSending(false);
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: ".9rem", outline: "none", borderRadius: "var(--radius)",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={22} style={{ color: "var(--gold)" }} /> Notification Center
        </h1>
      </div>

      {/* Send Form */}
      <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 28 }}>
        <h3 style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Send size={16} style={{ color: "var(--gold)" }} /> Send Notification
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={fieldS} />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AdminNotification["type"] }))} style={fieldS}>
              <option value="system">System</option>
              <option value="offer">Offer</option>
              <option value="order">Order</option>
              <option value="alert">Alert</option>
            </select>
          </div>
          <textarea rows={3} placeholder="Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} />
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as AdminNotification["audience"] }))} style={fieldS}>
              <option value="all_customers">All Customers</option>
              <option value="all_vendors">All Vendors</option>
              <option value="single_vendor">Single Vendor</option>
              <option value="single_customer">Single Customer</option>
            </select>
            {(form.audience === "single_vendor" || form.audience === "single_customer") && (
              <input type="text" placeholder={form.audience === "single_vendor" ? "Vendor name" : "Customer name"} value={form.recipientName} onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))} style={fieldS} />
            )}
          </div>
          <button onClick={handleSend} disabled={sending} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", minHeight: 46, alignSelf: "flex-start", padding: "0 32px" }}>
            {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>

      {/* History */}
      <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Notification History</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {notifications.map((n, i) => {
          const config = typeConfig[n.type] || typeConfig.system;
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${config.color}18`, display: "grid", placeItems: "center", color: config.color }}>{config.icon}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{n.title}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{n.message}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>
                    To: {n.audience === "all_customers" ? "All Customers" : n.audience === "all_vendors" ? "All Vendors" : n.recipientName}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: ".72rem", marginTop: 2 }}>
                    {new Date(n.sentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    · {n.readCount} read
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
