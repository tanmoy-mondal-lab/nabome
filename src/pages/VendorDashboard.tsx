import { motion } from "framer-motion";
import { Store, Clock, CheckCircle, XCircle, AlertTriangle, BarChart3 } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";

export default function VendorDashboard() {
  const { user } = useAuth();

  const statusConfig = {
    pending: { icon: <Clock size={24} />, color: "#f39c12", title: "Application Pending", message: "Your shop application is under review. We'll notify you once approved." },
    approved: { icon: <CheckCircle size={24} />, color: "#2ecc71", title: "Application Approved", message: "Your shop is active. Start managing your products and orders." },
    rejected: { icon: <XCircle size={24} />, color: "#e74c3c", title: "Application Rejected", message: "Your application was not approved. Contact support for more information." },
    suspended: { icon: <AlertTriangle size={24} />, color: "#e74c3c", title: "Account Suspended", message: "Your vendor account has been suspended. Please contact support." },
  };

  const status = user?.vendorStatus || "pending";
  const config = statusConfig[status];

  return (
    <>
      <SEO title="Vendor Dashboard | নবME" description="Manage your নবME shop." />
      <Navbar />
      <main className="page" style={{ padding: "120px 6%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Store size={28} style={{ color: "var(--gold)" }} />
            <h1 style={{ fontSize: "clamp(1.6rem,4vw,2rem)", fontWeight: 300 }}>Vendor Dashboard</h1>
          </div>
          <p style={{ color: "var(--muted)", marginBottom: 40 }}>
            Welcome, {user?.name || "Vendor"} · {user?.email}
          </p>

          {/* Status card */}
          <div className="glass" style={{ padding: 32, borderRadius: "var(--radius-xl)", marginBottom: 32, border: `1px solid ${config.color}40` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ color: config.color }}>{config.icon}</div>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 4, color: config.color }}>{config.title}</h2>
                <p className="lede" style={{ color: "var(--muted)", fontSize: ".9rem", margin: 0 }}>{config.message}</p>
              </div>
            </div>
          </div>

          {/* Placeholder stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {([
              ["Products", "0", <Store key="sp" size={18} />],
              ["Orders", "0", <BarChart3 key="bo" size={18} />],
              ["Revenue", "₹0", <BarChart3 key="rv" size={18} />],
            ] as [string, string, React.ReactNode][]).map(([label, value, icon]) => (
              <div key={label} className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                <div style={{ color: "var(--gold)", marginBottom: 8, display: "flex", justifyContent: "center" }}>{icon}</div>
                <p style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 8 }}>{label}</p>
                <p style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--text)" }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, padding: 32, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 400, marginBottom: 12 }}>Coming Soon</h3>
            <ul style={{ color: "var(--muted)", lineHeight: 2, fontSize: ".9rem", paddingLeft: 20 }}>
              <li>Product management — add, edit, remove your listings</li>
              <li>Order management — view and fulfill customer orders</li>
              <li>Analytics — sales reports and customer insights</li>
              <li>Payouts — track earnings and withdrawal history</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </>
  );
}
