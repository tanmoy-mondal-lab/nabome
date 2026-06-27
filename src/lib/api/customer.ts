import { api } from "./client";

export const customerApi = {
  // Dashboard
  getDashboard: () => api.get<{ recentOrders: unknown[]; wishlistCount: number; addressesCount: number; unreadNotifications: number }>("/dashboard"),

  // Orders
  getOrders: (params?: Record<string, string | number | undefined>) =>
    api.get<{ orders: unknown[]; pagination: unknown }>("/orders", { params }),
  getOrder: (id: string) => api.get<{ order: unknown }>(`/orders/${id}`),
  cancelOrder: (id: string) => api.post<{ order: unknown }>(`/orders/${id}/cancel`),
  getOrderTracking: (id: string) => api.get<{ timeline: unknown[]; shipping: unknown }>(`/orders/${id}/tracking`),
  getOrderInvoice: (id: string) => api.get<{ html: string }>(`/orders/${id}/invoice`),
  getOrderStats: () => api.get<{ totalOrders: number; totalSpent: number; pendingOrders: number; deliveredOrders: number }>("/orders/stats"),

  // Profile
  getProfile: () => api.get<{ profile: unknown }>("/profile"),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; preferences?: Record<string, boolean> }) =>
    api.put<{ profile: unknown }>("/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>("/profile/password", data),

  // Addresses
  getAddresses: () => api.get<{ addresses: unknown[] }>("/addresses"),
  createAddress: (data: unknown) => api.post<unknown>("/addresses", data),
  updateAddress: (id: string, data: unknown) => api.put<unknown>(`/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete<{ message: string }>(`/addresses/${id}`),

  // Wishlist
  getWishlist: () => api.get<{ items: unknown[] }>("/wishlist"),
  addToWishlist: (variantId: string) => api.post<unknown>("/wishlist", { variantId }),
  removeFromWishlist: (variantId: string) => api.delete<{ message: string }>(`/wishlist/${variantId}`),

  // Returns
  getReturns: (params?: Record<string, string | number | undefined>) =>
    api.get<{ returns: unknown[] }>("/returns", { params }),
  getReturn: (id: string) => api.get<{ returnRequest: unknown }>(`/returns/${id}`),
  createReturn: (data: { orderId: string; orderItemId?: string; reason: string; reasonDetail?: string; evidenceImages?: string[] }) =>
    api.post<unknown>("/returns", data),

  // Refunds
  getRefunds: (params?: Record<string, string | number | undefined>) =>
    api.get<{ refunds: unknown[] }>("/refunds", { params }),
  getRefund: (id: string) => api.get<{ refund: unknown }>(`/refunds/${id}`),

  // Notifications
  getNotifications: (params?: Record<string, string | number | undefined>) =>
    api.get<{ notifications: unknown[] }>("/notifications", { params }),
  markNotificationRead: (id: string) => api.put<unknown>(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put<unknown>("/notifications/read-all"),
  getUnreadNotificationCount: () => api.get<{ count: number }>("/notifications/unread-count"),

  // Support
  getSupportTickets: () => api.get<{ tickets: unknown[] }>("/support"),
  getSupportTicket: (id: string) => api.get<{ ticket: unknown }>(`/support/${id}`),
  createSupportTicket: (data: { subject: string; message: string; orderId?: string }) =>
    api.post<unknown>("/support", data),
  addSupportReply: (ticketId: string, data: { message: string }) =>
    api.post<unknown>(`/support/${ticketId}/reply`, data),

  // FAQ
  getFaqs: () => api.get<{ faqs: unknown[] }>("/faq"),

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
  }) => api.post<{ order: unknown; razorpayOrderId: string | null }>("/checkout", data),

  guestCheckout: (data: {
    email: string;
    shippingAddress: {
      fullName: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country?: string;
    };
    sameAsShipping?: boolean;
    billingAddress?: {
      fullName: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country?: string;
    };
    items: { variantId: string; quantity: number }[];
    couponCode?: string;
    giftMessage?: string;
    notes?: string;
    paymentMethod: string;
  }) => api.post<{ order: unknown; razorpayOrderId: string | null }>("/checkout/guest", data),

  // Payments
  verifyPayment: (data: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string; orderId: string }) =>
    api.post<{ order: unknown }>("/payments/verify", data),
  reportPaymentFailed: (data: { orderId: string; errorDescription?: string }) =>
    api.post<unknown>("/payments/failed", data),
  retryPayment: (orderId: string) =>
    api.post<{ razorpayOrderId: string }>("/payments/retry", { orderId }),

  // Shipping
  getShippingRates: (params: { pincode: string; subtotal: number }) =>
    api.get<{ rates: unknown[] }>("/shipping/rates", { params }),
};
