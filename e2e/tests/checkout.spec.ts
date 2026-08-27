import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to shop page
    await page.goto('/shop');
  });

  test('should add product to cart and proceed to checkout', async ({
    page,
  }) => {
    // Find first product and add to cart
    await page.locator('[data-testid="product-card"]').first().click();

    // Wait for product detail page
    await expect(page.locator('h1')).toContainText('Product');

    // Select variant if available
    const variantSelector = page.locator('[data-testid="variant-selector"]');
    if (await variantSelector.isVisible()) {
      await variantSelector.first().click();
    }

    // Add to cart
    await page.locator('[data-testid="add-to-cart"]').click();

    // Wait for cart drawer or navigate to cart
    await page.waitForTimeout(1000);

    // Navigate to cart page
    await page.goto('/cart');

    // Verify cart has items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // Proceed to checkout
    await page.locator('[data-testid="proceed-to-checkout"]').click();

    // Verify checkout page loads
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('should complete checkout with COD payment', async ({ page }) => {
    // Add product to cart first
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="add-to-cart"]').click();
    await page.goto('/cart');
    await page.locator('[data-testid="proceed-to-checkout"]').click();

    // Select shipping address
    await page.locator('[data-testid="address-selector"]').first().click();

    // Select shipping method
    await page.locator('[data-testid="shipping-method"]').first().click();

    // Select COD payment
    await page.locator('[data-testid="payment-cod"]').click();

    // Place order
    await page.locator('[data-testid="place-order"]').click();

    // Verify redirect to order confirmation
    await expect(page).toHaveURL(/\/order-confirmation\//);
    await expect(
      page.locator('[data-testid="order-confirmation"]'),
    ).toBeVisible();
  });
});
