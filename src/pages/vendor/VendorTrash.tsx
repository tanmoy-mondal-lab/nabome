import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, RefreshCw, Package, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { generateMockTrash } from "../../lib/mockVendorData";
import type { VendorProduct } from "../../types/vendor";

export default function VendorTrash() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [trash, setTrash] = useState<VendorProduct[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) setTrash(generateMockTrash(user.id));
  }, [user]);

  const handleRestore = (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      setTrash((prev) => prev.filter((p) => p.id !== id));
      showToast("Product restored successfully!");
      setActionLoading(null);
    }, 500);
  };

  const handleRequestDelete = (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      showToast("Permanent deletion request sent to admin.");
      setActionLoading(null);
    }, 500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Trash2 size={22} style={{ color: "var(--gold)" }} /> Trash ({trash.length})
        </h1>
      </div>

      {trash.length === 0 ? (
        <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
          <Package size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
          <p style={{ color: "var(--muted)" }}>Trash is empty.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {trash.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 56, height: 56, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                  <img src={product.mainImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{product.name}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>
                    SKU: {product.sku} · Price: ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>
                    Deleted: {new Date(product.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleRestore(product.id)} disabled={actionLoading === product.id}
                    className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px", fontSize: ".78rem", minHeight: 36 }}>
                    {actionLoading === product.id ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
                    Restore
                  </button>
                  <button onClick={() => handleRequestDelete(product.id)} disabled={actionLoading === product.id}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem", fontWeight: 500, minHeight: 36 }}>
                    {actionLoading === product.id ? <Loader2 size={14} className="spin" /> : <AlertCircle size={14} />}
                    Request Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)", marginTop: 24 }}>
        <p style={{ fontSize: ".82rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={14} />
          Soft-deleted products are hidden from the marketplace but kept in the database. You can restore any product. Permanent deletion requires admin approval.
        </p>
      </div>
    </motion.div>
  );
}
