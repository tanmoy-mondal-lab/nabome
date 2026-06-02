import { neon, isNeonConnected } from "../neon";
import type { OrderStatus, OrderItem, OrderTimelineEntry } from "../../types/order";

export interface PlaceOrderInput {
  userId?: string | null;
  shipping: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    district?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    productId?: string;
    variantId?: string;
    vendorId?: string;
    name: string;
    image?: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }[];
  paymentMethod: string;
  paymentStatus?: string;
  couponCode?: string;
  couponDiscount?: number;
  shippingCost?: number;
  taxAmount?: number;
  utr?: string;
  note?: string;
}

export interface OrderResult {
  id: string;
  orderNumber: string;
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingCost: number;
  taxAmount: number;
  taxLabel: string;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  utr: string | null;
  orderStatus: OrderStatus;
  trackingNumber: string | null;
  courierName: string | null;
  notes: string | null;
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: Record<string, unknown>): OrderWithItems {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    userId: (row.user_id as string) || null,
    customerName: row.customer_name as string,
    customerEmail: (row.customer_email as string) || null,
    customerPhone: row.customer_phone as string,
    shippingAddress: {
      name: (row.shipping_name as string) || (row.customer_name as string),
      phone: (row.shipping_phone as string) || (row.customer_phone as string),
      email: (row.shipping_email as string) || undefined,
      address: row.shipping_address as string,
      district: (row.shipping_district as string) || "",
      city: row.shipping_city as string,
      state: row.shipping_state as string,
      pincode: row.shipping_pincode as string,
    },
    subtotal: Number(row.subtotal) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    couponCode: (row.coupon_code as string) || null,
    shippingCost: Number(row.shipping_cost) || 0,
    taxAmount: Number(row.tax_amount) || 0,
    taxLabel: (row.tax_label as string) || "GST 5%",
    grandTotal: Number(row.grand_total) || 0,
    paymentMethod: row.payment_method as string,
    paymentStatus: row.payment_status as string,
    utr: (row.utr as string) || null,
    orderStatus: (row.order_status as OrderStatus) || "pending",
    trackingNumber: (row.tracking_number as string) || null,
    courierName: (row.courier_name as string) || null,
    notes: (row.notes as string) || null,
    items: [],
    timeline: [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as string,
    productId: (row.product_id as string) || "",
    productName: row.name as string,
    productImage: (row.image as string) || "",
    vendorId: (row.vendor_id as string) || "",
    vendorName: "",
    vendorShop: "",
    quantity: Number(row.quantity) || 1,
    price: Number(row.price) || 0,
    originalPrice: Number(row.price) || 0,
    size: (row.size as string) || "",
    color: (row.color as string) || "",
    sku: "",
  };
}

function mapTimelineEntry(row: Record<string, unknown>): OrderTimelineEntry {
  return {
    status: row.status as OrderStatus,
    label: row.label as string,
    date: row.created_at as string | null,
    completed: true,
    note: (row.note as string) || undefined,
  };
}

