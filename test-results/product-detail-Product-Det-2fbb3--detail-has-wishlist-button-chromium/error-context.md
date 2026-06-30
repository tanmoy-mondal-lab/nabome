# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-detail.spec.ts >> Product Detail Page >> product detail has wishlist button
- Location: e2e/product-detail.spec.ts:111:3

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[class*="product-card"], .product-card').first() to be visible

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
          - generic [ref=e59]: Products
      - generic [ref=e60]:
        - generic [ref=e61]:
          - heading "All Products" [level=1] [ref=e62]
          - paragraph [ref=e63]: 9 products found
        - generic [ref=e64]:
          - button "Filters" [ref=e65] [cursor=pointer]:
            - img [ref=e66]
            - text: Filters
          - combobox [ref=e67]:
            - option "Newest" [selected]
            - option "Most Popular"
            - option "Best Selling"
            - 'option "Price: Low to High"'
            - 'option "Price: High to Low"'
          - generic [ref=e68]:
            - button [ref=e69] [cursor=pointer]:
              - img [ref=e70]
            - button [ref=e72] [cursor=pointer]:
              - img [ref=e73]
      - generic [ref=e76]:
        - generic [ref=e77]:
          - link "Linen Straight Trousers New Quick view Toggle wishlist" [ref=e78] [cursor=pointer]:
            - /url: /products/linen-straight-trousers
            - img "Linen Straight Trousers" [ref=e79]
            - generic [ref=e80]: New
            - generic [ref=e81]:
              - button "Quick view" [ref=e82]:
                - img [ref=e83]
              - button "Toggle wishlist" [ref=e86]:
                - img [ref=e88]
          - generic [ref=e93]:
            - paragraph [ref=e94]: women
            - link "Linen Straight Trousers" [ref=e95] [cursor=pointer]:
              - /url: /products/linen-straight-trousers
            - generic [ref=e97]: ₹7,500
          - button "Add to Cart" [ref=e99] [cursor=pointer]:
            - img [ref=e100]
            - text: Add to Cart
        - generic [ref=e103]:
          - link "Handcrafted Pearl Necklace 22% OFF Quick view Toggle wishlist" [ref=e104] [cursor=pointer]:
            - /url: /products/handcrafted-pearl-necklace
            - img "Handcrafted Pearl Necklace" [ref=e105]
            - generic [ref=e106]: 22% OFF
            - generic [ref=e107]:
              - button "Quick view" [ref=e108]:
                - img [ref=e109]
              - button "Toggle wishlist" [ref=e112]:
                - img [ref=e114]
          - generic [ref=e116]:
            - paragraph [ref=e117]: women
            - link "Handcrafted Pearl Necklace" [ref=e118] [cursor=pointer]:
              - /url: /products/handcrafted-pearl-necklace
            - generic [ref=e119]:
              - generic [ref=e120]: ₹12,500
              - generic [ref=e121]: ₹16,000
              - generic [ref=e122]: 22% OFF
          - button "Add to Cart" [ref=e124] [cursor=pointer]:
            - img [ref=e125]
            - text: Add to Cart
        - generic [ref=e128]:
          - link "Wool Blend Blazer 21% OFF Quick view Toggle wishlist" [ref=e129] [cursor=pointer]:
            - /url: /products/wool-blend-blazer
            - img "Wool Blend Blazer" [ref=e130]
            - generic [ref=e131]: 21% OFF
            - generic [ref=e132]:
              - button "Quick view" [ref=e133]:
                - img [ref=e134]
              - button "Toggle wishlist" [ref=e137]:
                - img [ref=e139]
          - generic [ref=e144]:
            - paragraph [ref=e145]: men
            - link "Wool Blend Blazer" [ref=e146] [cursor=pointer]:
              - /url: /products/wool-blend-blazer
            - generic [ref=e147]:
              - generic [ref=e148]: ₹22,000
              - generic [ref=e149]: ₹28,000
              - generic [ref=e150]: 21% OFF
          - button "Add to Cart" [ref=e152] [cursor=pointer]:
            - img [ref=e153]
            - text: Add to Cart
        - generic [ref=e156]:
          - link "Automatic Skeleton Watch Limited Edition Quick view Toggle wishlist" [ref=e157] [cursor=pointer]:
            - /url: /products/automatic-skeleton-watch
            - img "Automatic Skeleton Watch" [ref=e158]
            - generic [ref=e159]: Limited Edition
            - generic [ref=e160]:
              - button "Quick view" [ref=e161]:
                - img [ref=e162]
              - button "Toggle wishlist" [ref=e165]:
                - img [ref=e167]
          - generic [ref=e173]:
            - paragraph [ref=e174]: men
            - link "Automatic Skeleton Watch" [ref=e175] [cursor=pointer]:
              - /url: /products/automatic-skeleton-watch
            - generic [ref=e177]: ₹75,000
          - button "Add to Cart" [ref=e179] [cursor=pointer]:
            - img [ref=e180]
            - text: Add to Cart
        - generic [ref=e183]:
          - link "Premium Leather Tote 16% OFF Quick view Toggle wishlist" [ref=e184] [cursor=pointer]:
            - /url: /products/premium-leather-tote
            - img "Premium Leather Tote" [ref=e185]
            - generic [ref=e186]: 16% OFF
            - generic [ref=e187]:
              - button "Quick view" [ref=e188]:
                - img [ref=e189]
              - button "Toggle wishlist" [ref=e192]:
                - img [ref=e194]
          - generic [ref=e200]:
            - paragraph [ref=e201]: women
            - link "Premium Leather Tote" [ref=e202] [cursor=pointer]:
              - /url: /products/premium-leather-tote
            - generic [ref=e203]:
              - generic [ref=e204]: ₹18,500
              - generic [ref=e205]: ₹22,000
              - generic [ref=e206]: 16% OFF
          - button "Add to Cart" [ref=e208] [cursor=pointer]:
            - img [ref=e209]
            - text: Add to Cart
        - generic [ref=e212]:
          - link "Banarasi Silk Saree 18% OFF Quick view Toggle wishlist" [ref=e213] [cursor=pointer]:
            - /url: /products/banarasi-silk-saree
            - img "Banarasi Silk Saree" [ref=e214]
            - generic [ref=e215]: 18% OFF
            - generic [ref=e216]:
              - button "Quick view" [ref=e217]:
                - img [ref=e218]
              - button "Toggle wishlist" [ref=e221]:
                - img [ref=e223]
          - generic [ref=e230]:
            - paragraph [ref=e231]: women
            - link "Banarasi Silk Saree" [ref=e232] [cursor=pointer]:
              - /url: /products/banarasi-silk-saree
            - generic [ref=e233]:
              - generic [ref=e234]: ₹45,000
              - generic [ref=e235]: ₹55,000
              - generic [ref=e236]: 18% OFF
          - button "Add to Cart" [ref=e238] [cursor=pointer]:
            - img [ref=e239]
            - text: Add to Cart
        - generic [ref=e242]:
          - link "Silk Evening Gown 19% OFF Quick view Toggle wishlist" [ref=e243] [cursor=pointer]:
            - /url: /products/silk-evening-gown
            - img "Silk Evening Gown" [ref=e244]
            - generic [ref=e245]: 19% OFF
            - generic [ref=e246]:
              - button "Quick view" [ref=e247]:
                - img [ref=e248]
              - button "Toggle wishlist" [ref=e251]:
                - img [ref=e253]
          - generic [ref=e258]:
            - paragraph [ref=e259]: women
            - link "Silk Evening Gown" [ref=e260] [cursor=pointer]:
              - /url: /products/silk-evening-gown
            - generic [ref=e261]:
              - generic [ref=e262]: ₹28,500
              - generic [ref=e263]: ₹35,000
              - generic [ref=e264]: 19% OFF
          - button "Add to Cart" [ref=e266] [cursor=pointer]:
            - img [ref=e267]
            - text: Add to Cart
        - generic [ref=e270]:
          - link "Handloom Cotton Kurta Best Seller Quick view Toggle wishlist" [ref=e271] [cursor=pointer]:
            - /url: /products/handloom-cotton-kurta
            - img "Handloom Cotton Kurta" [ref=e272]
            - generic [ref=e273]: Best Seller
            - generic [ref=e274]:
              - button "Quick view" [ref=e275]:
                - img [ref=e276]
              - button "Toggle wishlist" [ref=e279]:
                - img [ref=e281]
          - generic [ref=e286]:
            - paragraph [ref=e287]: men
            - link "Handloom Cotton Kurta" [ref=e288] [cursor=pointer]:
              - /url: /products/handloom-cotton-kurta
            - generic [ref=e290]: ₹6,500
          - button "Add to Cart" [ref=e292] [cursor=pointer]:
            - img [ref=e293]
            - text: Add to Cart
        - generic [ref=e296]:
          - link "Pure Linen Shirt 25% OFF Quick view Toggle wishlist" [ref=e297] [cursor=pointer]:
            - /url: /products/pure-linen-shirt
            - img "Pure Linen Shirt" [ref=e298]
            - generic [ref=e299]: 25% OFF
            - generic [ref=e300]:
              - button "Quick view" [ref=e301]:
                - img [ref=e302]
              - button "Toggle wishlist" [ref=e305]:
                - img [ref=e307]
          - generic [ref=e312]:
            - paragraph [ref=e313]: men
            - link "Pure Linen Shirt" [ref=e314] [cursor=pointer]:
              - /url: /products/pure-linen-shirt
            - generic [ref=e315]:
              - generic [ref=e316]: ₹8,900
              - generic [ref=e317]: ₹11,900
              - generic [ref=e318]: 25% OFF
          - button "Add to Cart" [ref=e320] [cursor=pointer]:
            - img [ref=e321]
            - text: Add to Cart
  - contentinfo [ref=e324]:
    - generic [ref=e326]:
      - generic [ref=e327]:
        - paragraph [ref=e328]: Stay Connected
        - paragraph [ref=e329]: Join the नबME Inner Circle
      - generic [ref=e331]:
        - textbox "Enter your email" [ref=e332]
        - button "Subscribe" [ref=e333] [cursor=pointer]
    - generic [ref=e335]:
      - generic [ref=e336]:
        - link "নবME" [ref=e337] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e338]: Premium Fashion Destination
        - generic [ref=e339]:
          - link [ref=e340] [cursor=pointer]:
            - /url: https://instagram.com/nabome
            - img [ref=e341]
          - link [ref=e344] [cursor=pointer]:
            - /url: https://youtube.com/@nabome
            - img [ref=e345]
      - generic [ref=e349]:
        - heading "নবME" [level=4] [ref=e350]
        - paragraph [ref=e351]: Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.
      - heading "Shop" [level=4] [ref=e354]
      - heading "Support" [level=4] [ref=e357]
      - heading "Connect" [level=4] [ref=e360]
      - generic [ref=e361]:
        - heading "Contact" [level=4] [ref=e362]
        - generic [ref=e363]:
          - paragraph [ref=e364]: hello@nabome.com
          - paragraph [ref=e365]: +91-1800-নবME
    - generic [ref=e367]:
      - paragraph [ref=e368]: © 2026 নবME. All rights reserved.
      - generic [ref=e369]:
        - link "FAQ" [ref=e370] [cursor=pointer]:
          - /url: /faq
        - link "Privacy Policy" [ref=e371] [cursor=pointer]:
          - /url: /privacy
        - link "Terms of Service" [ref=e372] [cursor=pointer]:
          - /url: /terms
        - link "Shipping & Returns" [ref=e373] [cursor=pointer]:
          - /url: /shipping-returns
      - button "Back to top" [ref=e374] [cursor=pointer]:
        - text: Back to top
        - img [ref=e375]
