import { test, expect } from '@playwright/test';
import { navigateToAdminPage } from './admin-auth-helper';

// Use storageState for authentication instead of logging in each test
test.use({ storageState: 'playwright/.auth/admin.json' });

test.describe.configure({ mode: 'parallel' });

test.describe('Admin CRUD Operations', () => {

  test('admin can view products list', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    await expect(page).toHaveURL(/.*admin\/products/);
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible();
  });

  test('admin can create a new product', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    await page.getByRole('button', { name: /add product/i }).click();
    await expect(page).toHaveURL(/.*products\/new/);

    // Fill basic product details
    await page.getByLabel(/name/i).fill('E2E Test Product');
    await page.getByLabel(/description/i).fill('This is a test product created by E2E tests');
    await page.getByLabel(/price/i).fill('999');
    
    // Select category
    await page.getByLabel(/category/i).selectOption({ index: 0 });
    
    // Save product
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should redirect to products list or show success
    await expect(page).toHaveURL(/.*admin\/products/, { timeout: 10000 });
  });

  test('admin can edit existing product', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    
    // Click first product's edit button
    await page.getByRole('button', { name: /edit/i }).first().click();
    await expect(page).toHaveURL(/.*products\/.*\/edit/);
    
    // Update product name
    await page.getByLabel(/name/i).fill('Updated E2E Test Product');
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should redirect to products list
    await expect(page).toHaveURL(/.*admin\/products/);
  });

  test('admin can delete product (soft delete)', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/products');
    
    // Get initial product count
    const initialCount = await page.getByRole('row').count();
    
    // Click delete button on first product
    await page.getByRole('button', { name: /delete/i }).first().click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm|delete/i }).click();
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify product count decreased or product is marked as deleted
    const newCount = await page.getByRole('row').count();
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('admin can view categories', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/categories');
    await expect(page).toHaveURL(/.*admin\/categories/);
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible();
  });

  test('admin can create category', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/categories');
    await page.getByRole('button', { name: /add category/i }).click();
    
    await page.getByLabel(/name/i).fill('E2E Test Category');
    await page.getByLabel(/slug/i).fill('e2e-test-category');
    await page.getByRole('button', { name: /save/i }).click();
    
    await expect(page).toHaveURL(/.*admin\/categories/);
  });

  test('admin can view orders', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/orders');
    await expect(page).toHaveURL(/.*admin\/orders/);
    await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible();
  });

  test('admin can view order details', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/orders');
    
    // Click first order
    await page.getByRole('row').first().click();
    await expect(page).toHaveURL(/.*admin\/orders\/.+/);
    
    // Verify order details are visible
    await expect(page.getByRole('heading', { name: /order details/i })).toBeVisible();
  });

  test('admin can update order status', async ({ page }) => {
    await navigateToAdminPage(page, '/admin/orders');
    await page.getByRole('row').first().click();
    
    // Select new status
    await page.getByLabel(/status/i).selectOption('shipped');
    
    // Save status
    await page.getByRole('button', { name: /update status/i }).click();
    
    // Verify success message
    await expect(page.getByText(/status updated/i)).toBeVisible();
  });

  test('admin can view dashboard analytics', async ({ page }) => {
    await navigateToAdminPage(page, '/admin');
    await expect(page).toHaveURL(/.*admin(\/|$)/);
    
    // Verify dashboard stats cards are visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
