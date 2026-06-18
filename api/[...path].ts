// ─────────────────────────────────────────────────────────────
// NABOME API — Catch-all Router
// ─────────────────────────────────────────────────────────────
// Receives all /api/* requests and dispatches to handlers.
// Vercel serverless function entry point.
// ─────────────────────────────────────────────────────────────

import type { RequestContext } from "./_lib/types";
import { authenticateRequest, requireAdmin } from "./_lib/auth";
import { notFound, serverError, error } from "./_lib/response";

// ─── Route handler registry ───
type RouteHandler = (req: Request, ctx: RequestContext, params: string[]) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
  auth: boolean;
  admin: boolean;
}

const routes: Route[] = [];

function route(
  method: string,
  pattern: string,
  handler: RouteHandler,
  options?: { auth?: boolean; admin?: boolean }
) {
  const regex = new RegExp(
    "^" + pattern.replace(/\/:(\w+)/g, "/([^/]+)") + "$"
  );
  routes.push({
    method,
    pattern: regex,
    handler,
    auth: options?.auth ?? false,
    admin: options?.admin ?? false,
  });
}

// ─── Import handlers ───

// Each handler module registers its routes via the `route` function.
// To keep this file manageable, handlers are defined inline below.
// In production, they would be imported from separate files.

import { handleAuthRequest } from "./_handlers/auth";
import { handleProductRequest } from "./_handlers/products";
import { handleCategoryRequest } from "./_handlers/categories";
import { handleCollectionRequest } from "./_handlers/collections";
import { handleOrderRequest } from "./_handlers/orders";
import { handleCheckoutRequest } from "./_handlers/checkout";
import { handleAddressRequest } from "./_handlers/addresses";
import { handleWishlistRequest } from "./_handlers/wishlist";
import { handleCouponRequest } from "./_handlers/coupons";
import { handleReviewRequest } from "./_handlers/reviews";
import { handleCMSRequest } from "./_handlers/cms";
import { handleLookbookRequest } from "./_handlers/lookbooks";
import { handleContactRequest } from "./_handlers/contact";
import { handleSettingsRequest } from "./_handlers/settings";
import { handleUploadRequest } from "./_handlers/upload";
import { handleDashboardRequest } from "./_handlers/admin/dashboard";
import { handleAdminProductRequest } from "./_handlers/admin/products";
import { handleAdminCategoryRequest } from "./_handlers/admin/categories";
import { handleAdminCollectionRequest } from "./_handlers/admin/collections";
import { handleAdminOrderRequest } from "./_handlers/admin/orders";
import { handleAdminCustomerRequest } from "./_handlers/admin/customers";
import { handleAdminCMSRequest } from "./_handlers/admin/cms";
import { handleAdminLookbookRequest } from "./_handlers/admin/lookbooks";
import { handleAdminCouponRequest } from "./_handlers/admin/coupons";
import { handleAdminReviewRequest } from "./_handlers/admin/reviews";
import { handleAdminAnalyticsRequest } from "./_handlers/admin/analytics";
import { handleAdminSettingsRequest } from "./_handlers/admin/settings";
import { handleAdminMarketingRequest } from "./_handlers/admin/marketing";
import { handleAdminMediaRequest } from "./_handlers/admin/media";
import { handleAdminContactRequest } from "./_handlers/admin/contacts";
import { handleAdminTemplateRequest } from "./_handlers/admin/templates";
import { handleAdminImportExportRequest } from "./_handlers/admin/import-export";
import { handleAdminSearchIndexRequest } from "./_handlers/admin/search-index";
import { handleAdminBrandRequest } from "./_handlers/admin/brands";
import { handleAdminSizeGuideRequest } from "./_handlers/admin/size-guides";
import { handleAdminProductLabelRequest } from "./_handlers/admin/product-labels";
import { handleAdminRelatedProductRequest } from "./_handlers/admin/related-products";
import { handleAdminInventoryRequest } from "./_handlers/admin/inventory";
import { handleAdminSubcategoryRequest } from "./_handlers/admin/subcategories";

// ─── Route registration ───

