import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, ShoppingBag, Package, Clock, AlertTriangle, TrendingUp, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getVendorDashboardStats } from "../../lib/api/vendor-analytics";
import { getVendorByUserId } from "../../lib/api/vendors";
import type { VendorTab } from "../../types/vendor";

type Props = { onTab: (tab: VendorTab) => void };

const statCards = [
  { label: "Total Revenue", key: "totalRevenue", icon: <IndianRupee size={20} />, color: "#2ecc71", prefix: "₹" },
  { label: "Recent Orders", key: "recentOrders", icon: <TrendingUp size={20} />, color: "#3498db" },
  { label: "Total Orders", key: "totalOrders", icon: <ShoppingBag size={20} />, color: "#9b59b6" },
  { label: "Pending Orders", key: "pendingOrders", icon: <Clock size={20} />, color: "#f39c12" },
  { label: "Products", key: "totalProducts", icon: <Package size={20} />, color: "#1abc9c" },
  { label: "Low Stock", key: "lowStockProducts", icon: <AlertTriangle size={20} />, color: "#e74c3c" },
];

export default function VendorHome({ onTab }: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [shopName, setShopName] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const vendor = await getVendorByUserId(user.id);
      if (vendor) {
        setShopName(vendor.shop_name || vendor.shop_slug || "");
        setRating(vendor.rating || 0);
        const s = await getVendorDashboardStats(vendor.id);
        if (s) setStats(s as unknown as Record<string, number>);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 4 }}>{shopName}</p>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 400 }}>Welcome, {user?.name || user?.email}</h1>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4 }}>Your shop is active and visible to customers</p>
        </div>
        {rating > 0 && (
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4 }}>Shop Rating</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 300, color: "var(--gold)" }}>{rating} ★</p>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {statCards.map(({ label, key, icon, color, prefix }, i) => {
          const val = stats[key] ?? 0;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", textAlign: "center" }}
            >
              <div style={{ color, marginBottom: 10, display: "flex", justifyContent: "center" }}>{icon}</div>
              <p style={{ fontSize: "1.5rem", fontWeight: 300, color: "var(--text)" }}>
                {prefix || ""}{typeof val === "number" ? val.toLocaleString("en-IN") : val}
              </p>
              <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 4 }}>{label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginBottom: 28 }}>
        <h3 style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[
            { label: "Add Product", tab: "products" as VendorTab },
            { label: "View Orders", tab: "orders" as VendorTab },
            { label: "Shop Settings", tab: "shop" as VendorTab },
            { label: "Analytics", tab: "analytics" as VendorTab },
          ].map(({ label, tab }) => (
            <button key={tab} onClick={() => onTab(tab)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem", fontWeight: 500, transition: "all var(--transition-fast)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--gold-soft)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "transparent"; }}
            >
              {label} <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 4 }}>Total Customers</p>
          <p style={{ fontSize: "2rem", fontWeight: 300 }}>{stats.totalCustomers || 0}</p>
          <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>unique customers</p>
        </div>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 4 }}>Average Rating</p>
          <p style={{ fontSize: "2rem", fontWeight: 300, color: "var(--gold)" }}>{(stats.averageRating || 0).toFixed(1)}</p>
          <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>across all products</p>
        </div>
      </div>
    </motion.div>
  );
}
