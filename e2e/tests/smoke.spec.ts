import { expect, test } from '@playwright/test';

/**
 * Smoke tests — every app boots, renders, and enforces its auth guard.
 * Backend-less by design: guards are client-side decisions.
 */

test.describe('customer website', () => {
  test('home page loads with branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/নবME/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('header, nav').first()).toBeVisible();
  });

  test('unknown route renders 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('account page redirects unauthenticated users to login', async ({
    page,
  }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login\?from=/);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('registration page is accessible', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/Register/);
    await expect(
      page.getByRole('heading', { name: /register/i }),
    ).toBeVisible();
  });

  test('shop page loads products', async ({ page }) => {
    await page.goto('/shop');
    await expect(page).toHaveTitle(/Shop/);
    await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible();
  });

  test('cart page is accessible', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveTitle(/Cart/);
  });
});

test.describe('admin dashboard', () => {
  test('renders a page when served', async ({ page }) => {
    const response = await page.request.get(
      process.env.E2E_ADMIN_URL ?? 'http://localhost:5174/',
    );
    expect(response.status()).toBe(200);
    await page.goto(process.env.E2E_ADMIN_URL ?? 'http://localhost:5174/');
    await expect(page).toHaveTitle(/নবME/);
  });

  test('guards protected routes from guests', async ({ page }) => {
    await page.goto(
      `${process.env.E2E_ADMIN_URL ?? 'http://localhost:5174'}/dashboard`,
    );
    await expect(page).toHaveURL(/\/login\?from=/);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto(
      `${process.env.E2E_ADMIN_URL ?? 'http://localhost:5174'}/login`,
    );
    await expect(page).toHaveTitle(/Login/);
  });
});

test.describe('shop owner dashboard', () => {
  test('guards protected routes from guests', async ({ page }) => {
    await page.goto(
      `${process.env.E2E_SHOP_URL ?? 'http://localhost:5175'}/dashboard`,
    );
    await expect(page).toHaveURL(/\/login\?from=/);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto(
      `${process.env.E2E_SHOP_URL ?? 'http://localhost:5175'}/login`,
    );
    await expect(page).toHaveTitle(/Login/);
  });
});

test.describe('api', () => {
  test('health endpoint returns the envelope', async ({ request }) => {
    const res = await request.get(
      `${process.env.E2E_API_URL ?? 'http://localhost:8788'}/api/v1/health`,
    );
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      error: null;
      meta: { version: string; requestId: string };
    };
    expect(body.success).toBe(true);
    expect(body.error).toBeNull();
    expect(body.meta.version).toBe('v1');
    expect(body.meta.requestId).toBeTruthy();
  });

  test('products endpoint is accessible', async ({ request }) => {
    const res = await request.get(
      `${process.env.E2E_API_URL ?? 'http://localhost:8788'}/api/v1/products`,
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
  });

  test('featured products endpoint is accessible', async ({ request }) => {
    const res = await request.get(
      `${process.env.E2E_API_URL ?? 'http://localhost:8788'}/api/v1/products/featured`,
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
  });

  test('auth endpoints are accessible', async ({ request }) => {
    const registerRes = await request.post(
      `${process.env.E2E_API_URL ?? 'http://localhost:8788'}/api/v1/auth/register`,
      {
        data: {
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
        },
      },
    );
    // May fail if user exists, but endpoint should be accessible
    expect([200, 400, 409, 422]).toContain(registerRes.status());
  });
});
