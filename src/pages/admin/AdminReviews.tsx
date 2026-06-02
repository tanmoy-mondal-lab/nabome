import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Eye, EyeOff, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "../../components/Toast";
import { getAllReviews, updateReviewStatus, deleteReview, type Review } from "../../lib/api/reviews";

export default function AdminReviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReviews().then((data) => { setReviews(data); setLoading(false); });
  }, []);

  const handleToggleVisibility = async (id: string) => {
    const r = reviews.find((r) => r.id === id);
    if (!r) return;
    const newStatus = r.status === "approved" ? "rejected" : "approved";
    await updateReviewStatus(id, newStatus);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`Review ${newStatus === "approved" ? "approved" : "hidden"}.`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast("Review deleted.");
  };

  const handleApprove = async (id: string) => {
    await updateReviewStatus(id, "approved");
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
    showToast("Review approved!");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading...</div>;

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
              opacity: review.status === "rejected" ? 0.5 : 1,
              border: review.status === "pending" ? "1px solid #f39c1240" : "1px solid var(--line)",
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
                  <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{review.userName || "Anonymous"}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>· {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {review.status === "pending" && <span style={{ padding: "3px 8px", borderRadius: 8, fontSize: ".68rem", fontWeight: 600, background: "#f39c1218", color: "#f39c12", border: "1px solid #f39c1230" }}>Pending</span>}
                {review.status === "rejected" && <span style={{ padding: "3px 8px", borderRadius: 8, fontSize: ".68rem", fontWeight: 600, background: "#95a5a618", color: "#95a5a6", border: "1px solid #95a5a630" }}>Hidden</span>}
              </div>
            </div>
            {review.comment && (
              <p style={{ fontSize: ".85rem", lineHeight: 1.6, margin: "12px 0", paddingLeft: 52 }}>{review.comment}</p>
            )}
            {review.vendorReply && (
              <div style={{ marginLeft: 52, padding: "10px 14px", background: "var(--surface)", borderRadius: "var(--radius)", borderLeft: "2px solid var(--gold)", marginBottom: 12 }}>
                <p style={{ color: "var(--gold)", fontSize: ".72rem", fontWeight: 600, marginBottom: 2 }}>Vendor Reply</p>
                <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{review.vendorReply}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, paddingLeft: 52 }}>
              {(review.status === "pending" || review.status === "rejected") && (
                <button onClick={() => handleApprove(review.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid #2ecc71", background: "transparent", color: "#2ecc71", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                  <CheckCircle size={12} /> Approve
                </button>
              )}
              {review.status === "approved" && (
                <button onClick={() => handleToggleVisibility(review.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                  <EyeOff size={12} /> Hide
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
