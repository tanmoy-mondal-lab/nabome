# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart-edge-cases.spec.ts >> Cart - Edge Cases >> empty cart shows appropriate message
- Location: e2e/cart-edge-cases.spec.ts:48:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
    - generic [ref=e53]:
      - navigation "Breadcrumb" [ref=e54]:
        - link "Home" [ref=e55] [cursor=pointer]:
          - /url: /
        - generic [ref=e56]:
          - img [ref=e57]
          - generic [ref=e59]: Shopping Cart
      - generic [ref=e60]:
        - img [ref=e62]
        - heading "Your Cart is Empty" [level=1] [ref=e65]
        - paragraph [ref=e66]: Looks like you haven't added anything yet. Let's change that.
        - link "Explore Collection" [ref=e67] [cursor=pointer]:
          - /url: /products
          - img [ref=e68]
          - text: Explore Collection
        - generic [ref=e70]:
          - generic [ref=e71]:
            - img [ref=e72]
            - paragraph [ref=e77]: Free Shipping
            - paragraph [ref=e78]: On orders above ₹500
          - generic [ref=e79]:
            - img [ref=e80]
            - paragraph [ref=e83]: Easy Returns
            - paragraph [ref=e84]: 30-day return policy
          - generic [ref=e85]:
            - img [ref=e86]
            - paragraph [ref=e88]: Secure Checkout
            - paragraph [ref=e89]: Protected payment
  - contentinfo [ref=e90]:
    - generic [ref=e92]:
      - generic [ref=e93]:
        - paragraph [ref=e94]: Stay Connected
        - paragraph [ref=e95]: Join the नबME Inner Circle
      - generic [ref=e97]:
        - textbox "Enter your email" [ref=e98]
        - button "Subscribe" [ref=e99] [cursor=pointer]
    - generic [ref=e101]:
      - generic [ref=e102]:
        - link "নবME" [ref=e103] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e104]: Premium Fashion Destination
        - generic [ref=e105]:
          - link [ref=e106] [cursor=pointer]:
            - /url: https://instagram.com/nabome
            - img [ref=e107]
          - link [ref=e110] [cursor=pointer]:
            - /url: https://youtube.com/@nabome
            - img [ref=e111]
      - generic [ref=e115]:
        - heading "নবME" [level=4] [ref=e116]
        - paragraph [ref=e117]: Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.
      - heading "Shop" [level=4] [ref=e120]
      - heading "Support" [level=4] [ref=e123]
      - heading "Connect" [level=4] [ref=e126]
      - generic [ref=e127]:
        - heading "Contact" [level=4] [ref=e128]
        - generic [ref=e129]:
          - paragraph [ref=e130]: hello@nabome.com
          - paragraph [ref=e131]: +91-1800-নবME
    - generic [ref=e133]:
      - paragraph [ref=e134]: © 2026 নবME. All rights reserved.
      - generic [ref=e135]:
        - link "FAQ" [ref=e136] [cursor=pointer]:
          - /url: /faq
        - link "Privacy Policy" [ref=e137] [cursor=pointer]:
          - /url: /privacy
        - link "Terms of Service" [ref=e138] [cursor=pointer]:
          - /url: /terms
        - link "Shipping & Returns" [ref=e139] [cursor=pointer]:
          - /url: /shipping-returns
      - button "Back to top" [ref=e140] [cursor=pointer]:
        - text: Back to top
        - img [ref=e141]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Cart - Edge Cases', () => {
  4   |   test('cart persists across page navigation', async ({ page }) => {
  5   |     await page.goto('/products');
  6   |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  7   |     await page.locator('[class*="product-card"], .product-card').first().click();
  8   |     await page.waitForTimeout(500);
  9   | 
  10  |     const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag")').first();
  11  |     if (await addBtn.isVisible()) {
  12  |       await addBtn.click();
  13  |       await page.waitForTimeout(500);
  14  |     }
  15  | 
  16  |     await page.goto('/products');
  17  |     await page.waitForTimeout(500);
  18  |     await page.goto('/cart');
  19  |     await page.waitForTimeout(500);
  20  |   });
  21  | 
  22  |   test('cart persists after browser refresh', async ({ page }) => {
  23  |     await page.goto('/products');
  24  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  25  |     await page.locator('[class*="product-card"], .product-card').first().click();
  26  |     await page.waitForTimeout(500);
  27  | 
  28  |     const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag")').first();
  29  |     if (await addBtn.isVisible()) {
  30  |       await addBtn.click();
  31  |       await page.waitForTimeout(500);
  32  |     }
  33  | 
  34  |     await page.reload();
  35  |     await page.waitForTimeout(500);
  36  |   });
  37  | 
  38  |   test('cart shows correct item count badge', async ({ page }) => {
  39  |     await page.goto('/cart');
  40  |     await page.waitForTimeout(500);
  41  |     const cartBadge = page.locator('[class*="cart-count"], [data-cart-count], [class*="badge"]').first();
  42  |     if (await cartBadge.isVisible().catch(() => false)) {
  43  |       const text = await cartBadge.textContent();
  44  |       expect(text).toBeTruthy();
  45  |     }
  46  |   });
  47  | 
  48  |   test('empty cart shows appropriate message', async ({ page }) => {
  49  |     await page.goto('/cart');
  50  |     await page.waitForTimeout(1000);
  51  |     const emptyMsg = page.locator('text=empty, text=No items, text=Your cart is empty, text=Add some');
  52  |     const cartItems = page.locator('[class*="cart-item"], .cart-item, [data-testid="cart-item"]');
  53  |     const isEmpty = await emptyMsg.first().isVisible().catch(() => false);
  54  |     const hasItems = await cartItems.count() > 0;
> 55  |     expect(isEmpty || hasItems).toBeTruthy();
      |                                 ^ Error: expect(received).toBeTruthy()
  56  |   });
  57  | 
  58  |   test('cart page has continue shopping link', async ({ page }) => {
  59  |     await page.goto('/cart');
  60  |     await page.waitForTimeout(500);
  61  |     const continueLink = page.locator('a:has-text("Continue Shopping"), a:has-text("Continue shopping"), a[href="/products"]').first();
  62  |     if (await continueLink.isVisible().catch(() => false)) {
  63  |       await continueLink.click();
  64  |       await expect(page).toHaveURL(/.*products/);
  65  |     }
  66  |   });
  67  | 
  68  |   test('cart page has proceed to checkout button', async ({ page }) => {
  69  |     await page.goto('/cart');
  70  |     await page.waitForTimeout(500);
  71  |     const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Proceed"), a:has-text("Checkout")').first();
  72  |     if (await checkoutBtn.isVisible().catch(() => false)) {
  73  |       await checkoutBtn.click();
  74  |       await page.waitForTimeout(1000);
  75  |     }
  76  |   });
  77  | 
  78  |   test('adding same product twice increases quantity', async ({ page }) => {
  79  |     await page.goto('/products');
  80  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  81  |     await page.locator('[class*="product-card"], .product-card').first().click();
  82  |     await page.waitForTimeout(500);
  83  | 
  84  |     const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag")').first();
  85  |     if (await addBtn.isVisible()) {
  86  |       await addBtn.click();
  87  |       await page.waitForTimeout(500);
  88  |       await addBtn.click();
  89  |       await page.waitForTimeout(500);
  90  |     }
  91  |   });
  92  | 
  93  |   test('cart quantity can be incremented', async ({ page }) => {
  94  |     await page.goto('/cart');
  95  |     await page.waitForTimeout(500);
  96  |     const incrementBtn = page.locator('button[aria-label*="increase"], button[aria-label*="plus"], button:has-text("+")').first();
  97  |     if (await incrementBtn.isVisible().catch(() => false)) {
  98  |       await incrementBtn.click();
  99  |       await page.waitForTimeout(300);
  100 |     }
  101 |   });
  102 | 
  103 |   test('cart quantity can be decremented', async ({ page }) => {
  104 |     await page.goto('/cart');
  105 |     await page.waitForTimeout(500);
  106 |     const decrementBtn = page.locator('button[aria-label*="decrease"], button[aria-label*="minus"], button:has-text("-")').first();
  107 |     if (await decrementBtn.isVisible().catch(() => false)) {
  108 |       await decrementBtn.click();
  109 |       await page.waitForTimeout(300);
  110 |     }
  111 |   });
  112 | 
  113 |   test('cart item can be removed', async ({ page }) => {
  114 |     await page.goto('/cart');
  115 |     await page.waitForTimeout(500);
  116 |     const removeBtn = page.locator('button[aria-label*="remove"], button[aria-label*="delete"], button:has-text("Remove"), button:has-text("×")').first();
  117 |     if (await removeBtn.isVisible().catch(() => false)) {
  118 |       await removeBtn.click();
  119 |       await page.waitForTimeout(300);
  120 |     }
  121 |   });
  122 | 
  123 |   test('cart shows subtotal calculation', async ({ page }) => {
  124 |     await page.goto('/cart');
  125 |     await page.waitForTimeout(500);
  126 |     const subtotal = page.locator('text=Subtotal, text=Total, text=Amount').first();
  127 |     if (await subtotal.isVisible().catch(() => false)) {
  128 |       await expect(subtotal).toBeVisible();
  129 |     }
  130 |   });
  131 | 
  132 |   test('cart shows shipping info', async ({ page }) => {
  133 |     await page.goto('/cart');
  134 |     await page.waitForTimeout(500);
  135 |     const shipping = page.locator('text=Shipping, text=Delivery, text=Free shipping').first();
  136 |     if (await shipping.isVisible().catch(() => false)) {
  137 |       await expect(shipping).toBeVisible();
  138 |     }
  139 |   });
  140 | 
  141 |   test('cart page is responsive', async ({ page }) => {
  142 |     await page.setViewportSize({ width: 375, height: 812 });
  143 |     await page.goto('/cart');
  144 |     await page.waitForTimeout(500);
  145 |     await expect(page).toHaveURL(/.*cart/);
  146 |   });
  147 | });
  148 | 
  149 | test.describe('Cart - Drawer', () => {
  150 |   test('cart drawer opens from header', async ({ page }) => {
  151 |     await page.goto('/');
  152 |     const cartBtn = page.locator('[aria-label*="cart"], [data-testid="cart-trigger"], button[class*="cart"]').first();
  153 |     if (await cartBtn.isVisible()) {
  154 |       await cartBtn.click();
  155 |       await page.waitForTimeout(500);
```