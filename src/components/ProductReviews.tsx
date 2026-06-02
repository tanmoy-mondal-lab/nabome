import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, Flag, Reply, Loader2, Edit3, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "../context/AuthContext";
import { useCustomer } from "../context/CustomerContext";
import RatingSummary from "./RatingSummary";
import type { ProductReview, RatingDistribution } from "../types/product";

type Props = {
  reviews: ProductReview[];
  productId: string;
  rating: number;
  reviewCount: number;
  ratingDistribution: RatingDistribution[];
  onAddReview?: (review: { rating: number; title: string; comment: string }) => void;
  onEditReview?: (id: string, review: { rating: number; title: string; comment: string }) => void;
  onDeleteReview?: (id: string) => void;
  onVendorReply?: (reviewId: string, reply: string) => void;
  onReact?: (reviewId: string, type: "like" | "dislike") => void;
  onReport?: (reviewId: string) => void;
  isVendor?: boolean;
  vendorReplied?: Set<string>;
};

export default function ProductReviews({
  reviews, rating, reviewCount, ratingDistribution,
  onAddReview, onEditReview, onDeleteReview, onVendorReply,
  onReact, onReport, isVendor, vendorReplied,
}: Props) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { customer } = useCustomer();
  const [activeTab, setActiveTab] = useState<"reviews" | "write">("reviews");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = !!user;
  const customerName = customer?.name || user?.name || "Customer";

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.comment.trim()) {
      showToast("Please fill in title and comment"); return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onAddReview?.({ rating: form.rating, title: form.title.trim(), comment: form.comment.trim() });
    showToast("Review submitted!");
    setForm({ rating: 5, title: "", comment: "" });
    setActiveTab("reviews");
    setSubmitting(false);
  };

  const handleEdit = (review: ProductReview) => {
    setEditingId(review.id);
    setForm({ rating: review.rating, title: review.title, comment: review.comment });
    setActiveTab("write");
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onEditReview?.(editingId, { rating: form.rating, title: form.title.trim(), comment: form.comment.trim() });
    showToast("Review updated!");
    setEditingId(null);
    setForm({ rating: 5, title: "", comment: "" });
    setActiveTab("reviews");
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    onDeleteReview?.(id);
    showToast("Review deleted");
  };

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) { showToast("Please write a reply"); return; }
    onVendorReply?.(reviewId, replyText.trim());
    showToast("Reply posted");
    setReplyOpen(null);
    setReplyText("");
  };

  const [reactionState, setReactionState] = useState<Record<string, { likes: number; dislikes: number; userLiked: boolean; userDisliked: boolean }>>({});

  const handleReact = (reviewId: string, type: "like" | "dislike") => {
    if (!isLoggedIn) { showToast("Login to react"); return; }
    if (!onReact) {
      setReactionState((prev) => {
        const current = prev[reviewId] || { likes: 0, dislikes: 0, userLiked: false, userDisliked: false };
        const review = reviews.find((r) => r.id === reviewId);
        const baseLikes = review?.reactions.likes || 0;
        const baseDislikes = review?.reactions.dislikes || 0;
        if (type === "like") {
          const wasLiked = current.userLiked;
          return {
            ...prev,
            [reviewId]: {
              likes: wasLiked ? baseLikes - 1 : baseLikes + (current.userDisliked ? 0 : 1),
              dislikes: current.userDisliked ? baseDislikes - 1 : baseDislikes,
              userLiked: !wasLiked,
              userDisliked: false,
            },
          };
        } else {
          const wasDisliked = current.userDisliked;
          return {
            ...prev,
            [reviewId]: {
              likes: current.userLiked ? baseLikes - 1 : baseLikes,
              dislikes: wasDisliked ? baseDislikes - 1 : baseDislikes + 1,
              userLiked: false,
              userDisliked: !wasDisliked,
            },
          };
        }
      });
    } else {
      onReact(reviewId, type);
    }
  };

  const starRow = (rating: number, interactive = false, onClick?: (r: number) => void) => (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onClick?.(star)}
          style={{ background: "none", border: "none", cursor: interactive ? "pointer" : "default", padding: 0 }}
        >
          <Star
            size={interactive ? 28 : 16}
            fill={star <= rating ? "var(--gold)" : "var(--line)"}
            color={star <= rating ? "var(--gold)" : "var(--line)"}
            style={{ transition: "all 0.15s" }}
          />
        </button>
      ))}
    </div>
  );

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1px solid var(--line)",
    background: "var(--surface)", color: "var(--text)", fontSize: ".9rem",
    outline: "none", borderRadius: "var(--radius)",
  };

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <div className="split-intro" style={{ marginBottom: 24 }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Customer Reviews</p>
              <h2 className="heading" style={{ marginTop: 2 }}>What our customers say</h2>
            </div>
            {isLoggedIn && activeTab !== "write" && (
              <button onClick={() => { setEditingId(null); setForm({ rating: 5, title: "", comment: "" }); setActiveTab("write"); }}
                className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".82rem" }}>
                <Edit3 size={14} /> Write a Review
              </button>
            )}
          </div>

          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
            <RatingSummary rating={rating} reviewCount={reviewCount} distribution={ratingDistribution} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--line)", paddingBottom: 0 }}>
          {(["reviews", "write"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px", border: "none", background: "none",
                color: activeTab === tab ? "var(--gold)" : "var(--muted)",
                cursor: "pointer", fontWeight: activeTab === tab ? 600 : 400,
                fontSize: ".9rem", borderBottom: activeTab === tab ? "2px solid var(--gold)" : "2px solid transparent",
                transition: "all 0.2s",
              }}>
              {tab === "reviews" ? `Reviews (${reviews.length})` : "Write a Review"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "write" ? (
            <motion.div key="write" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", maxWidth: 600 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 20 }}>
                  {editingId ? "Edit Your Review" : "Write Your Review"}
                </h3>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 8, display: "block" }}>Rating</label>
                  {starRow(form.rating, true, (r) => setForm((f) => ({ ...f, rating: r })))}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={fieldS} placeholder="Summary of your review" />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Review</label>
                  <textarea rows={4} value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} placeholder="Share your experience with this product..." />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={editingId ? handleUpdate : handleSubmit} disabled={submitting} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                    {submitting ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />}
                    {submitting ? "Submitting..." : editingId ? "Update Review" : "Submit Review"}
                  </button>
                  <button onClick={() => { setEditingId(null); setForm({ rating: 5, title: "", comment: "" }); setActiveTab("reviews"); }}
                    style={{ padding: "0 20px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {reviews.map((review) => {
                    const reactState = reactionState[review.id];
                    const likes = reactState?.likes ?? review.reactions.likes;
                    const dislikes = reactState?.dislikes ?? review.reactions.dislikes;
                    const userLiked = reactState?.userLiked ?? review.reactions.currentUserLiked;
                    const userDisliked = reactState?.userDisliked ?? review.reactions.currentUserDisliked;

                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass"
                        style={{
                          padding: 24, borderRadius: "var(--radius-xl)",
                          border: review.status === "reported" ? "1px solid rgba(231,76,60,0.3)" : "1px solid var(--line)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: "50%",
                              background: "var(--gold-soft)", color: "var(--gold)",
                              display: "grid", placeItems: "center", fontWeight: 700, fontSize: "1rem",
                            }}>
                              {review.customerName.charAt(0)}
                            </div>
                            <div>
                              <h4 style={{ fontWeight: 600, fontSize: ".9rem" }}>{review.customerName}</h4>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {starRow(review.rating)}
                                <span style={{ color: "var(--muted)", fontSize: ".75rem" }}>
                                  {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {review.status === "reported" && (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "4px 10px", borderRadius: 12, fontSize: ".7rem",
                              background: "rgba(231,76,60,0.1)", color: "#e74c3c",
                              border: "1px solid rgba(231,76,60,0.2)",
                            }}>
                              <Flag size={12} /> Reported
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: ".95rem", fontWeight: 600, marginTop: 12 }}>{review.title}</h4>
                        <p style={{ color: "var(--muted)", fontSize: ".88rem", marginTop: 6, lineHeight: 1.6 }}>{review.comment}</p>

                        {review.images.length > 0 && (
                          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            {review.images.map((img) => (
                              <div key={img.id} style={{ width: 64, height: 64, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--surface-strong)" }}>
                                <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => handleReact(review.id, "like")}
                              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: `1px solid ${userLiked ? "var(--gold)" : "var(--line)"}`, background: userLiked ? "var(--gold-soft)" : "transparent", color: userLiked ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                              <ThumbsUp size={13} fill={userLiked ? "var(--gold)" : "none"} /> {likes}
                            </button>
                            <button onClick={() => handleReact(review.id, "dislike")}
                              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: `1px solid ${userDisliked ? "#e74c3c" : "var(--line)"}`, background: userDisliked ? "rgba(231,76,60,0.1)" : "transparent", color: userDisliked ? "#e74c3c" : "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                              <ThumbsDown size={13} fill={userDisliked ? "#e74c3c" : "none"} /> {dislikes}
                            </button>
                          </div>

                          <button onClick={() => onReport?.(review.id)}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                            <Flag size={13} /> Report
                          </button>

                          {customerName === review.customerName && (
                            <>
                              <button onClick={() => handleEdit(review)}
                                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                                <Edit3 size={13} /> Edit
                              </button>
                              <button onClick={() => handleDelete(review.id)}
                                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: "1px solid var(--line)", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                                <Trash2 size={13} /> Delete
                              </button>
                            </>
                          )}

                          {isVendor && !vendorReplied?.has(review.id) && (
                            <button onClick={() => setReplyOpen(replyOpen === review.id ? null : review.id)}
                              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                              <Reply size={13} /> Reply
                            </button>
                          )}
                        </div>

                        {replyOpen === review.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 12 }}>
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply as a vendor..."
                              style={{ ...fieldS, resize: "vertical", marginBottom: 8 }}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => handleReply(review.id)} className="premium-button" style={{ fontSize: ".82rem", padding: "0 16px", minHeight: 36 }}>
                                Post Reply
                              </button>
                              <button onClick={() => { setReplyOpen(null); setReplyText(""); }}
                                style={{ padding: "0 12px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".8rem" }}>
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {review.vendorReply && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{
                              marginTop: 14, padding: "12px 16px", borderRadius: "var(--radius)",
                              background: "var(--gold-soft)", border: "1px solid rgba(212,175,55,0.2)",
                            }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <Reply size={14} style={{ color: "var(--gold)" }} />
                              <span style={{ fontWeight: 600, fontSize: ".82rem", color: "var(--gold)" }}>Vendor Response</span>
                              {review.vendorRepliedAt && (
                                <span style={{ color: "var(--muted)", fontSize: ".72rem", marginLeft: "auto" }}>
                                  {new Date(review.vendorRepliedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: ".85rem", color: "var(--text)", lineHeight: 1.5 }}>{review.vendorReply}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
