import { neon, isNeonConnected } from "../lib/neon";
import type { OrderStatus } from "../types/order";

export type PlaceOrderInput = {
  userId?: string | null;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: {
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
    size?: string;
    color?: string;
  }[];
  paymentMethod: string;
  paymentStatus?: string;
  couponCode?: string;
  couponDiscount?: number;
  utr?: string;
  note?: string;
};

export type OrderResult = {
  id: string;
  orderNumber: string;
};

function generateOrderNumber(): string {
  return `NB-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<OrderResult | null> {
  if (!await isNeonConnected()) {
    const orderNumber = generateOrderNumber();
    const mock = { ...input, orderNumber, id: `mock_${Date.now()}` };
    const existing = JSON.parse(localStorage.getItem("nabome-orders") || "[]");
    existing.push(mock);
    localStorage.setItem("nabome-orders", JSON.stringify(existing));
    localStorage.setItem("nabome-last-order", JSON.stringify(mock));
    return { id: mock.id, orderNumber };
  }

  const orderNumber = generateOrderNumber();
  const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = input.couponDiscount || 0;
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.05);
  const grandTotal = subtotal - discount + shipping + tax;

  const { data: orderResult, error } = await neon.insert("orders", {
    order_number: orderNumber,
    user_id: input.userId || null,
    customer_name: input.customerName,
    customer_email: input.customerEmail || null,
    customer_phone: input.customerPhone,
    shipping_name: input.shippingAddress.name,
    shipping_phone: input.shippingAddress.phone,
    shipping_email: input.shippingAddress.email || null,
    shipping_address: input.shippingAddress.address,
    shipping_district: input.shippingAddress.district || null,
    shipping_city: input.shippingAddress.city,
    shipping_state: input.shippingAddress.state,
    shipping_pincode: input.shippingAddress.pincode,
    subtotal,
    discount_amount: discount,
    coupon_code: input.couponCode || null,
    shipping_cost: shipping,
    tax_amount: tax,
    tax_label: "GST 5%",
    grand_total: grandTotal,
    payment_method: input.paymentMethod || "whatsapp",
    payment_status: input.paymentStatus || "pending",
    order_status: "pending",
    utr: input.utr || null,
    notes: input.note || null,
  });

  if (error || !orderResult?.[0]) throw error || new Error("Failed to create order");
  const order = orderResult[0] as Record<string, unknown>;

  for (const item of input.items) {
    await neon.insert("order_items", {
      order_id: order.id,
      product_id: item.productId || null,
      variant_id: item.variantId || null,
      vendor_id: item.vendorId || null,
      name: item.name,
      image: item.image || null,
      size: item.size || null,
      color: item.color || null,
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

export async function getOrdersByUser(userId: string) {
  if (!await isNeonConnected()) return [];

  const { data: orders } = await neon.select("orders", { user_id: userId }, { order: "created_at", ascending: false });
  const results: Record<string, unknown>[] = [];

  for (const row of (orders || []) as Record<string, unknown>[]) {
    const { data: items } = await neon.select("order_items", { order_id: row.id }, { order: "created_at", ascending: true });
    const { data: timeline } = await neon.select("order_timeline", { order_id: row.id }, { order: "created_at", ascending: true });
    results.push({ ...row, items: items || [], timeline: timeline || [] });
  }

  return results;
}

export async function getOrderById(orderId: string) {
  if (!await isNeonConnected()) return null;

  const { data: order } = await neon.select("orders", { id: orderId }, { single: true });
  if (!order) return null;

  const { data: items } = await neon.select("order_items", { order_id: orderId }, { order: "created_at", ascending: true });
  const { data: timeline } = await neon.select("order_timeline", { order_id: orderId }, { order: "created_at", ascending: true });

  return { ...(order as Record<string, unknown>), items: items || [], timeline: timeline || [] };
}

export async function getOrderByNumber(orderNumber: string) {
  if (!await isNeonConnected()) return null;

  const { data: order } = await neon.select("orders", { order_number: orderNumber }, { single: true });
  if (!order) return null;

  const { data: items } = await neon.select("order_items", { order_id: (order as any).id }, { order: "created_at", ascending: true });
  const { data: timeline } = await neon.select("order_timeline", { order_id: (order as any).id }, { order: "created_at", ascending: true });

  return { ...(order as Record<string, unknown>), items: items || [], timeline: timeline || [] };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  if (!await isNeonConnected()) return;

  await neon.update("orders", { order_status: status }, { id: orderId });

  const labels: Record<string, string> = {
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
    label: labels[status] || status,
    note: note || null,
  });
}

export async function getAllOrders() {
  if (!await isNeonConnected()) return [];

  const { data: orders } = await neon.select("orders", undefined, { order: "created_at", ascending: false });
  const results: Record<string, unknown>[] = [];

  for (const row of (orders || []) as Record<string, unknown>[]) {
    const { data: items } = await neon.select("order_items", { order_id: row.id }, { order: "created_at", ascending: true });
    const { data: timeline } = await neon.select("order_timeline", { order_id: row.id }, { order: "created_at", ascending: true });
    results.push({ ...row, items: items || [], timeline: timeline || [] });
  }

  return results;
}
