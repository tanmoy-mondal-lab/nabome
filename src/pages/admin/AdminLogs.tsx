import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Search, Shield, CheckCircle, XCircle, Package, ShoppingBag, User } from "lucide-react";
import { getLogs, type LogEntry } from "../../lib/api/logs";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  vendor_approval: { icon: <CheckCircle size={14} />, color: "#2ecc71" },
  vendor_rejection: { icon: <XCircle size={14} />, color: "#e74c3c" },
  product_approval: { icon: <Package size={14} />, color: "#3498db" },
  product_rejection: { icon: <XCircle size={14} />, color: "#f39c12" },
  order_update: { icon: <ShoppingBag size={14} />, color: "#9b59b6" },
  admin_action: { icon: <Shield size={14} />, color: "#d4af37" },
  customer_action: { icon: <User size={14} />, color: "#1abc9c" },
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLogs({ limit: 100 }).then((data) => { setLogs(data); setLoading(false); });
  }, []);

  const entityToType = (entityType: string): string => {
    if (entityType === "vendor" || entityType === "vendor_approval") return "vendor_approval";
    if (entityType === "product") return "product_approval";
    if (entityType === "order") return "order_update";
    if (entityType === "user") return "customer_action";
    return "admin_action";
  };

  const filtered = logs.filter((l) => {
    const type = entityToType(l.entityType);
    if (filter !== "all" && type !== filter) return false;
    if (search && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.entityType.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pag = usePagination(filtered, 12);

  const types = ["all", "vendor_approval", "vendor_rejection", "product_approval", "product_rejection", "order_update", "admin_action", "customer_action"];

  const chipS = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px", border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`, background: active ? "var(--gold-soft)" : "transparent", color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: 16, fontSize: ".72rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap", transition: "all var(--transition-fast)",
  });

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <ClipboardList size={22} style={{ color: "var(--gold)" }} /> System Logs ({logs.length})
        </h1>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)} style={chipS(filter === t)}>
            {t === "all" ? "All" : t.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pag.data.map((log, i) => {
          const type = entityToType(log.entityType);
          const config = typeConfig[type] || typeConfig.admin_action;
          return (
            <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="glass" style={{ padding: 16, borderRadius: "var(--radius-lg)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${config.color}18`, display: "grid", placeItems: "center", color: config.color, flexShrink: 0 }}>
                  {config.icon}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{log.action}</p>
                    <span style={{ color: "var(--muted)", fontSize: ".75rem" }}>— {log.entityType}</span>
                    {log.entityId && <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: ".65rem", fontWeight: 600, background: `${config.color}18`, color: config.color }}>#{log.entityId.slice(0, 8)}</span>}
                  </div>
                  {log.details && (
                    <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>{JSON.stringify(log.details).slice(0, 100)}</p>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {log.userId && <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>user: {log.userId.slice(0, 8)}</p>}
                  <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>{new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
            <ClipboardList size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
            <p style={{ color: "var(--muted)" }}>No logs found.</p>
          </div>
        )}
      </div>
      <Pagination page={pag.page} totalPages={pag.totalPages} total={pag.total} from={pag.from} to={pag.to} onPageChange={pag.goToPage} />
    </motion.div>
  );
}
