import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Search, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getVendorByUserId } from "../../lib/api/vendors";
import { getVendorInventory, updateStock, type InventoryItem } from "../../lib/api/inventory";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

export default function VendorInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const vendor = await getVendorByUserId(user.id);
      if (vendor) {
        const data = await getVendorInventory(vendor.id);
        setItems(data);
      }
      setLoading(false);
    })();
  }, [user]);

  const filtered = items.filter((item) =>
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );
  const pag = usePagination(filtered, 12);

  const stats = {
    total: items.reduce((s, i) => s + i.stock, 0),
    lowStock: items.filter((i) => i.stock > 0 && i.stock <= 5).length,
    outOfStock: items.filter((i) => i.stock === 0).length,
  };

  const handleStockUpdate = async (productId: string) => {
    const val = editingStock[productId];
    if (val === undefined || val < 0) return;
    await updateStock(productId, val);
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, stock: val } : i));
    setEditingStock((prev) => { const n = { ...prev }; delete n[productId]; return n; });
  };

  if (loading) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <ClipboardList size={22} style={{ color: "var(--gold)" }} /> Inventory
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Stock", value: stats.total, icon: <Package size={18} />, color: "#3498db" },
          { label: "Low Stock", value: stats.lowStock, icon: <AlertTriangle size={18} />, color: "#f39c12" },
          { label: "Out of Stock", value: stats.outOfStock, icon: <AlertTriangle size={18} />, color: "#e74c3c" },
          { label: "Products", value: items.length, icon: <TrendingUp size={18} />, color: "#2ecc71" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)", textAlign: "center" }}>
            <div style={{ color, marginBottom: 8, display: "flex", justifyContent: "center" }}>{icon}</div>
            <p style={{ fontSize: "1.3rem", fontWeight: 300 }}>{value}</p>
            <p style={{ color: "var(--muted)", fontSize: ".75rem", marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pag.data.map((item, i) => {
          const status: "in_stock" | "low_stock" | "out_of_stock" = item.stock === 0 ? "out_of_stock" : item.stock <= 5 ? "low_stock" : "in_stock";
          const config = status === "in_stock" ? { label: "In Stock", color: "#2ecc71", bg: "#2ecc7118" } : status === "low_stock" ? { label: "Low Stock", color: "#f39c12", bg: "#f39c1218" } : { label: "Out of Stock", color: "#e74c3c", bg: "#e74c3c18" };
          return (
            <motion.div key={item.productId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 48, height: 48, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: ".72rem" }}>N/A</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontWeight: 500, fontSize: ".85rem" }}>{item.name}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>SKU: {item.sku}</p>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {editingStock[item.productId] !== undefined ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="number" value={editingStock[item.productId]} onChange={(e) => setEditingStock((prev) => ({ ...prev, [item.productId]: Number(e.target.value) }))}
                        style={{ width: 70, padding: "6px 8px", border: "1px solid var(--gold)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".85rem", textAlign: "center", outline: "none" }}
                      />
                      <button onClick={() => handleStockUpdate(item.productId)} className="premium-button" style={{ padding: "0 12px", fontSize: ".72rem", minHeight: 32 }}>Save</button>
                      <button onClick={() => setEditingStock((prev) => { const n = { ...prev }; delete n[item.productId]; return n; })}
                        style={{ padding: "0 10px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".72rem", minHeight: 32 }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setEditingStock((prev) => ({ ...prev, [item.productId]: item.stock }))}>
                      <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{item.stock}</p>
                      <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>Stock</p>
                    </div>
                  )}
                  <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: ".72rem", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.bg}` }}>
                    {config.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <Pagination page={pag.page} totalPages={pag.totalPages} total={pag.total} from={pag.from} to={pag.to} onPageChange={pag.goToPage} />
    </motion.div>
  );
}
