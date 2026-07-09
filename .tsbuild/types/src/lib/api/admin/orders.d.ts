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
export declare const ordersApi: {
    list: (params?: Record<string, string | number | undefined>) => Promise<OrderListResponse>;
    get: (id: string) => Promise<OrderDetailResponse>;
    updateStatus: (id: string, data: {
        status: string;
        note?: string;
    }) => Promise<Order>;
    getStats: () => Promise<OrderStatsResponse>;
    updateInternalNotes: (id: string, notes: string) => Promise<{
        order: Order;
    }>;
    getTimeline: (id: string) => Promise<{
        timeline: OrderStatusHistory[];
    }>;
    getInvoice: (orderId: string) => Promise<{
        html: string;
    }>;
    generateInvoice: (orderId: string) => Promise<{
        order: Order;
    }>;
    export: (format?: "csv" | "json", status?: string) => Promise<Record<string, unknown>>;
};
