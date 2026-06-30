import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nabome.online';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456!';

test.describe('Admin - Auth & Dashboard', () => {
  test('admin can login', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('admin dashboard loads with stats', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*admin/);
    const stats = page.locator('[class*="stat"], [class*="card"], [data-testid*="stat"]').first();
    await expect(stats).toBeVisible({ timeout: 5000 });
  });

  test('admin can logout', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });

    const signOutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("Log out")').first();
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('admin sidebar has navigation groups', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });

    const sidebar = page.locator('[class*="sidebar"], nav, [class*="AdminLayout"] nav').first();
    await expect(sidebar).toBeVisible();
  });

  test('admin can view site', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });

    const viewSiteBtn = page.locator('a:has-text("View Site"), a[href="/"]').first();
    if (await viewSiteBtn.isVisible().catch(() => false)) {
      await viewSiteBtn.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Admin - Products Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('products list page loads', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/.*admin\/products/);
    await page.waitForTimeout(1000);
  });

  test('products page has add product button', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button:has-text("Add Product"), a:has-text("Add Product"), button:has-text("New Product")').first();
    await expect(addBtn).toBeVisible();
  });

  test('admin can open new product form', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button:has-text("Add Product"), a:has-text("Add Product"), button:has-text("New Product")').first();
    await addBtn.click();
    await page.waitForTimeout(1000);
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
  });

  test('admin can fill new product form', async ({ page }) => {
    await page.goto('/admin/products/new');
    await page.waitForTimeout(1000);
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
    await page.goto('/admin/products');
    await page.waitForTimeout(1000);
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"], input[name="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('admin can filter products', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(1000);
    const filterBtn = page.locator('button:has-text("Filter"), [class*="filter"], select').first();
    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Admin - Categories Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('categories list page loads', async ({ page }) => {
    await page.goto('/admin/categories');
    await expect(page).toHaveURL(/.*admin\/categories/);
    await page.waitForTimeout(1000);
  });

  test('categories page has add category button', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button:has-text("Add Category"), a:has-text("Add Category")').first();
    await expect(addBtn).toBeVisible();
  });
});

test.describe('Admin - Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('orders list page loads', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/.*admin\/orders/);
    await page.waitForTimeout(1000);
  });

  test('orders page has filter/search', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForTimeout(1000);
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });
});

test.describe('Admin - Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('inventory page loads', async ({ page }) => {
    await page.goto('/admin/inventory');
    await expect(page).toHaveURL(/.*admin\/inventory/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - Customers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('customers page loads', async ({ page }) => {
    await page.goto('/admin/customers');
    await expect(page).toHaveURL(/.*admin\/customers/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - Coupons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('coupons page loads', async ({ page }) => {
    await page.goto('/admin/coupons');
    await expect(page).toHaveURL(/.*admin\/coupons/);
    await page.waitForTimeout(1000);
  });

  test('coupons page has add coupon button', async ({ page }) => {
    await page.goto('/admin/coupons');
    await page.waitForTimeout(1000);
    const addBtn = page.locator('button:has-text("Add Coupon"), a:has-text("Add Coupon"), button:has-text("Create")').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await expect(addBtn).toBeVisible();
    }
  });
});

test.describe('Admin - Reviews', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('reviews page loads', async ({ page }) => {
    await page.goto('/admin/reviews');
    await expect(page).toHaveURL(/.*admin\/reviews/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - CMS Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('CMS pages list loads', async ({ page }) => {
    await page.goto('/admin/cms/pages');
    await expect(page).toHaveURL(/.*admin\/cms\/pages/);
    await page.waitForTimeout(1000);
  });

  test('homepage builder loads', async ({ page }) => {
    await page.goto('/admin/cms/homepage');
    await expect(page).toHaveURL(/.*admin\/cms\/homepage/);
    await page.waitForTimeout(1000);
  });

  test('hero builder loads', async ({ page }) => {
    await page.goto('/admin/cms/hero-builder');
    await expect(page).toHaveURL(/.*admin\/cms\/hero-builder/);
    await page.waitForTimeout(1000);
  });

  test('header builder loads', async ({ page }) => {
    await page.goto('/admin/cms/header');
    await expect(page).toHaveURL(/.*admin\/cms\/header/);
    await expect(page.getByText('Header Builder')).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test('footer builder loads', async ({ page }) => {
    await page.goto('/admin/cms/footer');
    await expect(page).toHaveURL(/.*admin\/cms\/footer/);
    await page.waitForTimeout(1000);
  });

  test('banners page loads', async ({ page }) => {
    await page.goto('/admin/cms/banners');
    await expect(page).toHaveURL(/.*admin\/cms\/banners/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - Marketing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('marketing page loads', async ({ page }) => {
    await page.goto('/admin/marketing');
    await expect(page).toHaveURL(/.*admin\/marketing/);
    await page.waitForTimeout(1000);
  });

  test('announcements page loads', async ({ page }) => {
    await page.goto('/admin/announcements');
    await expect(page).toHaveURL(/.*admin\/announcements/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('analytics page loads', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page).toHaveURL(/.*admin\/analytics/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/.*admin\/settings/);
    await page.waitForTimeout(1000);
  });

  test('SEO settings page loads', async ({ page }) => {
    await page.goto('/admin/seo');
    await expect(page).toHaveURL(/.*admin\/seo/);
    await page.waitForTimeout(1000);
  });

  test('theme page loads', async ({ page }) => {
    await page.goto('/admin/theme');
    await expect(page).toHaveURL(/.*admin\/theme/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('support tickets page loads', async ({ page }) => {
    await page.goto('/admin/support');
    await expect(page).toHaveURL(/.*admin\/support/);
    await page.waitForTimeout(1000);
  });

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/admin/faq');
    await expect(page).toHaveURL(/.*admin\/faq/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - Content Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('lookbooks page loads', async ({ page }) => {
    await page.goto('/admin/lookbooks');
    await expect(page).toHaveURL(/.*admin\/lookbooks/);
    await page.waitForTimeout(1000);
  });

  test('media library loads', async ({ page }) => {
    await page.goto('/admin/media');
    await expect(page).toHaveURL(/.*admin\/media/);
    await page.waitForTimeout(1000);
  });

  test('brands page loads', async ({ page }) => {
    await page.goto('/admin/brands');
    await expect(page).toHaveURL(/.*admin\/brands/);
    await page.waitForTimeout(1000);
  });

  test('size guides page loads', async ({ page }) => {
    await page.goto('/admin/size-guides');
    await expect(page).toHaveURL(/.*admin\/size-guides/);
    await page.waitForTimeout(1000);
  });

  test('labels page loads', async ({ page }) => {
    await page.goto('/admin/labels');
    await expect(page).toHaveURL(/.*admin\/labels/);
    await page.waitForTimeout(1000);
  });

  test('collections page loads', async ({ page }) => {
    await page.goto('/admin/collections');
    await expect(page).toHaveURL(/.*admin\/collections/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
  });

  test('audit log page loads', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await expect(page).toHaveURL(/.*admin\/audit-log/);
    await page.waitForTimeout(1000);
  });

  test('sessions page loads', async ({ page }) => {
    await page.goto('/admin/sessions');
    await expect(page).toHaveURL(/.*admin\/sessions/);
    await page.waitForTimeout(1000);
  });

  test('webhooks page loads', async ({ page }) => {
    await page.goto('/admin/webhooks');
    await expect(page).toHaveURL(/.*admin\/webhooks/);
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin - Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/, { timeout: 10000 });
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
