export declare const api: {
    get: <T>(endpoint: string, options?: import("./client").RequestOptions) => Promise<T>;
    post: <T>(endpoint: string, body?: unknown, options?: import("./client").RequestOptions) => Promise<T>;
    put: <T>(endpoint: string, body?: unknown, options?: import("./client").RequestOptions) => Promise<T>;
    patch: <T>(endpoint: string, body?: unknown, options?: import("./client").RequestOptions) => Promise<T>;
    delete: <T>(endpoint: string, options?: import("./client").RequestOptions) => Promise<T>;
};
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
    recentOrders: Record<string, unknown>[];
    recentCustomers: Record<string, unknown>[];
    dailySales: {
        date: string;
        revenue: number;
        orders: number;
    }[];
}
export declare const adminApi: {
    getDashboard: () => Promise<DashboardStats>;
    getProducts: (params?: Record<string, string | number | undefined>) => Promise<{
        products: unknown[];
        pagination: unknown;
    }>;
    getProduct: (id: string) => Promise<{
        product: unknown;
    }>;
    createProduct: (data: unknown) => Promise<Record<string, unknown>>;
    updateProduct: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteProduct: (id: string) => Promise<{
        message: string;
    }>;
    updateProductVariants: (id: string, variants: unknown[]) => Promise<{
        variants: unknown[];
    }>;
    addProductImage: (id: string, data: {
        url: string;
        publicId?: string;
        altText?: string;
        isPrimary?: boolean;
        sortOrder?: number;
        variantId?: string;
        type?: string;
    }) => Promise<Record<string, unknown>>;
    deleteProductImage: (productId: string, imageId: string) => Promise<unknown>;
    getCategories: () => Promise<{
        categories: unknown[];
    }>;
    createCategory: (data: unknown) => Promise<Record<string, unknown>>;
    updateCategory: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteCategory: (id: string) => Promise<{
        message: string;
    }>;
    getCollections: () => Promise<{
        collections: unknown[];
    }>;
    createCollection: (data: unknown) => Promise<Record<string, unknown>>;
    updateCollection: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteCollection: (id: string) => Promise<{
        message: string;
    }>;
    getOrders: (params?: Record<string, string | number | undefined>) => Promise<{
        orders: unknown[];
        pagination: unknown;
    }>;
    getOrder: (id: string) => Promise<{
        order: unknown;
    }>;
    updateOrderStatus: (id: string, data: {
        status: string;
        note?: string;
    }) => Promise<Record<string, unknown>>;
    getCustomers: (params?: Record<string, string | number | undefined>) => Promise<{
        customers: unknown[];
        pagination: unknown;
    }>;
    getCustomer: (id: string) => Promise<{
        customer: unknown;
    }>;
    updateCustomer: (id: string, data: unknown) => Promise<{
        customer: unknown;
    }>;
    getPages: () => Promise<{
        pages: unknown[];
    }>;
    getPage: (id: string) => Promise<{
        page: unknown;
    }>;
    createPage: (data: unknown) => Promise<Record<string, unknown>>;
    updatePage: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deletePage: (id: string) => Promise<{
        message: string;
    }>;
    getHomepageSections: () => Promise<{
        sections: unknown[];
    }>;
    createHomeSection: (data: unknown) => Promise<Record<string, unknown>>;
    updateHomeSection: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteHomeSection: (id: string) => Promise<{
        message: string;
    }>;
    reorderHomeSections: (order: {
        id: string;
        sortOrder: number;
    }[]) => Promise<unknown>;
    getNavigationMenus: () => Promise<{
        menus: unknown[];
    }>;
    createNavigation: (data: unknown) => Promise<Record<string, unknown>>;
    updateNavigation: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteNavigation: (id: string) => Promise<{
        message: string;
    }>;
    getFooterSections: () => Promise<{
        sections: unknown[];
    }>;
    createFooterSection: (data: unknown) => Promise<Record<string, unknown>>;
    updateFooterSection: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteFooterSection: (id: string) => Promise<{
        message: string;
    }>;
    getAnnouncements: () => Promise<{
        announcements: unknown[];
    }>;
    createAnnouncement: (data: unknown) => Promise<Record<string, unknown>>;
    updateAnnouncement: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteAnnouncement: (id: string) => Promise<{
        message: string;
    }>;
    getCoupons: () => Promise<{
        coupons: unknown[];
    }>;
    createCoupon: (data: unknown) => Promise<Record<string, unknown>>;
    updateCoupon: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteCoupon: (id: string) => Promise<{
        message: string;
    }>;
    getReviews: (params?: Record<string, string | undefined>) => Promise<{
        reviews: unknown[];
        pagination: unknown;
    }>;
    approveReview: (id: string, approved: boolean) => Promise<Record<string, unknown>>;
    deleteReview: (id: string) => Promise<{
        message: string;
    }>;
    getSalesAnalytics: (params?: Record<string, string | undefined>) => Promise<Record<string, unknown>>;
    getProductAnalytics: () => Promise<Record<string, unknown>>;
    getCustomerAnalytics: () => Promise<Record<string, unknown>>;
    getDeliveryAddressAnalytics: (params?: Record<string, string | undefined>) => Promise<Record<string, unknown>>;
    getSettings: () => Promise<{
        settings: unknown;
    }>;
    updateSettings: (data: unknown) => Promise<Record<string, unknown>>;
    getSocialLinks: () => Promise<{
        links: unknown[];
    }>;
    createSocialLink: (data: unknown) => Promise<Record<string, unknown>>;
    updateSocialLink: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteSocialLink: (id: string) => Promise<{
        message: string;
    }>;
    getMedia: (params?: Record<string, string | number | undefined>) => Promise<{
        assets: unknown[];
        folders: unknown[];
        pagination: unknown;
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
    }) => Promise<Record<string, unknown>>;
    updateMedia: (id: string, data: {
        altText?: string;
        displayName?: string;
        folder?: string;
        tags?: string[];
        sortOrder?: number;
        isPrimary?: boolean;
    }) => Promise<Record<string, unknown>>;
    deleteMedia: (id: string) => Promise<{
        message: string;
    }>;
    getContactSubmissions: (params?: Record<string, string | undefined>) => Promise<{
        submissions: unknown[];
        unreadCount: number;
        pagination: unknown;
    }>;
    markContactRead: (id: string) => Promise<Record<string, unknown>>;
    deleteContactSubmission: (id: string) => Promise<{
        message: string;
    }>;
    getNewsletterSubscribers: (params?: Record<string, string | number | undefined>) => Promise<{
        subscribers: unknown[];
        pagination: unknown;
    }>;
    deleteSubscriber: (id: string) => Promise<{
        message: string;
    }>;
    getTemplates: () => Promise<{
        templates: unknown[];
    }>;
    getTemplate: (id: string) => Promise<{
        template: unknown;
    }>;
    createTemplate: (data: unknown) => Promise<Record<string, unknown>>;
    updateTemplate: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteTemplate: (id: string) => Promise<{
        message: string;
    }>;
    applyTemplate: (templateId: string, pageId: string) => Promise<{
        page: unknown;
    }>;
    exportProducts: (format?: "csv" | "json", categoryId?: string) => Promise<Record<string, unknown>>;
    importProducts: (data: FormData | Record<string, unknown>[]) => Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    exportOrders: (format?: "csv" | "json", status?: string) => Promise<Record<string, unknown>>;
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
        lookbooks: unknown[];
    }>;
    getLookbook: (id: string) => Promise<{
        lookbook: unknown;
    }>;
    createLookbook: (data: unknown) => Promise<Record<string, unknown>>;
    updateLookbook: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteLookbook: (id: string) => Promise<{
        message: string;
    }>;
    addLookbookItem: (lookbookId: string, data: unknown) => Promise<Record<string, unknown>>;
    removeLookbookItem: (lookbookId: string, itemId: string) => Promise<{
        message: string;
    }>;
    updateLookbookItem: (lookbookId: string, itemId: string, data: unknown) => Promise<Record<string, unknown>>;
    reorderLookbookItems: (lookbookId: string, order: {
        id: string;
        sortOrder: number;
    }[]) => Promise<unknown>;
    getBrands: () => Promise<{
        brands: unknown[];
    }>;
    getBrand: (id: string) => Promise<{
        brand: unknown;
    }>;
    createBrand: (data: unknown) => Promise<Record<string, unknown>>;
    updateBrand: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteBrand: (id: string) => Promise<{
        message: string;
    }>;
    getSizeGuides: () => Promise<{
        sizeGuides: unknown[];
    }>;
    getSizeGuide: (id: string) => Promise<{
        sizeGuide: unknown;
    }>;
    createSizeGuide: (data: unknown) => Promise<Record<string, unknown>>;
    updateSizeGuide: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteSizeGuide: (id: string) => Promise<{
        message: string;
    }>;
    getSubcategories: () => Promise<{
        subcategories: unknown[];
    }>;
    createSubcategory: (data: unknown) => Promise<Record<string, unknown>>;
    updateSubcategory: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteSubcategory: (id: string) => Promise<{
        message: string;
    }>;
    getLabels: () => Promise<{
        labels: unknown[];
    }>;
    createLabel: (data: unknown) => Promise<Record<string, unknown>>;
    updateLabel: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteLabel: (id: string) => Promise<{
        message: string;
    }>;
    getTags: () => Promise<{
        tags: unknown[];
    }>;
    createTag: (data: unknown) => Promise<Record<string, unknown>>;
    updateTag: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteTag: (id: string) => Promise<{
        message: string;
    }>;
    assignLabels: (productId: string, labelIds: string[]) => Promise<unknown>;
    assignTags: (productId: string, tagIds: string[]) => Promise<unknown>;
    getRelatedProducts: (productId: string) => Promise<{
        related: unknown[];
    }>;
    addRelatedProduct: (data: {
        sourceId: string;
        targetId: string;
        type?: string;
    }) => Promise<Record<string, unknown>>;
    removeRelatedProduct: (id: string) => Promise<{
        message: string;
    }>;
    reorderRelatedProducts: (productId: string, order: {
        id: string;
        sortOrder: number;
    }[]) => Promise<unknown>;
    getInventoryOverview: () => Promise<{
        stats: unknown;
        recentMovements: unknown[];
        alerts: unknown[];
    }>;
    getProductMovements: (productId: string) => Promise<{
        variants: unknown[];
        movements: unknown[];
    }>;
    getVariantMovements: (variantId: string) => Promise<{
        movements: unknown[];
    }>;
    adjustVariantStock: (variantId: string, data: {
        quantityChange: number;
        reason: string;
        note?: string;
    }) => Promise<Record<string, unknown>>;
    getInventoryAlerts: (params?: Record<string, string | undefined>) => Promise<{
        alerts: unknown[];
        count: number;
    }>;
    resolveAlert: (alertId: string) => Promise<Record<string, unknown>>;
    duplicateProduct: (id: string) => Promise<{
        product: unknown;
        message: string;
    }>;
    restoreProduct: (id: string) => Promise<{
        message: string;
    }>;
    scheduleProduct: (id: string, data: {
        publishAt?: string;
        archiveAt?: string;
    }) => Promise<Record<string, unknown>>;
    bulkUpdateStatus: (ids: string[], status: boolean) => Promise<{
        updated: number;
    }>;
    bulkUpdateCategory: (ids: string[], data: {
        categoryId?: string;
        subcategoryId?: string;
        collectionId?: string;
    }) => Promise<{
        updated: number;
    }>;
    bulkDeleteProducts: (ids: string[]) => Promise<{
        archived: number;
    }>;
    permanentDeleteProduct: (id: string) => Promise<{
        message: string;
    }>;
    bulkPermanentDeleteProducts: (ids: string[]) => Promise<{
        deleted: number;
    }>;
    uploadFile: (file: File, entityType?: string, slug?: string, entityId?: string, altText?: string) => Promise<{
        id: string;
        assetId: string;
        url: string;
        publicId: string;
        folder: string;
        width: number | null;
        height: number | null;
        format: string;
        bytes: number;
        mimeType: string;
        resourceType: string;
    }>;
    getOrderStats: () => Promise<Record<string, unknown>>;
    updateOrderInternalNotes: (id: string, notes: string) => Promise<{
        order: unknown;
    }>;
    getOrderTimeline: (id: string) => Promise<{
        timeline: unknown[];
    }>;
    getReturns: (params?: Record<string, string | number | undefined>) => Promise<{
        returns: unknown[];
        pagination: unknown;
    }>;
    getReturn: (id: string) => Promise<{
        return: unknown;
    }>;
    approveReturn: (id: string, data?: {
        adminNote?: string;
    }) => Promise<Record<string, unknown>>;
    rejectReturn: (id: string, data: {
        adminNote: string;
    }) => Promise<Record<string, unknown>>;
    receiveReturn: (id: string) => Promise<Record<string, unknown>>;
    getRefunds: (params?: Record<string, string | number | undefined>) => Promise<{
        refunds: unknown[];
        pagination: unknown;
    }>;
    getRefund: (id: string) => Promise<{
        refund: unknown;
    }>;
    createRefund: (data: {
        orderId: string;
        returnRequestId?: string;
        amount: number;
        type: string;
        notes?: string;
    }) => Promise<Record<string, unknown>>;
    processRefund: (id: string) => Promise<Record<string, unknown>>;
    completeRefund: (id: string) => Promise<Record<string, unknown>>;
    failRefund: (id: string, data?: {
        notes?: string;
    }) => Promise<Record<string, unknown>>;
    getNotifications: (params?: Record<string, string | number | undefined>) => Promise<{
        notifications: unknown[];
    }>;
    getNotificationTemplates: () => Promise<{
        templates: unknown[];
    }>;
    updateNotificationTemplate: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    sendManualNotification: (data: {
        profileId: string;
        type: string;
        title: string;
        body?: string;
    }) => Promise<Record<string, unknown>>;
    getSupportTickets: (params?: Record<string, string | number | undefined>) => Promise<{
        tickets: unknown[];
        pagination: unknown;
    }>;
    getSupportTicket: (id: string) => Promise<{
        ticket: unknown;
    }>;
    updateSupportTicketStatus: (id: string, data: {
        status: string;
    }) => Promise<Record<string, unknown>>;
    assignSupportTicket: (id: string, data: {
        assignedTo: string;
    }) => Promise<Record<string, unknown>>;
    replySupportTicket: (id: string, data: {
        message: string;
    }) => Promise<Record<string, unknown>>;
    getFaqs: () => Promise<{
        faqs: unknown[];
    }>;
    createFaq: (data: {
        question: string;
        answer: string;
        category?: string;
        sortOrder?: number;
    }) => Promise<Record<string, unknown>>;
    updateFaq: (id: string, data: unknown) => Promise<Record<string, unknown>>;
    deleteFaq: (id: string) => Promise<{
        message: string;
    }>;
    getWebhookEvents: (params?: Record<string, string | number | undefined>) => Promise<{
        events: unknown[];
        pagination: unknown;
    }>;
    reprocessWebhookEvent: (id: string) => Promise<Record<string, unknown>>;
    reconcileWebhookOrder: (orderId: string) => Promise<Record<string, unknown>>;
    getOrderInvoice: (orderId: string) => Promise<{
        html: string;
    }>;
    generateOrderInvoice: (orderId: string) => Promise<{
        order: unknown;
    }>;
    getCampaigns: () => Promise<{
        campaigns: unknown[];
    }>;
    getCampaign: (id: string) => Promise<{
        campaign: unknown;
    }>;
    createCampaign: (data: unknown) => Promise<{
        campaign: unknown;
    }>;
    updateCampaign: (id: string, data: unknown) => Promise<{
        campaign: unknown;
    }>;
    deleteCampaign: (id: string) => Promise<{
        message: string;
    }>;
    getCouponRedemptions: (params?: Record<string, string | number | undefined>) => Promise<{
        redemptions: unknown[];
        pagination: unknown;
    }>;
    getAbandonedCarts: (params?: Record<string, string | number | undefined>) => Promise<{
        carts: unknown[];
        pagination: unknown;
    }>;
    getAuditLog: (params?: Record<string, string | number | undefined>) => Promise<{
        logs: unknown[];
        pagination: unknown;
    }>;
    getWishlists: (params?: Record<string, string | number | undefined>) => Promise<Record<string, unknown>>;
    getProductAttributes: (productId: string) => Promise<{
        attributes: unknown[];
    }>;
    createProductAttribute: (productId: string, data: unknown) => Promise<{
        attribute: unknown;
    }>;
    updateProductAttribute: (id: string, data: unknown) => Promise<{
        attribute: unknown;
    }>;
    deleteProductAttribute: (id: string) => Promise<{
        message: string;
    }>;
    getAddresses: (params?: Record<string, string | number | undefined>) => Promise<{
        addresses: unknown[];
        pagination: unknown;
    }>;
    getSessions: (params?: Record<string, string | number | undefined>) => Promise<{
        sessions: unknown[];
        pagination: unknown;
    }>;
    revokeSession: (id: string) => Promise<{
        message: string;
    }>;
    getLoginAttempts: (params?: Record<string, string | number | undefined>) => Promise<Record<string, unknown>>;
};
