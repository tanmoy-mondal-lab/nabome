import { neon, isNeonConnected } from "../neon";

export interface Notification {
  id: string;
  userId?: string;
  vendorId?: string;
  type: "order" | "product" | "review" | "vendor" | "system" | "promotion" | "return" | "support";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    userId: (row.user_id as string) || undefined,
    vendorId: (row.vendor_id as string) || undefined,
    type: row.type as Notification["type"],
    title: row.title as string,
    message: row.message as string,
    data: row.data ? (typeof row.data === "string" ? JSON.parse(row.data as string) : row.data as Record<string, unknown>) : undefined,
    isRead: !!row.is_read,
    createdAt: row.created_at as string,
  };
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  if (!(await isNeonConnected())) return [];
  const { data } = await neon.select("notifications", { user_id: userId }, { order: "created_at", ascending: false });
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function markAsRead(notificationId: string): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.update("notifications", { is_read: true }, { id: notificationId });
}

export async function markAllAsRead(userId: string): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.raw(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, [userId]);
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!(await isNeonConnected())) return 0;
  const { count } = await neon.count("notifications", { user_id: userId, is_read: false });
  return count || 0;
}
