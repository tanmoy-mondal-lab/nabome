import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can add product to cart', async ({ page }) => {
    // Navigate to a product page
    await page.click('.product-card:first-child');
    await expect(page).toHaveURL(/.*products/);

    // Select variant if available
    const sizeSelector = page.locator('.size-selector button').first();
    if (await sizeSelector.isVisible()) {
      await sizeSelector.click();
    }

    // Add to cart
    await page.click('button:has-text("Add to Cart")');
    
    // Verify cart indicator updates
    await expect(page.locator('.cart-count, [data-cart-count]')).toContainText(/[1-9]/);
  });

  test('user can view cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.click('.product-card:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to cart
    await page.click('text=Cart, a[href="/cart"]');
    await expect(page).toHaveURL(/.*cart/);
    
    // Verify cart has items
    await expect(page.locator('.cart-item')).toHaveCount(1);
  });

  test('user can proceed to checkout', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.click('.product-card:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    // Go to cart and checkout
    await page.goto('/cart');
    await page.click('button:has-text("Checkout")');
    
    // Should redirect to checkout page
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('user can fill shipping address', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill shipping form
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phone"]', '+919876543210');
    await page.fill('input[name="address"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="state"]', 'Test State');
    await page.fill('input[name="postalCode"]', '123456');
    
    // Continue to payment
    await page.click('button:has-text("Continue to Payment")');
    
    // Should show payment section
    await expect(page.locator('.payment-section')).toBeVisible();
  });

  test('user can complete order with Razorpay', async ({ page }) => {
    // This test requires Razorpay test mode credentials
    test.skip(process.env.NODE_ENV === 'production', 'Skip in production');
    
    await page.goto('/checkout');
    
    // Fill shipping form
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phone"]', '+919876543210');
    await page.fill('input[name="address"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="state"]', 'Test State');
    await page.fill('input[name="postalCode"]', '123456');
    await page.click('button:has-text("Continue to Payment")');
    
    // Select payment method
    await page.click('input[value="razorpay"]');
    await page.click('button:has-text("Place Order")');
    
    // Razorpay modal should appear (in test mode)
    await expect(page.locator('.razorpay-container, [class*="razorpay"]')).toBeVisible({ timeout: 10000 });
  });
});
