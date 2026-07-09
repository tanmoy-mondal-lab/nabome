import { api } from "./client";
export { api };
export { productsApi, type ProductListResponse, type ProductDetailResponse } from "./admin/products";
export { ordersApi, type OrderListResponse, type OrderDetailResponse, type OrderStatsResponse } from "./admin/orders";
export { customersApi, type CustomerListResponse } from "./admin/customers";
export { analyticsApi, type SalesAnalytics, type ProductAnalytics, type CustomerAnalytics, type DeliveryAddressAnalytics } from "./admin/analytics";
export { cmsApi, type CMSPage, type HomepageSection, type NavigationMenu, type NavigationItem, type FooterSection, type Announcement } from "./admin/cms";
export { settingsApi, type SiteSettings, type SocialLink } from "./admin/settings";
export { mediaApi, type MediaAsset, type MediaListResponse } from "./admin/media";
export { notificationsApi, type Notification, type NotificationTemplate } from "./admin/notifications";
import type { ProductListResponse, ProductDetailResponse } from "./admin/products";
import type { OrderListResponse, OrderDetailResponse, OrderStatsResponse } from "./admin/orders";
import type { CustomerListResponse } from "./admin/customers";
import type { SalesAnalytics, ProductAnalytics, CustomerAnalytics, DeliveryAddressAnalytics } from "./admin/analytics";
import type { CMSPage, HomepageSection, NavigationMenu, FooterSection, Announcement } from "./admin/cms";
import type { SocialLink } from "./admin/settings";
export interface DashboardStats {
    stats: {
        totalProducts: number;
        totalOrders: number;
        totalCustomers: number;
        totalRevenue: number;
        monthRevenue: number;
        monthOrders: number;
        lowStockVariants: number;
        pendingReviews: number;
    };
    ordersByStatus: {
        status: string;
        count: number;
    }[];
    recentOrders: Array<{
        id: string;
        orderNumber: string;
        status: string;
        total: number;
        createdAt: string;
        customer?: {
            firstName: string;
            lastName: string;
            email: string;
        };
    }>;
    recentCustomers: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        createdAt: string;
    }>;
    dailySales: {
        date: string;
        revenue: number;
        orders: number;
    }[];
}
export declare const adminApi: {
    getDashboard: () => Promise<DashboardStats>;
    getProducts: (params?: Record<string, string | number | undefined>) => Promise<ProductListResponse>;
    getProduct: (id: string) => Promise<ProductDetailResponse>;
    createProduct: (data: unknown) => Promise<unknown>;
    updateProduct: (id: string, data: unknown) => Promise<unknown>;
    deleteProduct: (id: string) => Promise<unknown>;
    updateProductVariants: (id: string, variants: unknown[]) => Promise<unknown>;
    addProductImage: (id: string, data: {
        url: string;
        publicId?: string;
        altText?: string;
        isPrimary?: boolean;
        sortOrder?: number;
        variantId?: string;
        type?: string;
    }) => Promise<unknown>;
    deleteProductImage: (productId: string, imageId: string) => Promise<unknown>;
    getCategories: () => Promise<{
        categories: Array<{
            id: string;
            name: string;
            slug: string;
        }>;
    }>;
    createCategory: (data: unknown) => Promise<unknown>;
    updateCategory: (id: string, data: unknown) => Promise<unknown>;
    deleteCategory: (id: string) => Promise<unknown>;
    getCollections: () => Promise<{
        collections: Array<{
            id: string;
            name: string;
            slug: string;
        }>;
    }>;
    createCollection: (data: unknown) => Promise<unknown>;
    updateCollection: (id: string, data: unknown) => Promise<unknown>;
    deleteCollection: (id: string) => Promise<unknown>;
    getOrders: (params?: Record<string, string | number | undefined>) => Promise<OrderListResponse>;
    getOrder: (id: string) => Promise<OrderDetailResponse>;
    updateOrderStatus: (id: string, data: {
        status: string;
        note?: string;
    }) => Promise<unknown>;
    getCustomers: (params?: Record<string, string | number | undefined>) => Promise<CustomerListResponse>;
    getCustomer: (id: string) => Promise<{
        customer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
        };
    }>;
    updateCustomer: (id: string, data: unknown) => Promise<unknown>;
    getPages: () => Promise<{
        pages: CMSPage[];
    }>;
    getPage: (id: string) => Promise<CMSPage>;
    createPage: (data: unknown) => Promise<unknown>;
    updatePage: (id: string, data: unknown) => Promise<unknown>;
    deletePage: (id: string) => Promise<unknown>;
    getHomepageSections: () => Promise<{
        sections: HomepageSection[];
    }>;
    createHomeSection: (data: unknown) => Promise<unknown>;
    updateHomeSection: (id: string, data: unknown) => Promise<unknown>;
    deleteHomeSection: (id: string) => Promise<unknown>;
    reorderHomeSections: (order: {
        id: string;
        sortOrder: number;
    }[]) => Promise<unknown>;
    getNavigationMenus: () => Promise<{
        menus: NavigationMenu[];
    }>;
    createNavigation: (data: unknown) => Promise<unknown>;
    updateNavigation: (id: string, data: unknown) => Promise<unknown>;
    deleteNavigation: (id: string) => Promise<unknown>;
    getFooterSections: () => Promise<{
        sections: FooterSection[];
    }>;
    createFooterSection: (data: unknown) => Promise<unknown>;
    updateFooterSection: (id: string, data: unknown) => Promise<unknown>;
    deleteFooterSection: (id: string) => Promise<unknown>;
    getAnnouncements: () => Promise<{
        announcements: Announcement[];
    }>;
    createAnnouncement: (data: unknown) => Promise<unknown>;
    updateAnnouncement: (id: string, data: unknown) => Promise<unknown>;
    deleteAnnouncement: (id: string) => Promise<unknown>;
    getCoupons: () => Promise<{
        coupons: Array<{
            id: string;
            code: string;
            discountType: string;
            discountValue: number;
            isActive: boolean;
        }>;
    }>;
    createCoupon: (data: unknown) => Promise<unknown>;
    updateCoupon: (id: string, data: unknown) => Promise<unknown>;
    deleteCoupon: (id: string) => Promise<unknown>;
    getReviews: (params?: Record<string, string | undefined>) => Promise<{
        reviews: Array<{
            id: string;
            title: string;
            rating: number;
            comment: string;
            isApproved: boolean;
            createdAt: string;
            profile: {
                firstName: string;
                lastName: string;
                email: string;
            };
            product: {
                name: string;
            };
        }>;
    }>;
    approveReview: (id: string, approved: boolean) => Promise<unknown>;
    deleteReview: (id: string) => Promise<unknown>;
    getSalesAnalytics: (params?: Record<string, string | undefined>) => Promise<SalesAnalytics>;
    getProductAnalytics: () => Promise<ProductAnalytics>;
    getCustomerAnalytics: () => Promise<CustomerAnalytics>;
    getDeliveryAddressAnalytics: (params?: Record<string, string | undefined>) => Promise<DeliveryAddressAnalytics>;
    getSettings: () => Promise<{
        settings: Record<string, unknown>;
    }>;
    updateSettings: (data: unknown) => Promise<unknown>;
    getSocialLinks: () => Promise<{
        links: SocialLink[];
    }>;
    createSocialLink: (data: unknown) => Promise<unknown>;
    updateSocialLink: (id: string, data: unknown) => Promise<unknown>;
    deleteSocialLink: (id: string) => Promise<unknown>;
    getMedia: (params?: Record<string, string | number | undefined>) => Promise<{
        assets: Array<{
            id: string;
            url: string;
            publicId: string;
            type: string;
            altText: string | null;
            format: string;
            width: number | null;
            height: number | null;
            fileSize: number | null;
            entityType: string | null;
            entityId: string | null;
            displayName: string | null;
            sortOrder: number;
            isPrimary: boolean;
            folder: string | null;
            tags: string[];
            createdAt: string;
            updatedAt: string;
        }>;
        folders: Array<{
            name: string;
            count: number;
        }>;
    }>;
    createMedia: (data: {
        url: string;
        publicId?: string;
        type?: string;
        altText?: string;
        entityType?: string;
        entityId?: string;
        assetId?: string;
        secureUrl?: string;
        resourceType?: string;
        originalFilename?: string;
        displayName?: string;
        sortOrder?: number;
        isPrimary?: boolean;
        folder?: string;
        tags?: string[];
        width?: number | null;
        height?: number | null;
        fileSize?: number | null;
        mimeType?: string;
    }) => Promise<unknown>;
    updateMedia: (id: string, data: {
        altText?: string;
        displayName?: string;
        folder?: string;
        tags?: string[];
        sortOrder?: number;
        isPrimary?: boolean;
    }) => Promise<unknown>;
    deleteMedia: (id: string) => Promise<unknown>;
    getContactSubmissions: (params?: Record<string, string | undefined>) => Promise<{
        submissions: Array<{
            id: string;
            name: string;
            email: string;
            message: string;
            createdAt: string;
        }>;
        unreadCount: number;
        pagination?: {
            totalPages: number;
        };
    }>;
    markContactRead: (id: string) => Promise<unknown>;
    deleteContactSubmission: (id: string) => Promise<unknown>;
    getNewsletterSubscribers: (params?: Record<string, string | number | undefined>) => Promise<{
        subscribers: Array<{
            id: string;
            email: string;
            isActive: boolean;
            createdAt: string;
        }>;
        pagination?: {
            totalPages: number;
        };
    }>;
    deleteSubscriber: (id: string) => Promise<unknown>;
    getTemplates: () => Promise<{
        templates: Array<{
            id: string;
            name: string;
            slug: string;
            description: string;
            category: string;
            thumbnail: string | null;
            content: string;
            sections: unknown[];
            isActive: boolean;
            useCount: number;
            createdAt: string;
            updatedAt: string;
        }>;
    }>;
    getTemplate: (id: string) => Promise<{
        template: {
            id: string;
            name: string;
            slug: string;
            description: string;
            category: string;
            thumbnail: string | null;
            content: string;
            sections: unknown[];
            isActive: boolean;
            useCount: number;
            createdAt: string;
            updatedAt: string;
        };
    }>;
    createTemplate: (data: unknown) => Promise<unknown>;
    updateTemplate: (id: string, data: unknown) => Promise<unknown>;
    deleteTemplate: (id: string) => Promise<unknown>;
    applyTemplate: (templateId: string, pageId: string) => Promise<unknown>;
    exportProducts: (format?: "csv" | "json", categoryId?: string) => Promise<unknown>;
    importProducts: (data: FormData | Record<string, unknown>[]) => Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    exportOrders: (format?: "csv" | "json", status?: string) => Promise<unknown>;
    getSearchIndexStatus: () => Promise<{
        indexed: boolean;
        count: number;
        lastIndexed: string | null;
    }>;
    buildSearchIndex: () => Promise<{
        indexed: number;
        types: Record<string, number>;
    }>;
    searchIndex: (q: string, options?: {
        type?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        results: unknown[];
        total: number;
    }>;
    getLookbooks: () => Promise<{
        lookbooks: Array<{
            id: string;
            name: string;
            slug: string;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        }>;
    }>;
    getLookbook: (id: string) => Promise<{
        lookbook: {
            id: string;
            name: string;
            slug: string;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
            items: unknown[];
        };
    }>;
    createLookbook: (data: unknown) => Promise<unknown>;
    updateLookbook: (id: string, data: unknown) => Promise<unknown>;
    deleteLookbook: (id: string) => Promise<unknown>;
    addLookbookItem: (lookbookId: string, data: unknown) => Promise<unknown>;
    removeLookbookItem: (lookbookId: string, itemId: string) => Promise<unknown>;
    updateLookbookItem: (lookbookId: string, itemId: string, data: unknown) => Promise<unknown>;
    reorderLookbookItems: (lookbookId: string, order: {
        id: string;
        sortOrder: number;
    }[]) => Promise<unknown>;
    getBrands: () => Promise<{
        brands: Array<{
            id: string;
            name: string;
            slug: string;
        }>;
    }>;
    getBrand: (id: string) => Promise<{
        brand: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
    createBrand: (data: unknown) => Promise<unknown>;
    updateBrand: (id: string, data: unknown) => Promise<unknown>;
    deleteBrand: (id: string) => Promise<unknown>;
    getSizeGuides: () => Promise<{
        sizeGuides: Array<{
            id: string;
            name: string;
            category: string;
        }>;
    }>;
    getSizeGuide: (id: string) => Promise<{
        sizeGuide: {
            id: string;
            name: string;
            category: string;
            measurements: unknown[];
        };
    }>;
    createSizeGuide: (data: unknown) => Promise<unknown>;
    updateSizeGuide: (id: string, data: unknown) => Promise<unknown>;
    deleteSizeGuide: (id: string) => Promise<unknown>;
    getSubcategories: () => Promise<{
        subcategories: Array<{
            id: string;
            name: string;
            slug: string;
            categoryId: string;
        }>;
    }>;
    createSubcategory: (data: unknown) => Promise<unknown>;
    updateSubcategory: (id: string, data: unknown) => Promise<unknown>;
    deleteSubcategory: (id: string) => Promise<unknown>;
    getLabels: () => Promise<{
        labels: Array<{
            id: string;
            name: string;
            color: string;
        }>;
    }>;
    createLabel: (data: unknown) => Promise<unknown>;
    updateLabel: (id: string, data: unknown) => Promise<unknown>;
    deleteLabel: (id: string) => Promise<unknown>;
    getTags: () => Promise<{
        tags: Array<{
            id: string;
            name: string;
            slug: string;
        }>;
    }>;
    createTag: (data: unknown) => Promise<unknown>;
    updateTag: (id: string, data: unknown) => Promise<unknown>;
    deleteTag: (id: string) => Promise<unknown>;
    assignLabels: (productId: string, labelIds: string[]) => Promise<unknown>;
    assignTags: (productId: string, tagIds: string[]) => Promise<unknown>;
    getRelatedProducts: (productId: string) => Promise<unknown>;
    addRelatedProduct: (data: {
        sourceId: string;
        targetId: string;
        type?: string;
    }) => Promise<unknown>;
    removeRelatedProduct: (id: string) => Promise<unknown>;
    reorderRelatedProducts: (productId: string, order: {
        id: string;
        sortOrder: number;
    }[]) => Promise<unknown>;
    getInventoryOverview: () => Promise<{
        stats: {
            totalProducts: number;
            lowStock: number;
            outOfStock: number;
        };
        recentMovements: Array<{
            id: string;
            type: string;
            quantity: number;
            createdAt: string;
        }>;
        alerts: Array<{
            id: string;
            type: string;
            productId: string;
            variantId: string;
        }>;
    }>;
    getProductMovements: (productId: string) => Promise<{
        movements: Array<{
            id: string;
            type: string;
            quantity: number;
            createdAt: string;
        }>;
    }>;
    getVariantMovements: (variantId: string) => Promise<{
        movements: Array<{
            id: string;
            type: string;
            quantity: number;
            createdAt: string;
        }>;
    }>;
    adjustVariantStock: (variantId: string, data: {
        quantityChange: number;
        reason: string;
        note?: string;
    }) => Promise<unknown>;
    getInventoryAlerts: (params?: Record<string, string | undefined>) => Promise<{
        alerts: Array<{
            id: string;
            type: string;
            productId: string;
            variantId: string;
        }>;
    }>;
    resolveAlert: (alertId: string) => Promise<unknown>;
    duplicateProduct: (id: string) => Promise<unknown>;
    restoreProduct: (id: string) => Promise<unknown>;
    scheduleProduct: (id: string, data: {
        publishAt?: string;
        archiveAt?: string;
    }) => Promise<unknown>;
    bulkUpdateStatus: (ids: string[], status: boolean) => Promise<unknown>;
    bulkUpdateCategory: (ids: string[], data: {
        categoryId?: string;
        subcategoryId?: string;
        collectionId?: string;
    }) => Promise<unknown>;
    bulkDeleteProducts: (ids: string[]) => Promise<unknown>;
    permanentDeleteProduct: (id: string) => Promise<unknown>;
    bulkPermanentDeleteProducts: (ids: string[]) => Promise<unknown>;
    uploadFile: (file: File, entityType?: string, slug?: string, entityId?: string, altText?: string) => Promise<{
        url: string;
        publicId: string;
    }>;
    getOrderStats: () => Promise<OrderStatsResponse>;
    updateOrderInternalNotes: (id: string, notes: string) => Promise<unknown>;
    getOrderTimeline: (id: string) => Promise<{
        timeline: Array<{
            status: string;
            note?: string;
            createdAt: string;
        }>;
    }>;
    getReturns: (params?: Record<string, string | number | undefined>) => Promise<{
        returns: Array<{
            id: string;
            orderId: string;
            status: string;
            reason: string;
            createdAt: string;
        }>;
        pagination?: {
            totalPages: number;
        };
    }>;
    getReturn: (id: string) => Promise<{
        return: {
            id: string;
            orderId: string;
            status: string;
            reason: string;
            items: unknown[];
        };
    }>;
    approveReturn: (id: string, data?: {
        adminNote?: string;
    }) => Promise<unknown>;
    rejectReturn: (id: string, data: {
        adminNote: string;
    }) => Promise<unknown>;
    receiveReturn: (id: string) => Promise<unknown>;
    getRefunds: (params?: Record<string, string | number | undefined>) => Promise<{
        refunds: Array<{
            id: string;
            orderId: string;
            amount: number;
            status: string;
        }>;
    }>;
    getRefund: (id: string) => Promise<{
        refund: {
            id: string;
            orderId: string;
            amount: number;
            status: string;
        };
    }>;
    createRefund: (data: {
        orderId: string;
        returnRequestId?: string;
        amount: number;
        type: string;
        notes?: string;
    }) => Promise<unknown>;
    processRefund: (id: string) => Promise<unknown>;
    completeRefund: (id: string) => Promise<unknown>;
    failRefund: (id: string, data?: {
        notes?: string;
    }) => Promise<unknown>;
    getNotifications: (params?: Record<string, string | number | undefined>) => Promise<{
        notifications: Array<{
            id: string;
            type: string;
            channel: string;
            isRead: boolean;
            createdAt: string;
            profileId: string;
            title: string;
            body: string;
        }>;
        pagination?: {
            totalPages: number;
            total: number;
        };
    }>;
    getNotificationTemplates: () => Promise<{
        templates: Array<{
            id: string;
            name: string;
            type: string;
            emailSubject: string;
            emailBody: string;
            smsBody: string;
            inAppBody: string;
            isActive: boolean;
        }>;
    }>;
    updateNotificationTemplate: (id: string, data: unknown) => Promise<unknown>;
    sendManualNotification: (data: {
        profileId: string;
        type: string;
        title: string;
        body?: string;
    }) => Promise<unknown>;
    getSupportTickets: (params?: Record<string, string | number | undefined>) => Promise<{
        tickets: Array<{
            id: string;
            subject: string;
            status: string;
            createdAt: string;
        }>;
        pagination?: {
            totalPages: number;
        };
    }>;
    getSupportTicket: (id: string) => Promise<{
        ticket: {
            id: string;
            subject: string;
            status: string;
            messages: unknown[];
        };
    }>;
    updateSupportTicketStatus: (id: string, data: {
        status: string;
    }) => Promise<unknown>;
    assignSupportTicket: (id: string, data: {
        assignedTo: string;
    }) => Promise<unknown>;
    replySupportTicket: (id: string, data: {
        message: string;
    }) => Promise<unknown>;
    getFaqs: () => Promise<{
        faqs: Array<{
            id: string;
            question: string;
            answer: string;
            category: string;
            sortOrder: number;
        }>;
    }>;
    createFaq: (data: {
        question: string;
        answer: string;
        category?: string;
        sortOrder?: number;
    }) => Promise<unknown>;
    updateFaq: (id: string, data: unknown) => Promise<unknown>;
    deleteFaq: (id: string) => Promise<unknown>;
    getWebhookEvents: (params?: Record<string, string | number | undefined>) => Promise<{
        events: Array<{
            id: string;
            eventType: string;
            status: string;
            createdAt: string;
        }>;
        pagination?: {
            totalPages: number;
            total: number;
        };
    }>;
    reprocessWebhookEvent: (id: string) => Promise<unknown>;
    reconcileWebhookOrder: (orderId: string) => Promise<unknown>;
    getOrderInvoice: (orderId: string) => Promise<{
        html: string;
    }>;
    generateOrderInvoice: (orderId: string) => Promise<{
        invoiceUrl?: string;
    }>;
    getCampaigns: () => Promise<{
        campaigns: Array<{
            id: string;
            name: string;
            type: string;
            isActive: boolean;
        }>;
    }>;
    getCampaign: (id: string) => Promise<{
        campaign: {
            id: string;
            name: string;
            type: string;
            isActive: boolean;
        };
    }>;
    createCampaign: (data: unknown) => Promise<unknown>;
    updateCampaign: (id: string, data: unknown) => Promise<unknown>;
    deleteCampaign: (id: string) => Promise<unknown>;
    getCouponRedemptions: (params?: Record<string, string | number | undefined>) => Promise<{
        redemptions: Array<{
            id: string;
            couponCode: string;
            orderNumber: string;
            profileEmail: string;
            createdAt: string;
        }>;
    }>;
    getAbandonedCarts: (params?: Record<string, string | number | undefined>) => Promise<{
        carts: Array<{
            id: string;
            profileId: string;
            createdAt: string;
            profile: {
                firstName: string;
                lastName: string;
                email: string;
            };
        }>;
        pagination?: {
            total: number;
            totalPages: number;
        };
    }>;
    getAuditLog: (params?: Record<string, string | number | undefined>) => Promise<{
        logs: Array<{
            id: string;
            action: string;
            userId: string;
            entity: string;
            entityId: string;
            metadata: unknown;
            createdAt: string;
            profile: {
                firstName: string;
                lastName: string;
                email: string;
            };
        }>;
        pagination?: {
            totalPages: number;
        };
    }>;
    getWishlists: (params?: Record<string, string | number | undefined>) => Promise<{
        wishlists: Array<{
            id: string;
            profileId: string;
            productId: string;
            createdAt: string;
        }>;
    }>;
    getProductAttributes: (productId: string) => Promise<{
        attributes: Array<{
            id: string;
            productId: string;
            key: string;
            value: string;
        }>;
    }>;
    createProductAttribute: (productId: string, data: unknown) => Promise<unknown>;
    updateProductAttribute: (id: string, data: unknown) => Promise<unknown>;
    deleteProductAttribute: (id: string) => Promise<unknown>;
    getAddresses: (params?: Record<string, string | number | undefined>) => Promise<{
        addresses: Array<{
            id: string;
            fullName: string;
            line1: string;
            city: string;
            state: string;
        }>;
    }>;
    getSessions: (params?: Record<string, string | number | undefined>) => Promise<{
        sessions: Array<{
            id: string;
            profileId: string;
            userAgent: string;
            ipAddress: string;
            isActive: boolean;
        }>;
        pagination?: {
            totalPages: number;
        };
    }>;
    revokeSession: (id: string) => Promise<unknown>;
    getLoginAttempts: (params?: Record<string, string | number | undefined>) => Promise<{
        loginAttempts: Array<{
            id: string;
            email: string;
            success: boolean;
            ipAddress: string;
            createdAt: string;
        }>;
        pagination?: {
            totalPages: number;
        };
    }>;
};
