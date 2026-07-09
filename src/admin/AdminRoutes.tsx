import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import { ErrorBoundary } from "../components/ErrorBoundary";

function lazyWithRetry(factory: () => Promise<{ default: React.ComponentType<unknown> }>) {
  return lazy(() =>
    factory().catch((err: unknown) => {
      return new Promise<{ default: React.ComponentType<unknown> }>((resolve) => {
        setTimeout(() => resolve(factory()), 1000);
      });
    })
  );
}

const DashboardPage = lazyWithRetry(() => import("./dashboard/DashboardPage"));
const ProductsPage = lazyWithRetry(() => import("./products/ProductsPage"));
const ProductFormPage = lazyWithRetry(() => import("./products/ProductFormPage"));
const CategoriesPage = lazyWithRetry(() => import("./categories/CategoriesPage"));
const CollectionsPage = lazyWithRetry(() => import("./collections/CollectionsPage"));
const OrdersPage = lazyWithRetry(() => import("./orders/OrdersPage"));
const OrderDetailPage = lazyWithRetry(() => import("./orders/OrderDetailPage"));
const ReturnsPage = lazyWithRetry(() => import("./returns/ReturnsPage"));
const ReturnDetailPage = lazyWithRetry(() => import("./returns/ReturnDetailPage"));

const CustomersPage = lazyWithRetry(() => import("./customers/CustomersPage"));
const CMSPage = lazyWithRetry(() => import("./cms/CMSPage"));
const HomepageBuilder = lazyWithRetry(() => import("./cms/HomepageBuilder"));
const FooterBuilder = lazyWithRetry(() => import("./cms/FooterBuilder"));
const HeroBuilder = lazyWithRetry(() => import("./cms/HeroBuilder"));
const HeaderBuilder = lazyWithRetry(() => import("./cms/HeaderBuilder"));
const MediaLibrary = lazyWithRetry(() => import("./media/MediaLibrary"));
const MediaHealth = lazyWithRetry(() => import("./media/MediaHealth"));
const SEOPage = lazyWithRetry(() => import("./seo/SEOPage"));
const ThemeBuilder = lazyWithRetry(() => import("./theme/ThemeBuilder"));
const AnalyticsPage = lazyWithRetry(() => import("./analytics/AnalyticsPage"));
const SettingsPage = lazyWithRetry(() => import("./settings/SettingsPage"));
const LookbooksPage = lazyWithRetry(() => import("./lookbooks/LookbooksPage"));
const LookbookFormPage = lazyWithRetry(() => import("./lookbooks/LookbookFormPage"));
const BrandsPage = lazyWithRetry(() => import("./brands/BrandsPage"));
const SizeGuidesPage = lazyWithRetry(() => import("./size-guides/SizeGuidesPage"));
const LabelsPage = lazyWithRetry(() => import("./labels/LabelsPage"));
const InventoryPage = lazyWithRetry(() => import("./inventory/InventoryPage"));
const CouponsPage = lazyWithRetry(() => import("./coupons/CouponsPage"));
const ReviewsPage = lazyWithRetry(() => import("./reviews/ReviewsPage"));
const NewsletterPage = lazyWithRetry(() => import("./newsletter/NewsletterPage"));
const ContactsPage = lazyWithRetry(() => import("./contacts/ContactsPage"));
const AnnouncementsPage = lazyWithRetry(() => import("./announcements/AnnouncementsPage"));
const ImportExportPage = lazyWithRetry(() => import("./import-export/ImportExportPage"));
const SearchIndexPage = lazyWithRetry(() => import("./search/SearchIndexPage"));
const SocialLinksPage = lazyWithRetry(() => import("./social/SocialLinksPage"));
const SupportTicketsPage = lazyWithRetry(() => import("./support/SupportTicketsPage"));
const SupportTicketDetailPage = lazyWithRetry(() => import("./support/SupportTicketDetailPage"));
const FAQPage = lazyWithRetry(() => import("./faq/FAQPage"));
const NotificationsPage = lazyWithRetry(() => import("./notifications/NotificationsPage"));
const WebhookEventsPage = lazyWithRetry(() => import("./webhooks/WebhookEventsPage"));
const PageTemplatesPage = lazyWithRetry(() => import("./templates/PageTemplatesPage"));
const CampaignsPage = lazyWithRetry(() => import("./campaigns/CampaignsPage"));
const AbandonedCartsPage = lazyWithRetry(() => import("./abandoned-carts/AbandonedCartsPage"));
const AuthActivityPage = lazyWithRetry(() => import("./auth/AuthActivityPage"));
const AuditLogPage = lazyWithRetry(() => import("./audit-log/AuditLogPage"));
const WishlistsPage = lazyWithRetry(() => import("./wishlists/WishlistsPage"));
const LoyaltyAdminPage = lazyWithRetry(() => import("./loyalty/LoyaltyPage"));
const ReferralsAdminPage = lazyWithRetry(() => import("./referrals/ReferralsPage"));
const GiftCardsAdminPage = lazyWithRetry(() => import("./gift-cards/GiftCardsAdminPage"));
const FeatureFlagsPage = lazyWithRetry(() => import("./feature-flags/FeatureFlagsPage"));

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="premium-card rounded-2xl px-8 py-10 text-center shadow-elevated">
        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="font-display text-lg text-neutral-900">Loading admin…</p>
        <p className="text-sm text-neutral-500 mt-1">Preparing the dashboard experience</p>
      </div>
    </div>
  );
}

