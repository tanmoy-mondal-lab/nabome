import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Star, ClipboardList, BarChart3, Store, Trash2, LogOut,
} from "lucide-react";
import type { VendorTab } from "../../types/vendor";

export type { VendorTab };

type Props = {
  active: VendorTab;
  onTab: (tab: VendorTab) => void;
  onLogout: () => void;
};

const items: { tab: VendorTab; label: string; icon: React.ReactNode }[] = [
  { tab: "home", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { tab: "products", label: "Products", icon: <Package size={18} /> },
  { tab: "orders", label: "Orders", icon: <ShoppingBag size={18} /> },
  { tab: "customers", label: "Customers", icon: <Users size={18} /> },
  { tab: "reviews", label: "Reviews", icon: <Star size={18} /> },
  { tab: "inventory", label: "Inventory", icon: <ClipboardList size={18} /> },
  { tab: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  { tab: "shop", label: "Shop Profile", icon: <Store size={18} /> },
  { tab: "trash", label: "Trash", icon: <Trash2 size={18} /> },
];

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
  border: "none", background: active ? "var(--gold-soft)" : "transparent",
  color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer",
  fontSize: ".85rem", fontWeight: active ? 700 : 500,
  borderRadius: "var(--radius)", textAlign: "left", width: "100%",
  transition: "all var(--transition-fast)", letterSpacing: "0.02em",
});

export default function VendorSidebar({ active, onTab, onLogout }: Props) {
  return (
    <aside style={{
      width: "min(260px, 100%)", background: "var(--surface)",
      border: "1px solid var(--line)", borderRadius: "var(--radius-xl)",
      padding: 12, display: "flex", flexDirection: "column", gap: 4,
      height: "fit-content", position: "sticky", top: 100,
    }}>
      {items.map(({ tab, label, icon }) => (
        <motion.button key={tab} onClick={() => onTab(tab)} style={linkStyle(active === tab)}
          whileHover={{ x: 2 }} transition={{ duration: 0.15 }}
          onMouseEnter={(e) => { if (active !== tab) { e.currentTarget.style.background = "var(--surface-strong)"; e.currentTarget.style.color = "var(--text)"; }}}
          onMouseLeave={(e) => { if (active !== tab) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}
        >
          {icon}
          <span>{label}</span>
        </motion.button>
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
