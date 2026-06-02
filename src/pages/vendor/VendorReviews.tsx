import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Flag, Send, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { getVendorByUserId } from "../../lib/api/vendors";
import { getVendorReviews, replyToReview, updateReviewStatus, type Review } from "../../lib/api/reviews";

export default function VendorReviews() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const vendor = await getVendorByUserId(user.id);
      if (vendor) {
        const data = await getVendorReviews(vendor.id);
        setReviews(data);
      }
      setLoading(false);
    })();
  }, [user]);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingDist = [0, 0, 0, 0, 0];
  reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating - 1]++; });

  const handleReply = async (reviewId: string) => {
    const text = replyInput[reviewId]?.trim();
    if (!text) return;
    await replyToReview(reviewId, text);
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, vendorReply: text, vendorRepliedAt: new Date().toISOString() } : r));
    showToast("Reply posted!");
    setReplyInput((prev) => ({ ...prev, [reviewId]: "" }));
    setReplyingTo(null);
  };

  const handleReport = async (reviewId: string) => {
    await updateReviewStatus(reviewId, "rejected");
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast("Review removed.");
  };

  if (loading) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Star size={22} style={{ color: "var(--gold)" }} /> Reviews ({reviews.length})
        </h1>
      </div>

      {reviews.length > 0 && (
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
      )}

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
                  <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{review.userName || "Anonymous"}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill={s <= review.rating ? "var(--gold)" : "none"} color={s <= review.rating ? "var(--gold)" : "var(--line)"} />
                  ))}
                </div>
                <button onClick={() => handleReport(review.id)} title="Remove"
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Flag size={14} />
                </button>
              </div>
            </div>
            {review.comment && (
              <p style={{ fontSize: ".9rem", lineHeight: 1.6, paddingLeft: 52, marginTop: 12 }}>{review.comment}</p>
            )}

            {review.vendorReply && (
              <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--surface)", borderRadius: "var(--radius)", marginLeft: 52, borderLeft: "2px solid var(--gold)" }}>
                <p style={{ color: "var(--gold)", fontSize: ".78rem", fontWeight: 600, marginBottom: 4 }}>Your Reply</p>
                <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{review.vendorReply}</p>
              </div>
            )}

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
                !review.vendorReply && (
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
