import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, MapPin, Package, Bell, ArrowRight, TrendingUp, Clock, User } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import type { AccountTab } from "../components/AccountSidebar";

type Props = { onTab: (tab: AccountTab) => void };

const statIcon: Record<string, React.ReactNode> = {
  Orders: <ShoppingBag size={22} />,
  Wishlist: <Heart size={22} />,
  Addresses: <MapPin size={22} />,
  Profile: <User size={22} />,
  Notifications: <Bell size={22} />,
};

const statColor: Record<string, string> = {
  Orders: "#3498db",
  Wishlist: "#e74c3c",
  Addresses: "#2ecc71",
  Profile: "#d4af37",
  Notifications: "#9b59b6",
};

export default function AccountDashboard({ onTab }: Props) {
  const { customer } = useCustomer();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const [orderCount, setOrderCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);

  useMemo(() => {
    if (!customer) return;
    // TODO: integrate DB
    import("../lib/db").then(({ getOrdersByCustomer, getAddresses }) => {
      getOrdersByCustomer(customer.id).then((d) => setOrderCount(d?.length || 0)).catch(() => {});
      getAddresses(customer.id).then((d) => setAddressCount(d?.length || 0)).catch(() => {});
    });
  }, [customer]);

  const completed = useMemo(() => {
    let score = 0;
    if (customer?.name) score += 20;
    if (customer?.phone) score += 20;
    if (customer?.email) score += 20;
    if (customer?.gender) score += 20;
    if (addressCount > 0) score += 10;
    if (orderCount > 0) score += 10;
    return score;
  }, [customer, addressCount, orderCount]);

  const stats = [
    { label: "Orders", value: orderCount, tab: "orders" as AccountTab },
    { label: "Wishlist", value: wishlist.length, tab: "wishlist" as AccountTab },
    { label: "Addresses", value: addressCount, tab: "addresses" as AccountTab },
    { label: "Cart", value: cart.length, tab: "profile" as AccountTab },
    { label: "Notifications", value: 3, tab: "notifications" as AccountTab },
  ];

  const quickActions = [
    { label: "View Orders", tab: "orders" as AccountTab, icon: <Package size={16} /> },
    { label: "Edit Profile", tab: "profile" as AccountTab, icon: <User size={16} /> },
    { label: "Manage Addresses", tab: "addresses" as AccountTab, icon: <MapPin size={16} /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Welcome */}
      <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 4 }}>Welcome back</p>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 400 }}>{customer?.name || "Customer"}</h1>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4 }}>{customer?.phone}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4 }}>Account Completion</p>
          <div style={{ width: 120, height: 6, background: "var(--surface-strong)", borderRadius: 3, overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${completed}%` }} transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: "100%", background: "var(--gold)", borderRadius: 3 }} />
          </div>
          <p style={{ color: "var(--gold)", fontSize: ".82rem", fontWeight: 600, marginTop: 4 }}>{completed}%</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map(({ label, value, tab }) => (
          <motion.button key={label} onClick={() => onTab(tab)} whileHover={{ y: -4 }}
            style={{
              background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)",
              padding: 24, cursor: "pointer", textAlign: "center", transition: "border-color var(--transition-fast)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = statColor[label]}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}
          >
            <div style={{ color: statColor[label], marginBottom: 10, display: "flex", justifyContent: "center" }}>{statIcon[label]}</div>
            <p style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--text)" }}>{value}</p>
            <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 4 }}>{label}</p>
          </motion.button>
        ))}
      </div>

      {/* Quick Actions + Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} style={{ color: "var(--gold)" }} /> Quick Actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map(({ label, tab, icon }) => (
              <button key={label} onClick={() => onTab(tab)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem", fontWeight: 500, transition: "all var(--transition-fast)", textAlign: "left" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--gold-soft)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "transparent"; }}
              >
                {icon} <span style={{ flex: 1 }}>{label}</span> <ArrowRight size={14} style={{ color: "var(--muted)" }} />
              </button>
            ))}
          </div>
        </div>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={16} style={{ color: "var(--gold)" }} /> At a Glance
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Wishlist Items", String(wishlist.length), "#e74c3c"],
              ["Cart Items", String(cart.reduce((s, i) => s + i.quantity, 0)), "#3498db"],
              ["Saved Addresses", String(addressCount), "#2ecc71"],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>{label}</span>
                <span style={{ color, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
