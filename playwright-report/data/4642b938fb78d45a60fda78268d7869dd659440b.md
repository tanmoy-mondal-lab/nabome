# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer-journey.spec.ts >> Customer Journey - Auth Guarded Pages >> checkout redirects to login when not authenticated
- Location: e2e/customer-journey.spec.ts:184:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*login|.*auth/
Received string:  "http://localhost:5173/checkout"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:5173/checkout"

```

```yaml
- banner:
  - paragraph
  - navigation:
    - link "Men":
      - /url: /products?category=men
    - link "Women":
      - /url: /products?category=women
    - link "Accessories":
      - /url: /products?category=accessories
    - link "Collections":
      - /url: /products
    - link "Lookbook":
      - /url: /lookbooks
  - link "নবME":
    - /url: /
  - button "Search"
  - link "Wishlist":
    - /url: /auth/login
  - link "Notifications":
    - /url: /auth/login
  - link "Account":
    - /url: /auth/login
  - button "Cart"
- link "Skip to content":
  - /url: "#main-content"
- main:
  - heading "Your cart is empty" [level=1]
  - paragraph: Add some items to your cart before checking out.
  - link "Continue Shopping":
    - /url: /products
- contentinfo:
  - paragraph: Stay Connected
  - paragraph: Join the नबME Inner Circle
  - textbox "Enter your email"
  - button "Subscribe"
  - link "নবME":
    - /url: /
  - paragraph: Premium Fashion Destination
  - link:
    - /url: https://instagram.com/nabome
  - link:
    - /url: https://youtube.com/@nabome
  - heading "নবME" [level=4]
  - paragraph: Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.
  - heading "Shop" [level=4]
  - heading "Support" [level=4]
  - heading "Connect" [level=4]
  - heading "Contact" [level=4]
  - paragraph: hello@nabome.com
  - paragraph: +91-1800-নবME
  - paragraph: © 2026 নবME. All rights reserved.
  - link "FAQ":
    - /url: /faq
  - link "Privacy Policy":
    - /url: /privacy
  - link "Terms of Service":
    - /url: /terms
  - link "Shipping & Returns":
    - /url: /shipping-returns
  - button "Back to top"
```

# Test source

```ts
  87  |       await searchInput.fill('shirt');
  88  |       await searchInput.press('Enter');
  89  |       await expect(page).toHaveURL(/.*search/);
  90  |     }
  91  |   });
  92  | 
  93  |   test('user can navigate between pages using header', async ({ page }) => {
  94  |     const navLinks = page.locator('nav a, header a[href]');
  95  |     const count = await navLinks.count();
  96  |     expect(count).toBeGreaterThan(0);
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
> 187 |     await expect(page).toHaveURL(/.*login|.*auth/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  188 |   });
  189 | 
  190 |   test('account redirects to login when not authenticated', async ({ page }) => {
  191 |     await page.goto('/account');
  192 |     await page.waitForTimeout(1000);
  193 |     await expect(page).toHaveURL(/.*login|.*auth/);
  194 |   });
  195 | 
  196 |   test('wishlist redirects to login when not authenticated', async ({ page }) => {
  197 |     await page.goto('/wishlist');
  198 |     await page.waitForTimeout(1000);
  199 |     await expect(page).toHaveURL(/.*login|.*auth|.*wishlist/);
  200 |   });
  201 | 
  202 |   test('admin redirects to login when not authenticated', async ({ page }) => {
  203 |     await page.goto('/admin');
  204 |     await page.waitForTimeout(1000);
  205 |     await expect(page).toHaveURL(/.*login|.*auth|.*admin/);
  206 |   });
  207 | });
  208 | 
  209 | test.describe('Customer Journey - 404 Page', () => {
  210 |   test('non-existent page shows 404', async ({ page }) => {
  211 |     const response = await page.goto('/this-page-does-not-exist-12345');
  212 |     await page.waitForTimeout(500);
  213 |     const is404 = response?.status() === 404 ||
  214 |       await page.locator('text=404, text=Not Found, text=Page not found').first().isVisible().catch(() => false);
  215 |     expect(is404).toBeTruthy();
  216 |   });
  217 | });
  218 | 
  219 | test.describe('Customer Journey - Cart Page', () => {
  220 |   test('cart page loads with empty state', async ({ page }) => {
  221 |     await page.goto('/cart');
  222 |     await expect(page).toHaveURL(/.*cart/);
  223 |     await page.waitForTimeout(500);
  224 |   });
  225 | 
  226 |   test('cart shows items after adding from product page', async ({ page }) => {
  227 |     await page.goto('/products');
  228 |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  229 |     await page.locator('[class*="product-card"], .product-card').first().click();
  230 |     await page.waitForTimeout(500);
  231 | 
  232 |     const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag")').first();
  233 |     if (await addBtn.isVisible()) {
  234 |       await addBtn.click();
  235 |       await page.waitForTimeout(500);
  236 |     }
  237 | 
  238 |     await page.goto('/cart');
  239 |     await page.waitForTimeout(500);
  240 |   });
  241 | });
  242 | 
```