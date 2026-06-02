import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ScrollManager from "./components/ScrollManager";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import SkipToContent from "./components/SkipToContent";
import { useKeyboardNavigation, commonShortcuts } from "./hooks/useKeyboardNavigation";
import { registerServiceWorker } from "./lib/pwa";
import { seedProductsIfEmpty } from "./lib/db";

const Home = lazy(() => import("./pages/Home"));
const Category = lazy(() => import("./pages/Category"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const PolicyPage = lazy(() => import("./pages/PolicyPage"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Admin = lazy(() => import("./pages/Admin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const FAQ = lazy(() => import("./pages/FAQ"));
const VendorRegister = lazy(() => import("./pages/VendorRegister"));
const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const SessionExpired = lazy(() => import("./pages/SessionExpired"));
const Account = lazy(() => import("./pages/Account"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const SupportCenter = lazy(() => import("./pages/SupportCenter"));

function Loader() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
    </div>
  );
}


function AppContent() {
  useKeyboardNavigation(commonShortcuts);

  return (
    <AnalyticsProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1 }}>
          <PageTransition>
            <Suspense fallback={<Loader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/category" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/shipping-policy" element={<PolicyPage type="shipping" />} />
                <Route path="/return-policy" element={<PolicyPage type="returns" />} />
                <Route path="/refund-policy" element={<PolicyPage type="refund" />} />
                <Route path="/cancellation-policy" element={<PolicyPage type="cancellation" />} />
                <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
                <Route path="/terms" element={<PolicyPage type="terms" />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/shop/:slug" element={<ShopPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/support" element={<SupportCenter />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/session-expired" element={<SessionExpired />} />

                {/* Guest-only routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/vendor-register" element={<VendorRegister />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* Customer-protected routes */}
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

                {/* Vendor-only routes */}
                <Route path="/vendor" element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["vendor"]}>
                      <VendorDashboard />
                    </RoleGuard>
                  </ProtectedRoute>
                } />

                {/* Admin-only routes */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["admin"]}>
                      <Admin />
                    </RoleGuard>
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </div>

        <Footer />
      </div>
    </AnalyticsProvider>
  );
}

function App() {
  useEffect(() => {
    seedProductsIfEmpty();
    registerServiceWorker();
  }, []);

  return (
    <BrowserRouter>
      <SkipToContent />
      <ScrollManager />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
