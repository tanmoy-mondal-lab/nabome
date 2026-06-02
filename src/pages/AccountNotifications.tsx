import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, ShoppingBag, Heart, Tag, Shield, Store, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { generateMockNotifications, type Notification } from "../lib/mockAccountData";

const typeIcon: Record<string, React.ReactNode> = {
  order: <ShoppingBag size={18} />,
  offer: <Tag size={18} />,
  wishlist: <Heart size={18} />,
  vendor: <Store size={18} />,
  account: <Shield size={18} />,
};

const typeColor: Record<string, string> = {
  order: "#3498db", offer: "#f39c12", wishlist: "#e74c3c",
  vendor: "#2ecc71", account: "#9b59b6",
};

export default function AccountNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch from DB
    setNotifications(generateMockNotifications(10));
    setLoading(false);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: !n.read } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}><Loader2 size={32} className="spin" style={{ color: "var(--gold)" }} /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={22} style={{ color: "var(--gold)" }} /> Notifications
          {unreadCount > 0 && (
            <span style={{ background: "var(--gold)", color: "#050505", fontSize: ".72rem", fontWeight: 700, padding: "2px 9px", borderRadius: 10 }}>{unreadCount}</span>
          )}
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem", fontWeight: 500 }}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid var(--line)", background: "transparent", color: "var(--error)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem", fontWeight: 500 }}>
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
          <Bell size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
          <p style={{ color: "var(--muted)" }}>No notifications yet.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            className="glass"
            style={{
              padding: "16px 20px", borderRadius: "var(--radius-lg)", cursor: "pointer",
              borderLeft: `3px solid ${n.read ? "transparent" : typeColor[n.type]}`,
              opacity: n.read ? 0.6 : 1,
            }}
            onClick={() => toggleRead(n.id)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = typeColor[n.type]}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = n.read ? "transparent" : typeColor[n.type]}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ color: typeColor[n.type], marginTop: 2, flexShrink: 0 }}>{typeIcon[n.type]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <p style={{ fontWeight: n.read ? 400 : 700, fontSize: ".9rem" }}>{n.title}</p>
                  <span style={{ color: "var(--muted)", fontSize: ".72rem", whiteSpace: "nowrap" }}>
                    {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4, lineHeight: 1.5 }}>{n.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
