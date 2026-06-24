import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can register', async ({ page }) => {
    await page.click('text=Register');
    await expect(page).toHaveURL(/.*register/);

    const randomEmail = `test${Date.now()}@example.com`;
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'Test123456!');
    await page.fill('input[name="confirmPassword"]', 'Test123456!');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.click('button[type="submit"]');

    // Should redirect to verification page or dashboard
    await expect(page).toHaveURL(/.*(verify-email|dashboard)/, { timeout: 10000 });
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);

    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Test123456!');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/.*(dashboard|\/)/, { timeout: 10000 });
  });

  test('login fails with invalid credentials', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  });

  test('user can logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(dashboard|\/)/);

    // Then logout
    await page.click('button[aria-label="User menu"], .user-menu-button');
    await page.click('text=Logout');
    
    // Should redirect to home or login
    await expect(page).toHaveURL(/.*(login|\/)/);
  });
});
