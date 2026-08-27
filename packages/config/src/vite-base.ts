import type { UserConfig } from 'vite';

/**
 * Shared Vite base configuration implementing the binding build decisions
 * (FRONTEND_PERFORMANCE_SEO_PRODUCTION_READINESS_SPECIFICATION.md §4.5 and
 * FRONTEND_APPLICATION_IMPLEMENTATION_SPECIFICATION.md §10.6.2):
 * target es2020, terser minify, lightningcss CSS minification, manual
 * vendor chunks, and the `@` → src alias (GOVERNANCE_CONSTITUTION.md).
 */
export interface AppViteConfig {
  /** Absolute path to the application src directory (alias target for `@`). */
  srcDir: string;
  /** Port for `vite dev` (defaults per app: customer 5173, admin 5174, shop 5175). */
  port?: number;
}

export function defineAppViteConfig({
  srcDir,
  port = 5173,
}: AppViteConfig): UserConfig {
  return {
    build: {
      target: 'es2020',
      minify: 'terser',
      cssMinify: 'lightningcss',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-motion': ['framer-motion'],
            'shared-ui': ['@nabome/ui', '@nabome/design-tokens'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
    server: {
      port,
      host: true,
    },
    preview: {
      port,
    },
  };
}
