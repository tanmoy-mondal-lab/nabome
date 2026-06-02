import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/react")) return "vendor";
          if (id.includes("node_modules/@supabase")) return "supabase";
          if (id.includes("node_modules/framer-motion")) return "motion";
          if (id.includes("node_modules/recharts")) return "charts";
          if (id.includes("node_modules/lucide-react")) return "icons";
          if (id.includes("node_modules/qrcode.react")) return "qrcode";
        },
      },
    },
    chunkSizeWarningLimit: 400,
    minify: "esbuild",
  },
});
