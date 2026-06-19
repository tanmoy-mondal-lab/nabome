// ─────────────────────────────────────────────────────────────
// নবME API — Catch-all Router
// ─────────────────────────────────────────────────────────────
// Receives all /api/* requests and dispatches to handlers.
// Vercel serverless function entry point.
// ─────────────────────────────────────────────────────────────

import type { RequestContext } from "./_lib/types";
import { authenticateRequest, requireAdmin } from "./_lib/auth";
import { notFound, serverError, error } from "./_lib/response";
import { checkRateLimit, RATE_LIMIT_CONFIG, rateLimitResponse } from "./_lib/rate-limit";
import { logAction, extractRequestMeta } from "./_lib/audit";
import { setCsrfCookie, validateCsrf, csrfError } from "./_lib/csrf";

const ALLOWED_ORIGINS = [
  "https://www.nabome.online",
  "https://nabome.online",
  "http://localhost:5173",
  "http://localhost:4173",
];

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : "https://www.nabome.online";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

function securityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https://res.cloudinary.com data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.razorpay.com; frame-src https://checkout.razorpay.com;",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

function cacheControlHeaders(path: string): Record<string, string> {
  // Don't cache auth, admin, or mutation endpoints
  if (path.includes("/auth/") || path.includes("/admin/") || path.includes("/checkout") || path.includes("/payments") || path.includes("/orders") || path.includes("/cart")) {
    return { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" };
  }
  // Cache public product/category data for 60 seconds, stale-while-revalidate for 5 min
  if (path.includes("/api/products") || path.includes("/api/categories") || path.includes("/api/collections")) {
    return { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" };
  }
  // Cache static CMS content for 5 minutes
  if (path.includes("/api/cms") || path.includes("/api/settings")) {
    return { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" };
  }
  return { "Cache-Control": "no-cache" };
}

function withCors(response: Response, request: Request, path?: string): Response {
  const headers = {
    ...corsHeaders(request),
    ...securityHeaders(),
    ...(path ? cacheControlHeaders(path) : {}),
  };
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

function isAuthPath(path: string): boolean {
  return path.includes("/auth/login") || path.includes("/auth/register") ||
    path.includes("/auth/verify-email") || path.includes("/auth/resend-verification") ||
    path.includes("/contact") || path.includes("/auth/forgot-password") ||
    path.includes("/auth/reset-password");
}

function calculateKey(request: Request, path: string): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const ua = request.headers.get("user-agent")?.slice(0, 50) || "unknown";
  const endpoint = path.replace(/\/\d+/g, "/:id");
  return `${ip}:${ua}:${endpoint}`;
}

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
import { handleShippingRequest } from "./_handlers/shipping";
import { handleReturnRequest } from "./_handlers/returns";
import { handleRefundRequest } from "./_handlers/refunds";
import { handlePaymentRequest, handleAdminWebhookRequest } from "./_handlers/payments";
import { handleNotificationRequest } from "./_handlers/notifications";
import { handleSupportRequest } from "./_handlers/support";
import { handleInvoiceRequest } from "./_handlers/invoices";
import { handleDashboardRequest as handleCustomerDashboardRequest } from "./_handlers/dashboard";

// ─── Route registration ───

// Public routes
route("GET", "/api/auth/me", (req, ctx) => handleAuthRequest(req, ctx, [], "me"));
route("PUT", "/api/auth/me", (req, ctx) => handleAuthRequest(req, ctx, [], "updateMe"), { auth: true });
route("POST", "/api/auth/register", (req, ctx) => handleAuthRequest(req, ctx, [], "register"));
route("POST", "/api/auth/login", (req, ctx) => handleAuthRequest(req, ctx, [], "login"));
route("POST", "/api/auth/logout", (req, ctx) => handleAuthRequest(req, ctx, [], "logout"), { auth: true });
route("POST", "/api/auth/refresh", (req, ctx) => handleAuthRequest(req, ctx, [], "refresh"));
route("POST", "/api/auth/forgot-password", (req, ctx) => handleAuthRequest(req, ctx, [], "forgotPassword"));
route("POST", "/api/auth/reset-password", (req, ctx) => handleAuthRequest(req, ctx, [], "resetPassword"));
route("POST", "/api/auth/change-password", (req, ctx) => handleAuthRequest(req, ctx, [], "changePassword"), { auth: true });
route("GET", "/api/auth/sessions", (req, ctx) => handleAuthRequest(req, ctx, [], "sessions"), { auth: true });
route("DELETE", "/api/auth/sessions/:id", (req, ctx, p) => handleAuthRequest(req, ctx, p, "deleteSession"), { auth: true });
route("GET", "/api/auth/verify-email", (req, ctx) => handleAuthRequest(req, ctx, [], "verifyEmail"));
route("POST", "/api/auth/resend-verification", (req, ctx) => handleAuthRequest(req, ctx, [], "resendVerification"));

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
route("GET", "/api/orders", (req, ctx) => handleOrderRequest(req, ctx, []), { auth: true });
route("GET", "/api/orders/stats", (req, ctx) => handleOrderRequest(req, ctx, [], "stats"), { auth: true });
route("GET", "/api/orders/:id", (req, ctx, p) => handleOrderRequest(req, ctx, p, "detail"), { auth: true });
route("POST", "/api/orders/:id/cancel", (req, ctx, p) => handleOrderRequest(req, ctx, p, "cancel"), { auth: true });
route("GET", "/api/orders/:id/tracking", (req, ctx, p) => handleOrderRequest(req, ctx, p, "tracking"), { auth: true });

route("POST", "/api/checkout", handleCheckoutRequest);
route("POST", "/api/checkout/guest", (req, ctx) => handleCheckoutRequest(req, ctx, [], "guest"));
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

// Shipping
route("GET", "/api/shipping/zones", (req, ctx) => handleShippingRequest(req, ctx, [], "listZones"));
route("GET", "/api/shipping/rates", (req, ctx) => handleShippingRequest(req, ctx, [], "calculateRates"));

route("GET", "/api/admin/shipping/zones", (req, ctx) => handleShippingRequest(req, ctx, [], "adminListZones"), { auth: true, admin: true });
route("POST", "/api/admin/shipping/zones", (req, ctx) => handleShippingRequest(req, ctx, [], "createZone"), { auth: true, admin: true });
route("PUT", "/api/admin/shipping/zones/:id", (req, ctx, p) => handleShippingRequest(req, ctx, p, "updateZone"), { auth: true, admin: true });
route("DELETE", "/api/admin/shipping/zones/:id", (req, ctx, p) => handleShippingRequest(req, ctx, p, "deleteZone"), { auth: true, admin: true });
route("POST", "/api/admin/shipping/zones/:id/rates", (req, ctx, p) => handleShippingRequest(req, ctx, p, "addRate"), { auth: true, admin: true });
route("PUT", "/api/admin/shipping/rates/:id", (req, ctx, p) => handleShippingRequest(req, ctx, p, "updateRate"), { auth: true, admin: true });
route("DELETE", "/api/admin/shipping/rates/:id", (req, ctx, p) => handleShippingRequest(req, ctx, p, "deleteRate"), { auth: true, admin: true });

// Returns
route("POST", "/api/returns", (req, ctx) => handleReturnRequest(req, ctx, [], "create"), { auth: true });
route("GET", "/api/returns", (req, ctx) => handleReturnRequest(req, ctx, [], "listMy"), { auth: true });
route("GET", "/api/returns/:id", (req, ctx, p) => handleReturnRequest(req, ctx, p, "detailMy"), { auth: true });

route("GET", "/api/admin/returns", (req, ctx) => handleReturnRequest(req, ctx, [], "adminList"), { auth: true, admin: true });
route("GET", "/api/admin/returns/:id", (req, ctx, p) => handleReturnRequest(req, ctx, p, "adminDetail"), { auth: true, admin: true });
route("PUT", "/api/admin/returns/:id/approve", (req, ctx, p) => handleReturnRequest(req, ctx, p, "approve"), { auth: true, admin: true });
route("PUT", "/api/admin/returns/:id/reject", (req, ctx, p) => handleReturnRequest(req, ctx, p, "reject"), { auth: true, admin: true });
route("PUT", "/api/admin/returns/:id/receive", (req, ctx, p) => handleReturnRequest(req, ctx, p, "receive"), { auth: true, admin: true });

// Refunds
route("GET", "/api/admin/refunds", (req, ctx) => handleRefundRequest(req, ctx, [], "list"), { auth: true, admin: true });
route("GET", "/api/admin/refunds/:id", (req, ctx, p) => handleRefundRequest(req, ctx, p, "detail"), { auth: true, admin: true });
route("POST", "/api/admin/refunds", (req, ctx) => handleRefundRequest(req, ctx, [], "create"), { auth: true, admin: true });
route("POST", "/api/admin/refunds/:id/process", (req, ctx, p) => handleRefundRequest(req, ctx, p, "process"), { auth: true, admin: true });
route("POST", "/api/admin/refunds/:id/complete", (req, ctx, p) => handleRefundRequest(req, ctx, p, "complete"), { auth: true, admin: true });
route("POST", "/api/admin/refunds/:id/fail", (req, ctx, p) => handleRefundRequest(req, ctx, p, "fail"), { auth: true, admin: true });

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
route("GET", "/api/admin/orders/stats", (req, ctx) => handleAdminOrderRequest(req, ctx, [], "stats"), { auth: true, admin: true });
route("GET", "/api/admin/orders/:id", (req, ctx, p) => handleAdminOrderRequest(req, ctx, p, "detail"), { auth: true, admin: true });
route("PUT", "/api/admin/orders/:id/status", (req, ctx, p) => handleAdminOrderRequest(req, ctx, p, "updateStatus"), { auth: true, admin: true });
route("PUT", "/api/admin/orders/:id/internal-notes", (req, ctx, p) => handleAdminOrderRequest(req, ctx, p, "internalNotes"), { auth: true, admin: true });
route("GET", "/api/admin/orders/:id/timeline", (req, ctx, p) => handleAdminOrderRequest(req, ctx, p, "timeline"), { auth: true, admin: true });

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

route("GET", "/api/orders/:id/invoice", (req, ctx, p) => handleInvoiceRequest(req, ctx, p, "getInvoice"), { auth: true });

// Payments
route("POST", "/api/payments/verify", (req, ctx) => handlePaymentRequest(req, ctx, [], "verify"));
route("POST", "/api/payments/failed", (req, ctx) => handlePaymentRequest(req, ctx, [], "failed"));
route("POST", "/api/payments/retry", (req, ctx) => handlePaymentRequest(req, ctx, [], "retry"));
route("POST", "/api/payments/refund", (req, ctx) => handlePaymentRequest(req, ctx, [], "refund"), { auth: true });
route("POST", "/api/payments/webhook", (req) => handlePaymentRequest(req, {} as RequestContext, [], "webhook"));

// Admin Webhooks
route("GET", "/api/admin/webhooks/events", (req, ctx) => handleAdminWebhookRequest(req, ctx, [], "events"), { auth: true, admin: true });
route("POST", "/api/admin/webhooks/reprocess/:id", (req, ctx, p) => handleAdminWebhookRequest(req, ctx, p, "reprocess"), { auth: true, admin: true });
route("POST", "/api/admin/webhooks/reconcile/:orderId", (req, ctx, p) => handleAdminWebhookRequest(req, ctx, p, "reconcile"), { auth: true, admin: true });

// Notifications
route("GET", "/api/notifications", (req, ctx) => handleNotificationRequest(req, ctx, [], "list"), { auth: true });
route("PUT", "/api/notifications/read-all", (req, ctx) => handleNotificationRequest(req, ctx, [], "readAll"), { auth: true });
route("GET", "/api/notifications/unread-count", (req, ctx) => handleNotificationRequest(req, ctx, [], "unreadCount"), { auth: true });
route("PUT", "/api/notifications/:id/read", (req, ctx, p) => handleNotificationRequest(req, ctx, p, "read"), { auth: true });

// Dashboard
route("GET", "/api/dashboard", (req, ctx) => handleCustomerDashboardRequest(req, ctx, [], "overview"), { auth: true });
route("GET", "/api/profile", (req, ctx) => handleCustomerDashboardRequest(req, ctx, [], "profile"), { auth: true });
route("PUT", "/api/profile", (req, ctx) => handleCustomerDashboardRequest(req, ctx, [], "profile"), { auth: true });
route("PUT", "/api/profile/password", (req, ctx) => handleCustomerDashboardRequest(req, ctx, [], "changePassword"), { auth: true });

// Support
route("POST", "/api/support", (req, ctx) => handleSupportRequest(req, ctx, [], "createTicket"));
route("GET", "/api/support", (req, ctx) => handleSupportRequest(req, ctx, [], "listTickets"), { auth: true });
route("GET", "/api/support/:id", (req, ctx, p) => handleSupportRequest(req, ctx, p, "ticketDetail"), { auth: true });
route("POST", "/api/support/:id/reply", (req, ctx, p) => handleSupportRequest(req, ctx, p, "ticketReply"), { auth: true });
route("GET", "/api/faq", (req, ctx) => handleSupportRequest(req, ctx, [], "faq"));

// --- ADMIN ROUTES ---

// Admin Notifications
route("GET", "/api/admin/notifications", (req, ctx) => handleNotificationRequest(req, ctx, [], "adminList"), { auth: true, admin: true });
route("GET", "/api/admin/notification-templates", (req, ctx) => handleNotificationRequest(req, ctx, [], "adminTemplates"), { auth: true, admin: true });
route("PUT", "/api/admin/notification-templates/:id", (req, ctx, p) => handleNotificationRequest(req, ctx, p, "adminUpdateTemplate"), { auth: true, admin: true });
route("POST", "/api/admin/notifications/send", (req, ctx) => handleNotificationRequest(req, ctx, [], "adminSend"), { auth: true, admin: true });

// Admin Support
route("GET", "/api/admin/support", (req, ctx) => handleSupportRequest(req, ctx, [], "adminList"), { auth: true, admin: true });
route("GET", "/api/admin/support/:id", (req, ctx, p) => handleSupportRequest(req, ctx, p, "adminDetail"), { auth: true, admin: true });
route("PUT", "/api/admin/support/:id/status", (req, ctx, p) => handleSupportRequest(req, ctx, p, "adminUpdateStatus"), { auth: true, admin: true });
route("PUT", "/api/admin/support/:id/assign", (req, ctx, p) => handleSupportRequest(req, ctx, p, "adminAssign"), { auth: true, admin: true });
route("POST", "/api/admin/support/:id/reply", (req, ctx, p) => handleSupportRequest(req, ctx, p, "adminReply"), { auth: true, admin: true });

// Admin FAQ
route("GET", "/api/admin/faq", (req, ctx) => handleSupportRequest(req, ctx, [], "adminFaqList"), { auth: true, admin: true });
route("POST", "/api/admin/faq", (req, ctx) => handleSupportRequest(req, ctx, [], "adminFaqCreate"), { auth: true, admin: true });
route("PUT", "/api/admin/faq/:id", (req, ctx, p) => handleSupportRequest(req, ctx, p, "adminFaqUpdate"), { auth: true, admin: true });
route("DELETE", "/api/admin/faq/:id", (req, ctx, p) => handleSupportRequest(req, ctx, p, "adminFaqDelete"), { auth: true, admin: true });

// Admin Invoices
route("GET", "/api/admin/orders/:id/invoice", (req, ctx, p) => handleInvoiceRequest(req, ctx, p, "adminGetInvoice"), { auth: true, admin: true });
route("POST", "/api/admin/orders/:id/invoice/generate", (req, ctx, p) => handleInvoiceRequest(req, ctx, p, "adminGenerateInvoice"), { auth: true, admin: true });

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

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Max-Age": "86400",
    },
  });
}

