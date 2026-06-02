import { supabase } from "../supabase";

function isConnected() { return !!supabase; }

export async function getNotifications(userId?: string, vendorId?: string) {
  if (!isConnected()) return [];
  let query = supabase!.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
  if (userId) query = query.eq("user_id", userId);
  if (vendorId) query = query.eq("vendor_id", vendorId);
  const { data } = await query;
  return data || [];
}

export async function markAsRead(id: string) {
  if (!isConnected()) return;
  await supabase!.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllAsRead(userId?: string, vendorId?: string) {
  if (!isConnected()) return;
  let query = supabase!.from("notifications").update({ is_read: true });
  if (userId) query = query.eq("user_id", userId);
  if (vendorId) query = query.eq("vendor_id", vendorId);
  await query;
}

export async function createNotification(notification: any) {
  if (!isConnected()) return;
  await supabase!.from("notifications").insert(notification);
}

export async function getUnreadCount(userId?: string, vendorId?: string) {
  if (!isConnected()) return 0;
  let query = supabase!.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false);
  if (userId) query = query.eq("user_id", userId);
  if (vendorId) query = query.eq("vendor_id", vendorId);
  const { count } = await query;
  return count || 0;
}
