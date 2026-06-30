import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import { ErrorBoundary } from "../components/ErrorBoundary";

const DashboardPage = lazy(() => import("./dashboard/DashboardPage"));
const ProductsPage = lazy(() => import("./products/ProductsPage"));
const ProductFormPage = lazy(() => import("./products/ProductFormPage"));
const CategoriesPage = lazy(() => import("./categories/CategoriesPage"));
const CollectionsPage = lazy(() => import("./collections/CollectionsPage"));
const OrdersPage = lazy(() => import("./orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("./orders/OrderDetailPage"));
const ReturnsPage = lazy(() => import("./returns/ReturnsPage"));
const ReturnDetailPage = lazy(() => import("./returns/ReturnDetailPage"));

const CustomersPage = lazy(() => import("./customers/CustomersPage"));
const CMSPage = lazy(() => import("./cms/CMSPage"));
const HomepageBuilder = lazy(() => import("./cms/HomepageBuilder"));
const HeaderBuilder = lazy(() => import("./cms/HeaderBuilder"));
const FooterBuilder = lazy(() => import("./cms/FooterBuilder"));
const HeroBuilder = lazy(() => import("./cms/HeroBuilder"));
const MediaLibrary = lazy(() => import("./media/MediaLibrary"));
const SEOPage = lazy(() => import("./seo/SEOPage"));
const ThemeBuilder = lazy(() => import("./theme/ThemeBuilder"));
const AnalyticsPage = lazy(() => import("./analytics/AnalyticsPage"));
const SettingsPage = lazy(() => import("./settings/SettingsPage"));
const LookbooksPage = lazy(() => import("./lookbooks/LookbooksPage"));
const LookbookFormPage = lazy(() => import("./lookbooks/LookbookFormPage"));
const BrandsPage = lazy(() => import("./brands/BrandsPage"));
const SizeGuidesPage = lazy(() => import("./size-guides/SizeGuidesPage"));
const LabelsPage = lazy(() => import("./labels/LabelsPage"));
const InventoryPage = lazy(() => import("./inventory/InventoryPage"));
const CouponsPage = lazy(() => import("./coupons/CouponsPage"));
const ReviewsPage = lazy(() => import("./reviews/ReviewsPage"));
const NewsletterPage = lazy(() => import("./newsletter/NewsletterPage"));
const ContactsPage = lazy(() => import("./contacts/ContactsPage"));
const AnnouncementsPage = lazy(() => import("./announcements/AnnouncementsPage"));
const ImportExportPage = lazy(() => import("./import-export/ImportExportPage"));
const SearchIndexPage = lazy(() => import("./search/SearchIndexPage"));
const SocialLinksPage = lazy(() => import("./social/SocialLinksPage"));
const SupportTicketsPage = lazy(() => import("./support/SupportTicketsPage"));
const SupportTicketDetailPage = lazy(() => import("./support/SupportTicketDetailPage"));
const FAQPage = lazy(() => import("./faq/FAQPage"));
const NotificationsPage = lazy(() => import("./notifications/NotificationsPage"));
const WebhookEventsPage = lazy(() => import("./webhooks/WebhookEventsPage"));
const PageTemplatesPage = lazy(() => import("./templates/PageTemplatesPage"));
const CampaignsPage = lazy(() => import("./campaigns/CampaignsPage"));
const AbandonedCartsPage = lazy(() => import("./abandoned-carts/AbandonedCartsPage"));
const AuthActivityPage = lazy(() => import("./auth/AuthActivityPage"));
const AuditLogPage = lazy(() => import("./audit-log/AuditLogPage"));
const WishlistsPage = lazy(() => import("./wishlists/WishlistsPage"));

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
  return (
    <Suspense fallback={<AdminFallback />}>
      <ErrorBoundary
        fallback={
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Admin Error</h2>
              <p className="text-sm text-neutral-500 mb-4">An admin page encountered an error.</p>
              <a href="/admin" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                ← Back to Admin Dashboard
              </a>
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
          <Route path="cms/header" element={<HeaderBuilder />} />
          <Route path="cms/footer" element={<FooterBuilder />} />

          <Route path="media" element={<MediaLibrary />} />
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
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="wishlists" element={<WishlistsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
      </ErrorBoundary>
    </Suspense>
  );
}
