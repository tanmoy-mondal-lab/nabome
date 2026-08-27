import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { defineAppViteConfig } from '@nabome/config';

export default defineConfig({
  ...defineAppViteConfig({
    srcDir: fileURLToPath(new URL('./src', import.meta.url)),
    port: 5174,
  }),
  plugins: [react(), tailwindcss()],
});
