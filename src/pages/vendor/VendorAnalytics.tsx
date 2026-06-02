import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Package, Star } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { generateMockAnalytics } from "../../lib/mockVendorData";

const COLORS = ["#d4af37", "#3498db", "#2ecc71", "#9b59b6", "#e74c3c", "#f39c12", "#1abc9c", "#e67e22"];

export default function VendorAnalytics() {
  const [data, setData] = useState<ReturnType<typeof generateMockAnalytics> | null>(null);

  useEffect(() => {
    setData(generateMockAnalytics());
  }, []);

  if (!data) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <BarChart3 size={22} style={{ color: "var(--gold)" }} /> Analytics
      </h1>

      {/* Revenue Chart */}
      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8 }}>
            <IndianRupee size={16} style={{ color: "var(--gold)" }} /> Revenue Overview
          </h3>
          <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: ".85rem" }}>
            ₹{data.monthlyRevenue.toLocaleString("en-IN")} this month
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.revenueChart}>
            <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} /><stop offset="95%" stopColor="#d4af37" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#d4af37" fill="url(#revGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Order Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <ShoppingBag size={16} style={{ color: "var(--gold)" }} /> Orders
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.orderChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} />
              <Bar dataKey="orders" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status breakdown */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Package size={16} style={{ color: "var(--gold)" }} /> Order Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.orderStatusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                {data.orderStatusBreakdown.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
            {data.orderStatusBreakdown.map((s, i) => (
              <span key={s.status} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: ".72rem", color: "var(--muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                {s.status} ({s.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Star size={16} style={{ color: "var(--gold)" }} /> Best Selling Products
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.bestSellingProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={180} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} />
            <Bar dataKey="sales" fill="#d4af37" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Package size={16} style={{ color: "var(--gold)" }} /> Top Categories
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.topCategories.map((cat, i) => {
              const pct = (cat.count / data.topCategories.reduce((s, c) => s + c.count, 0)) * 100;
              return (
                <div key={cat.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: ".82rem" }}>{cat.category}</span>
                    <span style={{ fontSize: ".82rem", color: "var(--gold)", fontWeight: 600 }}>{cat.count} items</span>
                  </div>
                  <div style={{ height: 8, background: "var(--surface-strong)", borderRadius: 4, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                      style={{ height: "100%", background: COLORS[i % COLORS.length], borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} style={{ color: "var(--gold)" }} /> Monthly Growth
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} />
              <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} dot={{ fill: "#d4af37", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
