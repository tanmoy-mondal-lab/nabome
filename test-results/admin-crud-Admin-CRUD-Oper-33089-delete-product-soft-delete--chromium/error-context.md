# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-crud.spec.ts >> Admin CRUD Operations >> admin can delete product (soft delete)
- Location: e2e/admin-crud.spec.ts:58:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - paragraph
    - generic [ref=e8]:
      - navigation [ref=e10]:
        - link "Men" [ref=e12] [cursor=pointer]:
          - /url: /products?category=men
          - text: Men
          - img [ref=e13]
        - link "Women" [ref=e16] [cursor=pointer]:
          - /url: /products?category=women
          - text: Women
          - img [ref=e17]
        - link "Accessories" [ref=e20] [cursor=pointer]:
          - /url: /products?category=accessories
          - text: Accessories
          - img [ref=e21]
        - link "Collections" [ref=e24] [cursor=pointer]:
          - /url: /products
          - text: Collections
        - link "Lookbook" [ref=e26] [cursor=pointer]:
          - /url: /lookbooks
          - text: Lookbook
      - link "নবME" [ref=e28] [cursor=pointer]:
        - /url: /
      - generic [ref=e29]:
        - button "Search" [ref=e30] [cursor=pointer]:
          - img [ref=e31]
        - link "Wishlist" [ref=e34] [cursor=pointer]:
          - /url: /auth/login
          - img [ref=e35]
        - link "Notifications" [ref=e37] [cursor=pointer]:
          - /url: /auth/login
          - img [ref=e38]
        - link "Account" [ref=e41] [cursor=pointer]:
          - /url: /auth/login
          - img [ref=e42]
        - button "Cart" [ref=e45] [cursor=pointer]:
          - img [ref=e46]
  - link "Skip to content" [ref=e50] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e51]:
    - generic [ref=e54]:
      - heading "Page Not Found" [level=1] [ref=e55]
      - paragraph [ref=e56]: The page you're looking for doesn't exist or has been removed.
  - contentinfo [ref=e57]:
    - generic [ref=e59]:
      - generic [ref=e60]:
        - paragraph [ref=e61]: Stay Connected
        - paragraph [ref=e62]: Join the नबME Inner Circle
      - generic [ref=e64]:
        - textbox "Enter your email" [ref=e65]
        - button "Subscribe" [ref=e66] [cursor=pointer]
    - generic [ref=e68]:
      - generic [ref=e69]:
        - link "নবME" [ref=e70] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e71]: Premium Fashion Destination
        - generic [ref=e72]:
          - link [ref=e73] [cursor=pointer]:
            - /url: https://instagram.com/nabome
            - img [ref=e74]
          - link [ref=e77] [cursor=pointer]:
            - /url: https://youtube.com/@nabome
            - img [ref=e78]
      - generic [ref=e82]:
        - heading "নবME" [level=4] [ref=e83]
        - paragraph [ref=e84]: Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.
      - heading "Shop" [level=4] [ref=e87]
      - heading "Support" [level=4] [ref=e90]
      - heading "Connect" [level=4] [ref=e93]
      - generic [ref=e94]:
        - heading "Contact" [level=4] [ref=e95]
        - generic [ref=e96]:
          - paragraph [ref=e97]: hello@nabome.com
          - paragraph [ref=e98]: +91-1800-নবME
    - generic [ref=e100]:
      - paragraph [ref=e101]: © 2026 নবME. All rights reserved.
      - generic [ref=e102]:
        - link "FAQ" [ref=e103] [cursor=pointer]:
          - /url: /faq
        - link "Privacy Policy" [ref=e104] [cursor=pointer]:
          - /url: /privacy
        - link "Terms of Service" [ref=e105] [cursor=pointer]:
          - /url: /terms
        - link "Shipping & Returns" [ref=e106] [cursor=pointer]:
          - /url: /shipping-returns
      - button "Back to top" [ref=e107] [cursor=pointer]:
        - text: Back to top
        - img [ref=e108]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Admin CRUD Operations', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Login as admin
  6   |     await page.goto('/login');
