import "dotenv/config";
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './e2e/auth.setup.ts',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
      testMatch: /(regression-verification|production-smoke)\.spec\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /(regression-verification|production-smoke)\.spec\.ts/,
    },
    {
      name: 'tablet-chrome',
      use: { ...devices['iPad Mini'] },
      testMatch: /(regression-verification|production-smoke)\.spec\.ts/,
    },
    {
      // Fast, deployment-gating suite: only the smoke spec, chromium only.
      name: 'smoke',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /production-smoke\.spec\.ts/,
    },
  ],
  webServer: process.env.BASE_URL ? undefined : [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
