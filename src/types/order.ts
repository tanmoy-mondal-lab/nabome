export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

import type { Address } from "./address";

export interface OrderTracking {
  timeline: OrderStatusHistory[];
  shipping: Address | null;
  currentStatus: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  deliveredOrders: number;
}
