import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ScrollManager from "./components/ScrollManager";
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

function Loader() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
    </div>
  );
}


function App() {
  useEffect(() => {
    seedProductsIfEmpty();
  }, []);

  return (
    <BrowserRouter>
      <ScrollManager />
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </PageTransition>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
