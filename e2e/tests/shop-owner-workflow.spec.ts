/**
 * Shop Owner Workflow E2E Tests
 *
 * End-to-end tests for the shop owner dashboard workflow
 */

import { test, expect } from '@playwright/test';

const SHOP_URL = process.env.E2E_SHOP_URL ?? 'http://localhost:5175';

test.describe('Shop Owner Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SHOP_URL);
  });

  test('should display dashboard with navigation', async ({ page }) => {
    // Check if dashboard loads
    await expect(page).toHaveTitle(/Shop/);

    // Check for navigation items
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Products')).toBeVisible();
    await expect(page.getByText('Orders')).toBeVisible();
    await expect(page.getByText('Customers')).toBeVisible();
    await expect(page.getByText('Analytics')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.getByText('Products').click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.getByText('Orders').click();
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.getByText('Orders')).toBeVisible();
  });

  test('should navigate to customers page', async ({ page }) => {
    await page.getByText('Customers').click();
    await expect(page).toHaveURL(/\/customers/);
    await expect(page.getByText('Customers')).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.getByText('Settings').click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('should display settings tabs', async ({ page }) => {
    await page.getByText('Settings').click();

    await expect(page.getByText('Business Profile')).toBeVisible();
    await expect(page.getByText('Shipping')).toBeVisible();
    await expect(page.getByText('Tax')).toBeVisible();
    await expect(page.getByText('Payments')).toBeVisible();
    await expect(page.getByText('Notifications')).toBeVisible();
    await expect(page.getByText('Staff')).toBeVisible();
    await expect(page.getByText('Coupons')).toBeVisible();
  });

  test('should switch between settings tabs', async ({ page }) => {
    await page.getByText('Settings').click();

    // Click on Coupons tab
    await page.getByText('Coupons').click();
    await expect(page.getByText('Coupons & Discounts')).toBeVisible();
    await expect(page.getByText('Create Coupon')).toBeVisible();

    // Click on Staff tab
    await page.getByText('Staff').click();
    await expect(page.getByText('Staff Members')).toBeVisible();
    await expect(page.getByText('Add Staff')).toBeVisible();
  });

  test('should toggle mobile navigation', async ({ page }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /open navigation/i });
    await expect(menuButton).toBeVisible();

    // Open mobile navigation
    await menuButton.click();
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Products')).toBeVisible();

    // Close mobile navigation
    const closeButton = page.getByRole('button', { name: /close navigation/i });
    await closeButton.click();
  });

  test('should display skip navigation link on focus', async ({ page }) => {
    // Tab to the skip link
    await page.keyboard.press('Tab');

    // Skip link should become visible on focus
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    const themeButton = page.getByRole('button', { name: /dark|light/i });
    const initialText = await themeButton.textContent();

    await themeButton.click();

    // Theme button text should change
    const newText = await themeButton.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should display logout button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();
  });

  test('should display exit button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /exit/i })).toBeVisible();
  });
});

test.describe('Shop Owner - Products Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SHOP_URL}/products`);
  });

  test('should display products list', async ({ page }) => {
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('should display pagination controls', async ({ page }) => {
    // Pagination controls should be present
    const pagination = page
      .locator('button')
      .filter({ hasText: /previous|next/i });
    await expect(pagination.first()).toBeVisible();
  });
});

test.describe('Shop Owner - Orders Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SHOP_URL}/orders`);
  });

  test('should display orders list', async ({ page }) => {
    await expect(page.getByText('Orders')).toBeVisible();
  });

  test('should display order queues', async ({ page }) => {
    // Order queues should be present
    await expect(
      page.getByText(/processing|packing|fulfillment/i),
    ).toBeVisible();
  });
});

test.describe('Shop Owner - Customers Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SHOP_URL}/customers`);
  });

  test('should display customers list', async ({ page }) => {
    await expect(page.getByText('Customers')).toBeVisible();
  });

  test('should display pagination controls', async ({ page }) => {
    const pagination = page
      .locator('button')
      .filter({ hasText: /previous|next/i });
    await expect(pagination.first()).toBeVisible();
  });
});
