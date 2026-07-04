import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { App } from "./App";
import "../styles/globals.css";
import { registerServiceWorker } from "../lib/serviceWorker";
import { ConnectivityProvider } from "../components/ConnectivityIndicators";

// Initialize enhanced offline support for mobile and desktop
registerServiceWorker()
  .then(() => {
    // Service worker initialized successfully
  })
  .catch(() => {
    // App works without service worker
  });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ConnectivityProvider>
        <App />
      </ConnectivityProvider>
    </HelmetProvider>
  </StrictMode>
);
