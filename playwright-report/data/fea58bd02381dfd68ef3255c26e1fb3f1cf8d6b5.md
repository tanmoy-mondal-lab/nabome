# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-detail.spec.ts >> Product Detail Page >> product not found shows error/redirect
- Location: e2e/product-detail.spec.ts:159:3

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
  - main [ref=e51]
  - contentinfo [ref=e62]:
    - generic [ref=e64]:
      - generic [ref=e65]:
        - paragraph [ref=e66]: Stay Connected
        - paragraph [ref=e67]: Join the नबME Inner Circle
      - generic [ref=e69]:
        - textbox "Enter your email" [ref=e70]
        - button "Subscribe" [ref=e71] [cursor=pointer]
    - generic [ref=e73]:
      - generic [ref=e74]:
        - link "নবME" [ref=e75] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e76]: Premium Fashion Destination
        - generic [ref=e77]:
          - link [ref=e78] [cursor=pointer]:
            - /url: https://instagram.com/nabome
            - img [ref=e79]
          - link [ref=e82] [cursor=pointer]:
            - /url: https://youtube.com/@nabome
            - img [ref=e83]
      - generic [ref=e87]:
        - heading "নবME" [level=4] [ref=e88]
        - paragraph [ref=e89]: Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.
      - heading "Shop" [level=4] [ref=e92]
      - heading "Support" [level=4] [ref=e95]
      - heading "Connect" [level=4] [ref=e98]
      - generic [ref=e99]:
        - heading "Contact" [level=4] [ref=e100]
        - generic [ref=e101]:
          - paragraph [ref=e102]: hello@nabome.com
          - paragraph [ref=e103]: +91-1800-নবME
    - generic [ref=e105]:
      - paragraph [ref=e106]: © 2026 নবME. All rights reserved.
      - generic [ref=e107]:
        - link "FAQ" [ref=e108] [cursor=pointer]:
          - /url: /faq
        - link "Privacy Policy" [ref=e109] [cursor=pointer]:
          - /url: /privacy
        - link "Terms of Service" [ref=e110] [cursor=pointer]:
          - /url: /terms
        - link "Shipping & Returns" [ref=e111] [cursor=pointer]:
          - /url: /shipping-returns
      - button "Back to top" [ref=e112] [cursor=pointer]:
        - text: Back to top
        - img [ref=e113]
```

# Test source

```ts
  64  | 
  65  |   test('product detail has size selector', async ({ page }) => {
  66  |     await page.goto('/products');
  67  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  68  |     await page.locator('[class*="product-card"], .product-card').first().click();
  69  |     await page.waitForTimeout(500);
  70  |     const sizeSelector = page.locator('[class*="size"], [data-testid="size-selector"], button:has-text("S"), button:has-text("M"), button:has-text("L")').first();
  71  |     if (await sizeSelector.isVisible().catch(() => false)) {
  72  |       await expect(sizeSelector).toBeVisible();
  73  |     }
  74  |   });
  75  | 
  76  |   test('product detail has color selector', async ({ page }) => {
  77  |     await page.goto('/products');
  78  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  79  |     await page.locator('[class*="product-card"], .product-card').first().click();
  80  |     await page.waitForTimeout(500);
  81  |     const colorSelector = page.locator('[class*="color"], [data-testid="color-selector"], [class*="swatch"]').first();
  82  |     if (await colorSelector.isVisible().catch(() => false)) {
  83  |       await expect(colorSelector).toBeVisible();
  84  |     }
  85  |   });
  86  | 
  87  |   test('product detail shows reviews section', async ({ page }) => {
  88  |     await page.goto('/products');
  89  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  90  |     await page.locator('[class*="product-card"], .product-card').first().click();
  91  |     await page.waitForTimeout(500);
  92  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  93  |     await page.waitForTimeout(500);
  94  |     const reviews = page.locator('[class*="review"], text=Reviews, text=reviews').first();
  95  |     if (await reviews.isVisible().catch(() => false)) {
  96  |       await expect(reviews).toBeVisible();
  97  |     }
  98  |   });
  99  | 
  100 |   test('product detail shows breadcrumb navigation', async ({ page }) => {
  101 |     await page.goto('/products');
  102 |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  103 |     await page.locator('[class*="product-card"], .product-card').first().click();
  104 |     await page.waitForTimeout(500);
  105 |     const breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]').first();
  106 |     if (await breadcrumb.isVisible().catch(() => false)) {
  107 |       await expect(breadcrumb).toBeVisible();
  108 |     }
  109 |   });
  110 | 
  111 |   test('product detail has wishlist button', async ({ page }) => {
  112 |     await page.goto('/products');
  113 |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  114 |     await page.locator('[class*="product-card"], .product-card').first().click();
  115 |     await page.waitForTimeout(500);
  116 |     const wishlistBtn = page.locator('button[aria-label*="wishlist"], button:has-text("Wishlist"), button[class*="wishlist"]').first();
  117 |     if (await wishlistBtn.isVisible().catch(() => false)) {
  118 |       await expect(wishlistBtn).toBeVisible();
  119 |     }
  120 |   });
  121 | 
  122 |   test('product detail shows related products', async ({ page }) => {
  123 |     await page.goto('/products');
  124 |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  125 |     await page.locator('[class*="product-card"], .product-card').first().click();
  126 |     await page.waitForTimeout(500);
  127 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  128 |     await page.waitForTimeout(500);
  129 |     const related = page.locator('[class*="related"], [class*="similar"], text=Related, text=You may also like').first();
  130 |     if (await related.isVisible().catch(() => false)) {
  131 |       await expect(related).toBeVisible();
  132 |     }
  133 |   });
  134 | 
  135 |   test('product detail image gallery - thumbnail click changes main image', async ({ page }) => {
  136 |     await page.goto('/products');
  137 |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  138 |     await page.locator('[class*="product-card"], .product-card').first().click();
  139 |     await page.waitForTimeout(500);
  140 |     const thumbnails = page.locator('[class*="thumbnail"], [class*="gallery"] img, [class*="image-list"] img');
  141 |     if (await thumbnails.count() > 1) {
  142 |       await thumbnails.nth(1).click();
  143 |       await page.waitForTimeout(300);
  144 |     }
  145 |   });
  146 | 
  147 |   test('product detail - quantity selector works', async ({ page }) => {
  148 |     await page.goto('/products');
  149 |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  150 |     await page.locator('[class*="product-card"], .product-card').first().click();
  151 |     await page.waitForTimeout(500);
  152 |     const quantityPlus = page.locator('button[aria-label*="increase"], button[aria-label*="plus"], button:has-text("+")').first();
  153 |     if (await quantityPlus.isVisible().catch(() => false)) {
  154 |       await quantityPlus.click();
  155 |       await page.waitForTimeout(200);
  156 |     }
  157 |   });
  158 | 
  159 |   test('product not found shows error/redirect', async ({ page }) => {
  160 |     const response = await page.goto('/products/nonexistent-slug-12345');
  161 |     await page.waitForTimeout(1000);
  162 |     const isError = response?.status() === 404 ||
  163 |       await page.locator('text=not found, text=Not Found, text=Product not found, text=does not exist').first().isVisible().catch(() => false);
> 164 |     expect(isError).toBeTruthy();
      |                     ^ Error: expect(received).toBeTruthy()
  165 |   });
  166 | });
  167 | 
```