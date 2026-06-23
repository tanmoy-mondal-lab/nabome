import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

const DashboardPage = lazy(() => import("./dashboard/DashboardPage"));
const ProductsPage = lazy(() => import("./products/ProductsPage"));
const ProductFormPage = lazy(() => import("./products/ProductFormPage"));
const CategoriesPage = lazy(() => import("./categories/CategoriesPage"));
const CollectionsPage = lazy(() => import("./collections/CollectionsPage"));
const OrdersPage = lazy(() => import("./orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("./orders/OrderDetailPage"));
const ReturnsPage = lazy(() => import("./returns/ReturnsPage"));
const ReturnDetailPage = lazy(() => import("./returns/ReturnDetailPage"));
const ShippingZonesPage = lazy(() => import("./shipping/ShippingZonesPage"));
const CustomersPage = lazy(() => import("./customers/CustomersPage"));
const CMSPagesPage = lazy(() => import("./cms/CMSPagesPage"));
const HomepageBuilder = lazy(() => import("./cms/HomepageBuilder"));
const PageBuilderDemo = lazy(() => import("./cms/PageBuilderDemo").then((m) => ({ default: m.PageBuilderDemo })));
const NavigationBuilder = lazy(() => import("./cms/NavigationBuilder"));
const HeaderBuilder = lazy(() => import("./cms/HeaderBuilder"));
const FooterBuilder = lazy(() => import("./cms/FooterBuilder"));
const BrandStoryPage = lazy(() => import("./cms/BrandStoryPage"));
const BannersPage = lazy(() => import("./cms/BannersPage"));
const HeroBuilder = lazy(() => import("./cms/HeroBuilder"));
const MediaLibrary = lazy(() => import("./media/MediaLibrary"));
const MarketingPage = lazy(() => import("./marketing/MarketingPage"));
const SEOPage = lazy(() => import("./seo/SEOPage"));
const ThemePage = lazy(() => import("./theme/ThemePage"));
const ThemeBuilder = lazy(() => import("./theme/ThemeBuilder"));
const AnalyticsPage = lazy(() => import("./analytics/AnalyticsPage"));
const SettingsPage = lazy(() => import("./settings/SettingsPage"));
const LookbooksPage = lazy(() => import("./lookbooks/LookbooksPage"));
const LookbookFormPage = lazy(() => import("./lookbooks/LookbookFormPage"));
const BrandsPage = lazy(() => import("./brands/BrandsPage"));
const SizeGuidesPage = lazy(() => import("./size-guides/SizeGuidesPage"));
const LabelsPage = lazy(() => import("./labels/LabelsPage"));
const SubcategoriesPage = lazy(() => import("./subcategories/SubcategoriesPage"));
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
const CouponRedemptionsPage = lazy(() => import("./coupon-redemptions/CouponRedemptionsPage"));
const AbandonedCartsPage = lazy(() => import("./abandoned-carts/AbandonedCartsPage"));
const AuditLogPage = lazy(() => import("./audit-log/AuditLogPage"));
const WishlistsPage = lazy(() => import("./wishlists/WishlistsPage"));
const ProductAttributesPage = lazy(() => import("./product-attributes/ProductAttributesPage"));
const AddressesPage = lazy(() => import("./addresses/AddressesPage"));
const SessionsPage = lazy(() => import("./sessions/SessionsPage"));
const LoginAttemptsPage = lazy(() => import("./login-attempts/LoginAttemptsPage"));

function AdminFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40,
          height: 40,
          border: "4px solid #e5e7eb",
          borderTopColor: "#2563eb",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading...</p>
      </div>
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <Suspense fallback={<AdminFallback />}>
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
          <Route path="shipping" element={<ShippingZonesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="lookbooks" element={<LookbooksPage />} />
          <Route path="lookbooks/new" element={<LookbookFormPage />} />
          <Route path="lookbooks/:id/edit" element={<LookbookFormPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="size-guides" element={<SizeGuidesPage />} />
          <Route path="labels" element={<LabelsPage />} />
          <Route path="subcategories" element={<SubcategoriesPage />} />
          <Route path="inventory" element={<InventoryPage />} />

          {/* CMS Routes */}
          <Route path="cms/pages" element={<CMSPagesPage />} />
          <Route path="cms/page-builder/new" element={<PageBuilderDemo />} />
          <Route path="cms/page-builder/:id" element={<PageBuilderDemo />} />
          <Route path="cms/homepage" element={<HomepageBuilder />} />
          <Route path="cms/hero-builder" element={<HeroBuilder />} />
          <Route path="cms/navigation" element={<NavigationBuilder />} />
          <Route path="cms/header" element={<HeaderBuilder />} />
          <Route path="cms/footer" element={<FooterBuilder />} />
          <Route path="cms/brand-story" element={<BrandStoryPage />} />
          <Route path="cms/banners" element={<BannersPage />} />

          <Route path="media" element={<MediaLibrary />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="seo" element={<SEOPage />} />
          <Route path="theme" element={<ThemePage />} />
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
          <Route path="coupon-redemptions" element={<CouponRedemptionsPage />} />
          <Route path="abandoned-carts" element={<AbandonedCartsPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="wishlists" element={<WishlistsPage />} />
          <Route path="product-attributes" element={<ProductAttributesPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="login-attempts" element={<LoginAttemptsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
