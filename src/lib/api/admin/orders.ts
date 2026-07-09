import { api } from "../client";
import type { Order, OrderItem, OrderStatusHistory } from "../../../types/index";

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface OrderDetailResponse {
  order: Order & {
    items: OrderItem[];
    statusHistory: OrderStatusHistory[];
  };
}

export interface OrderStatsResponse {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
}

export const ordersApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<OrderListResponse>("/admin/orders", { params }),
  get: (id: string) => api.get<OrderDetailResponse>(`/admin/orders/${id}`),
  updateStatus: (id: string, data: { status: string; note?: string }) =>
    api.put<Order>(`/admin/orders/${id}/status`, data),
  getStats: () => api.get<OrderStatsResponse>("/admin/orders/stats"),
  updateInternalNotes: (id: string, notes: string) =>
    api.put<{ order: Order }>(`/admin/orders/${id}/internal-notes`, { notes }),
  getTimeline: (id: string) => api.get<{ timeline: OrderStatusHistory[] }>(`/admin/orders/${id}/timeline`),
  getInvoice: (orderId: string) => api.get<{ html: string }>(`/admin/orders/${orderId}/invoice`),
  generateInvoice: (orderId: string) => api.post<{ order: Order }>(`/admin/orders/${orderId}/invoice/generate`),
  export: (format: "csv" | "json" = "csv", status?: string) => {
    const params = new URLSearchParams({ format });
    if (status) params.set("status", status);
    return api.get<Record<string, unknown>>(`/admin/orders/export?${params}`);
  },
};
