import { test, expect } from '@playwright/test';

test.describe('Wishlist Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('should add product to wishlist', async ({ page }) => {
    const wishlistButton = page.locator('[data-testid="wishlist-button"]').first();
    
    await expect(wishlistButton).toBeVisible();
    await wishlistButton.click();
    
    // Should show success toast
    await expect(page.locator('text=Added to wishlist')).toBeVisible();
    
    // Button should show as active
    await expect(wishlistButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should remove product from wishlist', async ({ page }) => {
    const wishlistButton = page.locator('[data-testid="wishlist-button"]').first();
    
    // Add to wishlist first
    await wishlistButton.click();
    await page.waitForTimeout(500);
    
    // Remove from wishlist
    await wishlistButton.click();
    
    // Should show success toast
    await expect(page.locator('text=Removed from wishlist')).toBeVisible();
    
    // Button should show as inactive
    await expect(wishlistButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should display wishlist page', async ({ page }) => {
    await page.click('a:has-text("Wishlist")');
    
    await expect(page).toHaveURL('/wishlist');
    await expect(page.locator('h1:has-text("My Wishlist")')).toBeVisible();
  });

  test('should move wishlist item to cart', async ({ page }) => {
    // Add product to wishlist
    const wishlistButton = page.locator('[data-testid="wishlist-button"]').first();
    await wishlistButton.click();
    
    // Navigate to wishlist
    await page.click('a:has-text("Wishlist")');
    
    // Click move to cart button
    await page.click('button:has-text("Move to Cart")');
    
    // Should show success message
    await expect(page.locator('text=Added to cart')).toBeVisible();
    
    // Navigate to cart to verify
    await page.click('a:has-text("Cart")');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('should handle empty wishlist state', async ({ page }) => {
    await page.goto('/wishlist');
    
    // Should show empty state
    await expect(page.locator('text=Your wishlist is empty')).toBeVisible();
    await expect(page.locator('text=Save items you love')).toBeVisible();
  });
});
