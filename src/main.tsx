import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles/global.css";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CustomerProvider } from "./context/CustomerContext";
import { DeliveryProvider } from "./context/DeliveryContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <CustomerProvider>
          <DeliveryProvider>
            <CartProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </CartProvider>
          </DeliveryProvider>
        </CustomerProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
