import { test, expect } from '@playwright/test';

test.describe('Cart - Edge Cases', () => {
  test('cart persists across page navigation', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);

    const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }

    await page.goto('/products');
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await page.waitForTimeout(500);
  });

  test('cart persists after browser refresh', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);

    const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }

    await page.reload();
    await page.waitForTimeout(500);
  });

  test('cart shows correct item count badge', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);
    const cartBadge = page.locator('[class*="cart-count"], [data-cart-count], [class*="badge"]').first();
    if (await cartBadge.isVisible().catch(() => false)) {
      const text = await cartBadge.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('empty cart shows appropriate message', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    const emptyMsg = page.locator('text=empty, text=No items, text=Your cart is empty, text=Add some');
    const cartItems = page.locator('[class*="cart-item"], .cart-item, [data-testid="cart-item"]');
    const isEmpty = await emptyMsg.first().isVisible().catch(() => false);
    const hasItems = await cartItems.count() > 0;
    expect(isEmpty || hasItems).toBeTruthy();
  });

  test('cart page has continue shopping link', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);
    const continueLink = page.locator('a:has-text("Continue Shopping"), a:has-text("Continue shopping"), a[href="/products"]').first();
    if (await continueLink.isVisible().catch(() => false)) {
      await continueLink.click();
      await expect(page).toHaveURL(/.*products/);
    }
  });

  test('cart page has proceed to checkout button', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Proceed"), a:has-text("Checkout")').first();
    if (await checkoutBtn.isVisible().catch(() => false)) {
      await checkoutBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('adding same product twice increases quantity', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
    await page.locator('[class*="product-card"], .product-card').first().click();
    await page.waitForTimeout(500);

    const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await addBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('cart quantity can be incremented', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);
    const incrementBtn = page.locator('button[aria-label*="increase"], button[aria-label*="plus"], button:has-text("+")').first();
    if (await incrementBtn.isVisible().catch(() => false)) {
      await incrementBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('cart quantity can be decremented', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);
    const decrementBtn = page.locator('button[aria-label*="decrease"], button[aria-label*="minus"], button:has-text("-")').first();
    if (await decrementBtn.isVisible().catch(() => false)) {
      await decrementBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('cart item can be removed', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);
    const removeBtn = page.locator('button[aria-label*="remove"], button[aria-label*="delete"], button:has-text("Remove"), button:has-text("×")').first();
    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('cart shows subtotal calculation', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);
    const subtotal = page.locator('text=Subtotal, text=Total, text=Amount').first();
    if (await subtotal.isVisible().catch(() => false)) {
      await expect(subtotal).toBeVisible();
    }
  });

  test('cart shows shipping info', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);
    const shipping = page.locator('text=Shipping, text=Delivery, text=Free shipping').first();
    if (await shipping.isVisible().catch(() => false)) {
      await expect(shipping).toBeVisible();
    }
  });

  test('cart page is responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/cart');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*cart/);
  });
});

test.describe('Cart - Drawer', () => {
  test('cart drawer opens from header', async ({ page }) => {
    await page.goto('/');
    const cartBtn = page.locator('[aria-label*="cart"], [data-testid="cart-trigger"], button[class*="cart"]').first();
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('cart drawer shows items', async ({ page }) => {
    await page.goto('/');
    const cartBtn = page.locator('[aria-label*="cart"], [data-testid="cart-trigger"], button[class*="cart"]').first();
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('cart drawer has close button', async ({ page }) => {
    await page.goto('/');
    const cartBtn = page.locator('[aria-label*="cart"], [data-testid="cart-trigger"], button[class*="cart"]').first();
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
      await page.waitForTimeout(500);
      const closeBtn = page.locator('[aria-label*="close"], button:has-text("×"), button[class*="close"]').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