export async function placeOrder(input: PlaceOrderInput): Promise<OrderResult | null> {
  if (!await isNeonConnected()) {
    const orderNumber = `NB-${Date.now()}`;
    const mockOrder = { ...input, orderNumber, id: `mock_${Date.now()}` };
    const existing = JSON.parse(localStorage.getItem("nabome-orders") || "[]");
    existing.push(mockOrder);
    localStorage.setItem("nabome-orders", JSON.stringify(existing));
    localStorage.setItem("nabome-last-bill", JSON.stringify(mockOrder));
    return { id: mockOrder.id, orderNumber };
  }

  const orderNumber = `NB-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = input.couponDiscount || 0;
  const shipping = input.shippingCost || (subtotal > 999 ? 0 : 99);
  const tax = input.taxAmount || Math.round((subtotal - discount) * 0.05);
  const grandTotal = subtotal - discount + shipping + tax;

  const orderPayload: Record<string, unknown> = {
    order_number: orderNumber,
    user_id: input.userId || null,
    customer_name: input.shipping.name,
    customer_email: input.shipping.email || null,
    customer_phone: input.shipping.phone,
    shipping_name: input.shipping.name,
    shipping_phone: input.shipping.phone,
    shipping_email: input.shipping.email || null,
    shipping_address: input.shipping.address,
    shipping_district: input.shipping.district || null,
    shipping_city: input.shipping.city,
    shipping_state: input.shipping.state,
    shipping_pincode: input.shipping.pincode,
    subtotal,
    discount_amount: discount,
    coupon_code: input.couponCode || null,
    shipping_cost: shipping,
    tax_amount: tax,
    tax_label: "GST 5%",
    grand_total: grandTotal,
    payment_method: input.paymentMethod || "whatsapp",
    payment_status: input.paymentStatus || "pending",
    utr: input.utr || null,
    order_status: "pending",
    notes: input.note || null,
  };

  const { data: orderResult, error: orderError } = await neon.insert("orders", orderPayload);
  if (orderError || !orderResult?.[0]) throw orderError || new Error("Failed to create order");
  const order = orderResult[0] as Record<string, unknown>;

  for (const item of input.items) {
    await neon.insert("order_items", {
      order_id: order.id,
      product_id: item.productId || null,
      variant_id: item.variantId || null,
      vendor_id: item.vendorId || null,
      name: item.name,
      image: item.image || null,
      size: item.selectedSize || null,
      color: item.selectedColor || null,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    });
  }

  await neon.insert("order_timeline", {
    order_id: order.id,
    status: "pending",
    label: "Order Placed",
    note: "Your order has been placed successfully",
  });

  const result = { id: order.id as string, orderNumber };
  localStorage.setItem("nabome-last-order", JSON.stringify(result));
  return result;
}

export async function getOrdersByUser(userId: string): Promise<OrderWithItems[]> {
  if (!await isNeonConnected()) return [];

  const { data: orders } = await neon.select("orders", { user_id: userId }, { order: "created_at", ascending: false });
  if (!orders || !orders.length) return [];

  const results: OrderWithItems[] = [];
  for (const row of orders as Record<string, unknown>[]) {
    const order = mapRow(row);
    const { data: items } = await neon.select("order_items", { order_id: order.id }, { order: "created_at", ascending: true });
    if (items) order.items = (items as Record<string, unknown>[]).map(mapOrderItem);
    const { data: timeline } = await neon.select("order_timeline", { order_id: order.id }, { order: "created_at", ascending: true });
    if (timeline) order.timeline = (timeline as Record<string, unknown>[]).map(mapTimelineEntry);
    results.push(order);
  }
  return results;
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  if (!await isNeonConnected()) return null;

  const { data: order } = await neon.select("orders", { id: orderId }, { single: true });
  if (!order) return null;

  const result = mapRow(order as Record<string, unknown>);
  const { data: items } = await neon.select("order_items", { order_id: result.id }, { order: "created_at", ascending: true });
  if (items) result.items = (items as Record<string, unknown>[]).map(mapOrderItem);
  const { data: timeline } = await neon.select("order_timeline", { order_id: result.id }, { order: "created_at", ascending: true });
  if (timeline) result.timeline = (timeline as Record<string, unknown>[]).map(mapTimelineEntry);
  return result;
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  if (!await isNeonConnected()) return null;

  const { data: order } = await neon.select("orders", { order_number: orderNumber }, { single: true });
  if (!order) return null;

  const result = mapRow(order as Record<string, unknown>);
  const { data: items } = await neon.select("order_items", { order_id: result.id }, { order: "created_at", ascending: true });
  if (items) result.items = (items as Record<string, unknown>[]).map(mapOrderItem);
  const { data: timeline } = await neon.select("order_timeline", { order_id: result.id }, { order: "created_at", ascending: true });
  if (timeline) result.timeline = (timeline as Record<string, unknown>[]).map(mapTimelineEntry);
  return result;
}

export async function getVendorOrders(vendorId: string): Promise<OrderWithItems[]> {
  if (!await isNeonConnected()) return [];

  const { data: orderItems } = await neon.select("order_items", { vendor_id: vendorId });
  if (!orderItems || !orderItems.length) return [];

  const orderIds = [...new Set((orderItems as Record<string, unknown>[]).map(i => i.order_id as string))];
  const results: OrderWithItems[] = [];

  for (const oid of orderIds) {
    const order = await getOrderById(oid);
    if (order) {
      order.items = order.items.filter(i => i.vendorId === vendorId);
      results.push(order);
    }
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return results;
}

export async function getAllOrders(): Promise<OrderWithItems[]> {
  if (!await isNeonConnected()) return [];

  const { data: orders } = await neon.select("orders", undefined, { order: "created_at", ascending: false });
  if (!orders) return [];

  const results: OrderWithItems[] = [];
  for (const row of orders as Record<string, unknown>[]) {
    const order = mapRow(row);
    const { data: items } = await neon.select("order_items", { order_id: order.id }, { order: "created_at", ascending: true });
    if (items) order.items = (items as Record<string, unknown>[]).map(mapOrderItem);
    const { data: timeline } = await neon.select("order_timeline", { order_id: order.id }, { order: "created_at", ascending: true });
    if (timeline) order.timeline = (timeline as Record<string, unknown>[]).map(mapTimelineEntry);
    results.push(order);
  }
  return results;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string, trackingNumber?: string, courierName?: string): Promise<void> {
  if (!await isNeonConnected()) return;

  const updates: Record<string, unknown> = { order_status: status };
  if (trackingNumber) updates.tracking_number = trackingNumber;
  if (courierName) updates.courier_name = courierName;
  if (status === "delivered") updates.delivered_at = new Date().toISOString();

  await neon.update("orders", updates, { id: orderId });

  const statusLabels: Record<string, string> = {
    pending: "Order Placed",
    confirmed: "Confirmed",
    processing: "Processing",
    packed: "Packed",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
    refunded: "Refunded",
  };

  await neon.insert("order_timeline", {
    order_id: orderId,
    status,
    label: statusLabels[status] || status,
    note: note || null,
  });
}

export async function addTimelineEntry(orderId: string, status: string, label: string, note?: string) {
  if (!await isNeonConnected()) return;
  await neon.insert("order_timeline", { order_id: orderId, status, label, note });
}

export async function getOrderTimeline(orderId: string): Promise<OrderTimelineEntry[]> {
  if (!await isNeonConnected()) return [];
  const { data } = await neon.select("order_timeline", { order_id: orderId }, { order: "created_at", ascending: true });
  return (data as Record<string, unknown>[] || []).map(mapTimelineEntry);
}

export async function getOrderAnalytics(vendorId?: string) {
  if (!await isNeonConnected()) return null;
  const filters: Record<string, unknown> = {};
  if (vendorId) filters.vendor_id = vendorId;
  const { data } = await neon.select("orders", Object.keys(filters).length ? filters : undefined, { columns: "grand_total, order_status, created_at" });
  if (!data) return null;

  const rows = data as Record<string, unknown>[];
  const total = rows.reduce((s: number, o) => s + (Number(o.grand_total) || 0), 0);
  const statusBreakdown = rows.reduce((acc: Record<string, number>, o) => {
    const st = o.order_status as string;
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { totalRevenue: total, orderCount: rows.length, statusBreakdown };
}
