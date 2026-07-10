import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom plugin to filter admin chunks from modulepreload
function filterAdminPreload() {
  return {
    name: 'filter-admin-preload',
    transformIndexHtml(html: string) {
      // Remove modulepreload links for admin chunks
      return html.replace(
        /<link rel="modulepreload"[^>]*href="[^"]*admin-[^"]*"[^>]*>/g,
        ''
      );
    }
  };
}

export default defineConfig({
  plugins: [react(), filterAdminPreload()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    cssMinify: "lightningcss",
    minify: "esbuild",
    target: "es2020",
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // React ecosystem
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            // State management
            if (id.includes("zustand") || id.includes("@tanstack/react-query")) {
              return "vendor-state";
            }
            // UI libraries
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide")) {
              return "vendor-icons";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // Form validation
            if (id.includes("zod") || id.includes("react-hook-form")) {
              return "vendor-forms";
            }
            // Date handling
            if (id.includes("date-fns")) {
              return "vendor-date";
            }
            // Routing
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            // Admin-specific (TanStack Table, etc.)
            if (id.includes("@tanstack/table") || id.includes("@tanstack/react-table")) {
              return "vendor-table";
            }
            return "vendor-core";
          }
          // Admin pages split by feature
          if (id.includes("/admin/")) {
            if (id.includes("/admin/products")) return "admin-products";
            if (id.includes("/admin/orders")) return "admin-orders";
            if (id.includes("/admin/customers")) return "admin-customers";
            if (id.includes("/admin/cms")) return "admin-cms";
            if (id.includes("/admin/analytics")) return "admin-analytics";
            if (id.includes("/admin/media")) return "admin-media";
            if (id.includes("/admin/settings")) return "admin-settings";
            return "admin-misc";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