// Public routes
route("GET", "/api/auth/me", (req, ctx) => handleAuthRequest(req, ctx, [], "me"));
route("PUT", "/api/auth/me", (req, ctx) => handleAuthRequest(req, ctx, [], "updateMe"), { auth: true });
route("POST", "/api/auth/register", (req, ctx) => handleAuthRequest(req, ctx, [], "register"));
route("POST", "/api/auth/login", (req, ctx) => handleAuthRequest(req, ctx, [], "login"));
route("POST", "/api/auth/logout", (req, ctx) => handleAuthRequest(req, ctx, [], "logout"), { auth: true });
route("POST", "/api/auth/forgot-password", (req, ctx) => handleAuthRequest(req, ctx, [], "forgotPassword"));
route("POST", "/api/auth/reset-password", (req, ctx) => handleAuthRequest(req, ctx, [], "resetPassword"));
route("POST", "/api/auth/change-password", (req, ctx) => handleAuthRequest(req, ctx, [], "changePassword"), { auth: true });
route("GET", "/api/auth/sessions", (req, ctx) => handleAuthRequest(req, ctx, [], "sessions"), { auth: true });
route("DELETE", "/api/auth/sessions/:id", (req, ctx, p) => handleAuthRequest(req, ctx, p, "deleteSession"), { auth: true });

route("GET", "/api/products", (req, ctx) => handleProductRequest(req, ctx, [], "list"));
route("GET", "/api/products/featured", (req, ctx) => handleProductRequest(req, ctx, [], "featured"));
route("GET", "/api/products/new", (req, ctx) => handleProductRequest(req, ctx, [], "newArrivals"));
route("GET", "/api/products/search", (req, ctx) => handleProductRequest(req, ctx, [], "search"));
route("GET", "/api/products/:slug", (req, ctx, p) => handleProductRequest(req, ctx, p, "detail"));
route("GET", "/api/products/:slug/variants", (req, ctx, p) => handleProductRequest(req, ctx, p, "variants"));
route("GET", "/api/products/:slug/reviews", (req, ctx, p) => handleProductRequest(req, ctx, p, "reviews"));

route("GET", "/api/categories", (req, ctx) => handleCategoryRequest(req, ctx, [], "list"));
route("GET", "/api/categories/:slug", (req, ctx, p) => handleCategoryRequest(req, ctx, p, "detail"));

route("GET", "/api/collections", (req, ctx) => handleCollectionRequest(req, ctx, [], "list"));
route("GET", "/api/collections/:slug", (req, ctx, p) => handleCollectionRequest(req, ctx, p, "detail"));

route("GET", "/api/cms/homepage", (req, ctx) => handleCMSRequest(req, ctx, [], "homepage"));
route("GET", "/api/cms/pages", (req, ctx) => handleCMSRequest(req, ctx, [], "pages"));
route("GET", "/api/cms/pages/:slug", (req, ctx, p) => handleCMSRequest(req, ctx, p, "page"));
route("GET", "/api/cms/navigation", (req, ctx) => handleCMSRequest(req, ctx, [], "navigation"));
route("GET", "/api/cms/announcements", (req, ctx) => handleCMSRequest(req, ctx, [], "announcements"));
route("GET", "/api/cms/brand-story", (req, ctx) => handleCMSRequest(req, ctx, [], "brandStory"));
route("GET", "/api/cms/footer", (req, ctx) => handleCMSRequest(req, ctx, [], "footer"));

route("GET", "/api/lookbooks", (req, ctx) => handleLookbookRequest(req, ctx, [], "list"));
route("GET", "/api/lookbooks/:slug", (req, ctx, p) => handleLookbookRequest(req, ctx, p, "detail"));

route("GET", "/api/settings", (req, ctx) => handleSettingsRequest(req, ctx, [], "public"));

route("GET", "/api/orders", handleOrderRequest);
route("GET", "/api/orders/:id", (req, ctx, p) => handleOrderRequest(req, ctx, p, "detail"));

route("POST", "/api/checkout", handleCheckoutRequest, { auth: true });

