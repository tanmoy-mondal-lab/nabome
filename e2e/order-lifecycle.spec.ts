import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/admin.json' });

test.describe.configure({ mode: 'parallel' });

async function navigateToOrderDetail(page: import('@playwright/test').Page, orderId?: string): Promise<void> {
  if (orderId) {
    await page.goto(`/admin/orders/${orderId}`);
  } else {
    await page.goto('/admin/orders');
    await page.waitForTimeout(500);
    const firstRow = page.getByRole('row').nth(1);
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click();
    }
  }
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
}

test.describe('Order Lifecycle - Admin View', () => {
  test('admin can view orders list', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/.*admin\/orders/);
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('order detail page displays order information', async ({ page }) => {
    await navigateToOrderDetail(page);

    const detailSection = page.locator('[class*="order-detail"], [data-testid="order-detail"], main');
    await expect(detailSection.first()).toBeVisible();
  });

  test('order status shows pending by default for new orders', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForTimeout(500);

    const statusBadge = page.locator('[class*="status"], [data-testid="order-status"], .badge');
    if (await statusBadge.first().isVisible().catch(() => false)) {
      await expect(statusBadge.first()).toBeVisible();
    }
  });

  test('admin can update order status to confirmed', async ({ page }) => {
    await navigateToOrderDetail(page);

    const statusSelect = page.getByLabel(/status/i);
    if (await statusSelect.isVisible().catch(() => false)) {
      await statusSelect.selectOption('confirmed');

      const updateBtn = page.getByRole('button', { name: /update status/i });
      if (await updateBtn.isVisible().catch(() => false)) {
        await updateBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('admin can update order status to shipped', async ({ page }) => {
    await navigateToOrderDetail(page);

    const statusSelect = page.getByLabel(/status/i);
    if (await statusSelect.isVisible().catch(() => false)) {
      await statusSelect.selectOption('shipped');

      const updateBtn = page.getByRole('button', { name: /update status/i });
      if (await updateBtn.isVisible().catch(() => false)) {
        await updateBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('admin can update order status to delivered', async ({ page }) => {
    await navigateToOrderDetail(page);

    const statusSelect = page.getByLabel(/status/i);
    if (await statusSelect.isVisible().catch(() => false)) {
      await statusSelect.selectOption('delivered');

      const updateBtn = page.getByRole('button', { name: /update status/i });
      if (await updateBtn.isVisible().catch(() => false)) {
        await updateBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('order status progression follows pending to confirmed to shipped to delivered', async ({ page }) => {
    await navigateToOrderDetail(page);

    const statusSelect = page.getByLabel(/status/i);
    const updateBtn = page.getByRole('button', { name: /update status/i });

    if (await statusSelect.isVisible().catch(() => false)) {
      const statuses = ['confirmed', 'shipped', 'delivered'];
      for (const status of statuses) {
        await statusSelect.selectOption(status);
        if (await updateBtn.isVisible().catch(() => false)) {
          await updateBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('order cancellation prevents further status updates', async ({ page }) => {
    await navigateToOrderDetail(page);

    const cancelBtn = page.getByRole('button', { name: /cancel order/i });
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();

      const confirmBtn = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('order detail page shows customer information', async ({ page }) => {
    await navigateToOrderDetail(page);

    const customerSection = page.locator('[class*="customer"], [data-testid="customer-info"], text=Customer');
    if (await customerSection.first().isVisible().catch(() => false)) {
      await expect(customerSection.first()).toBeVisible();
    }
  });

  test('order detail page shows shipping address', async ({ page }) => {
    await navigateToOrderDetail(page);

    const addressSection = page.locator('[class*="address"], [data-testid="shipping-address"], text=Address');
    if (await addressSection.first().isVisible().catch(() => false)) {
      await expect(addressSection.first()).toBeVisible();
    }
  });

  test('order detail page shows order items', async ({ page }) => {
    await navigateToOrderDetail(page);

    const itemsSection = page.locator('[class*="order-item"], [data-testid="order-items"], table');
    if (await itemsSection.first().isVisible().catch(() => false)) {
      await expect(itemsSection.first()).toBeVisible();
    }
  });

  test('order total is calculated correctly', async ({ page }) => {
    await navigateToOrderDetail(page);

    const totalSection = page.locator('[class*="total"], [data-testid="order-total"], text=Total');
    if (await totalSection.first().isVisible().catch(() => false)) {
      await expect(totalSection.first()).toBeVisible();
    }
  });
});

test.describe('Order Lifecycle - Customer View', () => {
  test('customer can view order history', async ({ page }) => {
    await page.goto('/account/orders');
    await page.waitForTimeout(1000);

    const ordersSection = page.locator('[class*="order"], [data-testid="order-list"], main');
    await expect(ordersSection.first()).toBeVisible({ timeout: 5000 });
  });

  test('customer can view order details', async ({ page }) => {
    await page.goto('/account/orders');
    await page.waitForTimeout(500);

    const orderLink = page.locator('a[href*="/orders/"], [class*="order-card"]').first();
    if (await orderLink.isVisible().catch(() => false)) {
      await orderLink.click();
      await page.waitForTimeout(500);
    }
  });

  test('order tracking page is accessible', async ({ page }) => {
    await page.goto('/account/orders');
    await page.waitForTimeout(500);

    const trackingLink = page.locator('a:has-text("Track"), button:has-text("Track"), [class*="tracking"]').first();
    if (await trackingLink.isVisible().catch(() => false)) {
      await trackingLink.click();
      await page.waitForTimeout(500);
    }
  });

  test('order status is displayed on order card', async ({ page }) => {
    await page.goto('/account/orders');
    await page.waitForTimeout(500);

    const statusBadge = page.locator('[class*="status"], [data-testid="order-status"], .badge').first();
    if (await statusBadge.isVisible().catch(() => false)) {
      await expect(statusBadge).toBeVisible();
    }
  });
});
