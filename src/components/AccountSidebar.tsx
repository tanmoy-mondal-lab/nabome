import { useMemo } from "react";
import { LayoutDashboard, ShoppingBag, Heart, MapPin, Bell, User, Settings, LogOut } from "lucide-react";

export type AccountTab = "dashboard" | "orders" | "wishlist" | "addresses" | "notifications" | "profile" | "settings";

type Props = {
  active: AccountTab;
  onTab: (tab: AccountTab) => void;
  onLogout: () => void;
  unreadNotifications?: number;
};

const items: { tab: AccountTab; label: string; icon: React.ReactNode }[] = [
  { tab: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { tab: "orders", label: "Orders", icon: <ShoppingBag size={18} /> },
  { tab: "wishlist", label: "Wishlist", icon: <Heart size={18} /> },
  { tab: "addresses", label: "Addresses", icon: <MapPin size={18} /> },
  { tab: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  { tab: "profile", label: "Profile", icon: <User size={18} /> },
  { tab: "settings", label: "Settings", icon: <Settings size={18} /> },
];

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 16px",
  border: "none",
  background: active ? "var(--gold-soft)" : "transparent",
  color: active ? "var(--gold)" : "var(--muted)",
  cursor: "pointer",
  fontSize: ".85rem",
  fontWeight: active ? 700 : 500,
  borderRadius: "var(--radius)",
  textAlign: "left",
  width: "100%",
  transition: "all var(--transition-fast)",
  letterSpacing: "0.02em",
});

export default function AccountSidebar({ active, onTab, onLogout, unreadNotifications }: Props) {
  const withBadge = useMemo(() => items.map((item) => ({
    ...item,
    badge: item.tab === "notifications" && unreadNotifications && unreadNotifications > 0 ? unreadNotifications : undefined,
  })), [unreadNotifications]);

  return (
    <aside style={{
      width: "min(280px, 100%)",
      background: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-xl)",
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      height: "fit-content",
      position: "sticky",
      top: 100,
    }}>
      {withBadge.map(({ tab, label, icon, badge }) => (
        <button key={tab} onClick={() => onTab(tab)} style={linkStyle(active === tab)}
          onMouseEnter={(e) => { if (active !== tab) { e.currentTarget.style.background = "var(--surface-strong)"; e.currentTarget.style.color = "var(--text)"; }}}
          onMouseLeave={(e) => { if (active !== tab) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}
        >
          {icon}
          <span style={{ flex: 1 }}>{label}</span>
          {badge && (
            <span style={{
              background: "var(--gold)",
              color: "#050505",
              fontSize: ".68rem",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 10,
              lineHeight: 1.3,
            }}>{badge}</span>
          )}
        </button>
      ))}
      <div style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 8 }}>
        <button onClick={onLogout} style={linkStyle(false)}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-strong)"; e.currentTarget.style.color = "var(--error)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          <LogOut size={18} /> Log out
        </button>
      </div>
    </aside>
  );
}
