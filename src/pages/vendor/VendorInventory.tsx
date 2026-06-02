import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Search, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { generateMockInventory, generateMockInventoryHistory } from "../../lib/mockVendorData";
import type { InventoryItem, InventoryHistoryEntry } from "../../types/vendor";

const stockStatusConfig = {
  in_stock: { label: "In Stock", color: "#2ecc71", bg: "#2ecc7118" },
  low_stock: { label: "Low Stock", color: "#f39c12", bg: "#f39c1218" },
  out_of_stock: { label: "Out of Stock", color: "#e74c3c", bg: "#e74c3c18" },
};

export default function VendorInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<InventoryHistoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      setItems(generateMockInventory());
      setHistory(generateMockInventoryHistory());
    }
  }, [user]);

  const filtered = items.filter((item) =>
    !search || item.productName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: items.reduce((s, i) => s + i.currentStock, 0),
    lowStock: items.filter((i) => i.status === "low_stock").length,
    outOfStock: items.filter((i) => i.status === "out_of_stock").length,
    soldToday: items.reduce((s, i) => s + i.soldToday, 0),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <ClipboardList size={22} style={{ color: "var(--gold)" }} /> Inventory
        </h1>
        <button onClick={() => setShowHistory(!showHistory)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".82rem", fontWeight: 500 }}>
          {showHistory ? "View Stock" : "View History"}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Stock", value: stats.total, icon: <Package size={18} />, color: "#3498db" },
          { label: "Low Stock", value: stats.lowStock, icon: <AlertTriangle size={18} />, color: "#f39c12" },
          { label: "Out of Stock", value: stats.outOfStock, icon: <AlertTriangle size={18} />, color: "#e74c3c" },
          { label: "Sold Today", value: stats.soldToday, icon: <TrendingUp size={18} />, color: "#2ecc71" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)", textAlign: "center" }}>
            <div style={{ color, marginBottom: 8, display: "flex", justifyContent: "center" }}>{icon}</div>
            <p style={{ fontSize: "1.3rem", fontWeight: 300 }}>{value}</p>
            <p style={{ color: "var(--muted)", fontSize: ".75rem", marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>

      {showHistory ? (
        /* History view */
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Inventory History</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((entry) => (
              <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: ".85rem" }}>{entry.productName}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{entry.note}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: entry.type === "sale" ? "#e74c3c" : "#2ecc71", fontWeight: 700 }}>
                    {entry.type === "sale" || entry.type === "adjustment" && entry.quantity < 0 ? "" : "+"}{entry.quantity}
                  </span>
                  <p style={{ color: "var(--muted)", fontSize: ".72rem", marginTop: 2 }}>
                    {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Stock view */
        <>
          <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            <input type="search" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((item, i) => {
              const config = stockStatusConfig[item.status];
              return (
                <motion.div key={item.productId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                      <img src={item.productImage} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <p style={{ fontWeight: 500, fontSize: ".85rem" }}>{item.productName}</p>
                      <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>Last restocked: {new Date(item.lastRestocked).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{item.currentStock}</p>
                        <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>Current</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{item.soldToday}</p>
                        <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>Sold Today</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{item.soldThisMonth}</p>
                        <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>This Month</p>
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: ".72rem", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.bg}` }}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
