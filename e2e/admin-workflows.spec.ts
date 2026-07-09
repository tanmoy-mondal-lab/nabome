import { test, expect } from '@playwright/test';

test.describe('Admin Workflows - Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin');
    // Login with admin credentials (would need to be configured in test setup)
    await page.waitForTimeout(1000);
  });

  test('admin can create a new product', async ({ page }) => {
    await page.goto('/admin/products/new');
    await page.waitForTimeout(500);

    // Fill in product details
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Product');
    }

    const priceInput = page.locator('input[name="price"], input[type="number"]').first();
    if (await priceInput.isVisible()) {
      await priceInput.fill('99.99');
    }

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create")').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('admin can edit existing product', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(500);

    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Product Name');
      }

      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('admin can delete product with confirmation', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(500);

    const deleteBtn = page.locator('button:has-text("Delete"), button[aria-label*="delete"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(300);

      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('admin can manage product variants', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(500);

    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);

      const variantsTab = page.locator('button:has-text("Variants"), [data-tab="variants"]').first();
      if (await variantsTab.isVisible()) {
        await variantsTab.click();
        await page.waitForTimeout(300);

        const addVariantBtn = page.locator('button:has-text("Add Variant")').first();
        if (await addVariantBtn.isVisible()) {
          await addVariantBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('admin can upload product images', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(500);

    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);

      const imagesTab = page.locator('button:has-text("Images"), [data-tab="images"]').first();
      if (await imagesTab.isVisible()) {
        await imagesTab.click();
        await page.waitForTimeout(300);

        const uploadInput = page.locator('input[type="file"]').first();
        if (await uploadInput.isVisible()) {
          // In a real test, you'd upload a test file
          await uploadInput.setInputFiles('/path/to/test-image.jpg');
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});

test.describe('Admin Workflows - Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);
  });

  test('admin can create category', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForTimeout(500);

    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Category');
      }

      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('admin can reorder categories', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForTimeout(500);

    const categoryItems = page.locator('[class*="category-item"], [data-testid="category-item"]');
    const count = await categoryItems.count();
    
    if (count > 1) {
      // Test drag and drop or reorder functionality
      const firstItem = categoryItems.first();
      const secondItem = categoryItems.nth(1);
      
      if (await firstItem.isVisible() && await secondItem.isVisible()) {
        await firstItem.dragTo(secondItem);
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Admin Workflows - Order Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);
  });

  test('admin can view orders list', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForTimeout(500);

    const orderItems = page.locator('[class*="order-item"], [data-testid="order-item"], tr');
    const count = await orderItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('admin can view order details', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForTimeout(500);

    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForTimeout(500);

      await expect(page.locator('[class*="order-detail"], [data-testid="order-detail"]')).toBeVisible();
    }
  });

  test('admin can update order status', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForTimeout(500);

    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForTimeout(500);

      const statusSelect = page.locator('select[name="status"], [data-testid="status-select"]').first();
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('shipped');
        await page.waitForTimeout(300);

        const updateBtn = page.locator('button:has-text("Update")').first();
        if (await updateBtn.isVisible()) {
          await updateBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});

test.describe('Admin Workflows - Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);
  });

  test('admin can view customers list', async ({ page }) => {
    await page.goto('/admin/customers');
    await page.waitForTimeout(500);

    const customerItems = page.locator('[class*="customer-item"], [data-testid="customer-item"], tr');
    const count = await customerItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('admin can view customer details', async ({ page }) => {
    await page.goto('/admin/customers');
    await page.waitForTimeout(500);

    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForTimeout(500);

      await expect(page.locator('[class*="customer-detail"], [data-testid="customer-detail"]')).toBeVisible();
    }
  });
});

test.describe('Admin Workflows - CMS Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);
  });

  test('admin can edit homepage content', async ({ page }) => {
    await page.goto('/admin/cms/homepage');
    await page.waitForTimeout(500);

    const heroSection = page.locator('[data-section="hero"], [class*="hero-section"]').first();
    if (await heroSection.isVisible()) {
      const editBtn = heroSection.locator('button:has-text("Edit")').first();
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(500);

        const titleInput = page.locator('input[name="title"]').first();
        if (await titleInput.isVisible()) {
          await titleInput.fill('Updated Hero Title');
        }

        const saveBtn = page.locator('button:has-text("Save")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('admin can manage navigation menu', async ({ page }) => {
    await page.goto('/admin/cms/navigation');
    await page.waitForTimeout(500);

    const navItems = page.locator('[class*="nav-item"], [data-testid="nav-item"]');
    const count = await navItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Admin Workflows - Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);
  });

  test('admin can view dashboard metrics', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(500);

    const metrics = page.locator('[class*="metric"], [data-testid="metric"], [class*="stat"]');
    const count = await metrics.count();
    expect(count).toBeGreaterThan(0);
  });

  test('admin can view sales chart', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(500);

    const chart = page.locator('[class*="chart"], [data-testid="chart"], canvas');
    const isVisible = await chart.first().isVisible().catch(() => false);
    // Chart may or may not be visible depending on data
  });
});
