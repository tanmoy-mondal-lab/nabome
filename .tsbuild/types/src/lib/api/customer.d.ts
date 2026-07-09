import type { DashboardData, Order, OrderTracking, OrderStats, Profile, Address, WishlistItem, ReturnRequest, Refund, Notification, SupportTicket, Pagination } from "./types";
export declare const customerApi: {
    getDashboard: () => Promise<DashboardData>;
    getOrders: (params?: Record<string, string | number | undefined>) => Promise<{
        orders: Order[];
        pagination: Pagination;
    }>;
    getOrder: (id: string) => Promise<{
        order: Order;
    }>;
    cancelOrder: (id: string) => Promise<{
        order: Order;
    }>;
    getOrderTracking: (id: string) => Promise<OrderTracking>;
    getOrderInvoice: (id: string) => Promise<{
        html: string;
    }>;
    getOrderStats: () => Promise<OrderStats>;
    getProfile: () => Promise<{
        profile: Profile;
    }>;
    updateProfile: (data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        preferences?: Record<string, boolean>;
    }) => Promise<{
        profile: Profile;
    }>;
    changePassword: (data: {
        currentPassword: string;
        newPassword: string;
    }) => Promise<{
        message: string;
    }>;
    getAddresses: () => Promise<{
        addresses: Address[];
    }>;
    createAddress: (data: Partial<Address>) => Promise<Address>;
    updateAddress: (id: string, data: Partial<Address>) => Promise<Address>;
    deleteAddress: (id: string) => Promise<{
        message: string;
    }>;
    getWishlist: () => Promise<{
        items: WishlistItem[];
    }>;
    addToWishlist: (variantId: string) => Promise<WishlistItem>;
    removeFromWishlist: (variantId: string) => Promise<{
        message: string;
    }>;
    getReturns: (params?: Record<string, string | number | undefined>) => Promise<{
        returns: ReturnRequest[];
    }>;
    getReturn: (id: string) => Promise<{
        return: ReturnRequest;
    }>;
    createReturn: (data: {
        orderId: string;
        orderItemId?: string;
        reason: string;
        reasonDetail?: string;
        evidenceImages?: string[];
    }) => Promise<ReturnRequest>;
    getRefunds: (params?: Record<string, string | number | undefined>) => Promise<{
        refunds: Refund[];
    }>;
    getRefund: (id: string) => Promise<{
        refund: Refund;
    }>;
    getNotifications: (params?: Record<string, string | number | undefined>) => Promise<{
        notifications: Notification[];
    }>;
    markNotificationRead: (id: string) => Promise<Notification>;
    markAllNotificationsRead: () => Promise<{
        message: string;
    }>;
    getUnreadNotificationCount: () => Promise<{
        count: number;
    }>;
    getSupportTickets: () => Promise<{
        tickets: SupportTicket[];
    }>;
    getSupportTicket: (id: string) => Promise<{
        ticket: SupportTicket;
    }>;
    createSupportTicket: (data: {
        subject: string;
        message: string;
        orderId?: string;
    }) => Promise<SupportTicket>;
    addSupportReply: (ticketId: string, data: {
        message: string;
    }) => Promise<{
        message: string;
    }>;
    getFaqs: () => Promise<{
        faqs: Record<string, unknown[]>;
    }>;
    createCheckout: (data: {
        shippingAddressId: string;
        billingAddressId?: string;
        email: string;
        items: {
            variantId: string;
            quantity: number;
        }[];
        couponCode?: string;
        giftMessage?: string;
        notes?: string;
        paymentMethod: string;
    }) => Promise<{
        order: Order;
        razorpayOrderId: string | null;
    }>;
    guestCheckout: (data: {
        email: string;
        shippingAddress: Partial<Address>;
        sameAsShipping?: boolean;
        billingAddress?: Partial<Address>;
        items: {
            variantId: string;
            quantity: number;
        }[];
        couponCode?: string;
        giftMessage?: string;
        notes?: string;
        paymentMethod: string;
    }) => Promise<{
        order: Order;
        razorpayOrderId: string | null;
    }>;
    uploadImage: (file: File, folder?: string) => Promise<string>;
    verifyPayment: (data: {
        razorpayPaymentId: string;
        razorpayOrderId: string;
        razorpaySignature: string;
        orderId: string;
    }) => Promise<{
        order: Order;
    }>;
    reportPaymentFailed: (data: {
        orderId: string;
        razorpayOrderId: string;
        errorDescription?: string;
    }) => Promise<{
        message: string;
    }>;
    retryPayment: (orderId: string) => Promise<{
        razorpayOrderId: string;
    }>;
};
