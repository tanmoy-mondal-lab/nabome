import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminRoute } from "../components/auth/AdminRoute";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));

const AdminRoutes = lazy(() => import("../admin/AdminRoutes"));

const StorefrontLayout = lazy(() => import("../storefront/layout/Layout").then((m) => ({ default: m.StorefrontLayout })));
const HomePage = lazy(() => import("../storefront/pages/HomePage"));
const ProductListingPage = lazy(() => import("../storefront/pages/ProductListingPage"));
const ProductDetailPage = lazy(() => import("../storefront/pages/ProductDetailPage"));
const CartPage = lazy(() => import("../storefront/pages/CartPage"));
const WishlistPage = lazy(() => import("../storefront/pages/WishlistPage"));
const SearchResultsPage = lazy(() => import("../storefront/pages/SearchResultsPage"));
const CollectionPage = lazy(() => import("../storefront/pages/CollectionPage"));
const CheckoutPage = lazy(() => import("../storefront/pages/CheckoutPage"));
const LookbookPage = lazy(() => import("../storefront/pages/LookbookPage"));
const LookbookDetailPage = lazy(() => import("../storefront/pages/LookbookDetailPage"));
const FaqPage = lazy(() => import("../storefront/pages/FaqPage"));
const StaticPage = lazy(() => import("../storefront/pages/StaticPage").then((m) => ({ default: m.StaticPage })));

const CollectionsIndexPage = lazy(() => import("../storefront/pages/CollectionsIndexPage"));

// Dashboard pages
const DashboardOverview = lazy(() => import("../storefront/pages/DashboardPage"));
const DashboardOrdersList = lazy(() => import("../storefront/pages/OrdersPage"));
const DashboardOrderDetail = lazy(() => import("../storefront/pages/OrderDetailPage"));
const DashboardAddresses = lazy(() => import("../storefront/pages/AddressesPage"));
const DashboardNotifications = lazy(() => import("../storefront/pages/NotificationsPage"));
const DashboardSettings = lazy(() => import("../storefront/pages/SettingsPage"));
const DashboardSupport = lazy(() => import("../storefront/pages/SupportTicketsPage"));
const DashboardReturnRequest = lazy(() => import("../storefront/pages/ReturnRequestPage"));

export const STOREFRONT_ROUTES = (
  <Route element={<StorefrontLayout />}>
    <Route index element={<HomePage />} />
    <Route path="products" element={<ProductListingPage />} />
    <Route path="products/:slug" element={<ProductDetailPage />} />
    <Route path="search" element={<SearchResultsPage />} />
    <Route path="cart" element={<CartPage />} />
    <Route path="wishlist" element={<WishlistPage />} />
    <Route path="collections" element={<CollectionsIndexPage />} />
    <Route path="collections/:slug" element={<CollectionPage />} />
    <Route path="checkout" element={<CheckoutPage />} />
    <Route path="privacy" element={<StaticPage />} />
    <Route path="terms" element={<StaticPage />} />
    <Route path="faq" element={<FaqPage />} />
    <Route path="shipping-returns" element={<StaticPage />} />

    <Route path="lookbooks" element={<LookbookPage />} />
    <Route path="lookbooks/:slug" element={<LookbookDetailPage />} />
    <Route path="account" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
    <Route path="account/orders" element={<ProtectedRoute><DashboardOrdersList /></ProtectedRoute>} />
    <Route path="account/orders/:id" element={<ProtectedRoute><DashboardOrderDetail /></ProtectedRoute>} />
    <Route path="account/orders/:id/return" element={<ProtectedRoute><DashboardReturnRequest /></ProtectedRoute>} />
    <Route path="account/addresses" element={<ProtectedRoute><DashboardAddresses /></ProtectedRoute>} />
    <Route path="account/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
    <Route path="account/notifications" element={<ProtectedRoute><DashboardNotifications /></ProtectedRoute>} />
    <Route path="account/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
    <Route path="account/support" element={<ProtectedRoute><DashboardSupport /></ProtectedRoute>} />

    <Route path=":slug" element={<StaticPage />} />
  </Route>
);

export const AUTH_ROUTES = (
  <>
    <Route path="auth/login" element={<LoginPage />} />
    <Route path="auth/register" element={<RegisterPage />} />
    <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="auth/reset-password" element={<ResetPasswordPage />} />
    <Route path="auth/verify-email" element={<VerifyEmailPage />} />
  </>
);

export const ADMIN_ROUTES = (
  <Route
    path="admin/*"
    element={
      <AdminRoute>
        <AdminRoutes />
      </AdminRoute>
    }
  />
);
