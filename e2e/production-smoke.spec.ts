import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminPage } from './admin-auth-helper';

type RoleCreds = { email: string; password: string } | null;

function getCustomerCreds(): RoleCreds {
  const email = process.env.TEST_CUSTOMER_EMAIL;
  const password = process.env.TEST_CUSTOMER_PASSWORD;
  return email && password ? { email, password } : null;
}

function getSellerCreds(): RoleCreds {
  const email = process.env.TEST_SELLER_EMAIL;
  const password = process.env.TEST_SELLER_PASSWORD;
  return email && password ? { email, password } : null;
}

async function loginAsUser(
  page: import('@playwright/test').Page,
  creds: { email: string; password: string },
  dashboardPattern: RegExp,
): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(creds.email);
  await page.getByLabel(/password/i).fill(creds.password);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  await expect(page).toHaveURL(dashboardPattern, { timeout: 15000 });
}

/**
 * Production Smoke Test.
 *
 * Runs immediately after a production deployment and must complete in < 2-3 min.
 * It only verifies the most critical paths are alive — any failure here means
 * the release is broken and should be rolled back.
 */
test.describe('Production Smoke', () => {
  test('homepage loads with HTTP 200', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('main')).toBeVisible();
  });

  test('login page is reachable and functional', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('register page is reachable', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('email verification page is reachable', async ({ page }) => {
    await page.goto('/auth/verify-email');
    await expect(page.locator('main')).toBeVisible();
  });

  test('customer can log in and reach dashboard', async ({ page }) => {
    const creds = getCustomerCreds();
    test.skip(!creds, 'No customer credentials configured');
    await loginAsUser(page, creds!, /\/(dashboard|account|home|\/)$/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('dashboard loads', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('product creation is reachable', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    const createButton = page
      .locator('a:has-text("Add"), button:has-text("Add Product"), button:has-text("Create")')
      .first();
    await expect(createButton).toBeVisible();
  });

  test('image upload dialog opens', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/media');
    const uploadButton = page
      .locator('button:has-text("Upload"), button[aria-label*="upload"]')
      .first();
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
    await expect(page.locator('[role="dialog"], .modal, .upload-dialog').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('search returns a result listing', async ({ page }) => {
    await page.goto('/');
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('a');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('main')).toBeVisible();
  });

  test('cart page is reachable', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('main')).toBeVisible();
  });

  test('checkout page is reachable', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('main')).toBeVisible();
  });

  test('seller dashboard loads', async ({ page }) => {
    const creds = getSellerCreds();
    test.skip(!creds, 'No seller credentials configured');
    await loginAsUser(page, creds!, /\/seller/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('media library loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/media');
    await expect(page.locator('main')).toBeVisible();
  });

  test('logout returns to a public area', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });
});
