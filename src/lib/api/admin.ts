import { api } from "./client";

// ─── Dashboard ───

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
  ordersByStatus: { status: string; count: number }[];
  recentOrders: unknown[];
  recentCustomers: unknown[];
  dailySales: { date: string; revenue: number; orders: number }[];
}

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get<DashboardStats>("/admin/dashboard"),

  // Products
  getProducts: (params?: Record<string, string | number | undefined>) =>
    api.get<{ products: unknown[]; pagination: unknown }>("/admin/products", { params }),
  getProduct: (id: string) => api.get<{ product: unknown }>(`/admin/products/${id}`),
  createProduct: (data: unknown) => api.post<unknown>("/admin/products", data),
  updateProduct: (id: string, data: unknown) => api.put<unknown>(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete<{ message: string }>(`/admin/products/${id}`),
  updateProductVariants: (id: string, variants: unknown[]) =>
    api.put<{ variants: unknown[] }>(`/admin/products/${id}/variants`, { variants }),
  addProductImage: (id: string, data: { url: string; publicId?: string; altText?: string; isPrimary?: boolean; variantId?: string }) =>
    api.post<unknown>(`/admin/products/${id}/images`, data),
  deleteProductImage: (productId: string, imageId: string) =>
    api.delete(`/admin/products/${productId}/images/${imageId}`),

  // Categories
  getCategories: () => api.get<{ categories: unknown[] }>("/admin/categories"),
  createCategory: (data: unknown) => api.post<unknown>("/admin/categories", data),
  updateCategory: (id: string, data: unknown) => api.put<unknown>(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete<{ message: string }>(`/admin/categories/${id}`),

  // Collections
  getCollections: () => api.get<{ collections: unknown[] }>("/admin/collections"),
  createCollection: (data: unknown) => api.post<unknown>("/admin/collections", data),
  updateCollection: (id: string, data: unknown) => api.put<unknown>(`/admin/collections/${id}`, data),
  deleteCollection: (id: string) => api.delete<{ message: string }>(`/admin/collections/${id}`),

  // Orders
  getOrders: (params?: Record<string, string | number | undefined>) =>
    api.get<{ orders: unknown[]; pagination: unknown }>("/admin/orders", { params }),
  getOrder: (id: string) => api.get<{ order: unknown }>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, data: { status: string; note?: string }) =>
    api.put<unknown>(`/admin/orders/${id}/status`, data),
  // Customers
  getCustomers: (params?: Record<string, string | number | undefined>) =>
    api.get<{ customers: unknown[]; pagination: unknown }>("/admin/customers", { params }),
  getCustomer: (id: string) => api.get<{ customer: unknown }>(`/admin/customers/${id}`),
  updateCustomer: (id: string, data: unknown) => api.put<{ customer: unknown }>(`/admin/customers/${id}`, data),

  // CMS Pages
  getPages: () => api.get<{ pages: unknown[] }>("/admin/cms/pages"),
  getPage: (id: string) => api.get<{ page: unknown }>(`/admin/cms/pages/${id}`),
  createPage: (data: unknown) => api.post<unknown>("/admin/cms/pages", data),
  updatePage: (id: string, data: unknown) => api.put<unknown>(`/admin/cms/pages/${id}`, data),
  deletePage: (id: string) => api.delete<{ message: string }>(`/admin/cms/pages/${id}`),

  // Homepage
  getHomepageSections: () => api.get<{ sections: unknown[] }>("/admin/cms/homepage"),
  createHomeSection: (data: unknown) => api.post<unknown>("/admin/cms/homepage", data),
  updateHomeSection: (id: string, data: unknown) => api.put<unknown>(`/admin/cms/homepage/${id}`, data),
  deleteHomeSection: (id: string) => api.delete<{ message: string }>(`/admin/cms/homepage/${id}`),
  reorderHomeSections: (order: { id: string; sortOrder: number }[]) =>
    api.put("/admin/cms/homepage/reorder", { order }),

  // Navigation
  getNavigationMenus: () => api.get<{ menus: unknown[] }>("/admin/cms/navigation"),
  createNavigation: (data: unknown) => api.post<unknown>("/admin/cms/navigation", data),
  updateNavigation: (id: string, data: unknown) => api.put<unknown>(`/admin/cms/navigation/${id}`, data),
  deleteNavigation: (id: string) => api.delete<{ message: string }>(`/admin/cms/navigation/${id}`),

  // Footer
  getFooterSections: () => api.get<{ sections: unknown[] }>("/admin/cms/footer"),
  createFooterSection: (data: unknown) => api.post<unknown>("/admin/cms/footer", data),
  updateFooterSection: (id: string, data: unknown) => api.put<unknown>(`/admin/cms/footer/${id}`, data),
  deleteFooterSection: (id: string) => api.delete<{ message: string }>(`/admin/cms/footer/${id}`),

  // Brand Story
  getBrandStory: () => api.get<{ story: unknown }>("/admin/cms/brand-story"),
  updateBrandStory: (data: unknown) => api.put<unknown>("/admin/cms/brand-story", data),

  // Announcements
  getAnnouncements: () => api.get<{ announcements: unknown[] }>("/admin/cms/announcements"),
  createAnnouncement: (data: unknown) => api.post<unknown>("/admin/cms/announcements", data),
  updateAnnouncement: (id: string, data: unknown) => api.put<unknown>(`/admin/cms/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete<{ message: string }>(`/admin/cms/announcements/${id}`),

  // Coupons
  getCoupons: () => api.get<{ coupons: unknown[] }>("/admin/coupons"),
  createCoupon: (data: unknown) => api.post<unknown>("/admin/coupons", data),
  updateCoupon: (id: string, data: unknown) => api.put<unknown>(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete<{ message: string }>(`/admin/coupons/${id}`),

  // Reviews
  getReviews: (params?: Record<string, string | undefined>) =>
    api.get<{ reviews: unknown[]; pagination: unknown }>("/admin/reviews", { params }),
  approveReview: (id: string, approved: boolean) =>
    api.put<unknown>(`/admin/reviews/${id}/approve`, { approved }),

  // Analytics
  getSalesAnalytics: (params?: Record<string, string | undefined>) =>
    api.get<unknown>("/admin/analytics/sales", { params }),
  getProductAnalytics: () => api.get<unknown>("/admin/analytics/products"),
  getCustomerAnalytics: () => api.get<unknown>("/admin/analytics/customers"),
  getDeliveryAddressAnalytics: (params?: Record<string, string | undefined>) =>
    api.get<unknown>("/admin/analytics/delivery-addresses", { params }),

  // Settings
  getSettings: () => api.get<{ settings: unknown }>("/admin/settings"),
  updateSettings: (data: unknown) => api.put<unknown>("/admin/settings", data),

  // Social Links
  getSocialLinks: () => api.get<{ links: unknown[] }>("/admin/social-links"),
  createSocialLink: (data: unknown) => api.post<unknown>("/admin/social-links", data),
  updateSocialLink: (id: string, data: unknown) => api.put<unknown>(`/admin/social-links/${id}`, data),
  deleteSocialLink: (id: string) => api.delete<{ message: string }>(`/admin/social-links/${id}`),

  // Media
  getMedia: (params?: Record<string, string | number | undefined>) =>
    api.get<{ assets: unknown[]; folders: unknown[]; pagination: unknown }>("/admin/media", { params }),
  createMedia: (data: { url: string; publicId?: string; type?: string; altText?: string; folder?: string; tags?: string[]; width?: number | null; height?: number | null; fileSize?: number | null; mimeType?: string }) =>
    api.post<unknown>("/admin/media", data),
  updateMedia: (id: string, data: { altText?: string; folder?: string }) =>
    api.put<unknown>(`/admin/media/${id}`, data),
  deleteMedia: (id: string) => api.delete<{ message: string }>(`/admin/media/${id}`),

  // Contact Submissions
  getContactSubmissions: (params?: Record<string, string | undefined>) =>
    api.get<{ submissions: unknown[]; unreadCount: number; pagination: unknown }>("/admin/contact-submissions", { params }),
  markContactRead: (id: string) => api.put<unknown>(`/admin/contact-submissions/${id}/read`),
  deleteContactSubmission: (id: string) => api.delete<{ message: string }>(`/admin/contact-submissions/${id}`),

  // Newsletter
  getNewsletterSubscribers: (params?: Record<string, string | number | undefined>) =>
    api.get<{ subscribers: unknown[]; pagination: unknown }>("/admin/newsletter-subscribers", { params }),
  deleteSubscriber: (id: string) => api.delete<{ message: string }>(`/admin/newsletter-subscribers/${id}`),

  // Templates
  getTemplates: () => api.get<{ templates: unknown[] }>("/admin/templates"),
  getTemplate: (id: string) => api.get<{ template: unknown }>(`/admin/templates/${id}`),
  createTemplate: (data: unknown) => api.post<unknown>("/admin/templates", data),
  updateTemplate: (id: string, data: unknown) => api.put<unknown>(`/admin/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete<{ message: string }>(`/admin/templates/${id}`),
  applyTemplate: (templateId: string, pageId: string) =>
    api.post<{ page: unknown }>(`/admin/templates/${templateId}/apply`, { pageId }),

  // Import / Export
  exportProducts: (format: "csv" | "json" = "csv", categoryId?: string) => {
    const params = new URLSearchParams({ format });
    if (categoryId) params.set("categoryId", categoryId);
    return api.get<unknown>(`/admin/products/export?${params}`);
  },
  importProducts: (data: FormData | Record<string, unknown>[]) =>
    api.post<{ imported: number; skipped: number; errors: string[] }>("/admin/products/import", data),
  exportOrders: (format: "csv" | "json" = "csv", status?: string) => {
    const params = new URLSearchParams({ format });
    if (status) params.set("status", status);
    return api.get<unknown>(`/admin/orders/export?${params}`);
  },

  // Search Index
  getSearchIndexStatus: () => api.get<{ indexed: boolean; count: number; lastIndexed: string | null }>("/admin/search/status"),
  buildSearchIndex: () => api.post<{ indexed: number; types: Record<string, number> }>("/admin/search/build"),
  searchIndex: (q: string, options?: { type?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams({ q });
    if (options?.type) params.set("type", options.type);
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    return api.get<{ results: unknown[]; total: number }>(`/admin/search?${params}`);
  },

  // Enhanced Lookbook
  getLookbooks: () => api.get<{ lookbooks: unknown[] }>("/admin/lookbooks"),
  getLookbook: (id: string) => api.get<{ lookbook: unknown }>(`/admin/lookbooks/${id}`),
  createLookbook: (data: unknown) => api.post<unknown>("/admin/lookbooks", data),
  updateLookbook: (id: string, data: unknown) => api.put<unknown>(`/admin/lookbooks/${id}`, data),
  deleteLookbook: (id: string) => api.delete<{ message: string }>(`/admin/lookbooks/${id}`),
  addLookbookItem: (lookbookId: string, data: unknown) =>
    api.post<unknown>(`/admin/lookbooks/${lookbookId}/items`, data),
  removeLookbookItem: (lookbookId: string, itemId: string) =>
    api.delete<{ message: string }>(`/admin/lookbooks/${lookbookId}/items/${itemId}`),
  updateLookbookItem: (lookbookId: string, itemId: string, data: unknown) =>
    api.put<unknown>(`/admin/lookbooks/${lookbookId}/items/${itemId}`, data),
  reorderLookbookItems: (lookbookId: string, order: { id: string; sortOrder: number }[]) =>
    api.put(`/admin/lookbooks/${lookbookId}/items/reorder`, { order }),

  // Brands
  getBrands: () => api.get<{ brands: unknown[] }>("/admin/brands"),
  getBrand: (id: string) => api.get<{ brand: unknown }>(`/admin/brands/${id}`),
  createBrand: (data: unknown) => api.post<unknown>("/admin/brands", data),
  updateBrand: (id: string, data: unknown) => api.put<unknown>(`/admin/brands/${id}`, data),
  deleteBrand: (id: string) => api.delete<{ message: string }>(`/admin/brands/${id}`),

  // Size Guides
  getSizeGuides: () => api.get<{ sizeGuides: unknown[] }>("/admin/size-guides"),
  getSizeGuide: (id: string) => api.get<{ sizeGuide: unknown }>(`/admin/size-guides/${id}`),
  createSizeGuide: (data: unknown) => api.post<unknown>("/admin/size-guides", data),
  updateSizeGuide: (id: string, data: unknown) => api.put<unknown>(`/admin/size-guides/${id}`, data),
  deleteSizeGuide: (id: string) => api.delete<{ message: string }>(`/admin/size-guides/${id}`),

  // Subcategories
  getSubcategories: () => api.get<{ subcategories: unknown[] }>("/admin/subcategories"),
  createSubcategory: (data: unknown) => api.post<unknown>("/admin/subcategories", data),
  updateSubcategory: (id: string, data: unknown) => api.put<unknown>(`/admin/subcategories/${id}`, data),
  deleteSubcategory: (id: string) => api.delete<{ message: string }>(`/admin/subcategories/${id}`),

  // Labels
  getLabels: () => api.get<{ labels: unknown[] }>("/admin/product-labels"),
  createLabel: (data: unknown) => api.post<unknown>("/admin/product-labels", data),
  updateLabel: (id: string, data: unknown) => api.put<unknown>(`/admin/product-labels/${id}`, data),
  deleteLabel: (id: string) => api.delete<{ message: string }>(`/admin/product-labels/${id}`),

  // Tags
  getTags: () => api.get<{ tags: unknown[] }>("/admin/product-tags"),
  createTag: (data: unknown) => api.post<unknown>("/admin/product-tags", data),
  updateTag: (id: string, data: unknown) => api.put<unknown>(`/admin/product-tags/${id}`, data),
  deleteTag: (id: string) => api.delete<{ message: string }>(`/admin/product-tags/${id}`),

  // Assign labels/tags to product
  assignLabels: (productId: string, labelIds: string[]) =>
    api.put(`/admin/products/${productId}/labels`, { labelIds }),
  assignTags: (productId: string, tagIds: string[]) =>
    api.put(`/admin/products/${productId}/tags`, { tagIds }),

  // Related Products
  getRelatedProducts: (productId: string) =>
    api.get<{ related: unknown[] }>(`/admin/products/${productId}/related`),
  addRelatedProduct: (data: { sourceId: string; targetId: string; type?: string }) =>
    api.post<unknown>("/admin/related-products", data),
  removeRelatedProduct: (id: string) =>
    api.delete<{ message: string }>(`/admin/related-products/${id}`),
  reorderRelatedProducts: (productId: string, order: { id: string; sortOrder: number }[]) =>
    api.put(`/admin/products/${productId}/related/reorder`, { order }),

  // Inventory
  getInventoryOverview: () =>
    api.get<{ stats: unknown; recentMovements: unknown[]; alerts: unknown[] }>("/admin/inventory/overview"),
  getProductMovements: (productId: string) =>
    api.get<{ variants: unknown[]; movements: unknown[] }>(`/admin/inventory/product/${productId}/movements`),
  getVariantMovements: (variantId: string) =>
    api.get<{ movements: unknown[] }>(`/admin/inventory/variant/${variantId}/movements`),
  adjustVariantStock: (variantId: string, data: { quantityChange: number; reason: string; note?: string }) =>
    api.post<unknown>(`/admin/inventory/variant/${variantId}/adjust`, data),
  getInventoryAlerts: (params?: Record<string, string | undefined>) =>
    api.get<{ alerts: unknown[]; count: number }>("/admin/inventory/alerts", { params }),
  resolveAlert: (alertId: string) =>
    api.put<unknown>(`/admin/inventory/alerts/${alertId}/resolve`),

  // Enhanced Product Actions
  duplicateProduct: (id: string) =>
    api.post<{ product: unknown; message: string }>(`/admin/products/${id}/duplicate`),
  restoreProduct: (id: string) =>
    api.put<{ message: string }>(`/admin/products/${id}/restore`),
  scheduleProduct: (id: string, data: { publishAt?: string; archiveAt?: string }) =>
    api.put<unknown>(`/admin/products/${id}/schedule`, data),
  bulkUpdateStatus: (ids: string[], status: boolean) =>
    api.put<{ updated: number }>("/admin/products/bulk/status", { ids, status }),
  bulkUpdateCategory: (ids: string[], data: { categoryId?: string; subcategoryId?: string; collectionId?: string }) =>
    api.put<{ updated: number }>("/admin/products/bulk/category", { ids, ...data }),
  bulkDeleteProducts: (ids: string[]) =>
    api.put<{ archived: number }>("/admin/products/bulk/delete", { ids }),
  permanentDeleteProduct: (id: string) =>
    api.delete<{ message: string }>(`/admin/products/${id}/permanent`),
  bulkPermanentDeleteProducts: (ids: string[]) =>
    api.put<{ deleted: number }>("/admin/products/bulk/permanent-delete", { ids }),

  // Upload
  uploadFile: (file: File, folder?: string, altText?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);
    if (altText) formData.append("altText", altText);
    return api.post<{ url: string; publicId: string; width: number; height: number; format: string; bytes: number; type: string; mimeType: string; folder: string }>("/upload", formData, {
      headers: {} as Record<string, string>,
    });
  },

  // Enhanced Orders
  getOrderStats: () => api.get<Record<string, unknown>>("/admin/orders/stats"),
  updateOrderInternalNotes: (id: string, notes: string) =>
    api.put<{ order: unknown }>(`/admin/orders/${id}/internal-notes`, { notes }),
  getOrderTimeline: (id: string) => api.get<{ timeline: unknown[] }>(`/admin/orders/${id}/timeline`),

  // Shipping Zones
  getShippingZones: () => api.get<{ zones: unknown[] }>("/admin/shipping/zones"),
  createShippingZone: (data: unknown) => api.post<unknown>("/admin/shipping/zones", data),
  updateShippingZone: (id: string, data: unknown) => api.put<unknown>(`/admin/shipping/zones/${id}`, data),
  deleteShippingZone: (id: string) => api.delete<{ message: string }>(`/admin/shipping/zones/${id}`),
  addShippingRate: (zoneId: string, data: unknown) => api.post<unknown>(`/admin/shipping/zones/${zoneId}/rates`, data),
  updateShippingRate: (id: string, data: unknown) => api.put<unknown>(`/admin/shipping/rates/${id}`, data),
  deleteShippingRate: (id: string) => api.delete<{ message: string }>(`/admin/shipping/rates/${id}`),

  // Returns
  getReturns: (params?: Record<string, string | number | undefined>) =>
    api.get<{ returns: unknown[]; pagination: unknown }>("/admin/returns", { params }),
  getReturn: (id: string) => api.get<{ return: unknown }>(`/admin/returns/${id}`),
  approveReturn: (id: string, data?: { adminNote?: string }) =>
    api.put<unknown>(`/admin/returns/${id}/approve`, data ?? {}),
  rejectReturn: (id: string, data: { adminNote: string }) =>
    api.put<unknown>(`/admin/returns/${id}/reject`, data),
  receiveReturn: (id: string) => api.put<unknown>(`/admin/returns/${id}/receive`),

  // Refunds
  getRefunds: (params?: Record<string, string | number | undefined>) =>
    api.get<{ refunds: unknown[]; pagination: unknown }>("/admin/refunds", { params }),
  getRefund: (id: string) => api.get<{ refund: unknown }>(`/admin/refunds/${id}`),
  createRefund: (data: { orderId: string; returnRequestId?: string; amount: number; type: string; notes?: string }) =>
    api.post<unknown>("/admin/refunds", data),
  processRefund: (id: string) => api.post<unknown>(`/admin/refunds/${id}/process`),
  completeRefund: (id: string) => api.post<unknown>(`/admin/refunds/${id}/complete`),
  failRefund: (id: string, data?: { notes?: string }) =>
    api.post<unknown>(`/admin/refunds/${id}/fail`, data ?? {}),

  // Notifications
  getNotifications: (params?: Record<string, string | number | undefined>) =>
    api.get<{ notifications: unknown[] }>("/admin/notifications", { params }),
  getNotificationTemplates: () => api.get<{ templates: unknown[] }>("/admin/notification-templates"),
  updateNotificationTemplate: (id: string, data: unknown) =>
    api.put<unknown>(`/admin/notification-templates/${id}`, data),
  sendManualNotification: (data: { profileId: string; type: string; title: string; body?: string }) =>
    api.post<unknown>("/admin/notifications/send", data),

  // Support
  getSupportTickets: (params?: Record<string, string | number | undefined>) =>
    api.get<{ tickets: unknown[]; pagination: unknown }>("/admin/support", { params }),
  getSupportTicket: (id: string) => api.get<{ ticket: unknown }>(`/admin/support/${id}`),
  updateSupportTicketStatus: (id: string, data: { status: string }) =>
    api.put<unknown>(`/admin/support/${id}/status`, data),
  assignSupportTicket: (id: string, data: { assignedTo: string }) =>
    api.put<unknown>(`/admin/support/${id}/assign`, data),
  replySupportTicket: (id: string, data: { message: string }) =>
    api.post<unknown>(`/admin/support/${id}/reply`, data),

  // FAQ
  getFaqs: () => api.get<{ faqs: unknown[] }>("/admin/faq"),
  createFaq: (data: { question: string; answer: string; category?: string; sortOrder?: number }) =>
    api.post<unknown>("/admin/faq", data),
  updateFaq: (id: string, data: unknown) => api.put<unknown>(`/admin/faq/${id}`, data),
  deleteFaq: (id: string) => api.delete<{ message: string }>(`/admin/faq/${id}`),

  // Webhook Events
  getWebhookEvents: (params?: Record<string, string | number | undefined>) =>
    api.get<{ events: unknown[]; pagination: unknown }>("/admin/webhooks/events", { params }),
  reprocessWebhookEvent: (id: string) =>
    api.post<unknown>(`/admin/webhooks/reprocess/${id}`),
  reconcileWebhookOrder: (orderId: string) =>
    api.post<unknown>(`/admin/webhooks/reconcile/${orderId}`),

  // Invoices
  getOrderInvoice: (orderId: string) => api.get<{ html: string }>(`/admin/orders/${orderId}/invoice`),
  generateOrderInvoice: (orderId: string) => api.post<{ order: unknown }>(`/admin/orders/${orderId}/invoice/generate`),

  // ─── Campaigns ───
  getCampaigns: () => api.get<{ campaigns: unknown[] }>("/admin/campaigns"),
  getCampaign: (id: string) => api.get<{ campaign: unknown }>(`/admin/campaigns/${id}`),
  createCampaign: (data: unknown) => api.post<{ campaign: unknown }>("/admin/campaigns", data),
  updateCampaign: (id: string, data: unknown) => api.put<{ campaign: unknown }>(`/admin/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete<{ message: string }>(`/admin/campaigns/${id}`),

  // ─── Coupon Redemptions ───
  getCouponRedemptions: (params?: Record<string, string | number | undefined>) =>
    api.get<{ redemptions: unknown[]; pagination: unknown }>("/admin/coupon-redemptions", { params }),

  // ─── Abandoned Carts ───
  getAbandonedCarts: (params?: Record<string, string | number | undefined>) =>
    api.get<{ carts: unknown[]; pagination: unknown }>("/admin/abandoned-carts", { params }),

  // ─── Audit Log ───
  getAuditLog: (params?: Record<string, string | number | undefined>) =>
    api.get<{ logs: unknown[]; pagination: unknown }>("/admin/audit-log", { params }),

  // ─── Wishlists ───
  getWishlists: (params?: Record<string, string | number | undefined>) =>
    api.get<unknown>("/admin/wishlists", { params }),

  // ─── Product Attributes ───
  getProductAttributes: (productId: string) =>
    api.get<{ attributes: unknown[] }>(`/admin/product-attributes/${productId}`),
  createProductAttribute: (productId: string, data: unknown) =>
    api.post<{ attribute: unknown }>(`/admin/product-attributes/${productId}`, data),
  updateProductAttribute: (id: string, data: unknown) =>
    api.put<{ attribute: unknown }>(`/admin/product-attributes/${id}`, data),
  deleteProductAttribute: (id: string) =>
    api.delete<{ message: string }>(`/admin/product-attributes/${id}`),

  // ─── Addresses ───
  getAddresses: (params?: Record<string, string | number | undefined>) =>
    api.get<{ addresses: unknown[]; pagination: unknown }>("/admin/addresses", { params }),

  // ─── Sessions ───
  getSessions: (params?: Record<string, string | number | undefined>) =>
    api.get<{ sessions: unknown[]; pagination: unknown }>("/admin/sessions", { params }),
  revokeSession: (id: string) =>
    api.delete<{ message: string }>(`/admin/sessions/${id}`),

  // ─── Login Attempts ───
  getLoginAttempts: (params?: Record<string, string | number | undefined>) =>
    api.get<unknown>("/admin/login-attempts", { params }),
};
