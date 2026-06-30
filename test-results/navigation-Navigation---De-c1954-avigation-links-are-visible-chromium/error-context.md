# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - Desktop >> header navigation links are visible
- Location: e2e/navigation.spec.ts:16:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading…
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Navigation - Desktop', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.setViewportSize({ width: 1280, height: 720 });
  6   |     await page.goto('/');
  7   |   });
  8   | 
  9   |   test('header is visible and contains logo', async ({ page }) => {
  10  |     const header = page.locator('header, [class*="header"], nav').first();
  11  |     await expect(header).toBeVisible();
  12  |     const logo = page.locator('header img, header a[href="/"], [class*="logo"]').first();
  13  |     await expect(logo).toBeVisible();
  14  |   });
  15  | 
  16  |   test('header navigation links are visible', async ({ page }) => {
  17  |     const navLinks = page.locator('nav a[href], header a[href]');
  18  |     const count = await navLinks.count();
> 19  |     expect(count).toBeGreaterThan(0);
      |                   ^ Error: expect(received).toBeGreaterThan(expected)
  20  |   });
  21  | 
  22  |   test('logo links to homepage', async ({ page }) => {
  23  |     const logo = page.locator('header a[href="/"], [class*="logo"] a[href="/"]').first();
  24  |     if (await logo.isVisible()) {
  25  |       await logo.click();
  26  |       await expect(page).toHaveURL('/');
  27  |     }
  28  |   });
  29  | 
  30  |   test('search icon is clickable', async ({ page }) => {
  31  |     const searchBtn = page.locator('button[aria-label*="search"], [data-testid="search-trigger"]').first();
  32  |     if (await searchBtn.isVisible()) {
  33  |       await searchBtn.click();
  34  |       await page.waitForTimeout(300);
  35  |     }
  36  |   });
  37  | 
  38  |   test('cart icon is clickable', async ({ page }) => {
  39  |     const cartBtn = page.locator('[aria-label*="cart"], [data-testid="cart-trigger"], a[href="/cart"]').first();
  40  |     if (await cartBtn.isVisible()) {
  41  |       await cartBtn.click();
  42  |       await page.waitForTimeout(300);
  43  |     }
  44  |   });
  45  | 
  46  |   test('account icon is clickable', async ({ page }) => {
  47  |     const accountBtn = page.locator('[aria-label*="account"], a[href="/account"], a[href="/auth/login"]').first();
  48  |     if (await accountBtn.isVisible()) {
  49  |       await accountBtn.click();
  50  |       await page.waitForTimeout(300);
  51  |     }
  52  |   });
  53  | 
  54  |   test('user menu dropdown works', async ({ page }) => {
  55  |     const userMenu = page.locator('button[aria-label*="menu"], .user-menu-button, [data-testid="user-menu"]').first();
  56  |     if (await userMenu.isVisible()) {
  57  |       await userMenu.click();
  58  |       await page.waitForTimeout(300);
  59  |     }
  60  |   });
  61  | 
  62  |   test('mega menu opens on hover', async ({ page }) => {
  63  |     const menuItem = page.locator('nav a[href*="/products"], nav button').first();
  64  |     if (await menuItem.isVisible()) {
  65  |       await menuItem.hover();
  66  |       await page.waitForTimeout(300);
  67  |     }
  68  |   });
  69  | 
  70  |   test('announcement bar is visible', async ({ page }) => {
  71  |     const announcement = page.locator('[class*="announcement"], [class*="top-bar"]').first();
  72  |     if (await announcement.isVisible().catch(() => false)) {
  73  |       await expect(announcement).toBeVisible();
  74  |     }
  75  |   });
  76  | 
  77  |   test('footer is visible with links', async ({ page }) => {
  78  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  79  |     await page.waitForTimeout(500);
  80  |     const footer = page.locator('footer');
  81  |     await expect(footer).toBeVisible();
  82  |     const footerLinks = page.locator('footer a[href]');
  83  |     const count = await footerLinks.count();
  84  |     expect(count).toBeGreaterThan(0);
  85  |   });
  86  | });
  87  | 
  88  | test.describe('Navigation - Mobile', () => {
  89  |   test.beforeEach(async ({ page }) => {
  90  |     await page.setViewportSize({ width: 375, height: 812 });
  91  |     await page.goto('/');
  92  |   });
  93  | 
  94  |   test('mobile nav is visible', async ({ page }) => {
  95  |     const mobileNav = page.locator('[class*="mobile-nav"], [class*="bottom-nav"], [class*="BottomNav"]').first();
  96  |     if (await mobileNav.isVisible().catch(() => false)) {
  97  |       await expect(mobileNav).toBeVisible();
  98  |     }
  99  |   });
  100 | 
  101 |   test('bottom nav has home link', async ({ page }) => {
  102 |     const homeLink = page.locator('[class*="bottom-nav"] a[href="/"], [class*="BottomNav"] a[href="/"]').first();
  103 |     if (await homeLink.isVisible().catch(() => false)) {
  104 |       await homeLink.click();
  105 |       await expect(page).toHaveURL('/');
  106 |     }
  107 |   });
  108 | 
  109 |   test('bottom nav has browse/products link', async ({ page }) => {
  110 |     const browseLink = page.locator('[class*="bottom-nav"] a[href="/products"], [class*="BottomNav"] a[href="/products"]').first();
  111 |     if (await browseLink.isVisible().catch(() => false)) {
  112 |       await browseLink.click();
  113 |       await expect(page).toHaveURL(/.*products/);
  114 |     }
  115 |   });
  116 | 
  117 |   test('bottom nav has wishlist link', async ({ page }) => {
  118 |     const wishlistLink = page.locator('[class*="bottom-nav"] a[href*="wishlist"], [class*="BottomNav"] a[href*="wishlist"]').first();
  119 |     if (await wishlistLink.isVisible().catch(() => false)) {
```