route("GET", "/api/addresses", handleAddressRequest, { auth: true });
route("POST", "/api/addresses", handleAddressRequest, { auth: true });
route("PUT", "/api/addresses/:id", (req, ctx, p) => handleAddressRequest(req, ctx, p, "update"), { auth: true });
route("DELETE", "/api/addresses/:id", (req, ctx, p) => handleAddressRequest(req, ctx, p, "delete"), { auth: true });

route("GET", "/api/wishlist", handleWishlistRequest, { auth: true });
route("POST", "/api/wishlist", (req, ctx) => handleWishlistRequest(req, ctx, [], "add"), { auth: true });
route("DELETE", "/api/wishlist/:variantId", (req, ctx, p) => handleWishlistRequest(req, ctx, p, "remove"), { auth: true });

route("POST", "/api/coupons/validate", (req, ctx) => handleCouponRequest(req, ctx, [], "validate"), { auth: true });

route("POST", "/api/reviews", (req, ctx) => handleReviewRequest(req, ctx, [], "create"), { auth: true });

route("POST", "/api/contact", (req, ctx) => handleContactRequest(req, ctx, [], "contact"));
route("POST", "/api/newsletter", (req, ctx) => handleContactRequest(req, ctx, [], "newsletter"));

route("POST", "/api/upload", handleUploadRequest, { auth: true });

// Admin routes
route("GET", "/api/admin/dashboard", (req, ctx) => handleDashboardRequest(req, ctx, [], "overview"), { auth: true, admin: true });

route("GET", "/api/admin/products", (req, ctx) => handleAdminProductRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/products", (req, ctx) => handleAdminProductRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("GET", "/api/admin/products/:id", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "detail"), { auth: true, admin: true });
route("PUT", "/api/admin/products/:id", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/products/:id", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "delete"), { auth: true, admin: true });
route("PUT", "/api/admin/products/:id/variants", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "variants"), { auth: true, admin: true });
route("POST", "/api/admin/products/:id/images", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "addImage"), { auth: true, admin: true });
route("DELETE", "/api/admin/products/:id/images/:imageId", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "deleteImage"), { auth: true, admin: true });
route("POST", "/api/admin/products/:id/duplicate", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "duplicate"), { auth: true, admin: true });
route("PUT", "/api/admin/products/:id/restore", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "restore"), { auth: true, admin: true });
route("PUT", "/api/admin/products/:id/schedule", (req, ctx, p) => handleAdminProductRequest(req, ctx, p, "schedule"), { auth: true, admin: true });
route("PUT", "/api/admin/products/bulk/status", (req, ctx) => handleAdminProductRequest(req, ctx, [], "bulkStatus"), { auth: true, admin: true });
route("PUT", "/api/admin/products/bulk/category", (req, ctx) => handleAdminProductRequest(req, ctx, [], "bulkCategory"), { auth: true, admin: true });
route("PUT", "/api/admin/products/bulk/delete", (req, ctx) => handleAdminProductRequest(req, ctx, [], "bulkDelete"), { auth: true, admin: true });
route("PUT", "/api/admin/products/:id/labels", (req, ctx, p) => handleAdminProductLabelRequest(req, ctx, p, "assignLabels"), { auth: true, admin: true });
route("PUT", "/api/admin/products/:id/tags", (req, ctx, p) => handleAdminProductLabelRequest(req, ctx, p, "assignTags"), { auth: true, admin: true });
route("GET", "/api/admin/products/:id/related", (req, ctx, p) => handleAdminRelatedProductRequest(req, ctx, p, "list"), { auth: true, admin: true });
route("PUT", "/api/admin/products/:id/related/reorder", (req, ctx, p) => handleAdminRelatedProductRequest(req, ctx, p, "reorder"), { auth: true, admin: true });

route("GET", "/api/admin/categories", (req, ctx) => handleAdminCategoryRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/categories", (req, ctx) => handleAdminCategoryRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("PUT", "/api/admin/categories/:id", (req, ctx, p) => handleAdminCategoryRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/categories/:id", (req, ctx, p) => handleAdminCategoryRequest(req, ctx, p, "delete"), { auth: true, admin: true });

