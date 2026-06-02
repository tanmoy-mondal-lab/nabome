import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Store, Package, ShoppingBag, IndianRupee, Activity, TrendingUp, UserCheck,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { generateAdminDashboardStats } from "../../lib/mockAdminData";

const COLORS = ["#d4af37", "#3498db", "#2ecc71", "#9b59b6", "#e74c3c", "#f39c12", "#1abc9c", "#e67e22"];

const statCards = [
  { label: "Total Customers", key: "totalCustomers", icon: <Users size={20} />, color: "#3498db", suffix: "" },
  { label: "Total Vendors", key: "totalVendors", icon: <Store size={20} />, color: "#2ecc71", suffix: "" },
  { label: "Pending Vendors", key: "pendingVendors", icon: <UserCheck size={20} />, color: "#f39c12", suffix: "" },
  { label: "Total Products", key: "totalProducts", icon: <Package size={20} />, color: "#9b59b6", suffix: "" },
  { label: "Pending Products", key: "pendingProducts", icon: <Package size={20} />, color: "#e74c3c", suffix: "" },
  { label: "Total Orders", key: "totalOrders", icon: <ShoppingBag size={20} />, color: "#1abc9c", suffix: "" },
  { label: "Revenue", key: "totalRevenue", icon: <IndianRupee size={20} />, color: "#d4af37", prefix: "₹", suffix: "" },
  { label: "Active Users", key: "activeUsers", icon: <Activity size={20} />, color: "#e67e22", suffix: "" },
];

export default function AdminHome() {
  const [stats, setStats] = useState<ReturnType<typeof generateAdminDashboardStats> | null>(null);

  useEffect(() => {
    setStats(generateAdminDashboardStats());
  }, []);

  if (!stats) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, marginBottom: 24 }}>Marketplace Overview</h1>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 14, marginBottom: 28 }}>
        {statCards.map(({ label, key, icon, color, prefix, suffix }, i) => {
          const val = stats[key as keyof typeof stats] as number;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)", textAlign: "center" }}
            >
              <div style={{ color, marginBottom: 8, display: "flex", justifyContent: "center" }}>{icon}</div>
              <p style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--text)" }}>
                {prefix || ""}{typeof val === "number" ? val.toLocaleString("en-IN") : val}{suffix}
              </p>
              <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 4 }}>{label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Growth metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Customer Growth", value: stats.customerGrowth, color: "#3498db" },
          { label: "Vendor Growth", value: stats.vendorGrowth, color: "#2ecc71" },
          { label: "Revenue Growth", value: stats.revenueGrowth, color: "#d4af37" },
          { label: "Order Growth", value: stats.orderGrowth, color: "#9b59b6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ padding: 16, borderRadius: "var(--radius-lg)", textAlign: "center" }}>
            <p style={{ fontSize: "1.5rem", fontWeight: 300, color }}>+{value}%</p>
            <p style={{ color: "var(--muted)", fontSize: ".72rem", marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={16} style={{ color: "var(--gold)" }} /> Revenue Trend
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={stats.revenueChart}>
            <defs><linearGradient id="adRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} /><stop offset="95%" stopColor="#d4af37" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#d4af37" fill="url(#adRev)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Order Chart + Category Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={16} style={{ color: "var(--gold)" }} /> Orders
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.orderChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} />
              <Bar dataKey="orders" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Grid3X3 size={16} style={{ color: "var(--gold)" }} /> Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.categoryDistribution} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={45} label={(props: any) => `${props.category} ${(props.percent * 100).toFixed(0)}%`}>
                {stats.categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
        <h3 style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: 16 }}>Recent Activity</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.recentActivities.map((act, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < stats.recentActivities.length - 1 ? "1px solid var(--line)" : "none", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: act.type === "vendor" ? "#2ecc71" : act.type === "product" ? "#f39c12" : act.type === "order" ? "#3498db" : "#9b59b6",
                }} />
                <span style={{ fontSize: ".85rem" }}>{act.action}</span>
              </div>
              <span style={{ color: "var(--muted)", fontSize: ".78rem" }}>{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Grid3X3({ size, style: _style }: { size?: number; style?: React.CSSProperties }) {
  return <Grid3X3Icon size={size} style={_style} />;
}
function Grid3X3Icon({ size, style }: { size?: number; style?: React.CSSProperties }) {
  return <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
}
