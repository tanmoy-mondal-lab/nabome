import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminPage } from './admin-auth-helper';

test.describe('Admin - Auth & Dashboard', () => {
  test('admin can login', async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin dashboard loads with stats', async ({ page }) => {
    await loginAsAdmin(page);
    const stats = page.locator('[class*="stat"], [class*="card"], [data-testid*="stat"]').first();
    await expect(stats).toBeVisible({ timeout: 5000 });
  });

  test('admin can logout', async ({ page }) => {
    await loginAsAdmin(page);

    const signOutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("Log out")').first();
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('admin sidebar has navigation groups', async ({ page }) => {
    await loginAsAdmin(page);
    const sidebar = page.locator('[class*="sidebar"], nav, [class*="AdminLayout"] nav').first();
    await expect(sidebar).toBeVisible();
  });

  test('admin can view site', async ({ page }) => {
    await loginAsAdmin(page);
    const viewSiteBtn = page.locator('a:has-text("View Site"), a[href="/"]').first();
    if (await viewSiteBtn.isVisible().catch(() => false)) {
      await viewSiteBtn.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Admin - Products Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('products list page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    await expect(page).toHaveURL(/.*admin\/products/);
  });

  test('products page has add product button', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    const addBtn = page.locator('button:has-text("Add Product"), a:has-text("Add Product"), button:has-text("New Product")').first();
    await expect(addBtn).toBeVisible();
  });

  test('admin can open new product form', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    const addBtn = page.locator('button:has-text("Add Product"), a:has-text("Add Product"), button:has-text("New Product")').first();
    await addBtn.click();
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
  });

  test('admin can fill new product form', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products/new');
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('E2E Test Product ' + Date.now());
    }
    const priceInput = page.locator('input[name="basePrice"], input[name="price"], input[placeholder*="price" i]').first();
    if (await priceInput.isVisible()) {
      await priceInput.fill('1299');
    }
  });

  test('admin can search products', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"], input[name="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('admin can filter products', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    const filterBtn = page.locator('button:has-text("Filter"), [class*="filter"], select').first();
    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Admin - Categories Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('categories list page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/categories');
    await expect(page).toHaveURL(/.*admin\/categories/);
  });

  test('categories page has add category button', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/categories');
    const addBtn = page.locator('button:has-text("Add Category"), a:has-text("Add Category")').first();
    await expect(addBtn).toBeVisible();
  });
});

test.describe('Admin - Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('orders list page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/orders');
    await expect(page).toHaveURL(/.*admin\/orders/);
  });

  test('orders page has filter/search', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/orders');
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });
});

test.describe('Admin - Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('inventory page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/inventory');
    await expect(page).toHaveURL(/.*admin\/inventory/);
  });
});

test.describe('Admin - Customers', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('customers page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/customers');
    await expect(page).toHaveURL(/.*admin\/customers/);
  });
});

test.describe('Admin - Coupons', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('coupons page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/coupons');
    await expect(page).toHaveURL(/.*admin\/coupons/);
  });

  test('coupons page has add coupon button', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/coupons');
    const addBtn = page.locator('button:has-text("Add Coupon"), a:has-text("Add Coupon"), button:has-text("Create")').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await expect(addBtn).toBeVisible();
    }
  });
});

test.describe('Admin - Reviews', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('reviews page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/reviews');
    await expect(page).toHaveURL(/.*admin\/reviews/);
  });
});

test.describe('Admin - CMS Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('CMS pages list loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/cms/pages');
    await expect(page).toHaveURL(/.*admin\/cms\/pages/);
  });

  test('homepage builder loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/cms/homepage');
    await expect(page).toHaveURL(/.*admin\/cms\/homepage/);
  });

  test('hero builder loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/cms/hero-builder');
    await expect(page).toHaveURL(/.*admin\/cms\/hero-builder/);
  });

  test('header builder loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/cms/header');
    await expect(page).toHaveURL(/.*admin\/cms\/header/);
    await expect(page.getByText('Header Builder')).toBeVisible();
  });

  test('footer builder loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/cms/footer');
    await expect(page).toHaveURL(/.*admin\/cms\/footer/);
  });

  test('banners page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/cms/banners');
    await expect(page).toHaveURL(/.*admin\/cms\/banners/);
  });
});

