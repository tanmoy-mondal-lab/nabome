import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Check, X, Loader2, Percent } from "lucide-react";
import { validateCoupon } from "../lib/mockOrderData";
import { useToast } from "./Toast";
import type { CouponRedemption } from "../types/order";

type Props = {
  subtotal: number;
  onApply: (coupon: CouponRedemption) => void;
  onRemove: () => void;
  applied?: CouponRedemption | null;
};

export default function CouponInput({ subtotal, onApply, onRemove, applied }: Props) {
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) { setError("Enter a coupon code"); return; }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 500));
    const result = validateCoupon(code.trim(), subtotal);
    setLoading(false);
    if (result.isValid) {
      onApply(result);
      showToast(`Coupon applied! ${result.type === "free_shipping" ? "Free shipping!" : result.type === "percentage" ? `${result.value}% off` : `₹${result.value} off`}`);
      setCode("");
    } else {
      setError(result.error || "Invalid coupon");
    }
  };

  return (
    <div>
      {applied ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: "var(--radius)",
            background: "rgba(46,204,113,0.08)",
            border: "1px solid rgba(46,204,113,0.2)",
          }}
        >
          <Check size={16} style={{ color: "#2ecc71", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: ".85rem", color: "#2ecc71" }}>
              {applied.code}
            </p>
            <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>
              {applied.type === "free_shipping" ? "Free Shipping" : applied.type === "percentage" ? `${applied.value}% off` : `₹${applied.value} off`}
              {applied.discount > 0 && ` — Saved ₹${applied.discount.toLocaleString("en-IN")}`}
            </p>
          </div>
          <button onClick={onRemove}
            style={{ width: 28, height: 28, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "50%", display: "grid", placeItems: "center" }}>
            <X size={14} />
          </button>
        </motion.div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Tag size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="Enter coupon code"
                style={{
                  width: "100%", padding: "12px 12px 12px 38px",
                  border: `1px solid ${error ? "#e74c3c" : "var(--line)"}`,
                  background: "var(--surface)", color: "var(--text)",
                  borderRadius: "var(--radius)", fontSize: ".85rem",
                  outline: "none", textTransform: "uppercase",
                }}
              />
            </div>
            <button onClick={handleApply} disabled={loading}
              style={{
                padding: "0 18px", border: "1px solid var(--gold)",
                background: loading ? "var(--gold-soft)" : "transparent",
                color: "var(--gold)", cursor: loading ? "not-allowed" : "pointer",
                borderRadius: "var(--radius)", fontWeight: 600, fontSize: ".82rem",
                whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
              }}>
              {loading ? <Loader2 size={14} className="spin" /> : <Percent size={14} />}
              Apply
            </button>
          </div>
          {error && <p style={{ color: "#e74c3c", fontSize: ".78rem", marginTop: 6 }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
