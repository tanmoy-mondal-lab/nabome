import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Eye, EyeOff, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "../../components/Toast";
import { generateMockAdminReviews } from "../../lib/mockAdminData";
import type { AdminReview } from "../../types/admin";

export default function AdminReviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);

  useEffect(() => { setReviews(generateMockAdminReviews()); }, []);

  const handleHide = (id: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === "hidden" ? "visible" : "hidden" } : r));
    showToast("Review visibility updated.");
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast("Review deleted.");
  };

  const handleApprove = (id: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "visible" } : r));
    showToast("Review approved!");
  };


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Star size={22} style={{ color: "var(--gold)" }} /> Review Management ({reviews.length})
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {reviews.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass" style={{
              padding: 24, borderRadius: "var(--radius-lg)",
              opacity: review.status === "hidden" ? 0.5 : 1,
              border: review.status === "reported" ? "1px solid #e74c3c40" : "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill={s <= review.rating ? "var(--gold)" : "none"} color={s <= review.rating ? "var(--gold)" : "var(--line)"} />
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{review.customerName}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>on {review.productName} · {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {review.status === "reported" && <span style={{ padding: "3px 8px", borderRadius: 8, fontSize: ".68rem", fontWeight: 600, background: "#e74c3c18", color: "#e74c3c", border: "1px solid #e74c3c30" }}>Reported</span>}
                {review.status === "hidden" && <span style={{ padding: "3px 8px", borderRadius: 8, fontSize: ".68rem", fontWeight: 600, background: "#95a5a618", color: "#95a5a6", border: "1px solid #95a5a630" }}>Hidden</span>}
              </div>
            </div>
            <p style={{ fontSize: ".85rem", lineHeight: 1.6, margin: "12px 0", paddingLeft: 52 }}>{review.comment}</p>
            {review.reply && (
              <div style={{ marginLeft: 52, padding: "10px 14px", background: "var(--surface)", borderRadius: "var(--radius)", borderLeft: "2px solid var(--gold)", marginBottom: 12 }}>
                <p style={{ color: "var(--gold)", fontSize: ".72rem", fontWeight: 600, marginBottom: 2 }}>Vendor Reply</p>
                <p style={{ color: "var(--muted)", fontSize: .82 }}>{review.reply}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, paddingLeft: 52 }}>
              {(review.status === "reported" || review.status === "hidden") && (
                <button onClick={() => handleApprove(review.id)} title={review.status === "reported" ? "Clear report" : "Show"}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid #2ecc71", background: "transparent", color: "#2ecc71", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                  <CheckCircle size={12} /> {review.status === "reported" ? "Clear Report" : "Approve"}
                </button>
              )}
              {review.status !== "reported" && (
                <button onClick={() => handleHide(review.id)} title={review.status === "hidden" ? "Show" : "Hide"}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                  {review.status === "hidden" ? <Eye size={12} /> : <EyeOff size={12} />} {review.status === "hidden" ? "Show" : "Hide"}
                </button>
              )}
              <button onClick={() => handleDelete(review.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
