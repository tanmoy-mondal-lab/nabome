import { api } from "./client";
import type {
  DashboardData,
  Order,
  OrderTracking,
  OrderStats,
  Profile,
  Address,
  WishlistItem,
  ReturnRequest,
  Refund,
  Notification,
  SupportTicket,
  Pagination,
} from "./types";

export const customerApi = {
  // Dashboard
  getDashboard: () => api.get<DashboardData>("/dashboard"),

  // Orders
  getOrders: (params?: Record<string, string | number | undefined>) =>
    api.get<{ orders: Order[]; pagination: Pagination }>("/orders", { params }),
  getOrder: (id: string) => api.get<{ order: Order }>(`/orders/${id}`),
  cancelOrder: (id: string) => api.post<{ order: Order }>(`/orders/${id}/cancel`),
  getOrderTracking: (id: string) => api.get<OrderTracking>(`/orders/${id}/tracking`),
  getOrderInvoice: (id: string) => api.get<{ html: string }>(`/orders/${id}/invoice`),
  getOrderStats: () => api.get<OrderStats>("/orders/stats"),

  // Profile
  getProfile: () => api.get<{ profile: Profile }>("/profile"),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; preferences?: Record<string, boolean> }) =>
    api.put<{ profile: Profile }>("/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>("/profile/password", data),

  // Addresses
  getAddresses: () => api.get<{ addresses: Address[] }>("/addresses"),
  createAddress: (data: Partial<Address>) => api.post<Address>("/addresses", data),
  updateAddress: (id: string, data: Partial<Address>) => api.put<Address>(`/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete<{ message: string }>(`/addresses/${id}`),

  // Wishlist
  getWishlist: () => api.get<{ items: WishlistItem[] }>("/wishlist"),
  addToWishlist: (variantId: string) => api.post<WishlistItem>("/wishlist", { variantId }),
  removeFromWishlist: (variantId: string) => api.delete<{ message: string }>(`/wishlist/${variantId}`),

  // Returns
  getReturns: (params?: Record<string, string | number | undefined>) =>
    api.get<{ returns: ReturnRequest[] }>("/returns", { params }),
  getReturn: (id: string) => api.get<{ return: ReturnRequest }>(`/returns/${id}`),
  createReturn: (data: { orderId: string; orderItemId?: string; reason: string; reasonDetail?: string; evidenceImages?: string[] }) =>
    api.post<ReturnRequest>("/returns", data),

  // Refunds
  getRefunds: (params?: Record<string, string | number | undefined>) =>
    api.get<{ refunds: Refund[] }>("/refunds", { params }),
  getRefund: (id: string) => api.get<{ refund: Refund }>(`/refunds/${id}`),

  // Notifications
  getNotifications: (params?: Record<string, string | number | undefined>) =>
    api.get<{ notifications: Notification[] }>("/notifications", { params }),
  markNotificationRead: (id: string) => api.put<Notification>(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put<{ message: string }>("/notifications/read-all"),
  getUnreadNotificationCount: () => api.get<{ count: number }>("/notifications/unread-count"),

  // Support
  getSupportTickets: () => api.get<{ tickets: SupportTicket[] }>("/support"),
  getSupportTicket: (id: string) => api.get<{ ticket: SupportTicket }>(`/support/${id}`),
  createSupportTicket: (data: { subject: string; message: string; orderId?: string }) =>
    api.post<SupportTicket>("/support", data),
  addSupportReply: (ticketId: string, data: { message: string }) =>
    api.post<{ message: string }>(`/support/${ticketId}/reply`, data),

  // FAQ
  getFaqs: () => api.get<{ faqs: Record<string, unknown[]> }>("/faq"),

  // Checkout
  createCheckout: (data: {
    shippingAddressId: string;
    billingAddressId?: string;
    email: string;
    items: { variantId: string; quantity: number }[];
    couponCode?: string;
    giftMessage?: string;
    notes?: string;
    paymentMethod: string;
  }) => api.post<{ order: Order; razorpayOrderId: string | null }>("/checkout", data),

  guestCheckout: (data: {
    email: string;
    shippingAddress: Partial<Address>;
    sameAsShipping?: boolean;
    billingAddress?: Partial<Address>;
    items: { variantId: string; quantity: number }[];
    couponCode?: string;
    giftMessage?: string;
    notes?: string;
    paymentMethod: string;
  }) => api.post<{ order: Order; razorpayOrderId: string | null }>("/checkout/guest", data),

  // Uploads
  uploadImage: async (file: File, folder = "returns"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", folder);
    formData.append("slug", `upload-${Date.now().toString(36)}`);
    formData.append("entityId", crypto.randomUUID());
    formData.append("altText", file.name);
    const res = await fetch("/api/upload/customer", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url || json.data?.url;
  },

  // Payments
  verifyPayment: (data: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string; orderId: string }) =>
    api.post<{ order: Order }>("/payments/verify", data),
  reportPaymentFailed: (data: { orderId: string; razorpayOrderId: string; errorDescription?: string }) =>
    api.post<{ message: string }>("/payments/failed", data),
  retryPayment: (orderId: string) =>
    api.post<{ razorpayOrderId: string }>("/payments/retry", { orderId }),
};
