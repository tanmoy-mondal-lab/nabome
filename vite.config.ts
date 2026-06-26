import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to copy functions + api directories to dist for Cloudflare Pages Functions
function copyFunctionsPlugin() {
  return {
    name: 'copy-functions',
    closeBundle() {
      const functionsSrc = path.resolve(__dirname, 'functions');
      const functionsDest = path.resolve(__dirname, 'dist', 'functions');
      if (fs.existsSync(functionsSrc)) {
        fs.mkdirSync(functionsDest, { recursive: true });
        fs.cpSync(functionsSrc, functionsDest, { recursive: true });
        console.log('✓ Copied functions/ to dist/functions/');
      }

      const apiSrc = path.resolve(__dirname, 'api');
      const apiDest = path.resolve(__dirname, 'dist', 'api');
      if (fs.existsSync(apiSrc)) {
        fs.mkdirSync(apiDest, { recursive: true });
        fs.cpSync(apiSrc, apiDest, { recursive: true });
        console.log('✓ Copied api/ to dist/api/ (needed by Cloudflare Pages Functions)');
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyFunctionsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
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
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          state: ["zustand", "@tanstack/react-query"],
          ui: ["framer-motion", "lucide-react"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
