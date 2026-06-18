import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import DashboardPage from "./dashboard/DashboardPage";
import ProductsPage from "./products/ProductsPage";
import ProductFormPage from "./products/ProductFormPage";
import CategoriesPage from "./categories/CategoriesPage";
import CollectionsPage from "./collections/CollectionsPage";
import OrdersPage from "./orders/OrdersPage";
import OrderDetailPage from "./orders/OrderDetailPage";
import ReturnsPage from "./returns/ReturnsPage";
import ReturnDetailPage from "./returns/ReturnDetailPage";
import ShippingZonesPage from "./shipping/ShippingZonesPage";
import CustomersPage from "./customers/CustomersPage";
import CMSPagesPage from "./cms/CMSPagesPage";
import HomepageBuilder from "./cms/HomepageBuilder";
import { PageBuilderDemo } from "./cms/PageBuilderDemo";
import NavigationBuilder from "./cms/NavigationBuilder";
import HeaderBuilder from "./cms/HeaderBuilder";
import FooterBuilder from "./cms/FooterBuilder";
import BrandStoryPage from "./cms/BrandStoryPage";
import BannersPage from "./cms/BannersPage";
import MediaLibrary from "./media/MediaLibrary";
import MarketingPage from "./marketing/MarketingPage";
import SEOPage from "./seo/SEOPage";
import ThemePage from "./theme/ThemePage";
import ThemeBuilder from "./theme/ThemeBuilder";
import AnalyticsPage from "./analytics/AnalyticsPage";
import SettingsPage from "./settings/SettingsPage";
import LookbooksPage from "./lookbooks/LookbooksPage";
import LookbookFormPage from "./lookbooks/LookbookFormPage";
import BrandsPage from "./brands/BrandsPage";
import SizeGuidesPage from "./size-guides/SizeGuidesPage";
import LabelsPage from "./labels/LabelsPage";
import SubcategoriesPage from "./subcategories/SubcategoriesPage";
import InventoryPage from "./inventory/InventoryPage";

export default function AdminRoutes() {
  return (
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
        <Route path="cms/page-builder/:id" element={<PageBuilderDemo />} />
        <Route path="cms/homepage" element={<HomepageBuilder />} />
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
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
