import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Flag, Send, User } from "lucide-react";
import { useToast } from "../../components/Toast";
import { generateMockReviews } from "../../lib/mockVendorData";
import type { VendorReview } from "../../types/vendor";

export default function VendorReviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    setReviews(generateMockReviews());
  }, []);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingDist = [0, 0, 0, 0, 0];
  reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating - 1]++; });

  const handleReply = (reviewId: string) => {
    const text = replyInput[reviewId]?.trim();
    if (!text) return;
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, reply: text } : r));
    showToast("Reply posted!");
    setReplyInput((prev) => ({ ...prev, [reviewId]: "" }));
    setReplyingTo(null);
  };

  const handleReport = (reviewId: string) => {
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, reported: true } : r));
    showToast("Review reported to admin.");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Star size={22} style={{ color: "var(--gold)" }} /> Reviews ({reviews.length})
        </h1>
      </div>

      {/* Rating summary */}
      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24, display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", fontWeight: 300, color: "var(--gold)" }}>{avgRating.toFixed(1)}</p>
          <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>Average Rating</p>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDist[star - 1];
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: ".78rem", color: "var(--muted)", minWidth: 30 }}>{star} ★</span>
                <div style={{ flex: 1, height: 8, background: "var(--surface-strong)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold)", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: ".78rem", color: "var(--muted)", minWidth: 24, textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {reviews.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}>
                  <User size={18} style={{ color: "var(--muted)" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{review.customerName}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill={s <= review.rating ? "var(--gold)" : "none"} color={s <= review.rating ? "var(--gold)" : "var(--line)"} />
                  ))}
                </div>
                {!review.reported && (
                  <button onClick={() => handleReport(review.id)} title="Report"
                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "grid", placeItems: "center" }}>
                    <Flag size={14} />
                  </button>
                )}
              </div>
            </div>
            <p style={{ color: "var(--muted)", fontSize: ".82rem", margin: "12px 0", paddingLeft: 52 }}>
              Reviewed on: {review.productName}
            </p>
            <p style={{ fontSize: ".9rem", lineHeight: 1.6, paddingLeft: 52 }}>{review.comment}</p>

            {/* Reply */}
            {review.reply && (
              <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--surface)", borderRadius: "var(--radius)", marginLeft: 52, borderLeft: "2px solid var(--gold)" }}>
                <p style={{ color: "var(--gold)", fontSize: ".78rem", fontWeight: 600, marginBottom: 4 }}>Your Reply</p>
                <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{review.reply}</p>
              </div>
            )}

            {/* Reply form */}
            <div style={{ marginTop: 12, paddingLeft: 52 }}>
              {replyingTo === review.id ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={replyInput[review.id] || ""} onChange={(e) => setReplyInput((prev) => ({ ...prev, [review.id]: e.target.value }))}
                    placeholder="Write your reply..."
                    style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".85rem", outline: "none" }}
                    onKeyDown={(e) => e.key === "Enter" && handleReply(review.id)}
                  />
                  <button onClick={() => handleReply(review.id)}
                    className="premium-button" style={{ padding: "0 16px", fontSize: ".78rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <Send size={12} /> Reply
                  </button>
                  <button onClick={() => setReplyingTo(null)}
                    style={{ padding: "0 12px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                !review.reply && (
                  <button onClick={() => setReplyingTo(review.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                    <MessageSquare size={14} /> Reply
                  </button>
                )
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
