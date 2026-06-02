import { neon, isNeonConnected } from "../neon";

export async function getNotifications(userId?: string, vendorId?: string) {
  if (!await isNeonConnected()) return [];
  const filters: Record<string, unknown> = {};
  if (userId) filters.user_id = userId;
  if (vendorId) filters.vendor_id = vendorId;
  const { data } = await neon.select(
    "notifications",
    Object.keys(filters).length ? filters : undefined,
    { order: "created_at", ascending: false, limit: 50 }
  );
  return data || [];
}

export async function markAsRead(id: string) {
  if (!await isNeonConnected()) return;
  await neon.update("notifications", { is_read: true }, { id });
}

export async function markAllAsRead(userId?: string, vendorId?: string) {
  if (!await isNeonConnected()) return;
  const filters: Record<string, unknown> = {};
  if (userId) filters.user_id = userId;
  if (vendorId) filters.vendor_id = vendorId;
  await neon.update("notifications", { is_read: true }, Object.keys(filters).length ? filters : undefined);
}

export async function createNotification(notification: any) {
  if (!await isNeonConnected()) return;
  await neon.insert("notifications", notification);
}

export async function getUnreadCount(userId?: string, vendorId?: string) {
  if (!await isNeonConnected()) return 0;
  const filters: Record<string, unknown> = { is_read: false };
  if (userId) filters.user_id = userId;
  if (vendorId) filters.vendor_id = vendorId;
  const res = await neon.count("notifications", Object.keys(filters).length ? filters : undefined);
  return res.count || 0;
}
