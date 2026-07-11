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
        // NOTE: Do not manually split the React ecosystem into separate vendor
        // chunks. Doing so reorders module initialization and causes React 19 to
        // crash at load with "Cannot set properties of undefined (setting
        // 'Activity')" because react-dom evaluates before React's shared
        // internals are ready. Let Rollup determine chunking so init order and
        // circular dependencies are handled correctly.
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
