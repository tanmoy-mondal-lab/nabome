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
            // Simple strategy to avoid circular dependencies
            // Group React ecosystem together
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "vendor-react";
            }
            // Group large UI libraries separately
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            // Everything else in a single chunk to avoid circular deps
            return "vendor-core";
          }
          // Don't split admin pages to avoid circular dependencies
          // Let Rollup handle chunking naturally
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
