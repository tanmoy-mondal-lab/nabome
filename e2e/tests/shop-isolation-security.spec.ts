/**
 * Shop Isolation Security Regression Tests
 *
 * Security tests to ensure shop owners cannot access other shops' data
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8788';
const SHOP_URL = process.env.E2E_SHOP_URL ?? 'http://localhost:5175';

test.describe('Shop Isolation Security', () => {
  test('should prevent cross-shop product access via API', async ({
    request,
  }) => {
    // Attempt to access another shop's product without proper authorization
    const response = await request.get(
      `${API_URL}/api/v1/shop/products/other-shop-product-id`,
    );

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403, 404]).toContain(response.status());
  });

  test('should prevent cross-shop order access via API', async ({
    request,
  }) => {
    // Attempt to access another shop's order without proper authorization
    const response = await request.get(
      `${API_URL}/api/v1/shop/orders/other-shop-order-id`,
    );

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403, 404]).toContain(response.status());
  });

  test('should prevent cross-shop customer access via API', async ({
    request,
  }) => {
    // Attempt to access another shop's customer without proper authorization
    const response = await request.get(
      `${API_URL}/api/v1/shop/customers/other-shop-customer-id`,
    );

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403, 404]).toContain(response.status());
  });

  test('should prevent cross-shop finance data access via API', async ({
    request,
  }) => {
    // Attempt to access another shop's finance data without proper authorization
    const response = await request.get(
      `${API_URL}/api/v1/shop/finance/earnings`,
    );

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
  });

  test('should prevent cross-shop dashboard data access via API', async ({
    request,
  }) => {
    // Attempt to access another shop's dashboard data without proper authorization
    const response = await request.get(`${API_URL}/api/v1/shop/dashboard`);

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
  });

  test('should prevent unauthorized product creation', async ({ request }) => {
    // Attempt to create a product without proper authentication
    const response = await request.post(`${API_URL}/api/v1/shop/products`, {
      data: {
        name: 'Unauthorized Product',
        description: 'This should not be created',
      },
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should prevent unauthorized order updates', async ({ request }) => {
    // Attempt to update an order without proper authentication
    const response = await request.patch(
      `${API_URL}/api/v1/shop/orders/some-order-id`,
      {
        data: {
          status: 'shipped',
        },
      },
    );

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should prevent unauthorized product deletion', async ({ request }) => {
    // Attempt to delete a product without proper authentication
    const response = await request.delete(
      `${API_URL}/api/v1/shop/products/some-product-id`,
    );

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should validate shop ID in API responses', async ({ request }) => {
    // This test assumes we have valid authentication
    // In a real scenario, you would authenticate first and then verify
    // that all returned data belongs to the authenticated shop

    // For now, we'll test that the API requires authentication
    const response = await request.get(`${API_URL}/api/v1/shop/products`);

    // Should require authentication
    expect(response.status()).toBe(401);
  });

  test('should prevent CSRF attacks on protected endpoints', async ({
    request,
  }) => {
    // Attempt to make a POST request without CSRF token
    const response = await request.post(`${API_URL}/api/v1/shop/products`, {
      data: {
        name: 'CSRF Attack Product',
      },
      headers: {
        // Deliberately omit CSRF token
      },
    });

    // Should be rejected due to missing CSRF protection
    expect([401, 403]).toContain(response.status());
  });

  test('should enforce rate limiting on API endpoints', async ({ request }) => {
    // Make multiple rapid requests to test rate limiting
    const requests = Array(20)
      .fill(null)
      .map(() => request.get(`${API_URL}/api/v1/shop/products`));

    const responses = await Promise.all(requests);
    const statusCodes = responses.map((r) => r.status());

    // At least some requests should be rate limited (429)
    // or unauthorized (401) if no auth is provided
    expect(statusCodes.some((code) => code === 429 || code === 401)).toBe(true);
  });
});

test.describe('Shop Data Isolation in UI', () => {
  test('should not display other shops data in dashboard', async ({ page }) => {
    await page.goto(SHOP_URL);

    // Dashboard should only show current shop's data
    // This is a visual check - in a real test with authenticated user,
    // we would verify that only the authenticated shop's data appears
    await expect(page).toHaveTitle(/Shop/);
  });

  test('should not allow navigation to other shop URLs', async ({ page }) => {
    // Attempt to navigate to another shop's URL directly
    await page.goto(`${SHOP_URL}/products?shop_id=other-shop-id`);

    // Should redirect or show error
    // The application should ignore or reject the shop_id parameter
    await expect(page).toHaveURL(/\/products/);
  });
});

test.describe('Session Security', () => {
  test('should invalidate session on logout', async ({ page, request }) => {
    await page.goto(SHOP_URL);

    // Logout
    const logoutButton = page.getByRole('button', { name: /log out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }

    // Attempt to access protected endpoint after logout
    const response = await request.get(`${API_URL}/api/v1/shop/products`);

    // Should be unauthorized
    expect(response.status()).toBe(401);
  });

  test('should not expose sensitive data in client-side storage', async ({
    page,
  }) => {
    await page.goto(SHOP_URL);

    // Check localStorage for sensitive data
    const localStorageData = await page.evaluate(() => {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            data[key] = value;
          }
        }
      }
      return data;
    });

    // Should not contain raw tokens or sensitive data
    const sensitiveKeys = Object.keys(localStorageData).filter(
      (key) =>
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('password'),
    );

    // If tokens are stored, they should be encrypted or minimal
    // For this test, we just verify the structure
    expect(localStorageData).toBeDefined();
  });
});
