import { supabase } from "../supabase";

function isConnected() { return !!supabase; }

export async function getReviews(productId: string) {
  if (!isConnected()) return [];
  const { data } = await supabase!.from("reviews").select("*, users(name, avatar_url)").eq("product_id", productId).eq("status", "active").order("created_at", { ascending: false });
  return data || [];
}

export async function createReview(review: any) {
  if (!isConnected()) return { id: `mock_${Date.now()}`, ...review };
  const { data, error } = await supabase!.from("reviews").insert(review).select().single();
  if (error) throw error;
  return data;
}

export async function updateReview(id: string, updates: any) {
  if (!isConnected()) return { id, ...updates };
  const { data, error } = await supabase!.from("reviews").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteReview(id: string) {
  if (!isConnected()) return;
  const { error } = await supabase!.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

export async function addVendorReply(reviewId: string, reply: string) {
  if (!isConnected()) return;
  const { error } = await supabase!.from("reviews").update({ vendor_reply: reply, vendor_replied_at: new Date().toISOString() }).eq("id", reviewId);
  if (error) throw error;
}

export async function reactToReview(reviewId: string, userId: string, reaction: "like" | "dislike" | "report") {
  if (!isConnected()) return;
  const { error } = await supabase!.from("review_reactions").upsert(
    { review_id: reviewId, user_id: userId, reaction },
    { onConflict: "review_id,user_id,reaction" }
  );
  if (error) throw error;
}

export async function getReviewStats(productId: string) {
  if (!isConnected()) return null;
  const { data } = await supabase!.from("reviews").select("rating").eq("product_id", productId);
  if (!data || data.length === 0) return null;
  const total = data.length;
  const average = data.reduce((s, r) => s + r.rating, 0) / total;
  const distribution = [0, 0, 0, 0, 0];
  data.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++; });
  return { average, total, distribution };
}
