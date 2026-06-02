import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, IndianRupee, ShoppingBag, Store, Users, Package, TrendingUp } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { generateMockAdminReports } from "../../lib/mockAdminData";
import type { AdminReport } from "../../types/admin";

const reportIcons: Record<string, React.ReactNode> = {
  revenue: <IndianRupee size={20} />,
  orders: <ShoppingBag size={20} />,
  vendors: <Store size={20} />,
  customers: <Users size={20} />,
  products: <Package size={20} />,
};

const reportColors: Record<string, string> = {
  revenue: "#d4af37",
  orders: "#3498db",
  vendors: "#2ecc71",
  customers: "#9b59b6",
  products: "#1abc9c",
};

export default function AdminReports() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [selected, setSelected] = useState<string>("revenue");

  useEffect(() => { setReports(generateMockAdminReports()); }, []);

  const current = reports.find((r) => r.type === selected);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart3 size={22} style={{ color: "var(--gold)" }} /> Reports
        </h1>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".82rem" }}>
          <Download size={14} /> Export All
        </button>
      </div>

      {/* Report selector */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {reports.map((r) => (
          <button key={r.id} onClick={() => setSelected(r.type)}
            style={{
              padding: "14px 20px", borderRadius: "var(--radius-lg)", cursor: "pointer", textAlign: "left",
              background: selected === r.type ? "var(--gold-soft)" : "var(--surface)",
              border: selected === r.type ? "1px solid var(--gold)" : "1px solid var(--line)",
              color: selected === r.type ? "var(--gold)" : "var(--text)",
              transition: "all var(--transition-fast)", minWidth: 150,
            }}
          >
            <div style={{ color: selected === r.type ? "var(--gold)" : reportColors[r.type], marginBottom: 8 }}>{reportIcons[r.type]}</div>
            <p style={{ fontWeight: 600, fontSize: ".85rem", marginBottom: 2 }}>{r.title}</p>
            <p style={{ fontSize: "1.2rem", fontWeight: 300, color: r.type === "revenue" ? "var(--gold)" : "var(--text)" }}>
              {r.type === "revenue" ? `₹${r.total.toLocaleString("en-IN")}` : r.total.toLocaleString("en-IN")}
            </p>
            <p style={{ color: r.growth >= 0 ? "#2ecc71" : "#e74c3c", fontSize: ".75rem", fontWeight: 600, marginTop: 2 }}>
              {r.growth >= 0 ? "+" : ""}{r.growth}% growth
            </p>
          </button>
        ))}
      </div>

      {/* Chart */}
      {current && (
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontWeight: 600, fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} style={{ color: "var(--gold)" }} /> {current.title} — {current.period}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>Total: {current.type === "revenue" ? `₹${current.total.toLocaleString("en-IN")}` : current.total.toLocaleString("en-IN")}</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={current.data}>
              <defs><linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={reportColors[current.type]} stopOpacity={0.3} /><stop offset="95%" stopColor={reportColors[current.type]} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => current.type === "revenue" ? `₹${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} formatter={(v) => [current.type === "revenue" ? `₹${Number(v).toLocaleString("en-IN")}` : v, current.title]} />
              <Area type="monotone" dataKey="value" stroke={reportColors[current.type]} fill="url(#rptGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
