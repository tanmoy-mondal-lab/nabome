import { defineConfig, devices } from '@playwright/test';

const BASE_URLS = {
  customer: process.env.E2E_CUSTOMER_URL ?? 'http://localhost:5173',
  admin: process.env.E2E_ADMIN_URL ?? 'http://localhost:5174',
  shop: process.env.E2E_SHOP_URL ?? 'http://localhost:5175',
  api: process.env.E2E_API_URL ?? 'http://localhost:8788',
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URLS.customer,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @nabome/api dev',
      url: `${BASE_URLS.api}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @nabome/customer dev --port 5173 --strictPort',
      url: `${BASE_URLS.customer}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @nabome/admin dev --port 5174 --strictPort',
      url: `${BASE_URLS.admin}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @nabome/shop dev --port 5175 --strictPort',
      url: `${BASE_URLS.shop}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
