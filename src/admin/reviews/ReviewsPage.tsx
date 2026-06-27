import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../components/ui/Toast";
import { adminApi } from "../../lib/api/admin";
import { EmptyState } from "../common/EmptyState";
import { StatusBadge } from "../common/StatusBadge";
import { MessageSquare, CheckCircle, XCircle, Star } from "lucide-react";
import { formatDate } from "../../lib/utils/format";

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
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["admin", "reviews", filter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filter === "pending") params.status = "pending";
      else if (filter === "approved") params.status = "approved";
      const res = await adminApi.getReviews(params);
      return ((res.reviews as Review[]) ?? []);
    },
    staleTime: 30_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async (review: Review) => {
      await adminApi.approveReview(review.id, !review.isApproved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast("Review updated", "success");
    },
    onError: () => {
      toast("Failed to update review", "error");
    },
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading reviews…</span>
        </div>
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
        <EmptyState icon={MessageSquare} title="No reviews found"
          description={filter !== "all" ? "Try changing the filter" : "No reviews have been submitted yet"}
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="premium-card rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14}
                          className={s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-200"} />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-400">{formatDate(r.createdAt)}</span>
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
                <button onClick={() => toggleMutation.mutate(r)}
                  disabled={toggleMutation.isPending}
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
