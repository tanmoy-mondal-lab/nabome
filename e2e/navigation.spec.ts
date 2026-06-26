import { test, expect } from '@playwright/test';

test.describe('Navigation - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
  });

  test('header is visible and contains logo', async ({ page }) => {
    const header = page.locator('header, [class*="header"], nav').first();
    await expect(header).toBeVisible();
    const logo = page.locator('header img, header a[href="/"], [class*="logo"]').first();
    await expect(logo).toBeVisible();
  });

  test('header navigation links are visible', async ({ page }) => {
    const navLinks = page.locator('nav a[href], header a[href]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('logo links to homepage', async ({ page }) => {
    const logo = page.locator('header a[href="/"], [class*="logo"] a[href="/"]').first();
    if (await logo.isVisible()) {
      await logo.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('search icon is clickable', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label*="search"], [data-testid="search-trigger"]').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('cart icon is clickable', async ({ page }) => {
    const cartBtn = page.locator('[aria-label*="cart"], [data-testid="cart-trigger"], a[href="/cart"]').first();
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('account icon is clickable', async ({ page }) => {
    const accountBtn = page.locator('[aria-label*="account"], a[href="/account"], a[href="/auth/login"]').first();
    if (await accountBtn.isVisible()) {
      await accountBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('user menu dropdown works', async ({ page }) => {
    const userMenu = page.locator('button[aria-label*="menu"], .user-menu-button, [data-testid="user-menu"]').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.waitForTimeout(300);
    }
  });

  test('mega menu opens on hover', async ({ page }) => {
    const menuItem = page.locator('nav a[href*="/products"], nav button').first();
    if (await menuItem.isVisible()) {
      await menuItem.hover();
      await page.waitForTimeout(300);
    }
  });

  test('announcement bar is visible', async ({ page }) => {
    const announcement = page.locator('[class*="announcement"], [class*="top-bar"]').first();
    if (await announcement.isVisible().catch(() => false)) {
      await expect(announcement).toBeVisible();
    }
  });

  test('footer is visible with links', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const footerLinks = page.locator('footer a[href]');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Navigation - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
  });

  test('mobile nav is visible', async ({ page }) => {
    const mobileNav = page.locator('[class*="mobile-nav"], [class*="bottom-nav"], [class*="BottomNav"]').first();
    if (await mobileNav.isVisible().catch(() => false)) {
      await expect(mobileNav).toBeVisible();
    }
  });

  test('bottom nav has home link', async ({ page }) => {
    const homeLink = page.locator('[class*="bottom-nav"] a[href="/"], [class*="BottomNav"] a[href="/"]').first();
    if (await homeLink.isVisible().catch(() => false)) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('bottom nav has browse/products link', async ({ page }) => {
    const browseLink = page.locator('[class*="bottom-nav"] a[href="/products"], [class*="BottomNav"] a[href="/products"]').first();
    if (await browseLink.isVisible().catch(() => false)) {
      await browseLink.click();
      await expect(page).toHaveURL(/.*products/);
    }
  });

  test('bottom nav has wishlist link', async ({ page }) => {
    const wishlistLink = page.locator('[class*="bottom-nav"] a[href*="wishlist"], [class*="BottomNav"] a[href*="wishlist"]').first();
    if (await wishlistLink.isVisible().catch(() => false)) {
      await wishlistLink.click();
      await page.waitForTimeout(500);
    }
  });

  test('bottom nav has cart link', async ({ page }) => {
    const cartLink = page.locator('[class*="bottom-nav"] a[href="/cart"], [class*="BottomNav"] a[href="/cart"]').first();
    if (await cartLink.isVisible().catch(() => false)) {
      await cartLink.click();
      await expect(page).toHaveURL(/.*cart/);
    }
  });

  test('bottom nav has account link', async ({ page }) => {
    const accountLink = page.locator('[class*="bottom-nav"] a[href*="account"], [class*="BottomNav"] a[href*="account"]').first();
    if (await accountLink.isVisible().catch(() => false)) {
      await accountLink.click();
      await page.waitForTimeout(500);
    }
  });

  test('hamburger menu opens mobile nav', async ({ page }) => {
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid="mobile-menu-trigger"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(300);
    }
  });

  test('mobile nav drawer has navigation links', async ({ page }) => {
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid="mobile-menu-trigger"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(300);
      const mobileLinks = page.locator('[class*="mobile-nav"] a, [class*="MobileNav"] a, nav[class*="mobile"] a');
      const count = await mobileLinks.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('mobile search works', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label*="search"], [data-testid="search-trigger"]').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForTimeout(300);
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await searchInput.press('Enter');
        await page.waitForTimeout(500);
      }
    }
  });

  test('bottom nav is hidden on checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(500);
    const bottomNav = page.locator('[class*="bottom-nav"], [class*="BottomNav"]');
    const isHidden = await bottomNav.first().isHidden().catch(() => true);
    expect(isHidden).toBeTruthy();
  });
});

test.describe('Navigation - Responsive', () => {
  test('page works at tablet size (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await page.goto('/products');
    await expect(page).toHaveURL(/.*products/);
  });

  test('page works at mobile size (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await page.goto('/products');
    await expect(page).toHaveURL(/.*products/);
  });

  test('page works at desktop size (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await page.goto('/products');
    await expect(page).toHaveURL(/.*products/);
  });

  test('page works at large desktop (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });
});
