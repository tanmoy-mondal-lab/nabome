import { neon, isNeonConnected } from "../neon";

export async function getReviews(productId: string) {
  if (!await isNeonConnected()) return [];
  const { data } = await neon.raw(
    `SELECT r.*, u.name, u.avatar_url FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.product_id = $1 AND r.status = 'active' ORDER BY r.created_at DESC`,
    [productId]
  );
  return data || [];
}

export async function createReview(review: any) {
  if (!await isNeonConnected()) return { id: `mock_${Date.now()}`, ...review };
  const { data, error } = await neon.insert("reviews", review);
  if (error) throw error;
  return data?.[0] || null;
}

export async function updateReview(id: string, updates: any) {
  if (!await isNeonConnected()) return { id, ...updates };
  const { data, error } = await neon.update("reviews", updates, { id });
  if (error) throw error;
  return data?.[0] || null;
}

export async function deleteReview(id: string) {
  if (!await isNeonConnected()) return;
  const { error } = await neon.delete("reviews", { id });
  if (error) throw error;
}

export async function addVendorReply(reviewId: string, reply: string) {
  if (!await isNeonConnected()) return;
  const { error } = await neon.update("reviews", { vendor_reply: reply, vendor_replied_at: new Date().toISOString() }, { id: reviewId });
  if (error) throw error;
}

export async function reactToReview(reviewId: string, userId: string, reaction: "like" | "dislike" | "report") {
  if (!await isNeonConnected()) return;
  const { error } = await neon.insert("review_reactions", { review_id: reviewId, user_id: userId, reaction });
  if (error) {
    // Upsert fallback: delete then insert
    await neon.delete("review_reactions", { review_id: reviewId, user_id: userId, reaction });
    const { error: retryErr } = await neon.insert("review_reactions", { review_id: reviewId, user_id: userId, reaction });
    if (retryErr) throw retryErr;
  }
}

export async function getReviewStats(productId: string) {
  if (!await isNeonConnected()) return null;
  const { data } = await neon.select("reviews", { product_id: productId, status: "active" }, { columns: "rating" });
  if (!data || data.length === 0) return null;
  const total = data.length;
  const average = data.reduce((s: number, r: any) => s + r.rating, 0) / total;
  const distribution = [0, 0, 0, 0, 0];
  data.forEach((r: any) => { if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++; });
  return { average, total, distribution };
}
