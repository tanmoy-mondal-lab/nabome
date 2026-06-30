# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Checkout Flow >> user can fill shipping address
- Location: e2e/checkout.spec.ts:54:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="fullName"]')

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
      - img [ref=e56]
      - heading "Your cart is empty" [level=1] [ref=e59]
      - paragraph [ref=e60]: Add some items to your cart before checking out.
      - link "Continue Shopping" [ref=e61] [cursor=pointer]:
        - /url: /products
        - img [ref=e62]
        - text: Continue Shopping
  - contentinfo [ref=e64]:
    - generic [ref=e66]:
      - generic [ref=e67]:
        - paragraph [ref=e68]: Stay Connected
        - paragraph [ref=e69]: Join the नबME Inner Circle
      - generic [ref=e71]:
        - textbox "Enter your email" [ref=e72]
        - button "Subscribe" [ref=e73] [cursor=pointer]
    - generic [ref=e75]:
      - generic [ref=e76]:
        - link "নবME" [ref=e77] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e78]: Premium Fashion Destination
        - generic [ref=e79]:
          - link [ref=e80] [cursor=pointer]:
            - /url: https://instagram.com/nabome
            - img [ref=e81]
          - link [ref=e84] [cursor=pointer]:
            - /url: https://youtube.com/@nabome
            - img [ref=e85]
      - generic [ref=e89]:
        - heading "নবME" [level=4] [ref=e90]
        - paragraph [ref=e91]: Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.
      - heading "Shop" [level=4] [ref=e94]
      - heading "Support" [level=4] [ref=e97]
      - heading "Connect" [level=4] [ref=e100]
      - generic [ref=e101]:
        - heading "Contact" [level=4] [ref=e102]
        - generic [ref=e103]:
          - paragraph [ref=e104]: hello@nabome.com
          - paragraph [ref=e105]: +91-1800-নবME
    - generic [ref=e107]:
      - paragraph [ref=e108]: © 2026 নবME. All rights reserved.
      - generic [ref=e109]:
        - link "FAQ" [ref=e110] [cursor=pointer]:
          - /url: /faq
        - link "Privacy Policy" [ref=e111] [cursor=pointer]:
          - /url: /privacy
        - link "Terms of Service" [ref=e112] [cursor=pointer]:
          - /url: /terms
        - link "Shipping & Returns" [ref=e113] [cursor=pointer]:
          - /url: /shipping-returns
      - button "Back to top" [ref=e114] [cursor=pointer]:
        - text: Back to top
        - img [ref=e115]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Checkout Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('user can add product to cart', async ({ page }) => {
  9  |     // Navigate to a product page
  10 |     await page.click('.product-card:first-child');
  11 |     await expect(page).toHaveURL(/.*products/);
  12 | 
  13 |     // Select variant if available
  14 |     const sizeSelector = page.locator('.size-selector button').first();
  15 |     if (await sizeSelector.isVisible()) {
  16 |       await sizeSelector.click();
  17 |     }
  18 | 
  19 |     // Add to cart
  20 |     await page.click('button:has-text("Add to Cart")');
  21 |     
  22 |     // Verify cart indicator updates
  23 |     await expect(page.locator('.cart-count, [data-cart-count]')).toContainText(/[1-9]/);
  24 |   });
  25 | 
  26 |   test('user can view cart', async ({ page }) => {
  27 |     // Add item to cart first
  28 |     await page.goto('/products');
  29 |     await page.click('.product-card:first-child');
  30 |     await page.click('button:has-text("Add to Cart")');
  31 |     
  32 |     // Navigate to cart
  33 |     await page.click('text=Cart, a[href="/cart"]');
  34 |     await expect(page).toHaveURL(/.*cart/);
  35 |     
  36 |     // Verify cart has items
  37 |     await expect(page.locator('.cart-item')).toHaveCount(1);
  38 |   });
  39 | 
  40 |   test('user can proceed to checkout', async ({ page }) => {
  41 |     // Add item to cart
  42 |     await page.goto('/products');
  43 |     await page.click('.product-card:first-child');
  44 |     await page.click('button:has-text("Add to Cart")');
  45 |     
  46 |     // Go to cart and checkout
  47 |     await page.goto('/cart');
  48 |     await page.click('button:has-text("Checkout")');
  49 |     
  50 |     // Should redirect to checkout page
  51 |     await expect(page).toHaveURL(/.*checkout/);
  52 |   });
  53 | 
  54 |   test('user can fill shipping address', async ({ page }) => {
  55 |     await page.goto('/checkout');
  56 |     
  57 |     // Fill shipping form
> 58 |     await page.fill('input[name="fullName"]', 'Test User');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  59 |     await page.fill('input[name="phone"]', '+919876543210');
  60 |     await page.fill('input[name="address"]', '123 Test Street');
  61 |     await page.fill('input[name="city"]', 'Test City');
  62 |     await page.fill('input[name="state"]', 'Test State');
  63 |     await page.fill('input[name="postalCode"]', '123456');
  64 |     
  65 |     // Continue to payment
  66 |     await page.click('button:has-text("Continue to Payment")');
  67 |     
  68 |     // Should show payment section
  69 |     await expect(page.locator('.payment-section')).toBeVisible();
  70 |   });
  71 | 
  72 |   test('user can complete order with Razorpay', async ({ page }) => {
  73 |     // This test requires Razorpay test mode credentials
  74 |     test.skip(process.env.NODE_ENV === 'production', 'Skip in production');
  75 |     
  76 |     await page.goto('/checkout');
  77 |     
  78 |     // Fill shipping form
  79 |     await page.fill('input[name="fullName"]', 'Test User');
  80 |     await page.fill('input[name="phone"]', '+919876543210');
  81 |     await page.fill('input[name="address"]', '123 Test Street');
  82 |     await page.fill('input[name="city"]', 'Test City');
  83 |     await page.fill('input[name="state"]', 'Test State');
  84 |     await page.fill('input[name="postalCode"]', '123456');
  85 |     await page.click('button:has-text("Continue to Payment")');
  86 |     
  87 |     // Select payment method
  88 |     await page.click('input[value="razorpay"]');
  89 |     await page.click('button:has-text("Place Order")');
  90 |     
  91 |     // Razorpay modal should appear (in test mode)
  92 |     await expect(page.locator('.razorpay-container, [class*="razorpay"]')).toBeVisible({ timeout: 10000 });
  93 |   });
  94 | });
  95 | 
```