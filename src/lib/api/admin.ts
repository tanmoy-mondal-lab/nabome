import { api } from "./client";

export { api };

// Re-export from domain modules
export { productsApi, type ProductListResponse, type ProductDetailResponse } from "./admin/products";
export { ordersApi, type OrderListResponse, type OrderDetailResponse, type OrderStatsResponse } from "./admin/orders";
export { customersApi, type CustomerListResponse } from "./admin/customers";
export { analyticsApi, type SalesAnalytics, type ProductAnalytics, type CustomerAnalytics, type DeliveryAddressAnalytics } from "./admin/analytics";
export { cmsApi, type CMSPage, type HomepageSection, type NavigationMenu, type NavigationItem, type FooterSection, type Announcement } from "./admin/cms";
export { settingsApi, type SiteSettings, type SocialLink } from "./admin/settings";
export { mediaApi, type MediaAsset, type MediaListResponse } from "./admin/media";
export { notificationsApi, type Notification, type NotificationTemplate } from "./admin/notifications";

// Import types for use in adminApi
import type { ProductListResponse, ProductDetailResponse } from "./admin/products";
import type { OrderListResponse, OrderDetailResponse, OrderStatsResponse } from "./admin/orders";
import type { CustomerListResponse } from "./admin/customers";
import type { SalesAnalytics, ProductAnalytics, CustomerAnalytics, DeliveryAddressAnalytics } from "./admin/analytics";
import type { CMSPage, HomepageSection, NavigationMenu, FooterSection, Announcement } from "./admin/cms";
import type { SocialLink } from "./admin/settings";

// Dashboard stats (kept here as it's cross-domain)
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
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customer?: { firstName: string; lastName: string; email: string };
  }>;
  recentCustomers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  }>;
  dailySales: { date: string; revenue: number; orders: number }[];
}