route("GET", "/api/admin/collections", (req, ctx) => handleAdminCollectionRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/collections", (req, ctx) => handleAdminCollectionRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("PUT", "/api/admin/collections/:id", (req, ctx, p) => handleAdminCollectionRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/collections/:id", (req, ctx, p) => handleAdminCollectionRequest(req, ctx, p, "delete"), { auth: true, admin: true });

route("GET", "/api/admin/orders", (req, ctx) => handleAdminOrderRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("GET", "/api/admin/orders/:id", (req, ctx, p) => handleAdminOrderRequest(req, ctx, p, "detail"), { auth: true, admin: true });
route("PUT", "/api/admin/orders/:id/status", (req, ctx, p) => handleAdminOrderRequest(req, ctx, p, "updateStatus"), { auth: true, admin: true });

route("GET", "/api/admin/customers", (req, ctx) => handleAdminCustomerRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("GET", "/api/admin/customers/:id", (req, ctx, p) => handleAdminCustomerRequest(req, ctx, p, "detail"), { auth: true, admin: true });

route("GET", "/api/admin/cms/pages", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "pages"), { auth: true, admin: true });
route("POST", "/api/admin/cms/pages", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "createPage"), { auth: true, admin: true });
route("PUT", "/api/admin/cms/pages/:id", (req, ctx, p) => handleAdminCMSRequest(req, ctx, p, "updatePage"), { auth: true, admin: true });
route("DELETE", "/api/admin/cms/pages/:id", (req, ctx, p) => handleAdminCMSRequest(req, ctx, p, "deletePage"), { auth: true, admin: true });

route("GET", "/api/admin/cms/homepage", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "homepage"), { auth: true, admin: true });
route("POST", "/api/admin/cms/homepage", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "createHomeSection"), { auth: true, admin: true });
route("PUT", "/api/admin/cms/homepage/:id", (req, ctx, p) => handleAdminCMSRequest(req, ctx, p, "updateHomeSection"), { auth: true, admin: true });
route("DELETE", "/api/admin/cms/homepage/:id", (req, ctx, p) => handleAdminCMSRequest(req, ctx, p, "deleteHomeSection"), { auth: true, admin: true });
route("PUT", "/api/admin/cms/homepage/reorder", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "reorderHomeSections"), { auth: true, admin: true });

route("GET", "/api/admin/cms/navigation", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "navigation"), { auth: true, admin: true });
route("POST", "/api/admin/cms/navigation", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "createNavigation"), { auth: true, admin: true });
route("PUT", "/api/admin/cms/navigation/:id", (req, ctx, p) => handleAdminCMSRequest(req, ctx, p, "updateNavigation"), { auth: true, admin: true });
route("DELETE", "/api/admin/cms/navigation/:id", (req, ctx, p) => handleAdminCMSRequest(req, ctx, p, "deleteNavigation"), { auth: true, admin: true });

route("GET", "/api/admin/cms/announcements", (req, ctx) => handleAdminMarketingRequest(req, ctx, [], "announcements"), { auth: true, admin: true });
route("POST", "/api/admin/cms/announcements", (req, ctx) => handleAdminMarketingRequest(req, ctx, [], "createAnnouncement"), { auth: true, admin: true });
route("PUT", "/api/admin/cms/announcements/:id", (req, ctx, p) => handleAdminMarketingRequest(req, ctx, p, "updateAnnouncement"), { auth: true, admin: true });
route("DELETE", "/api/admin/cms/announcements/:id", (req, ctx, p) => handleAdminMarketingRequest(req, ctx, p, "deleteAnnouncement"), { auth: true, admin: true });

route("GET", "/api/admin/cms/brand-story", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "brandStory"), { auth: true, admin: true });
route("PUT", "/api/admin/cms/brand-story", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "updateBrandStory"), { auth: true, admin: true });

route("GET", "/api/admin/cms/footer", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "footer"), { auth: true, admin: true });
route("POST", "/api/admin/cms/footer", (req, ctx) => handleAdminCMSRequest(req, ctx, [], "createFooter"), { auth: true, admin: true });
route("PUT", "/api/admin/cms/footer/:id", (req, ctx, p) => handleAdminCMSRequest(req, ctx, p, "updateFooter"), { auth: true, admin: true });
route("DELETE", "/api/admin/cms/footer/:id", (req, ctx, p) => handleAdminCMSRequest(req, ctx, p, "deleteFooter"), { auth: true, admin: true });

