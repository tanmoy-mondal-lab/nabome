import { neon, isNeonConnected } from "../lib/neon";

export type CreateReviewInput = {
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
};

export type ReviewData = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  status: string;
  vendorReply: string | null;
  createdAt: string;
};

export async function getProductReviews(productId: string): Promise<ReviewData[]> {
  if (!await isNeonConnected()) return [];

  const { data } = await neon.raw(`
    SELECT
      r.id, r.product_id as "productId", r.user_id as "userId",
      COALESCE(u.full_name, 'Anonymous') as "userName",
      r.rating, COALESCE(r.title, '') as title,
      COALESCE(r.comment, '') as comment,
      COALESCE(r.images, '{}') as images,
      r.is_verified as "isVerified",
      r.status, r.vendor_reply as "vendorReply",
      r.created_at as "createdAt"
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.product_id = $1 AND r.status = 'approved'
    ORDER BY r.created_at DESC
  `, [productId]);

  return (data || []) as ReviewData[];
}

export async function createReview(input: CreateReviewInput) {
  if (!await isNeonConnected()) throw new Error("Database not connected");

  const { data, error } = await neon.insert("reviews", {
    product_id: input.productId,
    user_id: input.userId,
    order_id: input.orderId || null,
    rating: input.rating,
    title: input.title || null,
    comment: input.comment || null,
    images: input.images || [],
    is_verified: !!input.orderId,
    status: "pending",
  });

  if (error) throw error;
  return data?.[0] || null;
}

export async function updateReviewStatus(id: string, status: "approved" | "rejected") {
  if (!await isNeonConnected()) return;
  await neon.update("reviews", { status }, { id });
}

export async function deleteReview(id: string) {
  if (!await isNeonConnected()) return;
  await neon.delete("reviews", { id });
}

export async function getVendorReviews(vendorId: string): Promise<ReviewData[]> {
  if (!await isNeonConnected()) return [];

  const { data } = await neon.raw(`
    SELECT r.*, u.full_name as "userName"
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    LEFT JOIN users u ON u.id = r.user_id
    WHERE p.vendor_id = $1
    ORDER BY r.created_at DESC
  `, [vendorId]);

  return (data || []).map((r: any) => ({
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    userName: r.userName || "Anonymous",
    rating: r.rating,
    title: r.title || "",
    comment: r.comment || "",
    images: r.images || [],
    isVerified: r.is_verified || false,
    status: r.status,
    vendorReply: r.vendor_reply,
    createdAt: r.created_at,
  }));
}

export async function replyToReview(reviewId: string, reply: string) {
  if (!await isNeonConnected()) return;
  await neon.update("reviews", {
    vendor_reply: reply,
    vendor_replied_at: new Date().toISOString(),
  }, { id: reviewId });
}