export default function AdminRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<AdminFallback />}>
      <ErrorBoundary
        key={location.pathname}
        fallback={
          <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Admin Error</h2>
              <p className="text-sm text-neutral-500 mb-6">An admin page encountered an error.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.reload();
                    }
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-sm hover:bg-brand-600 transition-colors"
                >
                  Try Again
                </button>
                <a href="/admin" className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-sm hover:bg-neutral-200 transition-colors">
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        }
      >
        <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="returns/:id" element={<ReturnDetailPage />} />

          <Route path="customers" element={<CustomersPage />} />
          <Route path="lookbooks" element={<LookbooksPage />} />
          <Route path="lookbooks/new" element={<LookbookFormPage />} />
          <Route path="lookbooks/:id/edit" element={<LookbookFormPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="size-guides" element={<SizeGuidesPage />} />
          <Route path="labels" element={<LabelsPage />} />
          <Route path="inventory" element={<InventoryPage />} />

          {/* CMS Routes */}
          <Route path="cms" element={<CMSPage />} />
          {/* Redirect old CMS routes to consolidated page */}
          <Route path="cms/pages" element={<Navigate to="/admin/cms" replace />} />
          <Route path="cms/page-builder/new" element={<Navigate to="/admin/cms" replace />} />
          <Route path="cms/page-builder/:id" element={<Navigate to="/admin/cms" replace />} />
          <Route path="cms/brand-story" element={<Navigate to="/admin/cms" replace />} />
          <Route path="cms/homepage" element={<HomepageBuilder />} />
          <Route path="cms/hero-builder" element={<HeroBuilder />} />
          <Route path="cms/footer" element={<FooterBuilder />} />
          <Route path="cms/header-builder" element={<HeaderBuilder />} />

          <Route path="media" element={<MediaLibrary />} />
          <Route path="media/health" element={<MediaHealth />} />
          <Route path="seo" element={<SEOPage />} />
          <Route path="theme/builder" element={<ThemeBuilder />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="import-export" element={<ImportExportPage />} />
          <Route path="search-index" element={<SearchIndexPage />} />
          <Route path="social-links" element={<SocialLinksPage />} />
          <Route path="support" element={<SupportTicketsPage />} />
          <Route path="support/:id" element={<SupportTicketDetailPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="webhooks" element={<WebhookEventsPage />} />
          <Route path="page-templates" element={<PageTemplatesPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="abandoned-carts" element={<AbandonedCartsPage />} />
          <Route path="auth" element={<AuthActivityPage />} />
          <Route path="sessions" element={<Navigate to="/admin/auth?tab=sessions" replace />} />
          <Route path="login-attempts" element={<Navigate to="/admin/auth?tab=attempts" replace />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="wishlists" element={<WishlistsPage />} />
          <Route path="loyalty" element={<LoyaltyAdminPage />} />
          <Route path="referrals" element={<ReferralsAdminPage />} />
          <Route path="gift-cards" element={<GiftCardsAdminPage />} />
          <Route path="feature-flags" element={<FeatureFlagsPage />} />
          <Route path="*" element={
            <div className="min-h-[60vh] flex items-center justify-center px-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
                  <span className="text-2xl font-display text-brand-500">404</span>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Page Not Found</h2>
                <p className="text-sm text-neutral-500 mb-6">The admin page you're looking for doesn't exist or has been moved.</p>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-sm text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          } />
        </Route>
      </Routes>
      </ErrorBoundary>
    </Suspense>
  );
}
