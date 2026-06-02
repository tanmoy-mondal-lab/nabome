import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, IndianRupee, ShoppingBag, Package } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { getVendorByUserId } from "../../lib/api/vendors";
import { getVendorDashboardStats } from "../../lib/api/vendor-analytics";

export default function VendorAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const vendor = await getVendorByUserId(user.id);
      if (vendor) {
        const s = await getVendorDashboardStats(vendor.id);
        if (s) setStats(s as unknown as Record<string, number>);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return null;

  const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const revenueChart = chartMonths.slice(0, currentMonth + 1).map((month) => ({
    month,
    revenue: month === chartMonths[currentMonth] ? (stats.thisMonthRevenue || 0) : Math.round((stats.totalRevenue || 0) / (currentMonth + 1)),
  }));

  const orderChart = chartMonths.slice(0, currentMonth + 1).map((month) => ({
    month,
    orders: month === chartMonths[currentMonth] ? (stats.recentOrders || 0) : Math.round((stats.totalOrders || 0) / (currentMonth + 1)),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <BarChart3 size={22} style={{ color: "var(--gold)" }} /> Analytics
      </h1>

      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8 }}>
            <IndianRupee size={16} style={{ color: "var(--gold)" }} /> Revenue Overview
          </h3>
          <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: ".85rem" }}>
            ₹{(stats.totalRevenue || 0).toLocaleString("en-IN")} total
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueChart}>
            <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} /><stop offset="95%" stopColor="#d4af37" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#d4af37" fill="url(#revGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <ShoppingBag size={16} style={{ color: "var(--gold)" }} /> Orders
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} />
              <Bar dataKey="orders" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Package size={16} style={{ color: "var(--gold)" }} /> Key Metrics
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4 }}>Total Orders</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 300 }}>{stats.totalOrders || 0}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4 }}>Pending Orders</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 300, color: "#f39c12" }}>{stats.pendingOrders || 0}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4 }}>Products</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 300 }}>{stats.totalProducts || 0}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: 4 }}>Average Rating</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 300, color: "var(--gold)" }}>{(stats.averageRating || 0).toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 4 }}>Total Customers</p>
          <p style={{ fontSize: "2rem", fontWeight: 300 }}>{stats.totalCustomers || 0}</p>
          <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>unique customers</p>
        </div>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 4 }}>This Month Revenue</p>
          <p style={{ fontSize: "2rem", fontWeight: 300, color: "var(--gold)" }}>₹{(stats.thisMonthRevenue || 0).toLocaleString("en-IN")}</p>
          <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>current month</p>
        </div>
      </div>
    </motion.div>
  );
}