> 7   |     await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@nabome.online');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  8   |     await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'Admin123456!');
  9   |     await page.click('button[type="submit"]');
  10  |     await page.waitForURL(/.*admin/);
  11  |   });
  12  | 
  13  |   test('admin can view products list', async ({ page }) => {
  14  |     await page.goto('/admin/products');
  15  |     await expect(page).toHaveURL(/.*admin\/products/);
  16  |     await expect(page.locator('.products-table, .data-table')).toBeVisible();
  17  |   });
  18  | 
  19  |   test('admin can create a new product', async ({ page }) => {
  20  |     await page.goto('/admin/products');
  21  |     await page.click('button:has-text("Add Product")');
  22  |     await expect(page).toHaveURL(/.*products\/new/);
  23  | 
  24  |     // Fill basic product details
  25  |     await page.fill('input[name="name"]', 'E2E Test Product');
  26  |     await page.fill('textarea[name="description"]', 'This is a test product created by E2E tests');
  27  |     await page.fill('input[name="basePrice"]', '999');
  28  |     
  29  |     // Select category
  30  |     await page.click('select[name="categoryId"]');
  31  |     await page.click('select[name="categoryId"] option:first-child');
  32  |     
  33  |     // Save product
  34  |     await page.click('button:has-text("Save")');
  35  |     
  36  |     // Should redirect to products list or show success
  37  |     await expect(page).toHaveURL(/.*admin\/products/, { timeout: 10000 });
  38  |   });
  39  | 
  40  |   test('admin can edit existing product', async ({ page }) => {
  41  |     await page.goto('/admin/products');
  42  |     
  43  |     // Click first product's edit button
  44  |     await page.click('.products-table .edit-button:first-child, button:has-text("Edit"):first-child');
  45  |     await expect(page).toHaveURL(/.*products\/.*\/edit/);
  46  |     
  47  |     // Update product name
  48  |     const nameInput = page.locator('input[name="name"]');
  49  |     await nameInput.fill('Updated E2E Test Product');
  50  |     
  51  |     // Save changes
  52  |     await page.click('button:has-text("Save")');
  53  |     
  54  |     // Should redirect to products list
  55  |     await expect(page).toHaveURL(/.*admin\/products/);
  56  |   });
  57  | 
  58  |   test('admin can delete product (soft delete)', async ({ page }) => {
  59  |     await page.goto('/admin/products');
  60  |     
  61  |     // Get initial product count
  62  |     const initialCount = await page.locator('.products-table tbody tr').count();
  63  |     
  64  |     // Click delete button on first product
  65  |     await page.click('.products-table .delete-button:first-child, button:has-text("Delete"):first-child');
  66  |     
  67  |     // Confirm deletion
  68  |     await page.click('button:has-text("Confirm"), button:has-text("Delete")');
  69  |     
  70  |     // Wait for deletion to complete
  71  |     await page.waitForTimeout(1000);
  72  |     
  73  |     // Verify product count decreased or product is marked as deleted
  74  |     const newCount = await page.locator('.products-table tbody tr').count();
  75  |     expect(newCount).toBeLessThanOrEqual(initialCount);
  76  |   });
  77  | 
  78  |   test('admin can view categories', async ({ page }) => {
  79  |     await page.goto('/admin/categories');
  80  |     await expect(page).toHaveURL(/.*admin\/categories/);
  81  |     await expect(page.locator('.categories-table, .data-table')).toBeVisible();
  82  |   });
  83  | 
  84  |   test('admin can create category', async ({ page }) => {
  85  |     await page.goto('/admin/categories');
  86  |     await page.click('button:has-text("Add Category")');
  87  |     
  88  |     await page.fill('input[name="name"]', 'E2E Test Category');
  89  |     await page.fill('input[name="slug"]', 'e2e-test-category');
  90  |     await page.click('button:has-text("Save")');
  91  |     
  92  |     await expect(page).toHaveURL(/.*admin\/categories/);
  93  |   });
  94  | 
  95  |   test('admin can view orders', async ({ page }) => {
  96  |     await page.goto('/admin/orders');
  97  |     await expect(page).toHaveURL(/.*admin\/orders/);
  98  |     await expect(page.locator('.orders-table, .data-table')).toBeVisible();
  99  |   });
  100 | 
  101 |   test('admin can view order details', async ({ page }) => {
  102 |     await page.goto('/admin/orders');
  103 |     
  104 |     // Click first order
  105 |     await page.click('.orders-table tbody tr:first-child');
  106 |     await expect(page).toHaveURL(/.*admin\/orders\/.+/);
  107 |     
```