// Consolidated admin API object for backward compatibility
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get<DashboardStats>("/admin/dashboard"),

  // Products (delegated to productsApi)
  getProducts: (params?: Record<string, string | number | undefined>) =>
    api.get<ProductListResponse>("/admin/products", { params }),
  getProduct: (id: string) => api.get<ProductDetailResponse>(`/admin/products/${id}`),
  createProduct: (data: unknown) => api.post("/admin/products", data),
  updateProduct: (id: string, data: unknown) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  updateProductVariants: (id: string, variants: unknown[]) =>
    api.put(`/admin/products/${id}/variants`, { variants }),
  addProductImage: (id: string, data: { url: string; publicId?: string; altText?: string; isPrimary?: boolean; sortOrder?: number; variantId?: string; type?: string }) =>
    api.post(`/admin/products/${id}/images`, data),
  deleteProductImage: (productId: string, imageId: string) =>
    api.delete(`/admin/products/${productId}/images/${imageId}`),

  // Categories
  getCategories: () => api.get<{ categories: Array<{ id: string; name: string; slug: string }> }>("/admin/categories"),
  createCategory: (data: unknown) => api.post("/admin/categories", data),
  updateCategory: (id: string, data: unknown) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  // Collections
  getCollections: () => api.get<{ collections: Array<{ id: string; name: string; slug: string }> }>("/admin/collections"),
  createCollection: (data: unknown) => api.post("/admin/collections", data),
  updateCollection: (id: string, data: unknown) => api.put(`/admin/collections/${id}`, data),
  deleteCollection: (id: string) => api.delete(`/admin/collections/${id}`),

  // Orders (delegated to ordersApi)
  getOrders: (params?: Record<string, string | number | undefined>) =>
    api.get<OrderListResponse>("/admin/orders", { params }),
  getOrder: (id: string) => api.get<OrderDetailResponse>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, data: { status: string; note?: string }) =>
    api.put(`/admin/orders/${id}/status`, data),

  // Customers (delegated to customersApi)
  getCustomers: (params?: Record<string, string | number | undefined>) =>
    api.get<CustomerListResponse>("/admin/customers", { params }),
  getCustomer: (id: string) => api.get<{ customer: { id: string; firstName: string; lastName: string; email: string; phone: string } }>(`/admin/customers/${id}`),
  updateCustomer: (id: string, data: unknown) => api.put(`/admin/customers/${id}`, data),

  // CMS (delegated to cmsApi)
  getPages: () => api.get<{ pages: CMSPage[] }>("/admin/cms/pages"),
  getPage: (id: string) => api.get<CMSPage>(`/admin/cms/pages/${id}`),
  createPage: (data: unknown) => api.post("/admin/cms/pages", data),
  updatePage: (id: string, data: unknown) => api.put(`/admin/cms/pages/${id}`, data),
  deletePage: (id: string) => api.delete(`/admin/cms/pages/${id}`),
  getHomepageSections: () => api.get<{ sections: HomepageSection[] }>("/admin/cms/homepage"),
  createHomeSection: (data: unknown) => api.post("/admin/cms/homepage", data),
  updateHomeSection: (id: string, data: unknown) => api.put(`/admin/cms/homepage/${id}`, data),
  deleteHomeSection: (id: string) => api.delete(`/admin/cms/homepage/${id}`),
  reorderHomeSections: (order: { id: string; sortOrder: number }[]) =>
    api.put("/admin/cms/homepage/reorder", { order }),
  getNavigationMenus: () => api.get<{ menus: NavigationMenu[] }>("/admin/cms/navigation"),
  createNavigation: (data: unknown) => api.post("/admin/cms/navigation", data),
  updateNavigation: (id: string, data: unknown) => api.put(`/admin/cms/navigation/${id}`, data),
  deleteNavigation: (id: string) => api.delete(`/admin/cms/navigation/${id}`),
  getFooterSections: () => api.get<{ sections: FooterSection[] }>("/admin/cms/footer"),
  createFooterSection: (data: unknown) => api.post("/admin/cms/footer", data),
  updateFooterSection: (id: string, data: unknown) => api.put(`/admin/cms/footer/${id}`, data),
  deleteFooterSection: (id: string) => api.delete(`/admin/cms/footer/${id}`),
  getAnnouncements: () => api.get<{ announcements: Announcement[] }>("/admin/cms/announcements"),
  createAnnouncement: (data: unknown) => api.post("/admin/cms/announcements", data),
  updateAnnouncement: (id: string, data: unknown) => api.put(`/admin/cms/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/admin/cms/announcements/${id}`),

  // Coupons
  getCoupons: () => api.get<{ coupons: Array<{ id: string; code: string; discountType: string; discountValue: number; isActive: boolean }> }>("/admin/coupons"),
  createCoupon: (data: unknown) => api.post("/admin/coupons", data),
  updateCoupon: (id: string, data: unknown) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),

  // Reviews
  getReviews: (params?: Record<string, string | undefined>) =>
    api.get<{ reviews: Array<{ id: string; title: string; rating: number; comment: string; isApproved: boolean; createdAt: string; profile: { firstName: string; lastName: string; email: string }; product: { name: string } }> }>("/admin/reviews", { params }),
  approveReview: (id: string, approved: boolean) =>
    api.put(`/admin/reviews/${id}/approve`, { approved }),
  deleteReview: (id: string) =>
    api.delete(`/admin/reviews/${id}`),

  // Analytics (delegated to analyticsApi)
  getSalesAnalytics: (params?: Record<string, string | undefined>) =>
    api.get<SalesAnalytics>("/admin/analytics/sales", { params }),
  getProductAnalytics: () => api.get<ProductAnalytics>("/admin/analytics/products"),
  getCustomerAnalytics: () => api.get<CustomerAnalytics>("/admin/analytics/customers"),
  getDeliveryAddressAnalytics: (params?: Record<string, string | undefined>) =>
    api.get<DeliveryAddressAnalytics>("/admin/analytics/delivery-addresses", { params }),

  // Settings (delegated to settingsApi)
  getSettings: () => api.get<{ settings: Record<string, unknown> }>("/admin/settings"),
  updateSettings: (data: unknown) => api.put("/admin/settings", data),
  getSocialLinks: () => api.get<{ links: SocialLink[] }>("/admin/social-links"),
  createSocialLink: (data: unknown) => api.post("/admin/social-links", data),
  updateSocialLink: (id: string, data: unknown) => api.put(`/admin/social-links/${id}`, data),
  deleteSocialLink: (id: string) => api.delete(`/admin/social-links/${id}`),

  // Media (delegated to mediaApi)
  getMedia: (params?: Record<string, string | number | undefined>) =>
    api.get<{ assets: Array<{ id: string; url: string; publicId: string; type: string; altText: string | null; format: string; width: number | null; height: number | null; fileSize: number | null; entityType: string | null; entityId: string | null; displayName: string | null; sortOrder: number; isPrimary: boolean; folder: string | null; tags: string[]; createdAt: string; updatedAt: string }>; folders: Array<{ name: string; count: number }> }>("/admin/media", { params }),
  createMedia: (data: { url: string; publicId?: string; type?: string; altText?: string; entityType?: string; entityId?: string; assetId?: string; secureUrl?: string; resourceType?: string; originalFilename?: string; displayName?: string; sortOrder?: number; isPrimary?: boolean; folder?: string; tags?: string[]; width?: number | null; height?: number | null; fileSize?: number | null; mimeType?: string }) =>
    api.post("/admin/media", data),
  updateMedia: (id: string, data: { altText?: string; displayName?: string; folder?: string; tags?: string[]; sortOrder?: number; isPrimary?: boolean }) =>
    api.put(`/admin/media/${id}`, data),
  deleteMedia: (id: string) => api.delete(`/admin/media/${id}`),
  
  // Media folder management
  getMediaFolders: () => api.get<{ folders: Array<{ path: string; name: string }> }>("/admin/media-folders"),
  getMediaFolderContents: (path: string, params?: { maxResults?: number; nextCursor?: string; resourceType?: "image" | "video" | "raw" }) =>
    api.get<{ folders: Array<{ path: string; name: string }>; resources: Array<{ public_id: string; resource_type: string; format: string; bytes: number; width: number | null; height: number | null; url: string; secure_url: string; created_at: string; filename: string; metadata: any }>; nextCursor?: string }>("/admin/media-folders/contents", { params: { path, ...params } }),
  createMediaFolder: (path: string) => api.post("/admin/media-folders", { path }),
  renameMediaFolder: (oldPath: string, newPath: string) => api.put("/admin/media-folders/rename", { oldPath, newPath }),
  deleteMediaFolder: (path: string) => api.delete(`/admin/media-folders?path=${encodeURIComponent(path)}`),
  moveMediaFolder: (oldPath: string, newPath: string) => api.put("/admin/media-folders/move", { oldPath, newPath }),
  getMediaStorageInfo: () => api.get<{ totalFiles: number; totalImages: number; totalVideos: number; totalRaw: number; usedStorage: number }>("/admin/media-folders/storage"),
  
  // Media upload with folder support
  uploadMediaToFolder: (file: File, folder: string, options?: { altText?: string; displayName?: string; tags?: string[] }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    if (options?.altText) formData.append("altText", options.altText);
    if (options?.displayName) formData.append("displayName", options.displayName);
    if (options?.tags) formData.append("tags", JSON.stringify(options.tags));
    return api.post("/admin/media/upload", formData);
  },
  
  // Media move and bulk operations
  moveMedia: (assetId: string, newFolder: string) => api.put(`/admin/media/${assetId}/move`, { assetId, newFolder }),
  bulkDeleteMedia: (assetIds: string[]) => api.post("/admin/media/bulk-delete", { assetIds }),
  bulkMoveMedia: (assetIds: string[], newFolder: string) => api.post("/admin/media/bulk-move", { assetIds, newFolder }),

  // Contact Submissions
  getContactSubmissions: (params?: Record<string, string | undefined>) =>
    api.get<{ submissions: Array<{ id: string; name: string; email: string; message: string; createdAt: string }>; unreadCount: number; pagination?: { totalPages: number } }>("/admin/contact-submissions", { params }),
  markContactRead: (id: string) => api.put(`/admin/contact-submissions/${id}/read`),
  deleteContactSubmission: (id: string) => api.delete(`/admin/contact-submissions/${id}`),

  // Newsletter
  getNewsletterSubscribers: (params?: Record<string, string | number | undefined>) =>
    api.get<{ subscribers: Array<{ id: string; email: string; isActive: boolean; createdAt: string }>; pagination?: { totalPages: number } }>("/admin/newsletter-subscribers", { params }),
  deleteSubscriber: (id: string) => api.delete(`/admin/newsletter-subscribers/${id}`),

  // Templates
  getTemplates: () => api.get<{ templates: Array<{ id: string; name: string; slug: string; description: string; category: string; thumbnail: string | null; content: string; sections: unknown[]; isActive: boolean; useCount: number; createdAt: string; updatedAt: string }> }>("/admin/templates"),
  getTemplate: (id: string) => api.get<{ template: { id: string; name: string; slug: string; description: string; category: string; thumbnail: string | null; content: string; sections: unknown[]; isActive: boolean; useCount: number; createdAt: string; updatedAt: string } }>(`/admin/templates/${id}`),
  createTemplate: (data: unknown) => api.post("/admin/templates", data),
  updateTemplate: (id: string, data: unknown) => api.put(`/admin/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/admin/templates/${id}`),
  applyTemplate: (templateId: string, pageId: string) =>
    api.post(`/admin/templates/${templateId}/apply`, { pageId }),

  // Import / Export
  exportProducts: (format: "csv" | "json" = "csv", categoryId?: string) => {
    const params = new URLSearchParams({ format });
    if (categoryId) params.set("categoryId", categoryId);
    return api.get(`/admin/products/export?${params}`);
  },
  importProducts: (data: FormData | Record<string, unknown>[]) =>
    api.post<{ imported: number; skipped: number; errors: string[] }>("/admin/products/import", data),
  exportOrders: (format: "csv" | "json" = "csv", status?: string) => {
    const params = new URLSearchParams({ format });
    if (status) params.set("status", status);
    return api.get(`/admin/orders/export?${params}`);
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

  // Lookbooks
  getLookbooks: () => api.get<{ lookbooks: Array<{ id: string; name: string; slug: string; isActive: boolean; createdAt: string; updatedAt: string }> }>("/admin/lookbooks"),
  getLookbook: (id: string) => api.get<{ lookbook: { id: string; name: string; slug: string; isActive: boolean; createdAt: string; updatedAt: string; items: unknown[] } }>(`/admin/lookbooks/${id}`),
  createLookbook: (data: unknown) => api.post("/admin/lookbooks", data),
  updateLookbook: (id: string, data: unknown) => api.put(`/admin/lookbooks/${id}`, data),
  deleteLookbook: (id: string) => api.delete(`/admin/lookbooks/${id}`),
  addLookbookItem: (lookbookId: string, data: unknown) =>
    api.post(`/admin/lookbooks/${lookbookId}/items`, data),
  removeLookbookItem: (lookbookId: string, itemId: string) =>
    api.delete(`/admin/lookbooks/${lookbookId}/items/${itemId}`),
  updateLookbookItem: (lookbookId: string, itemId: string, data: unknown) =>
    api.put(`/admin/lookbooks/${lookbookId}/items/${itemId}`, data),
  reorderLookbookItems: (lookbookId: string, order: { id: string; sortOrder: number }[]) =>
    api.put(`/admin/lookbooks/${lookbookId}/items/reorder`, { order }),

  // Brands
  getBrands: () => api.get<{ brands: Array<{ id: string; name: string; slug: string }> }>("/admin/brands"),
  getBrand: (id: string) => api.get<{ brand: { id: string; name: string; slug: string } }>(`/admin/brands/${id}`),
  createBrand: (data: unknown) => api.post("/admin/brands", data),
  updateBrand: (id: string, data: unknown) => api.put(`/admin/brands/${id}`, data),
  deleteBrand: (id: string) => api.delete(`/admin/brands/${id}`),

  // Size Guides
  getSizeGuides: () => api.get<{ sizeGuides: Array<{ id: string; name: string; category: string }> }>("/admin/size-guides"),
  getSizeGuide: (id: string) => api.get<{ sizeGuide: { id: string; name: string; category: string; measurements: unknown[] } }>(`/admin/size-guides/${id}`),
  createSizeGuide: (data: unknown) => api.post("/admin/size-guides", data),
  updateSizeGuide: (id: string, data: unknown) => api.put(`/admin/size-guides/${id}`, data),
  deleteSizeGuide: (id: string) => api.delete(`/admin/size-guides/${id}`),

  // Subcategories
  getSubcategories: () => api.get<{ subcategories: Array<{ id: string; name: string; slug: string; categoryId: string }> }>("/admin/subcategories"),
  createSubcategory: (data: unknown) => api.post("/admin/subcategories", data),
  updateSubcategory: (id: string, data: unknown) => api.put(`/admin/subcategories/${id}`, data),
  deleteSubcategory: (id: string) => api.delete(`/admin/subcategories/${id}`),

  // Labels
  getLabels: () => api.get<{ labels: Array<{ id: string; name: string; color: string }> }>("/admin/product-labels"),
  createLabel: (data: unknown) => api.post("/admin/product-labels", data),
  updateLabel: (id: string, data: unknown) => api.put(`/admin/product-labels/${id}`, data),
  deleteLabel: (id: string) => api.delete(`/admin/product-labels/${id}`),

  // Tags
  getTags: () => api.get<{ tags: Array<{ id: string; name: string; slug: string }> }>("/admin/product-tags"),
  createTag: (data: unknown) => api.post("/admin/product-tags", data),
  updateTag: (id: string, data: unknown) => api.put(`/admin/product-tags/${id}`, data),
  deleteTag: (id: string) => api.delete(`/admin/product-tags/${id}`),

  // Assign labels/tags to product
  assignLabels: (productId: string, labelIds: string[]) =>
    api.put(`/admin/products/${productId}/labels`, { labelIds }),
  assignTags: (productId: string, tagIds: string[]) =>
    api.put(`/admin/products/${productId}/tags`, { tagIds }),

  // Related Products
  getRelatedProducts: (productId: string) =>
    api.get(`/admin/products/${productId}/related`),
  addRelatedProduct: (data: { sourceId: string; targetId: string; type?: string }) =>
    api.post("/admin/related-products", data),
  removeRelatedProduct: (id: string) =>
    api.delete(`/admin/related-products/${id}`),
  reorderRelatedProducts: (productId: string, order: { id: string; sortOrder: number }[]) =>
    api.put(`/admin/products/${productId}/related/reorder`, { order }),

  // Inventory
  getInventoryOverview: () =>
    api.get<{ stats: { totalProducts: number; lowStock: number; outOfStock: number }; recentMovements: Array<{ id: string; type: string; quantity: number; createdAt: string }>; alerts: Array<{ id: string; type: string; productId: string; variantId: string }> }>("/admin/inventory/overview"),
  getProductMovements: (productId: string) =>
    api.get<{ movements: Array<{ id: string; type: string; quantity: number; createdAt: string }> }>(`/admin/inventory/product/${productId}/movements`),
  getVariantMovements: (variantId: string) =>
    api.get<{ movements: Array<{ id: string; type: string; quantity: number; createdAt: string }> }>(`/admin/inventory/variant/${variantId}/movements`),
  adjustVariantStock: (variantId: string, data: { quantityChange: number; reason: string; note?: string }) =>
    api.post(`/admin/inventory/variant/${variantId}/adjust`, data),
  getInventoryAlerts: (params?: Record<string, string | undefined>) =>
    api.get<{ alerts: Array<{ id: string; type: string; productId: string; variantId: string }> }>("/admin/inventory/alerts", { params }),
  resolveAlert: (alertId: string) =>
    api.put(`/admin/inventory/alerts/${alertId}/resolve`),

  // Enhanced Product Actions
  duplicateProduct: (id: string) =>
    api.post(`/admin/products/${id}/duplicate`),
  restoreProduct: (id: string) =>
    api.put(`/admin/products/${id}/restore`),
  scheduleProduct: (id: string, data: { publishAt?: string; archiveAt?: string }) =>
    api.put(`/admin/products/${id}/schedule`, data),
  bulkUpdateStatus: (ids: string[], status: boolean) =>
    api.put("/admin/products/bulk/status", { ids, status }),
  bulkUpdateCategory: (ids: string[], data: { categoryId?: string; subcategoryId?: string; collectionId?: string }) =>
    api.put("/admin/products/bulk/category", { ids, ...data }),
  bulkDeleteProducts: (ids: string[]) =>
    api.put("/admin/products/bulk/delete", { ids }),
  permanentDeleteProduct: (id: string) =>
    api.delete(`/admin/products/${id}/permanent`),
  bulkPermanentDeleteProducts: (ids: string[]) =>
    api.put("/admin/products/bulk/permanent-delete", { ids }),

  // Upload
  uploadFile: (file: File, entityType?: string, slug?: string, entityId?: string, altText?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (entityType) formData.append("entityType", entityType);
    if (slug) formData.append("slug", slug);
    if (entityId) formData.append("entityId", entityId);
    if (altText) formData.append("altText", altText);
    return api.post<{ url: string; publicId: string }>("/upload", formData);
  },

  // Enhanced Orders
  getOrderStats: () => api.get<OrderStatsResponse>("/admin/orders/stats"),
  updateOrderInternalNotes: (id: string, notes: string) =>
    api.put(`/admin/orders/${id}/internal-notes`, { notes }),
  getOrderTimeline: (id: string) => api.get<{ timeline: Array<{ status: string; note?: string; createdAt: string }> }>(`/admin/orders/${id}/timeline`),

  // Returns
  getReturns: (params?: Record<string, string | number | undefined>) =>
    api.get<{ returns: Array<{ id: string; orderId: string; status: string; reason: string; createdAt: string }>; pagination?: { totalPages: number } }>("/admin/returns", { params }),
  getReturn: (id: string) => api.get<{ return: { id: string; orderId: string; status: string; reason: string; items: unknown[] } }>(`/admin/returns/${id}`),
  approveReturn: (id: string, data?: { adminNote?: string }) =>
    api.put(`/admin/returns/${id}/approve`, data ?? {}),
  rejectReturn: (id: string, data: { adminNote: string }) =>
    api.put(`/admin/returns/${id}/reject`, data),
  receiveReturn: (id: string) => api.put(`/admin/returns/${id}/receive`),

  // Refunds
  getRefunds: (params?: Record<string, string | number | undefined>) =>
    api.get<{ refunds: Array<{ id: string; orderId: string; amount: number; status: string }> }>("/admin/refunds", { params }),
  getRefund: (id: string) => api.get<{ refund: { id: string; orderId: string; amount: number; status: string } }>(`/admin/refunds/${id}`),
  createRefund: (data: { orderId: string; returnRequestId?: string; amount: number; type: string; notes?: string }) =>
    api.post("/admin/refunds", data),
  processRefund: (id: string) => api.post(`/admin/refunds/${id}/process`),
  completeRefund: (id: string) => api.post(`/admin/refunds/${id}/complete`),
  failRefund: (id: string, data?: { notes?: string }) =>
    api.post(`/admin/refunds/${id}/fail`, data ?? {}),

  // Notifications (delegated to notificationsApi)
  getNotifications: (params?: Record<string, string | number | undefined>) =>
    api.get<{ notifications: Array<{ id: string; type: string; channel: string; isRead: boolean; createdAt: string; profileId: string; title: string; body: string }>; pagination?: { totalPages: number; total: number } }>("/admin/notifications", { params }),
  getNotificationTemplates: () => api.get<{ templates: Array<{ id: string; name: string; type: string; emailSubject: string; emailBody: string; smsBody: string; inAppBody: string; isActive: boolean }> }>("/admin/notification-templates"),
  updateNotificationTemplate: (id: string, data: unknown) =>
    api.put(`/admin/notification-templates/${id}`, data),
  sendManualNotification: (data: { profileId: string; type: string; title: string; body?: string }) =>
    api.post("/admin/notifications/send", data),

  // Support
  getSupportTickets: (params?: Record<string, string | number | undefined>) =>
    api.get<{ tickets: Array<{ id: string; subject: string; status: string; createdAt: string }>; pagination?: { totalPages: number } }>("/admin/support", { params }),
  getSupportTicket: (id: string) => api.get<{ ticket: { id: string; subject: string; status: string; messages: unknown[] } }>(`/admin/support/${id}`),
  updateSupportTicketStatus: (id: string, data: { status: string }) =>
    api.put(`/admin/support/${id}/status`, data),
  assignSupportTicket: (id: string, data: { assignedTo: string }) =>
    api.put(`/admin/support/${id}/assign`, data),
  replySupportTicket: (id: string, data: { message: string }) =>
    api.post(`/admin/support/${id}/reply`, data),

  // FAQ
  getFaqs: () => api.get<{ faqs: Array<{ id: string; question: string; answer: string; category: string; sortOrder: number }> }>("/admin/faq"),
  createFaq: (data: { question: string; answer: string; category?: string; sortOrder?: number }) =>
    api.post("/admin/faq", data),
  updateFaq: (id: string, data: unknown) => api.put(`/admin/faq/${id}`, data),
  deleteFaq: (id: string) => api.delete(`/admin/faq/${id}`),

  // Webhook Events
  getWebhookEvents: (params?: Record<string, string | number | undefined>) =>
    api.get<{ events: Array<{ id: string; eventType: string; status: string; createdAt: string }>; pagination?: { totalPages: number; total: number } }>("/admin/webhooks/events", { params }),
  reprocessWebhookEvent: (id: string) =>
    api.post(`/admin/webhooks/reprocess/${id}`),
  reconcileWebhookOrder: (orderId: string) =>
    api.post(`/admin/webhooks/reconcile/${orderId}`),

  // Invoices
  getOrderInvoice: (orderId: string) => api.get<{ html: string }>(`/admin/orders/${orderId}/invoice`),
  generateOrderInvoice: (orderId: string) => api.post<{ invoiceUrl?: string }>(`/admin/orders/${orderId}/invoice/generate`),

  // Campaigns
  getCampaigns: () => api.get<{ campaigns: Array<{ id: string; name: string; type: string; isActive: boolean }> }>("/admin/campaigns"),
  getCampaign: (id: string) => api.get<{ campaign: { id: string; name: string; type: string; isActive: boolean } }>(`/admin/campaigns/${id}`),
  createCampaign: (data: unknown) => api.post("/admin/campaigns", data),
  updateCampaign: (id: string, data: unknown) => api.put(`/admin/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete(`/admin/campaigns/${id}`),

  // Coupon Redemptions
  getCouponRedemptions: (params?: Record<string, string | number | undefined>) =>
    api.get<{ redemptions: Array<{ id: string; couponCode: string; orderNumber: string; profileEmail: string; createdAt: string }> }>(`/admin/coupon-redemptions`, { params }),

  // Abandoned Carts
  getAbandonedCarts: (params?: Record<string, string | number | undefined>) =>
    api.get<{ carts: Array<{ id: string; profileId: string; createdAt: string; profile: { firstName: string; lastName: string; email: string } }>; pagination?: { total: number; totalPages: number } }>("/admin/abandoned-carts", { params }),

  // Audit Log
  getAuditLog: (params?: Record<string, string | number | undefined>) =>
    api.get<{ logs: Array<{ id: string; action: string; userId: string; entity: string; entityId: string; metadata: unknown; createdAt: string; profile: { firstName: string; lastName: string; email: string } }>; pagination?: { totalPages: number } }>("/admin/audit-log", { params }),

  // Wishlists
  getWishlists: (params?: Record<string, string | number | undefined>) =>
    api.get<{ wishlists: Array<{ id: string; profileId: string; productId: string; createdAt: string }> }>("/admin/wishlists", { params }),

  // Product Attributes
  getProductAttributes: (productId: string) =>
    api.get<{ attributes: Array<{ id: string; productId: string; key: string; value: string }> }>(`/admin/product-attributes/${productId}`),
  createProductAttribute: (productId: string, data: unknown) =>
    api.post(`/admin/product-attributes/${productId}`, data),
  updateProductAttribute: (id: string, data: unknown) =>
    api.put(`/admin/product-attributes/${id}`, data),
  deleteProductAttribute: (id: string) =>
    api.delete(`/admin/product-attributes/${id}`),

  // Addresses
  getAddresses: (params?: Record<string, string | number | undefined>) =>
    api.get<{ addresses: Array<{ id: string; fullName: string; line1: string; city: string; state: string }> }>("/admin/addresses", { params }),

  // Sessions
  getSessions: (params?: Record<string, string | number | undefined>) =>
    api.get<{ sessions: Array<{ id: string; profileId: string; userAgent: string; ipAddress: string; isActive: boolean }>; pagination?: { totalPages: number } }>("/admin/sessions", { params }),
  revokeSession: (id: string) =>
    api.delete(`/admin/sessions/${id}`),

  // Login Attempts
  getLoginAttempts: (params?: Record<string, string | number | undefined>) =>
    api.get<{ loginAttempts: Array<{ id: string; email: string; success: boolean; ipAddress: string; createdAt: string }>; pagination?: { totalPages: number } }>("/admin/login-attempts", { params }),
};