async function handleRequest(method: string, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Rate limiting
  const key = calculateKey(request, path);
  let rateConfig = RATE_LIMIT_CONFIG.standard;
  if (isAuthPath(path)) {
    rateConfig = path.includes("/contact") ? RATE_LIMIT_CONFIG.contact : RATE_LIMIT_CONFIG.auth;
  } else if (path.includes("/api/admin/")) {
    rateConfig = RATE_LIMIT_CONFIG.admin;
  }
  const rateResult = checkRateLimit(key, rateConfig);
  if (!rateResult.allowed) {
    return withCors(rateLimitResponse(rateConfig.message || "Too many requests", rateResult.resetAt), request, path);
  }

  // Body size limit
  const contentLength = request.headers.get("content-length");
  if (contentLength && ["POST", "PUT", "PATCH"].includes(method)) {
    const isUpload = path === "/api/upload" || path.startsWith("/api/admin/media");
    const maxBytes = isUpload ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (parseInt(contentLength) > maxBytes) {
      return withCors(error(`Request body too large. Max: ${isUpload ? "20MB" : "5MB"}`, 413), request, path);
    }
  }

  // Try to match a route
  for (const r of routes) {
    if (r.method !== method) continue;

    const match = path.match(r.pattern);
    if (!match) continue;

    const params = match.slice(1);

    // CSRF validation for state-changing methods
    // Auth routes are exempt (no prior GET to set cookie, already protected by credentials)
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      const isPublicWebhook = path === "/api/payments/webhook";
      if (!isPublicWebhook && !isAuthPath(path) && !validateCsrf(request)) {
        return withCors(csrfError(), request, path);
      }
    }

    // Authenticate if required
    let context: RequestContext = {};
    if (r.auth || r.admin) {
      const result = await authenticateRequest(request);
      if (result instanceof Response) return withCors(result, request, path);
      context = result;
    }

    // Check admin role
    if (r.admin) {
      const forbidden = requireAdmin(context);
      if (forbidden) return withCors(forbidden, request, path);
    }

    try {
      const response = await r.handler(request, context, params);
      // Set CSRF cookie on GET responses for SPA to read
      const responseWithCsrf = method === "GET" ? setCsrfCookie(response) : response;
      return withCors(responseWithCsrf, request, path);
    } catch (err) {
      console.error(`Error handling ${method} ${path}:`, err);
      return withCors(serverError(err), request, path);
    }
  }

  return withCors(notFound(`Route not found: ${method} ${path}`), request, path);
}
