import { neon, isNeonConnected } from "../neon";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName?: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  status: "pending" | "approved" | "rejected";
  likesCount: number;
  dislikesCount: number;
  vendorReply?: string;
  vendorRepliedAt?: string;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    userId: row.user_id as string,
    userName: (row.user_name as string) || undefined,
    orderId: (row.order_id as string) || undefined,
    rating: Number(row.rating),
    title: (row.title as string) || undefined,
    comment: (row.comment as string) || undefined,
    images: row.images ? (typeof row.images === "string" ? JSON.parse(row.images as string) : row.images as string[]) : undefined,
    isVerified: !!row.is_verified,
    status: (row.status as Review["status"]) || "approved",
    likesCount: Number(row.likes_count || 0),
    dislikesCount: Number(row.dislikes_count || 0),
    vendorReply: (row.vendor_reply as string) || undefined,
    vendorRepliedAt: (row.vendor_replied_at as string) || undefined,
    createdAt: row.created_at as string,
  };
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!(await isNeonConnected())) return [];
  const { data } = await neon.select("reviews", { product_id: productId, status: "approved" }, { order: "created_at", ascending: false });
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function getAllReviews(filter?: { status?: string }): Promise<Review[]> {
  if (!(await isNeonConnected())) return [];
  const where: Record<string, unknown> = {};
  if (filter?.status) where.status = filter.status;
  const { data } = await neon.select("reviews", where, { order: "created_at", ascending: false });
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function getVendorReviews(vendorId: string): Promise<Review[]> {
  if (!(await isNeonConnected())) return [];
  const { data } = await neon.raw(
    `SELECT r.*, p.name as product_name FROM reviews r JOIN products p ON p.id = r.product_id WHERE p.vendor_id = $1 ORDER BY r.created_at DESC`,
    [vendorId],
  );
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function updateReviewStatus(id: string, status: "approved" | "rejected"): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.update("reviews", { status }, { id });
}

export async function replyToReview(id: string, reply: string): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.update("reviews", { vendor_reply: reply, vendor_replied_at: new Date().toISOString() }, { id });
}

export async function deleteReview(id: string): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.delete("reviews", { id });
}
