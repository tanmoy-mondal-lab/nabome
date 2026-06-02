import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles/global.css";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CustomerProvider } from "./context/CustomerContext";
import { DeliveryProvider } from "./context/DeliveryContext";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import { ToastProvider } from "./components/Toast";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <CustomerProvider>
              <DeliveryProvider>
                <CartProvider>
                  <WishlistProvider>
                    <App />
                  </WishlistProvider>
                </CartProvider>
              </DeliveryProvider>
            </CustomerProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
