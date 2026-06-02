import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, ShoppingBag, Heart, Tag, Shield, Store, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount, type Notification } from "../lib/api/notifications";

const typeIcon: Record<string, React.ReactNode> = {
  order: <ShoppingBag size={18} />,
  offer: <Tag size={18} />,
  wishlist: <Heart size={18} />,
  vendor: <Store size={18} />,
  system: <Shield size={18} />,
  promotion: <Tag size={18} />,
  return: <ShoppingBag size={18} />,
  support: <Shield size={18} />,
  product: <ShoppingBag size={18} />,
  review: <Heart size={18} />,
};

const typeColor: Record<string, string> = {
  order: "#3498db", offer: "#f39c12", wishlist: "#e74c3c",
  vendor: "#2ecc71", system: "#9b59b6", promotion: "#f39c12",
  return: "#3498db", support: "#9b59b6", product: "#1abc9c",
  review: "#e74c3c", account: "#9b59b6",
};

export default function AccountNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getUserNotifications(user.id).then((data) => {
      setNotifications(data);
      setLoading(false);
    });
    getUnreadCount(user.id).then(setUnreadCount);
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const toggleRead = async (id: string) => {
    const n = notifications.find((n) => n.id === id);
    if (!n || n.isRead) return;
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const clearAll = () => setNotifications([]);

  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}><Loader2 size={32} className="spin" style={{ color: "var(--gold)" }} /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={22} style={{ color: "var(--gold)" }} /> Notifications
          {unread > 0 && (
            <span style={{ background: "var(--gold)", color: "#050505", fontSize: ".72rem", fontWeight: 700, padding: "2px 9px", borderRadius: 10 }}>{unread}</span>
          )}
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          {unread > 0 && (
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
              borderLeft: `3px solid ${n.isRead ? "transparent" : typeColor[n.type] || typeColor.system}`,
              opacity: n.isRead ? 0.6 : 1,
            }}
            onClick={() => toggleRead(n.id)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = typeColor[n.type] || typeColor.system}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = n.isRead ? "transparent" : (typeColor[n.type] || typeColor.system)}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ color: typeColor[n.type] || typeColor.system, marginTop: 2, flexShrink: 0 }}>{typeIcon[n.type]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <p style={{ fontWeight: n.isRead ? 400 : 700, fontSize: ".9rem" }}>{n.title}</p>
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
