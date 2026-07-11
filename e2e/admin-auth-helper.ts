import { Page, expect } from '@playwright/test';
import { getAdminCredentials } from './admin-credentials';

/**
 * Handle cookie consent banner if present
 */
async function handleCookieConsent(page: Page): Promise<void> {
  await page.goto('/');

  const acceptButton = page.getByRole('button', { name: /accept all/i });
  
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}

/**
 * Perform admin login with proper verification
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } = getAdminCredentials();

  // Handle cookie consent first
  await handleCookieConsent(page);

  // Navigate to login page
  await page.goto('/auth/login');

  // Fill in credentials using stable locators
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);

  // Submit login form
  await page.getByRole('button', { name: /login|sign in/i }).click();

  // Verify successful authentication by checking for admin-specific UI
  // Instead of just checking URL, verify actual admin elements are visible
  await expect(page.getByRole('navigation')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/dashboard/i)).toBeVisible({ timeout: 5000 });
  
  // Verify we're on an admin page
  await expect(page).toHaveURL(/\/admin/);
}

/**
 * Navigate to admin page and verify it loads with deterministic waits
 */
export async function navigateToAdminPage(page: Page, path: string): Promise<void> {
  await page.goto(path);
  
  // Wait for main content to be visible instead of networkidle
  // Use more specific, deterministic waits based on page content
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  
  // Additional page-specific verification for common admin pages
  if (path.includes('/admin/products')) {
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible({ timeout: 5000 });
  } else if (path.includes('/admin/orders')) {
    await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible({ timeout: 5000 });
  } else if (path.includes('/admin/categories')) {
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible({ timeout: 5000 });
  } else if (path.includes('/admin/customers')) {
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible({ timeout: 5000 });
  } else if (path === '/admin' || path === '/admin/') {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 5000 });
  }
}
