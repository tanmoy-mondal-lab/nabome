import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      '_lib/**/*.test.ts',
      '_handlers/auth/__tests__/**/*.test.ts',
      '_handlers/media/__tests__/**/*.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '_lib/admin/**',
      '_lib/cart/**',
      '_lib/categories/**',
      '_lib/collections/**',
      '_lib/order/**',
      '_lib/products/**',
      '_lib/settings/**',
      '_lib/checkout/**',
      '_lib/auth/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '_lib/**/*.test.ts',
        '_lib/**/*.config.ts',
        '_lib/**/*.d.ts',
        'prisma/',
        'functions/',
      ],
      // Quality gates - fail if coverage drops below these thresholds
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 15,
        statements: 20,
      },
    },
  },
});
