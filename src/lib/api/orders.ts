import { neon, isNeonConnected } from "../neon";
import { generateMockOrders } from "../mockOrderData";

export async function getOrders(userId?: string, vendorId?: string) {
  if (!await isNeonConnected()) return generateMockOrders(5);
  const filters: Record<string, unknown> = {};
  if (userId) filters.user_id = userId;
  if (vendorId) filters.vendor_id = vendorId;
  const { data } = await neon.select("orders", Object.keys(filters).length ? filters : undefined, { order: "created_at", ascending: false });
  return (data || []).length > 0 ? data : generateMockOrders(5);
}

export async function getOrderById(id: string) {
  if (!await isNeonConnected()) return null;
  const { data } = await neon.select("orders", { id }, { single: true });
  return data || null;
}

export async function createOrder(order: any) {
  if (!await isNeonConnected()) {
    const orders = JSON.parse(localStorage.getItem("nabome-orders") || "[]");
    const newOrder = { ...order, id: `mock_${Date.now()}`, created_at: new Date().toISOString() };
    orders.push(newOrder);
    localStorage.setItem("nabome-orders", JSON.stringify(orders));
    return newOrder;
  }
  const { data, error } = await neon.insert("orders", order);
  if (error) throw error;
  return data?.[0] || null;
}

export async function updateOrderStatus(id: string, status: string, trackingNumber?: string) {
  if (!await isNeonConnected()) return { id, status };
  const updates: Record<string, unknown> = { order_status: status };
  if (trackingNumber) updates.tracking_number = trackingNumber;
  const { data, error } = await neon.update("orders", updates, { id });
  if (error) throw error;
  return data?.[0] || null;
}

export async function getOrderTimeline(orderId: string) {
  if (!await isNeonConnected()) return [];
  const { data } = await neon.select("order_timeline", { order_id: orderId }, { order: "created_at", ascending: true });
  return data || [];
}

export async function addTimelineEntry(orderId: string, status: string, label: string, note?: string) {
  if (!await isNeonConnected()) return;
  await neon.insert("order_timeline", { order_id: orderId, status, label, note });
}

export async function getOrderAnalytics(vendorId?: string) {
  if (!await isNeonConnected()) return null;
  const filters: Record<string, unknown> = {};
  if (vendorId) filters.vendor_id = vendorId;
  const { data } = await neon.select("orders", Object.keys(filters).length ? filters : undefined, { columns: "grand_total, order_status, created_at" });
  if (!data) return null;

  const total = data.reduce((s: number, o: any) => s + (o.grand_total || 0), 0);
  const statusBreakdown = data.reduce((acc: Record<string, number>, o: any) => {
    acc[o.order_status] = (acc[o.order_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { totalRevenue: total, orderCount: data.length, statusBreakdown };
}