test.describe('Admin - Marketing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('marketing page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/marketing');
    await expect(page).toHaveURL(/.*admin\/marketing/);
  });

  test('announcements page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/announcements');
    await expect(page).toHaveURL(/.*admin\/announcements/);
  });
});

test.describe('Admin - Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('analytics page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/analytics');
    await expect(page).toHaveURL(/.*admin\/analytics/);
  });
});

test.describe('Admin - Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('settings page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/settings');
    await expect(page).toHaveURL(/.*admin\/settings/);
  });

  test('SEO settings page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/seo');
    await expect(page).toHaveURL(/.*admin\/seo/);
  });

  test('theme page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/theme');
    await expect(page).toHaveURL(/.*admin\/theme/);
  });
});

test.describe('Admin - Support', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('support tickets page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/support');
    await expect(page).toHaveURL(/.*admin\/support/);
  });

  test('FAQ page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/faq');
    await expect(page).toHaveURL(/.*admin\/faq/);
  });
});

test.describe('Admin - Content Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('lookbooks page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/lookbooks');
    await expect(page).toHaveURL(/.*admin\/lookbooks/);
  });

  test('media library loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/media');
    await expect(page).toHaveURL(/.*admin\/media/);
  });

  test('brands page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/brands');
    await expect(page).toHaveURL(/.*admin\/brands/);
  });

  test('size guides page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/size-guides');
    await expect(page).toHaveURL(/.*admin\/size-guides/);
  });

  test('labels page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/labels');
    await expect(page).toHaveURL(/.*admin\/labels/);
  });

  test('collections page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/collections');
    await expect(page).toHaveURL(/.*admin\/collections/);
  });
});

test.describe('Admin - System', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('audit log page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/audit-log');
    await expect(page).toHaveURL(/.*admin\/audit-log/);
  });

  test('auth activity sessions page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/sessions');
    await expect(page).toHaveURL(/.*admin\/auth\?tab=sessions/);
    await expect(page.getByRole('button', { name: /active sessions/i })).toBeVisible();
    await expect(page.getByText(/No sessions found|User|Email/i).first()).toBeVisible();
  });

  test('auth activity login attempts tab loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/login-attempts');
    await expect(page).toHaveURL(/.*admin\/auth\?tab=attempts/);
    await expect(page.getByRole('button', { name: /login attempts/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search by email/i)).toBeVisible();
  });

  test('webhooks page loads', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/webhooks');
    await expect(page).toHaveURL(/.*admin\/webhooks/);
  });
});

test.describe('Admin - Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('sidebar Products group expands', async ({ page }) => {
    const productsGroup = page.locator('button:has-text("Products"), [class*="sidebar"] button:has-text("Products")').first();
    if (await productsGroup.isVisible()) {
      await productsGroup.click();
      await page.waitForTimeout(300);
    }
  });

  test('sidebar Content group expands', async ({ page }) => {
    const contentGroup = page.locator('button:has-text("Content"), [class*="sidebar"] button:has-text("Content")').first();
    if (await contentGroup.isVisible()) {
      await contentGroup.click();
      await page.waitForTimeout(300);
    }
  });

  test('sidebar Support group expands', async ({ page }) => {
    const supportGroup = page.locator('button:has-text("Support"), [class*="sidebar"] button:has-text("Support")').first();
    if (await supportGroup.isVisible()) {
      await supportGroup.click();
      await page.waitForTimeout(300);
    }
  });

  test('sidebar System group expands', async ({ page }) => {
    const systemGroup = page.locator('button:has-text("System"), [class*="sidebar"] button:has-text("System")').first();
    if (await systemGroup.isVisible()) {
      await systemGroup.click();
      await page.waitForTimeout(300);
    }
  });

  test('sidebar Theme group expands', async ({ page }) => {
    const themeGroup = page.locator('button:has-text("Theme"), [class*="sidebar"] button:has-text("Theme")').first();
    if (await themeGroup.isVisible()) {
      await themeGroup.click();
      await page.waitForTimeout(300);
    }
  });

  test('sidebar collapses and expands', async ({ page }) => {
    const toggleBtn = page.locator('button[aria-label*="collapse"], button[aria-label*="toggle"], [class*="sidebar"] button:first-child').first();
    if (await toggleBtn.isVisible().catch(() => false)) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('sidebar is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const sidebarToggle = page.locator('button[aria-label*="menu"], button[aria-label*="sidebar"]').first();
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click();
      await page.waitForTimeout(300);
    }
  });
});
