import { test, expect } from '@playwright/test';

test.describe('Returns and Refunds', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer with completed order
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
  });

  test('should display return request form', async ({ page }) => {
    await page.goto('/orders');
    await page.click('[data-testid="order-item"]:first-child');
    await page.click('button:has-text("Request Return")');
    
    await expect(page.locator('h1:has-text("Request Return")')).toBeVisible();
    await expect(page.locator('select[name="reason"]')).toBeVisible();
  });

  test('should submit return request', async ({ page }) => {
    await page.goto('/orders');
    await page.click('[data-testid="order-item"]:first-child');
    await page.click('button:has-text("Request Return")');
    
    // Fill return form
    await page.selectOption('select[name="reason"]', 'size_issue');
    await page.fill('textarea[name="reasonDetail"]', 'Item does not fit as expected');
    
    await page.click('button:has-text("Submit Request")');
    
    // Should show success message
    await expect(page.locator('text=Return request submitted')).toBeVisible();
  });

  test('should display return status', async ({ page }) => {
    await page.goto('/orders');
    await page.click('[data-testid="order-item"]:first-child');
    
    // Check if return status is visible
    await expect(page.locator('[data-testid="return-status"]')).toBeVisible();
  });

  test('should upload return evidence images', async ({ page }) => {
    await page.goto('/orders');
    await page.click('[data-testid="order-item"]:first-child');
    await page.click('button:has-text("Request Return")');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-assets/evidence.jpg');
    
    // Should show preview
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
  });

  test('should show refund status after return approval', async ({ page }) => {
    await page.goto('/orders');
    await page.click('[data-testid="order-item"]:first-child');
    
    // Navigate to return details
    await page.click('[data-testid="return-details"]');
    
    // Should show refund status
    await expect(page.locator('[data-testid="refund-status"]')).toBeVisible();
  });
});
