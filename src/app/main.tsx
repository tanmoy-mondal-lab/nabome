import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { App } from "./App";
import "../styles/globals.css";
// import { registerServiceWorker } from "../lib/serviceWorker";
import { ConnectivityProvider } from "../storefront/components/ConnectivityIndicators";

// Debug logging to identify mount failures
console.log("[main.tsx] Script loaded, starting initialization");

// TEMPORARILY DISABLED: Service worker to rule out caching issues on Cloudflare Pages
// Initialize enhanced offline support for mobile and desktop
// registerServiceWorker()
//   .then(() => {
//     console.log("[main.tsx] Service worker initialized successfully");
//   })
//   .catch((error) => {
//     console.warn("[main.tsx] Service worker registration failed:", error);
//     // App works without service worker
//   });
console.log("[main.tsx] Service worker registration DISABLED for debugging");

// Wait for DOM to be ready before mounting
function mountApp() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("[main.tsx] CRITICAL: Root element not found in DOM");
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: monospace; color: red; background: #fee; border: 2px solid red;">
        <h1>Mount Error: Root element not found</h1>
        <p>The #root element does not exist in the DOM. This may be caused by:</p>
        <ul>
          <li>Middleware HTML corruption</li>
          <li>Timing issue with script execution</li>
          <li>Build configuration error</li>
        </ul>
        <p>Check browser console for additional details.</p>
      </div>
    `;
    return;
  }

  console.log("[main.tsx] Root element found, attempting to mount React");

  try {
    const root = createRoot(rootElement);
    console.log("[main.tsx] React root created successfully");

    root.render(
      <StrictMode>
        <HelmetProvider>
          <ConnectivityProvider>
            <App />
          </ConnectivityProvider>
        </HelmetProvider>
      </StrictMode>
    );

    console.log("[main.tsx] React render called successfully");
  } catch (error) {
    console.error("[main.tsx] CRITICAL: React mount failed with error:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: monospace; color: red; background: #fee; border: 2px solid red;">
        <h1>React Mount Error</h1>
        <pre style="white-space: pre-wrap; word-wrap: break-word;">${error instanceof Error ? error.message : String(error)}</pre>
        <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; margin-top: 20px;">${error instanceof Error ? error.stack : ""}</pre>
        <p style="margin-top: 20px;">Check browser console for full error details.</p>
      </div>
    `;
  }
}

// Mount when DOM is ready
if (document.readyState === "loading") {
  console.log("[main.tsx] DOM still loading, waiting for DOMContentLoaded");
  document.addEventListener("DOMContentLoaded", mountApp);
} else {
  console.log("[main.tsx] DOM already ready, mounting immediately");
  mountApp();
}
