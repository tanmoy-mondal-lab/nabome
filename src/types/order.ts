export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export type ReturnReason = "wrong_product" | "damaged" | "size_issue" | "quality_issue" | "other";

export type ReturnStatus = "requested" | "vendor_review" | "admin_review" | "approved" | "rejected" | "return_completed" | "refund_completed";

export type PaymentMethod = "cod" | "whatsapp" | "upi" | "razorpay" | "card" | "net_banking" | "wallet";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  label?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  vendorId: string;
  vendorName: string;
  vendorShop: string;
  quantity: number;
  price: number;
  originalPrice: number;
  size: string;
  color: string;
  sku: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  label: string;
  date: string | null;
  completed: boolean;
  note?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  reason: ReturnReason;
  reasonText?: string;
  images: string[];
  status: ReturnStatus;
  requestedAt: string;
  vendorReviewedAt?: string;
  adminReviewedAt?: string;
  vendorNote?: string;
  adminNote?: string;
  vendorDecision?: "approve" | "reject";
  adminDecision?: "approve" | "reject";
  refundAmount?: number;
  refundMethod?: string;
  refundProcessedAt?: string;
}

export interface OrderNotification {
  id: string;
  type: "order_placed" | "order_confirmed" | "order_shipped" | "order_delivered" | "order_cancelled" | "return_requested" | "return_approved" | "return_rejected" | "refund_completed";
  title: string;
  message: string;
  orderId: string;
  customerId?: string;
  vendorId?: string;
  read: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "order" | "payment" | "return" | "product" | "vendor" | "other";
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  responses: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  author: string;
  authorRole: "customer" | "vendor" | "admin";
  message: string;
  createdAt: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
}

export interface InvoiceData {
  invoiceNo: string;
  orderNo: string;
  orderDate: string;
  invoiceDate: string;
  customer: OrderAddress;
  vendor: {
    name: string;
    shop: string;
    address: string;
    phone: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponDiscount: number;
  shipping: number;
  tax: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery: string;
  notes: string;
}

export interface CouponRedemption {
  code: string;
  type: "flat" | "percentage" | "free_shipping";
  value: number;
  discount: number;
  minOrder: number;
  maxDiscount?: number;
  isValid: boolean;
  error?: string;
}

export interface OrderAnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  refundedOrders: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
  statusBreakdown: { status: string; count: number }[];
  topProducts: { name: string; orders: number; revenue: number }[];
  dailyOrders: { date: string; orders: number }[];
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending", "confirmed", "processing", "packed",
  "shipped", "out_for_delivery", "delivered",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
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

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "#f39c12",
  confirmed: "#3498db",
  processing: "#9b59b6",
  packed: "#8e44ad",
  shipped: "#2ecc71",
  out_for_delivery: "#1abc9c",
  delivered: "#27ae60",
  cancelled: "#e74c3c",
  returned: "#e67e22",
  refunded: "#95a5a6",
};

export const RETURN_REASON_LABEL: Record<ReturnReason, string> = {
  wrong_product: "Wrong Product Received",
  damaged: "Damaged Product",
  size_issue: "Size Issue",
  quality_issue: "Quality Issue",
  other: "Other",
};

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  requested: "Return Requested",
  vendor_review: "Vendor Review",
  admin_review: "Admin Review",
  approved: "Return Approved",
  rejected: "Return Rejected",
  return_completed: "Return Completed",
  refund_completed: "Refund Completed",
};
