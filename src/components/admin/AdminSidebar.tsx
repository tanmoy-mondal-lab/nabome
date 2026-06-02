import { motion } from "framer-motion";
import {
  LayoutDashboard, Store, Package, Grid3X3, Users, ShoppingBag, Star, Percent, Image, Bell, BarChart3, Settings, ClipboardList, LogOut, Shield,
} from "lucide-react";
import type { AdminTab } from "../../types/admin";

type Props = { active: AdminTab; onTab: (t: AdminTab) => void; onLogout: () => void };

const items: { tab: AdminTab; label: string; icon: React.ReactNode }[] = [
  { tab: "home", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { tab: "vendors", label: "Vendors", icon: <Store size={18} /> },
  { tab: "products", label: "Products", icon: <Package size={18} /> },
  { tab: "categories", label: "Categories", icon: <Grid3X3 size={18} /> },
  { tab: "customers", label: "Customers", icon: <Users size={18} /> },
  { tab: "orders", label: "Orders", icon: <ShoppingBag size={18} /> },
  { tab: "reviews", label: "Reviews", icon: <Star size={18} /> },
  { tab: "coupons", label: "Coupons", icon: <Percent size={18} /> },
  { tab: "banners", label: "Banners", icon: <Image size={18} /> },
  { tab: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  { tab: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
  { tab: "settings", label: "Settings", icon: <Settings size={18} /> },
  { tab: "logs", label: "System Logs", icon: <ClipboardList size={18} /> },
];

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
  border: "none", background: active ? "var(--gold-soft)" : "transparent",
  color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer",
  fontSize: ".82rem", fontWeight: active ? 700 : 500,
  borderRadius: "var(--radius)", textAlign: "left", width: "100%",
  transition: "all var(--transition-fast)", letterSpacing: "0.02em",
});

export default function AdminSidebar({ active, onTab, onLogout }: Props) {
  return (
    <aside style={{
      width: "min(250px, 100%)", background: "var(--surface)",
      border: "1px solid var(--line)", borderRadius: "var(--radius-xl)",
      padding: 10, display: "flex", flexDirection: "column", gap: 2,
      height: "fit-content", position: "sticky", top: 96,
    }}>
      <div style={{ padding: "8px 14px 12px", borderBottom: "1px solid var(--line)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
        <Shield size={16} style={{ color: "var(--gold)" }} />
        <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Super Admin</span>
      </div>
      {items.map(({ tab, label, icon }) => (
        <motion.button key={tab} onClick={() => onTab(tab)} style={linkStyle(active === tab)}
          whileHover={{ x: 2 }} transition={{ duration: 0.15 }}
          onMouseEnter={(e) => { if (active !== tab) { e.currentTarget.style.background = "var(--surface-strong)"; e.currentTarget.style.color = "var(--text)"; }}}
          onMouseLeave={(e) => { if (active !== tab) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}
        >
          {icon} <span>{label}</span>
        </motion.button>
      ))}
      <div style={{ borderTop: "1px solid var(--line)", marginTop: 6, paddingTop: 6 }}>
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
