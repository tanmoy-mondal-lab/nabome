import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, ThumbsUp, Camera, BadgeCheck, ChevronDown } from "lucide-react";
import { api } from "../../lib/api/client";
import { StarRating } from "./StarRating";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../lib/utils/cn";
import { formatDate } from "../../lib/utils/format";
import { SafeImage } from "../../components/SafeImage";

interface ReviewsProps {
  productId: string;
  slug: string;
}

export function Reviews({ productId, slug }: ReviewsProps) {
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reviews", slug, page],
    queryFn: () => api.get<{ reviews: Record<string, unknown>[]; stats: { total: number; averageRating: number; distribution: Record<string, number> } }>(
      `/api/products/${slug}/reviews`, { params: { page } }
    ),
  });

  const submitMutation = useMutation({
    mutationFn: (body: { productId: string; rating: number; title: string; body: string }) =>
      api.post("/api/reviews", body),
    onSuccess: () => { setShowForm(false); setForm({ rating: 5, title: "", body: "" }); refetch(); },
  });

  const reviews = (data?.reviews ?? []) as Record<string, unknown>[];
  const stats = data?.stats ?? { total: 0, averageRating: 0, distribution: {} };

  const distTotal = Object.values(stats.distribution as Record<string, number> || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h2 className="text-xl font-display text-neutral-900">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={stats.averageRating} size={18} showValue />
            <span className="text-sm text-neutral-500">({stats.total} {stats.total === 1 ? "review" : "reviews"})</span>
          </div>
          {stats.total > 0 && (
            <div className="mt-4 space-y-1 max-w-[200px]">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = (stats.distribution as Record<string, number>)?.[String(star)] || 0;
                const pct = (count / distTotal) * 100;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-500 w-6">{star}</span>
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-neutral-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {isAuthenticated && (
          <button onClick={() => setShowForm(!showForm)} className="border border-neutral-900 px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors whitespace-nowrap shrink-0">
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-neutral-50 border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-neutral-700">Your Rating:</p>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setForm({ ...form, rating: star })}>
                <Star className={cn("w-6 h-6 transition-colors", star <= form.rating ? "text-amber-400 fill-amber-400" : "text-neutral-300 hover:text-amber-300")} />
              </button>
            ))}
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Review title" className="input-field w-full px-4 py-2 text-sm" />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Share your experience... What did you love? How was the fit?" rows={4} className="input-field w-full px-4 py-2 text-sm" />
          <button
            onClick={() => submitMutation.mutate({ productId, rating: form.rating, title: form.title, body: form.body })}
            disabled={!form.body || submitMutation.isPending}
            className="bg-neutral-900 text-white px-8 py-2.5 text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-400">No reviews yet. Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const profile = review.profile as Record<string, unknown> ?? {};
            const hasVerifiedPurchase = review.verified as boolean || review.verifiedPurchase as boolean;
            return (
              <div key={review.id as string} className="border-b border-neutral-100 pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-sm font-display text-brand-600">
                    {((profile.firstName as string)?.[0] || "U").toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-900">{profile.firstName as string || "Anonymous"}</p>
                      {hasVerifiedPurchase && (
                        <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating as number} size={11} />
                      <span className="text-[10px] text-neutral-400">{formatDate(review.createdAt as string)}</span>
                    </div>
                  </div>
                </div>
                {!!review.title && <p className="text-sm font-medium text-neutral-900 mb-1">{review.title as string}</p>}
                <p className="text-sm text-neutral-600 leading-relaxed">{review.body as string}</p>
                {(review.images as string[])?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {(review.images as string[]).map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded overflow-hidden bg-neutral-50">
                        <SafeImage src={img} alt={`Review image ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
