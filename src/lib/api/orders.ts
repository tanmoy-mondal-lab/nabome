import { supabase } from "../supabase";
import { generateMockOrders } from "../mockOrderData";

function isConnected() { return !!supabase; }

export async function getOrders(userId?: string, vendorId?: string) {
  if (!isConnected()) return generateMockOrders(5);
  let query = supabase!.from("orders").select("*").order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);
  if (vendorId) query = query.eq("vendor_id", vendorId);
  const { data } = await query;
  return (data || []).length > 0 ? data : generateMockOrders(5);
}

export async function getOrderById(id: string) {
  if (!isConnected()) return null;
  const { data } = await supabase!.from("orders").select("*").eq("id", id).single();
  return data || null;
}

export async function createOrder(order: any) {
  if (!isConnected()) {
    const orders = JSON.parse(localStorage.getItem("nabome-orders") || "[]");
    const newOrder = { ...order, id: `mock_${Date.now()}`, created_at: new Date().toISOString() };
    orders.push(newOrder);
    localStorage.setItem("nabome-orders", JSON.stringify(orders));
    return newOrder;
  }
  const { data, error } = await supabase!.from("orders").insert(order).select().single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, status: string, trackingNumber?: string) {
  if (!isConnected()) return { id, status };
  const updates: any = { order_status: status };
  if (trackingNumber) updates.tracking_number = trackingNumber;
  const { data, error } = await supabase!.from("orders").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getOrderTimeline(orderId: string) {
  if (!isConnected()) return [];
  const { data } = await supabase!.from("order_timeline").select("*").eq("order_id", orderId).order("created_at");
  return data || [];
}

export async function addTimelineEntry(orderId: string, status: string, label: string, note?: string) {
  if (!isConnected()) return;
  await supabase!.from("order_timeline").insert({ order_id: orderId, status, label, note });
}

export async function getOrderAnalytics(vendorId?: string) {
  if (!isConnected()) return null;
  let query = supabase!.from("orders").select("grand_total, order_status, created_at");
  if (vendorId) query = query.eq("vendor_id", vendorId);
  const { data } = await query;
  if (!data) return null;

  const total = data.reduce((s, o) => s + (o.grand_total || 0), 0);
  const statusBreakdown = data.reduce((acc: any, o) => {
    acc[o.order_status] = (acc[o.order_status] || 0) + 1;
    return acc;
  }, {});

  return { totalRevenue: total, orderCount: data.length, statusBreakdown };
}
