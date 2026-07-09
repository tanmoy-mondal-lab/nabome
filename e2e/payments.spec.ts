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
