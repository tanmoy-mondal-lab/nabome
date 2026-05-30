import React from "react";
import ReactDOM from "react-dom/client";
import { WishlistProvider }
from "./context/WishlistContext";

import App from "./App";

import { CartProvider } from "./context/CartContext";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <CartProvider>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </CartProvider>
  </React.StrictMode>
);