route("GET", "/api/admin/lookbooks", (req, ctx) => handleAdminLookbookRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/lookbooks", (req, ctx) => handleAdminLookbookRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("PUT", "/api/admin/lookbooks/:id", (req, ctx, p) => handleAdminLookbookRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/lookbooks/:id", (req, ctx, p) => handleAdminLookbookRequest(req, ctx, p, "delete"), { auth: true, admin: true });
route("POST", "/api/admin/lookbooks/:id/items", (req, ctx, p) => handleAdminLookbookRequest(req, ctx, p, "addItem"), { auth: true, admin: true });
route("DELETE", "/api/admin/lookbooks/:id/items/:itemId", (req, ctx, p) => handleAdminLookbookRequest(req, ctx, p, "removeItem"), { auth: true, admin: true });

route("GET", "/api/admin/coupons", (req, ctx) => handleAdminCouponRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/coupons", (req, ctx) => handleAdminCouponRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("PUT", "/api/admin/coupons/:id", (req, ctx, p) => handleAdminCouponRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/coupons/:id", (req, ctx, p) => handleAdminCouponRequest(req, ctx, p, "delete"), { auth: true, admin: true });

route("GET", "/api/admin/reviews", (req, ctx) => handleAdminReviewRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("PUT", "/api/admin/reviews/:id/approve", (req, ctx, p) => handleAdminReviewRequest(req, ctx, p, "approve"), { auth: true, admin: true });

route("GET", "/api/admin/analytics/sales", (req, ctx) => handleAdminAnalyticsRequest(req, ctx, [], "sales"), { auth: true, admin: true });
route("GET", "/api/admin/analytics/products", (req, ctx) => handleAdminAnalyticsRequest(req, ctx, [], "products"), { auth: true, admin: true });
route("GET", "/api/admin/analytics/customers", (req, ctx) => handleAdminAnalyticsRequest(req, ctx, [], "customers"), { auth: true, admin: true });

route("GET", "/api/admin/settings", (req, ctx) => handleAdminSettingsRequest(req, ctx, [], "get"), { auth: true, admin: true });
route("PUT", "/api/admin/settings", (req, ctx) => handleAdminSettingsRequest(req, ctx, [], "update"), { auth: true, admin: true });

route("GET", "/api/admin/social-links", (req, ctx) => handleAdminSettingsRequest(req, ctx, [], "socialLinks"), { auth: true, admin: true });
route("POST", "/api/admin/social-links", (req, ctx) => handleAdminSettingsRequest(req, ctx, [], "createSocialLink"), { auth: true, admin: true });
route("PUT", "/api/admin/social-links/:id", (req, ctx, p) => handleAdminSettingsRequest(req, ctx, p, "updateSocialLink"), { auth: true, admin: true });
route("DELETE", "/api/admin/social-links/:id", (req, ctx, p) => handleAdminSettingsRequest(req, ctx, p, "deleteSocialLink"), { auth: true, admin: true });

route("GET", "/api/admin/media", (req, ctx) => handleAdminMediaRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/media", (req, ctx) => handleAdminMediaRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("DELETE", "/api/admin/media/:id", (req, ctx, p) => handleAdminMediaRequest(req, ctx, p, "delete"), { auth: true, admin: true });

route("GET", "/api/admin/contact-submissions", (req, ctx) => handleAdminContactRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("PUT", "/api/admin/contact-submissions/:id/read", (req, ctx, p) => handleAdminContactRequest(req, ctx, p, "markRead"), { auth: true, admin: true });
route("DELETE", "/api/admin/contact-submissions/:id", (req, ctx, p) => handleAdminContactRequest(req, ctx, p, "delete"), { auth: true, admin: true });

route("GET", "/api/admin/newsletter-subscribers", (req, ctx) => handleAdminContactRequest(req, ctx, [], "subscribers"), { auth: true, admin: true });
route("DELETE", "/api/admin/newsletter-subscribers/:id", (req, ctx, p) => handleAdminContactRequest(req, ctx, p, "deleteSubscriber"), { auth: true, admin: true });

// Brands
route("GET", "/api/admin/brands", (req, ctx) => handleAdminBrandRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/brands", (req, ctx) => handleAdminBrandRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("GET", "/api/admin/brands/:id", (req, ctx, p) => handleAdminBrandRequest(req, ctx, p, "detail"), { auth: true, admin: true });
route("PUT", "/api/admin/brands/:id", (req, ctx, p) => handleAdminBrandRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/brands/:id", (req, ctx, p) => handleAdminBrandRequest(req, ctx, p, "delete"), { auth: true, admin: true });

// Size Guides
route("GET", "/api/admin/size-guides", (req, ctx) => handleAdminSizeGuideRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/size-guides", (req, ctx) => handleAdminSizeGuideRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("GET", "/api/admin/size-guides/:id", (req, ctx, p) => handleAdminSizeGuideRequest(req, ctx, p, "detail"), { auth: true, admin: true });
route("PUT", "/api/admin/size-guides/:id", (req, ctx, p) => handleAdminSizeGuideRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/size-guides/:id", (req, ctx, p) => handleAdminSizeGuideRequest(req, ctx, p, "delete"), { auth: true, admin: true });

// Subcategories
route("GET", "/api/admin/subcategories", (req, ctx) => handleAdminSubcategoryRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/subcategories", (req, ctx) => handleAdminSubcategoryRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("PUT", "/api/admin/subcategories/:id", (req, ctx, p) => handleAdminSubcategoryRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/subcategories/:id", (req, ctx, p) => handleAdminSubcategoryRequest(req, ctx, p, "delete"), { auth: true, admin: true });

// Product Labels
route("GET", "/api/admin/product-labels", (req, ctx) => handleAdminProductLabelRequest(req, ctx, [], "listLabels"), { auth: true, admin: true });
route("POST", "/api/admin/product-labels", (req, ctx) => handleAdminProductLabelRequest(req, ctx, [], "createLabel"), { auth: true, admin: true });
route("PUT", "/api/admin/product-labels/:id", (req, ctx, p) => handleAdminProductLabelRequest(req, ctx, p, "updateLabel"), { auth: true, admin: true });
route("DELETE", "/api/admin/product-labels/:id", (req, ctx, p) => handleAdminProductLabelRequest(req, ctx, p, "deleteLabel"), { auth: true, admin: true });

// Product Tags
route("GET", "/api/admin/product-tags", (req, ctx) => handleAdminProductLabelRequest(req, ctx, [], "listTags"), { auth: true, admin: true });
route("POST", "/api/admin/product-tags", (req, ctx) => handleAdminProductLabelRequest(req, ctx, [], "createTag"), { auth: true, admin: true });
route("DELETE", "/api/admin/product-tags/:id", (req, ctx, p) => handleAdminProductLabelRequest(req, ctx, p, "deleteTag"), { auth: true, admin: true });

// Related Products
route("POST", "/api/admin/related-products", (req, ctx) => handleAdminRelatedProductRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("DELETE", "/api/admin/related-products/:id", (req, ctx, p) => handleAdminRelatedProductRequest(req, ctx, p, "delete"), { auth: true, admin: true });

// Inventory
route("GET", "/api/admin/inventory/overview", (req, ctx) => handleAdminInventoryRequest(req, ctx, [], "overview"), { auth: true, admin: true });
route("GET", "/api/admin/inventory/product/:id/movements", (req, ctx, p) => handleAdminInventoryRequest(req, ctx, p, "productMovements"), { auth: true, admin: true });
route("GET", "/api/admin/inventory/variant/:id/movements", (req, ctx, p) => handleAdminInventoryRequest(req, ctx, p, "variantMovements"), { auth: true, admin: true });
route("POST", "/api/admin/inventory/variant/:id/adjust", (req, ctx, p) => handleAdminInventoryRequest(req, ctx, p, "adjustVariant"), { auth: true, admin: true });
route("GET", "/api/admin/inventory/alerts", (req, ctx) => handleAdminInventoryRequest(req, ctx, [], "alerts"), { auth: true, admin: true });
route("PUT", "/api/admin/inventory/alerts/:id/resolve", (req, ctx, p) => handleAdminInventoryRequest(req, ctx, p, "resolveAlert"), { auth: true, admin: true });

// Lookbooks extended
route("GET", "/api/admin/lookbooks/:id", (req, ctx, p) => handleAdminLookbookRequest(req, ctx, p, "detail"), { auth: true, admin: true });
route("PUT", "/api/admin/lookbooks/:id/items/:itemId", (req, ctx, p) => handleAdminLookbookRequest(req, ctx, p, "updateItem"), { auth: true, admin: true });
route("PUT", "/api/admin/lookbooks/:id/items/reorder", (req, ctx, p) => handleAdminLookbookRequest(req, ctx, p, "reorderItems"), { auth: true, admin: true });

// Templates
route("GET", "/api/admin/templates", (req, ctx) => handleAdminTemplateRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("POST", "/api/admin/templates", (req, ctx) => handleAdminTemplateRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("GET", "/api/admin/templates/:id", (req, ctx, p) => handleAdminTemplateRequest(req, ctx, p, "detail"), { auth: true, admin: true });
route("PUT", "/api/admin/templates/:id", (req, ctx, p) => handleAdminTemplateRequest(req, ctx, p, "update"), { auth: true, admin: true });
route("DELETE", "/api/admin/templates/:id", (req, ctx, p) => handleAdminTemplateRequest(req, ctx, p, "delete"), { auth: true, admin: true });
route("POST", "/api/admin/templates/:id/apply", (req, ctx, p) => handleAdminTemplateRequest(req, ctx, p, "apply"), { auth: true, admin: true });

// Import / Export
route("GET", "/api/admin/products/export", (req, ctx) => handleAdminImportExportRequest(req, ctx, [], "exportProducts"), { auth: true, admin: true });
route("POST", "/api/admin/products/import", (req, ctx) => handleAdminImportExportRequest(req, ctx, [], "importProducts"), { auth: true, admin: true });
route("GET", "/api/admin/orders/export", (req, ctx) => handleAdminImportExportRequest(req, ctx, [], "exportOrders"), { auth: true, admin: true });

// Search Index
route("GET", "/api/admin/search/status", (req, ctx) => handleAdminSearchIndexRequest(req, ctx, [], "status"), { auth: true, admin: true });
route("POST", "/api/admin/search/build", (req, ctx) => handleAdminSearchIndexRequest(req, ctx, [], "build"), { auth: true, admin: true });
route("GET", "/api/admin/search", (req, ctx) => handleAdminSearchIndexRequest(req, ctx, [], "search"), { auth: true, admin: true });

// Public theme endpoint
route("GET", "/api/theme", (req, ctx) => handleSettingsRequest(req, ctx, [], "public"));

// ─── Router ───

export async function GET(request: Request): Promise<Response> {
  return handleRequest("GET", request);
}

export async function POST(request: Request): Promise<Response> {
  return handleRequest("POST", request);
}

export async function PUT(request: Request): Promise<Response> {
  return handleRequest("PUT", request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleRequest("DELETE", request);
}

export async function PATCH(request: Request): Promise<Response> {
  return handleRequest("PATCH", request);
}

async function handleRequest(method: string, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Try to match a route
  for (const r of routes) {
    if (r.method !== method) continue;

    const match = path.match(r.pattern);
    if (!match) continue;

    const params = match.slice(1);

    // Authenticate if required
    let context: RequestContext = {};
    if (r.auth || r.admin) {
      const result = await authenticateRequest(request);
      if (result instanceof Response) return result;
      context = result;
    }

    // Check admin role
    if (r.admin) {
      const forbidden = requireAdmin(context);
      if (forbidden) return forbidden;
    }

    try {
      return await r.handler(request, context, params);
    } catch (err) {
      console.error(`Error handling ${method} ${path}:`, err);
      return serverError(err);
    }
  }

  return notFound(`Route not found: ${method} ${path}`);
}
