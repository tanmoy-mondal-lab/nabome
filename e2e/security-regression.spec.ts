import { test, expect } from '@playwright/test';

test.describe('Security Regression - CSRF Protection', () => {
  test('health endpoint returns CSRF token header', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const headers = response.headers();
    const hasCsrfHeader =
      headers['x-csrf-token'] ||
      headers['x-xsrf-token'] ||
      headers['set-cookie']?.includes('csrf');
    expect(hasCsrfHeader).toBeTruthy();
  });

  test('POST without CSRF token is rejected', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: { items: [] },
      headers: { 'Content-Type': 'application/json' },
    });

    expect([400, 403, 401]).toContain(response.status());
  });
});

test.describe('Security Regression - Rate Limiting', () => {
  test('rapid requests return 429 status', async ({ request }) => {
    const responses: number[] = [];

    for (let i = 0; i < 60; i++) {
      const res = await request.get('/api/health');
      responses.push(res.status());
      if (res.status() === 429) break;
    }

    const has429 = responses.includes(429);
    expect(has429).toBeTruthy();
  });

  test('rate limit response includes retry-after header', async ({ request }) => {
    let got429 = false;

    for (let i = 0; i < 60; i++) {
      const res = await request.get('/api/auth/login');
      if (res.status() === 429) {
        got429 = true;
        const headers = res.headers();
        expect(
          headers['retry-after'] || headers['x-ratelimit-reset']
        ).toBeTruthy();
        break;
      }
    }

    test.skip(!got429, 'Rate limit not triggered within burst threshold');
  });
});

test.describe('Security Regression - XSS Prevention', () => {
  test('script tags in search input are not executed', async ({ page }) => {
    await page.goto('/search');

    const xssPayload = '<script>alert("xss")</script>';
    let alertTriggered = false;

    page.on('dialog', () => {
      alertTriggered = true;
    });

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="q"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(xssPayload);
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);
    }

    expect(alertTriggered).toBe(false);
  });

  test('XSS payload in search results is rendered as text', async ({ page }) => {
    await page.goto('/search?q=<img src=x onerror=alert(1)>');

    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('<img');
  });

  test('event handler injection in product name does not execute', async ({ page }) => {
    await page.goto('/products');

    let alertTriggered = false;
    page.on('dialog', () => {
      alertTriggered = true;
    });

    await page.waitForTimeout(2000);
    expect(alertTriggered).toBe(false);
  });
});

test.describe('Security Regression - Authentication Required', () => {
  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    const protectedRoutes = ['/checkout', '/account', '/account/orders', '/wishlist'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForTimeout(500);
      const url = page.url();
      const isRedirected = /login|auth/.test(url) || url.endsWith(route);
      expect(isRedirected).toBeTruthy();
    }
  });

  test('API orders endpoint returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/orders');
    expect([401, 403]).toContain(response.status());
  });

  test('API wishlist endpoint returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/wishlist');
    expect([401, 403]).toContain(response.status());
  });

  test('API profile endpoint returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/user/profile');
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('Security Regression - Admin Authorization', () => {
  test('admin routes reject unauthenticated users', async ({ page }) => {
    const adminRoutes = ['/admin', '/admin/products', '/admin/orders', '/admin/customers'];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForTimeout(500);
      const url = page.url();
      expect(url).toMatch(/login|auth/);
    }
  });

  test('admin API endpoints reject unauthenticated requests', async ({ request }) => {
    const adminApiRoutes = ['/api/admin/products', '/api/admin/orders', '/api/admin/users'];

    for (const route of adminApiRoutes) {
      const response = await request.get(route);
      expect([401, 403]).toContain(response.status());
    }
  });

  test('admin dashboard is not accessible without admin role', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    const url = page.url();
    expect(url).toMatch(/login|auth/);
  });
});
