import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { EmptyState } from "../common/EmptyState";
import { StatusBadge } from "../common/StatusBadge";
import { MessageSquare, CheckCircle, XCircle, Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  profile: { id: string; firstName: string; lastName: string; email: string };
  product: { id: string; name: string; slug: string };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter === "pending") params.status = "pending";
      else if (filter === "approved") params.status = "approved";
      const res = await adminApi.getReviews(params);
      setReviews((res.reviews as Review[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleApproval = async (review: Review) => {
    try {
      await adminApi.approveReview(review.id, !review.isApproved);
      fetch();
    } catch { /* ignore */ }
  };

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Product Reviews</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage customer reviews and ratings</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {(["all", "pending", "approved"] as const).map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-xs rounded font-medium capitalize transition-colors ${
              filter === t
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}>
            {t} {t === "pending" && pendingCount > 0 ? `(${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={MessageSquare} title="No reviews found"
            description={filter !== "all" ? "Try changing the filter" : "No reviews have been submitted yet"}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border border-neutral-200 rounded p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14}
                          className={s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-200"} />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    <StatusBadge status={r.isApproved ? "approved" : "pending"} />
                  </div>
                  {r.title && <p className="font-medium text-sm text-neutral-900 mb-1">{r.title}</p>}
                  <p className="text-sm text-neutral-600 mb-2">{r.comment}</p>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span>{r.profile.firstName} {r.profile.lastName}</span>
                    <span>·</span>
                    <span>on <span className="text-neutral-600">{r.product.name}</span></span>
                  </div>
                </div>
                <button onClick={() => toggleApproval(r)}
                  className={`p-2 rounded transition-colors ${
                    r.isApproved
                      ? "text-green-600 hover:bg-green-50"
                      : "text-neutral-400 hover:bg-neutral-100"
                  }`}
                  title={r.isApproved ? "Unapprove" : "Approve review"}>
                  {r.isApproved ? <CheckCircle size={18} /> : <XCircle size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
