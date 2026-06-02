import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, RefreshCw, Package, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { getVendorByUserId } from "../../lib/api/vendors";
import { getVendorProductsList } from "../../lib/api/products";
import type { VendorProductListItem } from "../../lib/api/products";

export default function VendorTrash() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [trash, setTrash] = useState<VendorProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const vendor = await getVendorByUserId(user.id);
      if (vendor) {
        const products = await getVendorProductsList(vendor.id);
        setTrash(products.filter((p) => p.status === "archived"));
      }
      setLoading(false);
    })();
  }, [user]);

  const handleRestore = async (id: string) => {
    const { neon, isNeonConnected } = await import("../../lib/neon");
    if (await isNeonConnected()) {
      await neon.update("products", { status: "draft" }, { id });
    }
    setTrash((prev) => prev.filter((p) => p.id !== id));
    showToast("Product restored successfully!");
  };

  if (loading) return null;

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
                  {(product.images?.[0] as { url?: string } | undefined)?.url ? (
                    <img src={(product.images[0] as { url: string }).url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: ".72rem" }}>N/A</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{product.name}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>
                    Price: ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>
                    Deleted: {product.updated_at ? new Date(product.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleRestore(product.id)}
                    className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px", fontSize: ".78rem", minHeight: 36 }}>
                    <RefreshCw size={14} /> Restore
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
          Archived products are hidden from the marketplace but kept in the database. You can restore any product.
        </p>
      </div>
    </motion.div>
  );
}
