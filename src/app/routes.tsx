import { lazy, Suspense, type ReactNode } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminRoute } from "../components/auth/AdminRoute";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { StorefrontLayout } from "../storefront/layout/Layout";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));

const AdminRoutes = lazy(() => import("../admin/AdminRoutes"));
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
const CategoryPage = lazy(() => import("../storefront/pages/CategoryPage"));

// Dashboard pages
const DashboardOverview = lazy(() => import("../storefront/pages/DashboardPage"));
const DashboardOrdersList = lazy(() => import("../storefront/pages/OrdersPage"));
const DashboardOrderDetail = lazy(() => import("../storefront/pages/OrderDetailPage"));
const DashboardAddresses = lazy(() => import("../storefront/pages/AddressesPage"));
const DashboardNotifications = lazy(() => import("../storefront/pages/NotificationsPage"));
const DashboardSettings = lazy(() => import("../storefront/pages/SettingsPage"));
const DashboardSupport = lazy(() => import("../storefront/pages/SupportTicketsPage"));
const DashboardReturnRequest = lazy(() => import("../storefront/pages/ReturnRequestPage"));
const DashboardOrderTracking = lazy(() => import("../storefront/pages/OrderTrackingPage"));

const RB = (el: ReactNode) => <ErrorBoundary><Suspense fallback={<LoadingSpinner size="lg" className="min-h-[50vh] flex items-center justify-center" />}>{el}</Suspense></ErrorBoundary>;

export const STOREFRONT_ROUTES = (
  <Route element={<StorefrontLayout />}>
    <Route index element={RB(<HomePage />)} />
    <Route path="products" element={RB(<ProductListingPage />)} />
    <Route path="products/:slug" element={RB(<ProductDetailPage />)} />
    <Route path="search" element={RB(<SearchResultsPage />)} />
    <Route path="cart" element={RB(<CartPage />)} />
    <Route path="wishlist" element={RB(<WishlistPage />)} />
    <Route path="collections" element={RB(<CollectionsIndexPage />)} />
    <Route path="collections/:slug" element={RB(<CollectionPage />)} />
    <Route path="categories/:slug" element={RB(<CategoryPage />)} />
    <Route path="checkout" element={RB(<CheckoutPage />)} />
    <Route path="privacy" element={RB(<StaticPage />)} />
    <Route path="terms" element={RB(<StaticPage />)} />
    <Route path="faq" element={RB(<FaqPage />)} />
    <Route path="shipping-returns" element={RB(<StaticPage />)} />

    <Route path="lookbooks" element={RB(<LookbookPage />)} />
    <Route path="lookbooks/:slug" element={RB(<LookbookDetailPage />)} />
    <Route path="account" element={<ErrorBoundary><ProtectedRoute><DashboardOverview /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/orders" element={<ErrorBoundary><ProtectedRoute><DashboardOrdersList /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/orders/:id" element={<ErrorBoundary><ProtectedRoute><DashboardOrderDetail /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/orders/:id/return" element={<ErrorBoundary><ProtectedRoute><DashboardReturnRequest /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/orders/:id/tracking" element={<ErrorBoundary><ProtectedRoute><DashboardOrderTracking /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/addresses" element={<ErrorBoundary><ProtectedRoute><DashboardAddresses /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/wishlist" element={<ErrorBoundary><ProtectedRoute><WishlistPage /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/notifications" element={<ErrorBoundary><ProtectedRoute><DashboardNotifications /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/settings" element={<ErrorBoundary><ProtectedRoute><DashboardSettings /></ProtectedRoute></ErrorBoundary>} />
    <Route path="account/support" element={<ErrorBoundary><ProtectedRoute><DashboardSupport /></ProtectedRoute></ErrorBoundary>} />

    <Route path=":slug" element={RB(<StaticPage />)} />
  </Route>
);

export const AUTH_ROUTES = (
  <>
    <Route path="auth/login" element={RB(<LoginPage />)} />
    <Route path="auth/register" element={RB(<RegisterPage />)} />
    <Route path="auth/forgot-password" element={RB(<ForgotPasswordPage />)} />
    <Route path="auth/reset-password" element={RB(<ResetPasswordPage />)} />
    <Route path="auth/verify-email" element={RB(<VerifyEmailPage />)} />
  </>
);

export const ADMIN_ROUTES = (
  <Route
    path="admin/*"
    element={
      <ErrorBoundary>
        <AdminRoute>
          <Suspense fallback={<LoadingSpinner size="lg" className="min-h-[50vh] flex items-center justify-center" />}>
            <AdminRoutes />
          </Suspense>
        </AdminRoute>
      </ErrorBoundary>
    }
  />
);
