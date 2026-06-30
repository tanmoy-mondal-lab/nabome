# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer-journey.spec.ts >> Customer Journey - Browse to Purchase >> user can navigate between pages using header
- Location: e2e/customer-journey.spec.ts:93:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - generic:
        - navigation
      - link "নবME" [ref=e8] [cursor=pointer]:
        - /url: /
      - generic [ref=e9]:
        - button "Search" [ref=e10] [cursor=pointer]:
          - img [ref=e11]
        - link "Wishlist" [ref=e14] [cursor=pointer]:
          - /url: /auth/login
          - img [ref=e15]
        - link "Notifications" [ref=e17] [cursor=pointer]:
          - /url: /auth/login
          - img [ref=e18]
        - link "Account" [ref=e21] [cursor=pointer]:
          - /url: /auth/login
          - img [ref=e22]
        - button "Cart" [ref=e25] [cursor=pointer]:
          - img [ref=e26]
  - link "Skip to content" [ref=e30] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e31]
  - contentinfo [ref=e35]:
    - generic [ref=e37]:
      - generic [ref=e38]:
        - paragraph [ref=e39]: Stay Connected
        - paragraph [ref=e40]: Join the নবME Inner Circle
      - generic [ref=e42]:
        - textbox "Enter your email" [ref=e43]
        - button "Subscribe" [ref=e44] [cursor=pointer]
    - generic [ref=e46]:
      - generic [ref=e47]:
        - link "নবME" [ref=e48] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e49]: Premium fashion for the discerning individual. Curated collections delivered worldwide.
      - generic [ref=e50]:
        - heading "Contact" [level=4] [ref=e51]
        - generic [ref=e52]:
          - paragraph [ref=e53]: hello@নবME.com
          - paragraph [ref=e54]: +91 1800 123 4567
    - generic [ref=e56]:
      - paragraph [ref=e57]: © 2026 নবME. All rights reserved.
      - button "Back to top" [ref=e58] [cursor=pointer]:
        - text: Back to top
        - img [ref=e59]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Customer Journey - Browse to Purchase', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/');
  6   |   });
  7   | 
  8   |   test('homepage loads with hero, featured products, and footer', async ({ page }) => {
  9   |     await expect(page).toHaveURL('/');
  10  |     await expect(page).toHaveTitle(/.*Nabo.?me/i);
  11  | 
  12  |     const hero = page.locator('[class*="hero"], [data-testid="hero"], .hero-section, section:first-of-type');
  13  |     await expect(hero.first()).toBeVisible();
  14  | 
  15  |     const productCards = page.locator('[class*="product-card"], [data-testid="product-card"], .product-card');
  16  |     const count = await productCards.count();
  17  |     expect(count).toBeGreaterThanOrEqual(0);
  18  | 
  19  |     const footer = page.locator('footer');
  20  |     await expect(footer).toBeVisible();
  21  |   });
  22  | 
  23  |   test('user can browse products and navigate to detail', async ({ page }) => {
  24  |     await page.goto('/products');
  25  |     await expect(page).toHaveURL(/.*products/);
  26  | 
  27  |     const productCards = page.locator('[class*="product-card"], .product-card, a[href*="/products/"]');
  28  |     await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  29  | 
  30  |     await productCards.first().click();
  31  |     await expect(page).toHaveURL(/.*products\/.+/);
  32  | 
  33  |     await expect(page.locator('[class*="product-detail"], [data-testid="product-detail"], main')).toBeVisible();
  34  |   });
  35  | 
  36  |   test('user can filter products by category', async ({ page }) => {
  37  |     await page.goto('/products');
  38  | 
  39  |     const categoryFilter = page.locator('[class*="filter"], [data-testid="category-filter"], button:has-text("Men"), a:has-text("Men")');
  40  |     if (await categoryFilter.first().isVisible()) {
  41  |       await categoryFilter.first().click();
  42  |       await page.waitForTimeout(500);
  43  |     }
  44  |   });
  45  | 
  46  |   test('user can sort products', async ({ page }) => {
  47  |     await page.goto('/products');
  48  | 
  49  |     const sortSelect = page.locator('select[class*="sort"], [data-testid="sort-select"], select');
  50  |     if (await sortSelect.first().isVisible()) {
  51  |       await sortSelect.first().selectOption({ index: 1 });
  52  |       await page.waitForTimeout(500);
  53  |     }
  54  |   });
  55  | 
  56  |   test('user can add product to cart from listing', async ({ page }) => {
  57  |     await page.goto('/products');
  58  |     await expect(page.locator('[class*="product-card"], .product-card').first()).toBeVisible({ timeout: 10000 });
  59  | 
  60  |     const addBtn = page.locator('button:has-text("Add"), button[aria-label*="cart"], button:has-text("Cart")').first();
  61  |     if (await addBtn.isVisible()) {
  62  |       await addBtn.click();
  63  |       await page.waitForTimeout(500);
  64  |     }
  65  |   });
  66  | 
  67  |   test('user can add to wishlist from listing', async ({ page }) => {
  68  |     await page.goto('/products');
  69  |     await expect(page.locator('[class*="product-card"], .product-card').first()).toBeVisible({ timeout: 10000 });
  70  | 
  71  |     const wishlistBtn = page.locator('button[aria-label*="wishlist"], button:has-text("Wishlist"), button[class*="wishlist"]').first();
  72  |     if (await wishlistBtn.isVisible()) {
  73  |       await wishlistBtn.click();
  74  |       await page.waitForTimeout(500);
  75  |     }
  76  |   });
  77  | 
  78  |   test('user can search from header', async ({ page }) => {
  79  |     const searchBtn = page.locator('button[aria-label*="search"], [data-testid="search-trigger"], a[href="/search"]').first();
  80  |     if (await searchBtn.isVisible()) {
  81  |       await searchBtn.click();
  82  |       await page.waitForTimeout(300);
  83  |     }
  84  | 
  85  |     const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="q"]').first();
  86  |     if (await searchInput.isVisible()) {
  87  |       await searchInput.fill('shirt');
  88  |       await searchInput.press('Enter');
  89  |       await expect(page).toHaveURL(/.*search/);
  90  |     }
  91  |   });
  92  | 
  93  |   test('user can navigate between pages using header', async ({ page }) => {
  94  |     const navLinks = page.locator('nav a, header a[href]');
  95  |     const count = await navLinks.count();
> 96  |     expect(count).toBeGreaterThan(0);
      |                   ^ Error: expect(received).toBeGreaterThan(expected)
  97  | 
  98  |     const productsLink = page.locator('a[href="/products"]').first();
  99  |     if (await productsLink.isVisible()) {
  100 |       await productsLink.click();
  101 |       await expect(page).toHaveURL(/.*products/);
  102 |     }
  103 |   });
  104 | 
  105 |   test('user can use footer navigation', async ({ page }) => {
  106 |     const footerLinks = page.locator('footer a[href]');
  107 |     const count = await footerLinks.count();
  108 |     expect(count).toBeGreaterThan(0);
  109 |   });
  110 | 
  111 |   test('user can subscribe to newsletter', async ({ page }) => {
  112 |     const emailInput = page.locator('footer input[type="email"], input[placeholder*="email" i], input[name="email"]').first();
  113 |     if (await emailInput.isVisible()) {
  114 |       await emailInput.fill('test@example.com');
  115 |       const submitBtn = page.locator('footer button[type="submit"], footer button:has-text("Subscribe")').first();
  116 |       if (await submitBtn.isVisible()) {
  117 |         await submitBtn.click();
  118 |         await page.waitForTimeout(500);
  119 |       }
  120 |     }
  121 |   });
  122 | });
  123 | 
  124 | test.describe('Customer Journey - Search Flow', () => {
  125 |   test('search page loads and accepts input', async ({ page }) => {
  126 |     await page.goto('/search');
  127 |     const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="q"]').first();
  128 |     await expect(searchInput).toBeVisible({ timeout: 5000 });
  129 |     await searchInput.fill('dress');
  130 |     await searchInput.press('Enter');
  131 |     await page.waitForTimeout(1000);
  132 |   });
  133 | 
  134 |   test('search with empty query shows validation', async ({ page }) => {
  135 |     await page.goto('/search');
  136 |     const searchInput = page.locator('input[type="search"], input[placeholder*="search" i"], input[name="q"]').first();
  137 |     if (await searchInput.isVisible()) {
  138 |       await searchInput.press('Enter');
  139 |       await page.waitForTimeout(500);
  140 |     }
  141 |   });
  142 | 
  143 |   test('search results page displays results or empty state', async ({ page }) => {
  144 |     await page.goto('/search?q=shirt');
  145 |     await page.waitForTimeout(1000);
  146 |     const results = page.locator('[class*="search-result"], [data-testid="search-results"], .product-card');
  147 |     const emptyState = page.locator('text=No results, text=No products, text=Try a different');
  148 |     const resultCount = await results.count();
  149 |     const emptyVisible = await emptyState.first().isVisible().catch(() => false);
  150 |     expect(resultCount > 0 || emptyVisible).toBeTruthy();
  151 |   });
  152 | });
  153 | 
  154 | test.describe('Customer Journey - Collections', () => {
  155 |   test('collections page loads', async ({ page }) => {
  156 |     await page.goto('/products');
  157 |     const collectionLinks = page.locator('a[href*="/collections/"]');
  158 |     if (await collectionLinks.first().isVisible().catch(() => false)) {
  159 |       await collectionLinks.first().click();
  160 |       await page.waitForTimeout(1000);
  161 |     }
  162 |   });
  163 | 
  164 |   test('collection page shows products', async ({ page }) => {
  165 |     await page.goto('/collections/men');
  166 |     await page.waitForTimeout(1000);
  167 |     const products = page.locator('[class*="product-card"], .product-card');
  168 |     const emptyState = page.locator('text=No products, text=Coming soon');
  169 |     const hasProducts = await products.count() > 0;
  170 |     const hasEmpty = await emptyState.first().isVisible().catch(() => false);
  171 |     expect(hasProducts || hasEmpty).toBeTruthy();
  172 |   });
  173 | });
  174 | 
  175 | test.describe('Customer Journey - Lookbooks', () => {
  176 |   test('lookbooks page loads', async ({ page }) => {
  177 |     await page.goto('/lookbooks');
  178 |     await page.waitForTimeout(1000);
  179 |     await expect(page).toHaveURL(/.*lookbooks/);
  180 |   });
  181 | });
  182 | 
  183 | test.describe('Customer Journey - Auth Guarded Pages', () => {
  184 |   test('checkout redirects to login when not authenticated', async ({ page }) => {
  185 |     await page.goto('/checkout');
  186 |     await page.waitForTimeout(1000);
  187 |     await expect(page).toHaveURL(/.*login|.*auth/);
  188 |   });
  189 | 
  190 |   test('account redirects to login when not authenticated', async ({ page }) => {
  191 |     await page.goto('/account');
  192 |     await page.waitForTimeout(1000);
  193 |     await expect(page).toHaveURL(/.*login|.*auth/);
  194 |   });
  195 | 
  196 |   test('wishlist redirects to login when not authenticated', async ({ page }) => {
```