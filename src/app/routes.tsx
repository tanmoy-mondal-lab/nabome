// ─────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS — Lazy-loaded for code splitting
// ─────────────────────────────────────────────────────────────

import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminRoute } from "../components/auth/AdminRoute";

// Layouts
const AccountLayout = lazy(() => import("../pages/AccountPage"));

// Auth pages
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));

// Account pages
const AccountOverview = lazy(() => import("../pages/AccountOverview"));
const AccountOrdersPage = lazy(() => import("../pages/AccountOrdersPage"));
const AccountAddressesPage = lazy(() => import("../pages/AccountAddressesPage"));
const AccountWishlistPage = lazy(() => import("../pages/AccountWishlistPage"));
const AccountSettingsPage = lazy(() => import("../pages/AccountSettingsPage"));

// Admin pages
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));

export const AUTH_ROUTES = (
  <>
    <Route path="auth/login" element={<LoginPage />} />
    <Route path="auth/register" element={<RegisterPage />} />
    <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="auth/reset-password" element={<ResetPasswordPage />} />
  </>
);

export const ACCOUNT_ROUTES = (
  <Route
    path="account"
    element={
      <ProtectedRoute>
        <AccountLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<AccountOverview />} />
    <Route path="orders" element={<AccountOrdersPage />} />
    <Route path="orders/:id" element={<AccountOrdersPage />} />
    <Route path="addresses" element={<AccountAddressesPage />} />
    <Route path="wishlist" element={<AccountWishlistPage />} />
    <Route path="settings" element={<AccountSettingsPage />} />
  </Route>
);

export const ADMIN_ROUTES = (
  <Route
    path="admin"
    element={
      <AdminRoute>
        <AdminDashboardPage />
      </AdminRoute>
    }
  >
    <Route index element={<AdminDashboardPage />} />
    <Route path="dashboard" element={<AdminDashboardPage />} />
  </Route>
);
