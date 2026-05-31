import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import Footer from "./components/Footer";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PolicyPage from "./pages/PolicyPage";
import OrderTracking from "./pages/OrderTracking";
import PageTransition from "./components/PageTransition";
import ScrollManager from "./components/ScrollManager";


function App() {
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
              <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
              <Route path="/terms" element={<PolicyPage type="terms" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
