# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Checkout Flow >> user can add product to cart
- Location: e2e/checkout.spec.ts:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.product-card:first-child')

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
    - generic [ref=e52]:
      - generic [ref=e53]: Free shipping on orders above ₹500
      - generic [ref=e54]:
        - generic [ref=e55]:
          - paragraph [ref=e56]: Discover our handpicked edits
          - heading "Curated Collections" [level=2] [ref=e57]
        - generic [ref=e58]:
          - link "Summer Essentials Lightweight linen and cotton for the warmer months View Collection →" [ref=e60] [cursor=pointer]:
            - /url: /collections/summer-essentials
            - generic [ref=e62]:
              - heading "Summer Essentials" [level=3] [ref=e63]
              - paragraph [ref=e64]: Lightweight linen and cotton for the warmer months
              - text: View Collection →
          - link "Heritage Revival Traditional craftsmanship reimagined View Collection →" [ref=e66] [cursor=pointer]:
            - /url: /collections/heritage-revival
            - generic [ref=e68]:
              - heading "Heritage Revival" [level=3] [ref=e69]
              - paragraph [ref=e70]: Traditional craftsmanship reimagined
              - text: View Collection →
          - link "Evening Edit Curated pieces for your most memorable nights View Collection →" [ref=e72] [cursor=pointer]:
            - /url: /collections/evening-edit
            - generic [ref=e74]:
              - heading "Evening Edit" [level=3] [ref=e75]
              - paragraph [ref=e76]: Curated pieces for your most memorable nights
              - text: View Collection →
      - generic [ref=e77]:
        - generic [ref=e81]:
          - heading "Suggestion" [level=1] [ref=e82]
          - paragraph [ref=e83]: that you like
          - link "ok" [ref=e85] [cursor=pointer]:
            - /url: /collections/summer-essentials
        - generic [ref=e87]:
          - button [ref=e88] [cursor=pointer]
          - button [ref=e89] [cursor=pointer]
        - button "Mute" [ref=e90] [cursor=pointer]:
          - img [ref=e91]
        - button "Pause" [ref=e95] [cursor=pointer]:
          - img [ref=e96]
        - img [ref=e100]
      - generic [ref=e103]:
        - generic [ref=e104]:
          - generic [ref=e105]:
            - paragraph [ref=e106]: The latest additions to our collection
            - heading "New Arrivals" [level=2] [ref=e107]
            - paragraph [ref=e108]: The latest additions to our collection
          - link "View All" [ref=e109] [cursor=pointer]:
            - /url: /products?sort=newest
        - generic [ref=e110]:
          - generic [ref=e111]:
            - link "Linen Straight Trousers New Quick view Toggle wishlist" [ref=e112] [cursor=pointer]:
              - /url: /products/linen-straight-trousers
              - img "Linen Straight Trousers" [ref=e113]
              - generic [ref=e114]: New
              - generic [ref=e115]:
                - button "Quick view" [ref=e116]:
                  - img [ref=e117]
                - button "Toggle wishlist" [ref=e120]:
                  - img [ref=e122]
            - generic [ref=e127]:
              - paragraph [ref=e128]: women
              - link "Linen Straight Trousers" [ref=e129] [cursor=pointer]:
                - /url: /products/linen-straight-trousers
              - generic [ref=e131]: ₹7,500
            - button "Add to Cart" [ref=e133] [cursor=pointer]:
              - img [ref=e134]
              - text: Add to Cart
          - generic [ref=e137]:
            - link "Wool Blend Blazer 21% OFF Quick view Toggle wishlist" [ref=e138] [cursor=pointer]:
              - /url: /products/wool-blend-blazer
              - img "Wool Blend Blazer" [ref=e139]
              - generic [ref=e140]: 21% OFF
              - generic [ref=e141]:
                - button "Quick view" [ref=e142]:
                  - img [ref=e143]
                - button "Toggle wishlist" [ref=e146]:
                  - img [ref=e148]
            - generic [ref=e153]:
              - paragraph [ref=e154]: men
              - link "Wool Blend Blazer" [ref=e155] [cursor=pointer]:
                - /url: /products/wool-blend-blazer
              - generic [ref=e156]:
                - generic [ref=e157]: ₹22,000
                - generic [ref=e158]: ₹28,000
                - generic [ref=e159]: 21% OFF
            - button "Add to Cart" [ref=e161] [cursor=pointer]:
              - img [ref=e162]
              - text: Add to Cart
          - generic [ref=e165]:
            - link "Premium Leather Tote 16% OFF Quick view Toggle wishlist" [ref=e166] [cursor=pointer]:
              - /url: /products/premium-leather-tote
              - img "Premium Leather Tote" [ref=e167]
              - generic [ref=e168]: 16% OFF
              - generic [ref=e169]:
                - button "Quick view" [ref=e170]:
                  - img [ref=e171]
                - button "Toggle wishlist" [ref=e174]:
                  - img [ref=e176]
            - generic [ref=e182]:
              - paragraph [ref=e183]: women
              - link "Premium Leather Tote" [ref=e184] [cursor=pointer]:
                - /url: /products/premium-leather-tote
              - generic [ref=e185]:
                - generic [ref=e186]: ₹18,500
                - generic [ref=e187]: ₹22,000
                - generic [ref=e188]: 16% OFF
            - button "Add to Cart" [ref=e190] [cursor=pointer]:
              - img [ref=e191]
              - text: Add to Cart
          - generic [ref=e194]:
            - link "Silk Evening Gown 19% OFF Quick view Toggle wishlist" [ref=e195] [cursor=pointer]:
              - /url: /products/silk-evening-gown
              - img "Silk Evening Gown" [ref=e196]
              - generic [ref=e197]: 19% OFF
              - generic [ref=e198]:
                - button "Quick view" [ref=e199]:
                  - img [ref=e200]
                - button "Toggle wishlist" [ref=e203]:
                  - img [ref=e205]
            - generic [ref=e210]:
              - paragraph [ref=e211]: women
              - link "Silk Evening Gown" [ref=e212] [cursor=pointer]:
                - /url: /products/silk-evening-gown
              - generic [ref=e213]:
                - generic [ref=e214]: ₹28,500
                - generic [ref=e215]: ₹35,000
                - generic [ref=e216]: 19% OFF
            - button "Add to Cart" [ref=e218] [cursor=pointer]:
              - img [ref=e219]
              - text: Add to Cart
          - generic [ref=e222]:
            - link "Pure Linen Shirt 25% OFF Quick view Toggle wishlist" [ref=e223] [cursor=pointer]:
              - /url: /products/pure-linen-shirt
              - img "Pure Linen Shirt" [ref=e224]
              - generic [ref=e225]: 25% OFF
              - generic [ref=e226]:
                - button "Quick view" [ref=e227]:
                  - img [ref=e228]
                - button "Toggle wishlist" [ref=e231]:
                  - img [ref=e233]
            - generic [ref=e238]:
              - paragraph [ref=e239]: men
              - link "Pure Linen Shirt" [ref=e240] [cursor=pointer]:
                - /url: /products/pure-linen-shirt
              - generic [ref=e241]:
                - generic [ref=e242]: ₹8,900
                - generic [ref=e243]: ₹11,900
                - generic [ref=e244]: 25% OFF
            - button "Add to Cart" [ref=e246] [cursor=pointer]:
              - img [ref=e247]
              - text: Add to Cart
      - generic [ref=e253]:
        - paragraph [ref=e254]: Crafted with passion since 2020
        - heading "Craftsmanship That Endures" [level=2] [ref=e255]
        - paragraph [ref=e256]: নবME was born from a vision to blend traditional Indian craftsmanship with contemporary design. Every piece tells a story of heritage, artistry, and timeless elegance.
        - generic [ref=e257]:
          - generic [ref=e258]:
            - paragraph [ref=e259]: 200+
            - paragraph [ref=e260]: Artisan Craftspeople
          - generic [ref=e261]:
            - paragraph [ref=e262]: 15+
            - paragraph [ref=e263]: Countries Served
          - generic [ref=e264]:
            - paragraph [ref=e265]: 98%
            - paragraph [ref=e266]: Customer Satisfaction
      - generic [ref=e271]:
        - paragraph [ref=e272]: Be the first to know about new collections, exclusive offers, and events.
        - heading "Join the Inner Circle" [level=2] [ref=e273]
        - paragraph [ref=e274]: Subscribe for exclusive access to new drops, private sales, and editor's picks.
        - generic [ref=e276]:
          - textbox "Enter your email" [ref=e277]
          - button "Subscribe" [ref=e278] [cursor=pointer]
      - generic [ref=e279]:
        - img "Promotional banner" [ref=e281]
        - link "read" [ref=e284] [cursor=pointer]:
          - /url: /our-story
  - contentinfo [ref=e285]:
    - generic [ref=e287]:
      - generic [ref=e288]:
        - paragraph [ref=e289]: Stay Connected
        - paragraph [ref=e290]: Join the नबME Inner Circle
      - generic [ref=e292]:
        - textbox "Enter your email" [ref=e293]
        - button "Subscribe" [ref=e294] [cursor=pointer]
    - generic [ref=e296]:
      - generic [ref=e297]:
        - link "নবME" [ref=e298] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e299]: Premium Fashion Destination
        - generic [ref=e300]:
          - link [ref=e301] [cursor=pointer]:
            - /url: https://instagram.com/nabome
            - img [ref=e302]
          - link [ref=e305] [cursor=pointer]:
            - /url: https://youtube.com/@nabome
            - img [ref=e306]
      - generic [ref=e310]:
        - heading "নবME" [level=4] [ref=e311]
        - paragraph [ref=e312]: Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.
      - heading "Shop" [level=4] [ref=e315]
      - heading "Support" [level=4] [ref=e318]
      - heading "Connect" [level=4] [ref=e321]
      - generic [ref=e322]:
        - heading "Contact" [level=4] [ref=e323]
        - generic [ref=e324]:
          - paragraph [ref=e325]: hello@nabome.com
          - paragraph [ref=e326]: +91-1800-নবME
    - generic [ref=e328]:
      - paragraph [ref=e329]: © 2026 নবME. All rights reserved.
      - generic [ref=e330]:
        - link "FAQ" [ref=e331] [cursor=pointer]:
          - /url: /faq
        - link "Privacy Policy" [ref=e332] [cursor=pointer]:
          - /url: /privacy
        - link "Terms of Service" [ref=e333] [cursor=pointer]:
          - /url: /terms
        - link "Shipping & Returns" [ref=e334] [cursor=pointer]:
          - /url: /shipping-returns
      - button "Back to top" [ref=e335] [cursor=pointer]:
        - text: Back to top
        - img [ref=e336]
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
> 10 |     await page.click('.product-card:first-child');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  58 |     await page.fill('input[name="fullName"]', 'Test User');
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