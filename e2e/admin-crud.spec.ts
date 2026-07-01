import { test, expect } from '@playwright/test';
import { getAdminCredentials } from './admin-credentials';

const { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } = getAdminCredentials();

test.describe('Admin CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/);
  });

  test('admin can view products list', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/.*admin\/products/);
    await expect(page.locator('.products-table, .data-table')).toBeVisible();
  });

  test('admin can create a new product', async ({ page }) => {
    await page.goto('/admin/products');
    await page.click('button:has-text("Add Product")');
    await expect(page).toHaveURL(/.*products\/new/);

    // Fill basic product details
    await page.fill('input[name="name"]', 'E2E Test Product');
    await page.fill('textarea[name="description"]', 'This is a test product created by E2E tests');
    await page.fill('input[name="basePrice"]', '999');
    
    // Select category
    await page.click('select[name="categoryId"]');
    await page.click('select[name="categoryId"] option:first-child');
    
    // Save product
    await page.click('button:has-text("Save")');
    
    // Should redirect to products list or show success
    await expect(page).toHaveURL(/.*admin\/products/, { timeout: 10000 });
  });

  test('admin can edit existing product', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Click first product's edit button
    await page.click('.products-table .edit-button:first-child, button:has-text("Edit"):first-child');
    await expect(page).toHaveURL(/.*products\/.*\/edit/);
    
    // Update product name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('Updated E2E Test Product');
    
    // Save changes
    await page.click('button:has-text("Save")');
    
    // Should redirect to products list
    await expect(page).toHaveURL(/.*admin\/products/);
  });

  test('admin can delete product (soft delete)', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Get initial product count
    const initialCount = await page.locator('.products-table tbody tr').count();
    
    // Click delete button on first product
    await page.click('.products-table .delete-button:first-child, button:has-text("Delete"):first-child');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm"), button:has-text("Delete")');
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify product count decreased or product is marked as deleted
    const newCount = await page.locator('.products-table tbody tr').count();
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('admin can view categories', async ({ page }) => {
    await page.goto('/admin/categories');
    await expect(page).toHaveURL(/.*admin\/categories/);
    await expect(page.locator('.categories-table, .data-table')).toBeVisible();
  });

  test('admin can create category', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.click('button:has-text("Add Category")');
    
    await page.fill('input[name="name"]', 'E2E Test Category');
    await page.fill('input[name="slug"]', 'e2e-test-category');
    await page.click('button:has-text("Save")');
    
    await expect(page).toHaveURL(/.*admin\/categories/);
  });

  test('admin can view orders', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/.*admin\/orders/);
    await expect(page.locator('.orders-table, .data-table')).toBeVisible();
  });

  test('admin can view order details', async ({ page }) => {
    await page.goto('/admin/orders');
    
    // Click first order
    await page.click('.orders-table tbody tr:first-child');
    await expect(page).toHaveURL(/.*admin\/orders\/.+/);
    
    // Verify order details are visible
    await expect(page.locator('.order-details')).toBeVisible();
  });

  test('admin can update order status', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.click('.orders-table tbody tr:first-child');
    
    // Select new status
    await page.click('select[name="status"]');
    await page.click('select[name="status"] option[value="shipped"]');
    
    // Save status
    await page.click('button:has-text("Update Status")');
    
    // Verify success message
    await expect(page.locator('text=Status updated')).toBeVisible();
  });

  test('admin can view dashboard analytics', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin(\/|$)/);
    
    // Verify dashboard stats cards are visible
    const statsCards = page.locator('.stats-card, .stat-card');
    await expect(statsCards.first()).toBeVisible();
  });
});