```

# Test source

```ts
  13  |     await page.goto('/products');
  14  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  15  |     await page.locator('[class*="product-card"], .product-card').first().click();
  16  |     await page.waitForTimeout(500);
  17  |     const heading = page.locator('h1, [class*="product-title"], [class*="product-name"]').first();
  18  |     if (await heading.isVisible()) {
  19  |       const text = await heading.textContent();
  20  |       expect(text).toBeTruthy();
  21  |     }
  22  |   });
  23  | 
  24  |   test('product detail shows price', async ({ page }) => {
  25  |     await page.goto('/products');
  26  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  27  |     await page.locator('[class*="product-card"], .product-card').first().click();
  28  |     await page.waitForTimeout(500);
  29  |     const price = page.locator('[class*="price"], text=/₹|Rs|\\$/').first();
  30  |     if (await price.isVisible()) {
  31  |       await expect(price).toBeVisible();
  32  |     }
  33  |   });
  34  | 
  35  |   test('product detail shows product images', async ({ page }) => {
  36  |     await page.goto('/products');
  37  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  38  |     await page.locator('[class*="product-card"], .product-card').first().click();
  39  |     await page.waitForTimeout(500);
  40  |     const images = page.locator('[class*="product"] img, [class*="gallery"] img, main img');
  41  |     const count = await images.count();
  42  |     expect(count).toBeGreaterThan(0);
  43  |   });
  44  | 
  45  |   test('product detail shows description', async ({ page }) => {
  46  |     await page.goto('/products');
  47  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  48  |     await page.locator('[class*="product-card"], .product-card').first().click();
  49  |     await page.waitForTimeout(500);
  50  |     const description = page.locator('[class*="description"], [class*="product-description"], p').first();
  51  |     if (await description.isVisible().catch(() => false)) {
  52  |       await expect(description).toBeVisible();
  53  |     }
  54  |   });
  55  | 
  56  |   test('product detail has add to cart button', async ({ page }) => {
  57  |     await page.goto('/products');
  58  |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
  59  |     await page.locator('[class*="product-card"], .product-card').first().click();
  60  |     await page.waitForTimeout(500);
  61  |     const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to bag"), button:has-text("Add to Bag")').first();
  62  |     await expect(addBtn).toBeVisible();
  63  |   });
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
> 113 |     await page.locator('[class*="product-card"], .product-card').first().waitFor({ timeout: 10000 });
      |                                                                          ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
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
  164 |     expect(isError).toBeTruthy();
  165 |   });
  166 | });
  167 | 
```