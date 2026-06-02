import { neon, isNeonConnected } from "../neon";

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  reason: "defective" | "wrong_item" | "not_as_described" | "size_issue" | "other";
  reasonText?: string;
  images?: string[];
  status: "pending" | "approved" | "rejected" | "refunded" | "completed";
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

function mapRow(row: Record<string, unknown>): ReturnRequest {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    orderItemId: row.order_item_id as string,
    userId: row.user_id as string,
    reason: row.reason as ReturnRequest["reason"],
    reasonText: (row.reason_text as string) || undefined,
    images: row.images ? (typeof row.images === "string" ? JSON.parse(row.images as string) : row.images as string[]) : undefined,
    status: (row.status as ReturnRequest["status"]) || "pending",
    adminNote: (row.admin_note as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getReturns(filter?: { status?: string }): Promise<ReturnRequest[]> {
  if (!(await isNeonConnected())) return [];
  const where: Record<string, unknown> = {};
  if (filter?.status) where.status = filter.status;
  const { data } = await neon.select("returns", where, { order: "created_at", ascending: false });
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function getUserReturns(userId: string): Promise<ReturnRequest[]> {
  if (!(await isNeonConnected())) return [];
  const { data } = await neon.select("returns", { user_id: userId }, { order: "created_at", ascending: false });
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function updateReturnStatus(id: string, status: ReturnRequest["status"], adminNote?: string): Promise<void> {
  if (!(await isNeonConnected())) return;
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (adminNote !== undefined) updates.admin_note = adminNote;
  await neon.update("returns", updates, { id });
}
