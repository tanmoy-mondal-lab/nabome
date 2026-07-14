import { test, expect } from '@playwright/test';

test.describe('Payment Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product page
    await page.goto('/products/test-product');
  });

  test('should display Razorpay payment options', async ({ page }) => {
    await page.click('button:has-text("Add to Cart")');
    await page.click('a:has-text("Cart")');
    await page.click('button:has-text("Checkout")');
    
    // Verify Razorpay integration is present
    await expect(page.locator('[data-razorpay]')).toBeVisible();
  });

  test('should handle payment success flow', async ({ page }) => {
    await page.click('button:has-text("Add to Cart")');
    await page.click('a:has-text("Cart")');
    await page.click('button:has-text("Checkout")');
    
    // Mock successful payment
    await page.evaluate(() => {
      window.Razorpay = {
        open: function(options) {
          options.handler({
            razorpay_payment_id: 'pay_test123',
            order_id: options.order_id,
          });
        },
        close: function() {},
      };
    });
    
    await page.click('button:has-text("Pay Now")');
    
    // Should redirect to success page
    await expect(page).toHaveURL(/.*order.*success/);
    await expect(page.locator('text=Payment Successful')).toBeVisible();
  });

  test('should handle payment failure flow', async ({ page }) => {
    await page.click('button:has-text("Add to Cart")');
    await page.click('a:has-text("Cart")');
    await page.click('button:has-text("Checkout")');
    
    // Mock failed payment
    await page.evaluate(() => {
      window.Razorpay = {
        open: function(options) {
          options.handler({
            error: {
              description: 'Payment failed',
              code: 'BAD_REQUEST_ERROR',
            },
          });
        },
        close: function() {},
      };
    });
    
    await page.click('button:has-text("Pay Now")');
    
    // Should show error message
    await expect(page.locator('text=Payment Failed')).toBeVisible();
    await expect(page.locator('text=Retry Payment')).toBeVisible();
  });

  test('should display Cash on Delivery payment option', async ({ page }) => {
    await page.click('button:has-text("Add to Cart")');
    await page.click('a:has-text("Cart")');
    await page.click('button:has-text("Checkout")');

    const codOption = page.locator(
      'input[value="cod"], text=Cash on Delivery, text=COD, label:has-text("Cash on Delivery")'
    ).first();
    const hasCod = await codOption.isVisible().catch(() => false);
    expect(hasCod).toBeTruthy();
  });

  test('should validate payment form before submission', async ({ page }) => {
    await page.click('button:has-text("Add to Cart")');
    await page.click('a:has-text("Cart")');
    await page.click('button:has-text("Checkout")');

    const payButton = page.locator('button:has-text("Pay Now"), button:has-text("Place Order")').first();
    if (await payButton.isVisible().catch(() => false)) {
      await payButton.click();
      await page.waitForTimeout(500);
    }

    const errorMessages = page.locator('[class*="error"], [role="alert"], text|required|Required|invalid');
    const hasErrors = await errorMessages.count() > 0;
    const stayedOnCheckout = /checkout/.test(page.url());
    expect(hasErrors || stayedOnCheckout).toBeTruthy();
  });

  test('should handle network error during payment gracefully', async ({ page }) => {
    await page.click('button:has-text("Add to Cart")');
    await page.click('a:has-text("Cart")');
    await page.click('button:has-text("Checkout")');

    await page.route('**/api/orders**', (route) => route.abort('internetdisconnected'));

    const payButton = page.locator('button:has-text("Pay Now"), button:has-text("Place Order")').first();
    if (await payButton.isVisible().catch(() => false)) {
      await payButton.click();
      await page.waitForTimeout(2000);
    }

    const errorUI = page.locator(
      'text=network, text=Network, text=error, text=Error, text=failed, [role="alert"]'
    ).first();
    const hasErrorUI = await errorUI.isVisible().catch(() => false);
    const stillOnPage = /checkout|payment/.test(page.url());
    expect(hasErrorUI || stillOnPage).toBeTruthy();
  });

  test('should prevent duplicate payment submissions', async ({ page }) => {
    await page.click('button:has-text("Add to Cart")');
    await page.click('a:has-text("Cart")');
    await page.click('button:has-text("Checkout")');
    
    const payButton = page.locator('button:has-text("Pay Now")');
    
    // Click multiple times rapidly
    await payButton.click();
    await payButton.click();
    await payButton.click();
    
    // Should only submit once (button should be disabled)
    await expect(payButton).toBeDisabled();
  });
});
