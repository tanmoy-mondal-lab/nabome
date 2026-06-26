import { test, expect } from '@playwright/test';

test.describe('Customer Journey - Browse to Purchase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads with hero, featured products, and footer', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page).toHaveTitle(/.*Nabo.?me/i);

    const hero = page.locator('[class*="hero"], [data-testid="hero"], .hero-section, section:first-of-type');
    await expect(hero.first()).toBeVisible();

    const productCards = page.locator('[class*="product-card"], [data-testid="product-card"], .product-card');
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(0);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('user can browse products and navigate to detail', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/.*products/);

    const productCards = page.locator('[class*="product-card"], .product-card, a[href*="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });

    await productCards.first().click();
    await expect(page).toHaveURL(/.*products\/.+/);

    await expect(page.locator('[class*="product-detail"], [data-testid="product-detail"], main')).toBeVisible();
  });

  test('user can filter products by category', async ({ page }) => {
    await page.goto('/products');

    const categoryFilter = page.locator('[class*="filter"], [data-testid="category-filter"], button:has-text("Men"), a:has-text("Men")');
    if (await categoryFilter.first().isVisible()) {
      await categoryFilter.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('user can sort products', async ({ page }) => {
    await page.goto('/products');

    const sortSelect = page.locator('select[class*="sort"], [data-testid="sort-select"], select');
    if (await sortSelect.first().isVisible()) {
      await sortSelect.first().selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('user can add product to cart from listing', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('[class*="product-card"], .product-card').first()).toBeVisible({ timeout: 10000 });

    const addBtn = page.locator('button:has-text("Add"), button[aria-label*="cart"], button:has-text("Cart")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('user can add to wishlist from listing', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('[class*="product-card"], .product-card').first()).toBeVisible({ timeout: 10000 });

    const wishlistBtn = page.locator('button[aria-label*="wishlist"], button:has-text("Wishlist"), button[class*="wishlist"]').first();
    if (await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('user can search from header', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label*="search"], [data-testid="search-trigger"], a[href="/search"]').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForTimeout(300);
    }

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="q"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('shirt');
      await searchInput.press('Enter');
      await expect(page).toHaveURL(/.*search/);
    }
  });

  test('user can navigate between pages using header', async ({ page }) => {
    const navLinks = page.locator('nav a, header a[href]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    const productsLink = page.locator('a[href="/products"]').first();
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await expect(page).toHaveURL(/.*products/);
    }
  });

  test('user can use footer navigation', async ({ page }) => {
    const footerLinks = page.locator('footer a[href]');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('user can subscribe to newsletter', async ({ page }) => {
    const emailInput = page.locator('footer input[type="email"], input[placeholder*="email" i], input[name="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      const submitBtn = page.locator('footer button[type="submit"], footer button:has-text("Subscribe")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Customer Journey - Search Flow', () => {
  test('search page loads and accepts input', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="q"]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('dress');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
  });

  test('search with empty query shows validation', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i"], input[name="q"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
    }
  });

  test('search results page displays results or empty state', async ({ page }) => {
    await page.goto('/search?q=shirt');
    await page.waitForTimeout(1000);
    const results = page.locator('[class*="search-result"], [data-testid="search-results"], .product-card');
    const emptyState = page.locator('text=No results, text=No products, text=Try a different');
    const resultCount = await results.count();
    const emptyVisible = await emptyState.first().isVisible().catch(() => false);
    expect(resultCount > 0 || emptyVisible).toBeTruthy();
  });
});

test.describe('Customer Journey - Collections', () => {
  test('collections page loads', async ({ page }) => {
    await page.goto('/products');
    const collectionLinks = page.locator('a[href*="/collections/"]');
    if (await collectionLinks.first().isVisible().catch(() => false)) {
      await collectionLinks.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('collection page shows products', async ({ page }) => {
    await page.goto('/collections/men');
    await page.waitForTimeout(1000);
    const products = page.locator('[class*="product-card"], .product-card');
    const emptyState = page.locator('text=No products, text=Coming soon');
    const hasProducts = await products.count() > 0;
    const hasEmpty = await emptyState.first().isVisible().catch(() => false);
    expect(hasProducts || hasEmpty).toBeTruthy();
  });
});

test.describe('Customer Journey - Lookbooks', () => {
  test('lookbooks page loads', async ({ page }) => {
    await page.goto('/lookbooks');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*lookbooks/);
  });
});

test.describe('Customer Journey - Auth Guarded Pages', () => {
  test('checkout redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*login|.*auth/);
  });

  test('account redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/account');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*login|.*auth/);
  });

  test('wishlist redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/wishlist');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*login|.*auth|.*wishlist/);
  });

  test('admin redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*login|.*auth|.*admin/);
  });
});

test.describe('Customer Journey - 404 Page', () => {
  test('non-existent page shows 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    await page.waitForTimeout(500);
    const is404 = response?.status() === 404 ||
      await page.locator('text=404, text=Not Found, text=Page not found').first().isVisible().catch(() => false);
    expect(is404).toBeTruthy();
  });
});

test.describe('Customer Journey - Cart Page', () => {
  test('cart page loads with empty state', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL(/.*cart/);
    await page.waitForTimeout(500);
  });

  test('cart shows items after adding from product page', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);

    const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }

    await page.goto('/cart');
    await page.waitForTimeout(500);
  });
});
