# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-flows.spec.ts >> Admin - Products Management >> admin can fill new product form
- Location: e2e/admin-flows.spec.ts:98:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:5173/auth/register"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - link "নবME" [ref=e7] [cursor=pointer]:
        - /url: /
      - heading "Create an account" [level=1] [ref=e8]
      - paragraph [ref=e9]: Join the নবME family
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: First Name *
          - textbox "First Name *" [ref=e14]:
            - /placeholder: John
        - generic [ref=e15]:
          - generic [ref=e16]: Last Name
          - textbox "Last Name" [ref=e17]:
            - /placeholder: Doe
      - generic [ref=e18]:
        - generic [ref=e19]: Email *
        - textbox "Email *" [ref=e20]:
          - /placeholder: your@email.com
      - generic [ref=e21]:
        - generic [ref=e22]: Phone (optional)
        - generic [ref=e23]:
          - generic [ref=e24]:
            - combobox [ref=e25] [cursor=pointer]:
              - option "US +1"
              - option "CA +1"
              - option "UK +44"
              - option "IN +91" [selected]
              - option "AU +61"
              - option "JP +81"
              - option "CN +86"
              - option "DE +49"
              - option "FR +33"
              - option "IT +39"
              - option "RU +7"
              - option "BR +55"
              - option "KR +82"
              - option "SG +65"
              - option "AE +971"
              - option "SA +966"
              - option "QA +974"
              - option "OM +968"
              - option "BH +973"
              - option "BD +880"
              - option "PK +92"
              - option "LK +94"
              - option "NP +977"
              - option "MY +60"
              - option "PH +63"
              - option "ID +62"
              - option "NZ +64"
              - option "ZA +27"
              - option "EG +20"
              - option "NG +234"
              - option "KE +254"
              - option "GH +233"
              - option "PT +351"
              - option "ES +34"
              - option "NL +31"
              - option "BE +32"
              - option "CH +41"
              - option "SE +46"
              - option "NO +47"
              - option "DK +45"
              - option "FI +358"
              - option "GR +30"
              - option "PL +48"
              - option "HU +36"
              - option "CZ +420"
              - option "AT +43"
              - option "IE +353"
              - option "HK +852"
              - option "TW +886"
            - img
          - textbox "Phone (optional)" [ref=e26]:
            - /placeholder: "9876543210"
      - generic [ref=e27]:
        - generic [ref=e28]: Password *
        - generic [ref=e29]:
          - textbox "Password *" [ref=e30]:
            - /placeholder: Min. 8 characters
          - button "Show password" [ref=e31] [cursor=pointer]:
            - img [ref=e32]
      - generic [ref=e35]:
        - generic [ref=e36]: Confirm Password *
        - generic [ref=e37]:
          - textbox "Confirm Password *" [ref=e38]:
            - /placeholder: Re-enter password
          - button "Show password" [ref=e39] [cursor=pointer]:
            - img [ref=e40]
      - button "Create Account" [ref=e43] [cursor=pointer]
    - paragraph [ref=e44]:
      - text: Already have an account?
      - link "Sign in" [ref=e45] [cursor=pointer]:
        - /url: /auth/login
  - generic [ref=e48]:
    - paragraph [ref=e49]:
      - text: Join the
      - text: Inner Circle
    - paragraph [ref=e50]: Exclusive access • Early drops • Member benefits
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nabome.online';
  4   | const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456!';
  5   | 
  6   | test.describe('Admin - Auth & Dashboard', () => {
  7   |   test('admin can login', async ({ page }) => {
  8   |     await page.goto('/auth/login');
  9   |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  10  |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  11  |     await page.click('button[type="submit"]');
  12  |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  13  |   });
  14  | 
  15  |   test('admin dashboard loads with stats', async ({ page }) => {
  16  |     await page.goto('/auth/login');
  17  |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  18  |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  19  |     await page.click('button[type="submit"]');
  20  |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  21  |     await expect(page).toHaveURL(/.*admin/);
  22  |     const stats = page.locator('[class*="stat"], [class*="card"], [data-testid*="stat"]').first();
  23  |     await expect(stats).toBeVisible({ timeout: 5000 });
  24  |   });
  25  | 
  26  |   test('admin can logout', async ({ page }) => {
  27  |     await page.goto('/auth/login');
  28  |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  29  |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  30  |     await page.click('button[type="submit"]');
  31  |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  32  | 
  33  |     const signOutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("Log out")').first();
  34  |     if (await signOutBtn.isVisible()) {
  35  |       await signOutBtn.click();
  36  |       await page.waitForTimeout(1000);
  37  |     }
  38  |   });
  39  | 
  40  |   test('admin sidebar has navigation groups', async ({ page }) => {
  41  |     await page.goto('/auth/login');
  42  |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  43  |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  44  |     await page.click('button[type="submit"]');
  45  |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  46  | 
  47  |     const sidebar = page.locator('[class*="sidebar"], nav, [class*="AdminLayout"] nav').first();
  48  |     await expect(sidebar).toBeVisible();
  49  |   });
  50  | 
  51  |   test('admin can view site', async ({ page }) => {
  52  |     await page.goto('/auth/login');
  53  |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  54  |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  55  |     await page.click('button[type="submit"]');
  56  |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  57  | 
  58  |     const viewSiteBtn = page.locator('a:has-text("View Site"), a[href="/"]').first();
  59  |     if (await viewSiteBtn.isVisible().catch(() => false)) {
  60  |       await viewSiteBtn.click();
  61  |       await page.waitForTimeout(1000);
  62  |     }
  63  |   });
  64  | });
  65  | 
  66  | test.describe('Admin - Products Management', () => {
  67  |   test.beforeEach(async ({ page }) => {
  68  |     await page.goto('/auth/login');
  69  |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  70  |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  71  |     await page.click('button[type="submit"]');
> 72  |     await page.waitForURL(/.*admin/, { timeout: 10000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  73  |   });
  74  | 
  75  |   test('products list page loads', async ({ page }) => {
  76  |     await page.goto('/admin/products');
  77  |     await expect(page).toHaveURL(/.*admin\/products/);
  78  |     await page.waitForTimeout(1000);
  79  |   });
  80  | 
  81  |   test('products page has add product button', async ({ page }) => {
  82  |     await page.goto('/admin/products');
  83  |     await page.waitForTimeout(1000);
  84  |     const addBtn = page.locator('button:has-text("Add Product"), a:has-text("Add Product"), button:has-text("New Product")').first();
  85  |     await expect(addBtn).toBeVisible();
  86  |   });
  87  | 
  88  |   test('admin can open new product form', async ({ page }) => {
  89  |     await page.goto('/admin/products');
  90  |     await page.waitForTimeout(1000);
  91  |     const addBtn = page.locator('button:has-text("Add Product"), a:has-text("Add Product"), button:has-text("New Product")').first();
  92  |     await addBtn.click();
  93  |     await page.waitForTimeout(1000);
  94  |     const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
  95  |     await expect(nameInput).toBeVisible({ timeout: 5000 });
  96  |   });
  97  | 
  98  |   test('admin can fill new product form', async ({ page }) => {
  99  |     await page.goto('/admin/products/new');
  100 |     await page.waitForTimeout(1000);
  101 |     const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
  102 |     if (await nameInput.isVisible()) {
  103 |       await nameInput.fill('E2E Test Product ' + Date.now());
  104 |     }
  105 |     const priceInput = page.locator('input[name="basePrice"], input[name="price"], input[placeholder*="price" i]').first();
  106 |     if (await priceInput.isVisible()) {
  107 |       await priceInput.fill('1299');
  108 |     }
  109 |   });
  110 | 
  111 |   test('admin can search products', async ({ page }) => {
  112 |     await page.goto('/admin/products');
  113 |     await page.waitForTimeout(1000);
  114 |     const searchInput = page.locator('input[placeholder*="search" i], input[type="search"], input[name="search"]').first();
  115 |     if (await searchInput.isVisible()) {
  116 |       await searchInput.fill('test');
  117 |       await page.waitForTimeout(500);
  118 |     }
  119 |   });
  120 | 
  121 |   test('admin can filter products', async ({ page }) => {
  122 |     await page.goto('/admin/products');
  123 |     await page.waitForTimeout(1000);
  124 |     const filterBtn = page.locator('button:has-text("Filter"), [class*="filter"], select').first();
  125 |     if (await filterBtn.isVisible().catch(() => false)) {
  126 |       await filterBtn.click();
  127 |       await page.waitForTimeout(300);
  128 |     }
  129 |   });
  130 | });
  131 | 
  132 | test.describe('Admin - Categories Management', () => {
  133 |   test.beforeEach(async ({ page }) => {
  134 |     await page.goto('/auth/login');
  135 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  136 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  137 |     await page.click('button[type="submit"]');
  138 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  139 |   });
  140 | 
  141 |   test('categories list page loads', async ({ page }) => {
  142 |     await page.goto('/admin/categories');
  143 |     await expect(page).toHaveURL(/.*admin\/categories/);
  144 |     await page.waitForTimeout(1000);
  145 |   });
  146 | 
  147 |   test('categories page has add category button', async ({ page }) => {
  148 |     await page.goto('/admin/categories');
  149 |     await page.waitForTimeout(1000);
  150 |     const addBtn = page.locator('button:has-text("Add Category"), a:has-text("Add Category")').first();
  151 |     await expect(addBtn).toBeVisible();
  152 |   });
  153 | });
  154 | 
  155 | test.describe('Admin - Orders Management', () => {
  156 |   test.beforeEach(async ({ page }) => {
  157 |     await page.goto('/auth/login');
  158 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  159 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  160 |     await page.click('button[type="submit"]');
  161 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  162 |   });
  163 | 
  164 |   test('orders list page loads', async ({ page }) => {
  165 |     await page.goto('/admin/orders');
  166 |     await expect(page).toHaveURL(/.*admin\/orders/);
  167 |     await page.waitForTimeout(1000);
  168 |   });
  169 | 
  170 |   test('orders page has filter/search', async ({ page }) => {
  171 |     await page.goto('/admin/orders');
  172 |     await page.waitForTimeout(1000);
```