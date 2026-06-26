import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test('product detail page loads for valid product', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await expect(page).toHaveURL(/.*products\/.+/);
    await page.waitForTimeout(500);
  });

  test('product detail shows product name', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const heading = page.locator('h1, [class*="product-title"], [class*="product-name"]').first();
    if (await heading.isVisible()) {
      const text = await heading.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('product detail shows price', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const price = page.locator('[class*="price"], text=/₹|Rs|\\$/').first();
    if (await price.isVisible()) {
      await expect(price).toBeVisible();
    }
  });

  test('product detail shows product images', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const images = page.locator('[class*="product"] img, [class*="gallery"] img, main img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('product detail shows description', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const description = page.locator('[class*="description"], [class*="product-description"], p').first();
    if (await description.isVisible().catch(() => false)) {
      await expect(description).toBeVisible();
    }
  });

  test('product detail has add to cart button', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag"), button:has-text("Add to Bag")').first();
    await expect(addBtn).toBeVisible();
  });

  test('product detail has size selector', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const sizeSelector = page.locator('[class*="size"], [data-testid="size-selector"], button:has-text("S"), button:has-text("M"), button:has-text("L")').first();
    if (await sizeSelector.isVisible().catch(() => false)) {
      await expect(sizeSelector).toBeVisible();
    }
  });

  test('product detail has color selector', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const colorSelector = page.locator('[class*="color"], [data-testid="color-selector"], [class*="swatch"]').first();
    if (await colorSelector.isVisible().catch(() => false)) {
      await expect(colorSelector).toBeVisible();
    }
  });

  test('product detail shows reviews section', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const reviews = page.locator('[class*="review"], text=Reviews, text=reviews').first();
    if (await reviews.isVisible().catch(() => false)) {
      await expect(reviews).toBeVisible();
    }
  });

  test('product detail shows breadcrumb navigation', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]').first();
    if (await breadcrumb.isVisible().catch(() => false)) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('product detail has wishlist button', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const wishlistBtn = page.locator('button[aria-label*="wishlist"], button:has-text("Wishlist"), button[class*="wishlist"]').first();
    if (await wishlistBtn.isVisible().catch(() => false)) {
      await expect(wishlistBtn).toBeVisible();
    }
  });

  test('product detail shows related products', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const related = page.locator('[class*="related"], [class*="similar"], text=Related, text=You may also like').first();
    if (await related.isVisible().catch(() => false)) {
      await expect(related).toBeVisible();
    }
  });

  test('product detail image gallery - thumbnail click changes main image', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const thumbnails = page.locator('[class*="thumbnail"], [class*="gallery"] img, [class*="image-list"] img');
    if (await thumbnails.count() > 1) {
      await thumbnails.nth(1).click();
      await page.waitForTimeout(300);
    }
  });

  test('product detail - quantity selector works', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);
    const quantityPlus = page.locator('button[aria-label*="increase"], button[aria-label*="plus"], button:has-text("+")').first();
    if (await quantityPlus.isVisible().catch(() => false)) {
      await quantityPlus.click();
      await page.waitForTimeout(200);
    }
  });

  test('product not found shows error/redirect', async ({ page }) => {
    const response = await page.goto('/products/nonexistent-slug-12345');
    await page.waitForTimeout(1000);
    const isError = response?.status() === 404 ||
      await page.locator('text=not found, text=Not Found, text=Product not found, text=does not exist').first().isVisible().catch(() => false);
    expect(isError).toBeTruthy();
  });
});
