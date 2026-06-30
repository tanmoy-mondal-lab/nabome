# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-flows.spec.ts >> Admin - Analytics >> analytics page loads
- Location: e2e/admin-flows.spec.ts:331:3

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
  228 |     await page.goto('/admin/coupons');
  229 |     await page.waitForTimeout(1000);
  230 |     const addBtn = page.locator('button:has-text("Add Coupon"), a:has-text("Add Coupon"), button:has-text("Create")').first();
  231 |     if (await addBtn.isVisible().catch(() => false)) {
  232 |       await expect(addBtn).toBeVisible();
  233 |     }
  234 |   });
  235 | });
  236 | 
  237 | test.describe('Admin - Reviews', () => {
  238 |   test.beforeEach(async ({ page }) => {
  239 |     await page.goto('/auth/login');
  240 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  241 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  242 |     await page.click('button[type="submit"]');
  243 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  244 |   });
  245 | 
  246 |   test('reviews page loads', async ({ page }) => {
  247 |     await page.goto('/admin/reviews');
  248 |     await expect(page).toHaveURL(/.*admin\/reviews/);
  249 |     await page.waitForTimeout(1000);
  250 |   });
  251 | });
  252 | 
  253 | test.describe('Admin - CMS Pages', () => {
  254 |   test.beforeEach(async ({ page }) => {
  255 |     await page.goto('/auth/login');
  256 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  257 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  258 |     await page.click('button[type="submit"]');
  259 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  260 |   });
  261 | 
  262 |   test('CMS pages list loads', async ({ page }) => {
  263 |     await page.goto('/admin/cms/pages');
  264 |     await expect(page).toHaveURL(/.*admin\/cms\/pages/);
  265 |     await page.waitForTimeout(1000);
  266 |   });
  267 | 
  268 |   test('homepage builder loads', async ({ page }) => {
  269 |     await page.goto('/admin/cms/homepage');
  270 |     await expect(page).toHaveURL(/.*admin\/cms\/homepage/);
  271 |     await page.waitForTimeout(1000);
  272 |   });
  273 | 
  274 |   test('hero builder loads', async ({ page }) => {
  275 |     await page.goto('/admin/cms/hero-builder');
  276 |     await expect(page).toHaveURL(/.*admin\/cms\/hero-builder/);
  277 |     await page.waitForTimeout(1000);
  278 |   });
  279 | 
  280 |   test('header builder loads', async ({ page }) => {
  281 |     await page.goto('/admin/cms/header');
  282 |     await expect(page).toHaveURL(/.*admin\/cms\/header/);
  283 |     await expect(page.getByText('Header Builder')).toBeVisible();
  284 |     await page.waitForTimeout(1000);
  285 |   });
  286 | 
  287 |   test('footer builder loads', async ({ page }) => {
  288 |     await page.goto('/admin/cms/footer');
  289 |     await expect(page).toHaveURL(/.*admin\/cms\/footer/);
  290 |     await page.waitForTimeout(1000);
  291 |   });
  292 | 
  293 |   test('banners page loads', async ({ page }) => {
  294 |     await page.goto('/admin/cms/banners');
  295 |     await expect(page).toHaveURL(/.*admin\/cms\/banners/);
  296 |     await page.waitForTimeout(1000);
  297 |   });
  298 | });
  299 | 
  300 | test.describe('Admin - Marketing', () => {
  301 |   test.beforeEach(async ({ page }) => {
  302 |     await page.goto('/auth/login');
  303 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  304 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  305 |     await page.click('button[type="submit"]');
  306 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  307 |   });
  308 | 
  309 |   test('marketing page loads', async ({ page }) => {
  310 |     await page.goto('/admin/marketing');
  311 |     await expect(page).toHaveURL(/.*admin\/marketing/);
  312 |     await page.waitForTimeout(1000);
  313 |   });
  314 | 
  315 |   test('announcements page loads', async ({ page }) => {
  316 |     await page.goto('/admin/announcements');
  317 |     await expect(page).toHaveURL(/.*admin\/announcements/);
  318 |     await page.waitForTimeout(1000);
  319 |   });
  320 | });
  321 | 
  322 | test.describe('Admin - Analytics', () => {
  323 |   test.beforeEach(async ({ page }) => {
  324 |     await page.goto('/auth/login');
  325 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  326 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  327 |     await page.click('button[type="submit"]');
> 328 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  329 |   });
  330 | 
  331 |   test('analytics page loads', async ({ page }) => {
  332 |     await page.goto('/admin/analytics');
  333 |     await expect(page).toHaveURL(/.*admin\/analytics/);
  334 |     await page.waitForTimeout(1000);
  335 |   });
  336 | });
  337 | 
  338 | test.describe('Admin - Settings', () => {
  339 |   test.beforeEach(async ({ page }) => {
  340 |     await page.goto('/auth/login');
  341 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  342 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  343 |     await page.click('button[type="submit"]');
  344 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  345 |   });
  346 | 
  347 |   test('settings page loads', async ({ page }) => {
  348 |     await page.goto('/admin/settings');
  349 |     await expect(page).toHaveURL(/.*admin\/settings/);
  350 |     await page.waitForTimeout(1000);
  351 |   });
  352 | 
  353 |   test('SEO settings page loads', async ({ page }) => {
  354 |     await page.goto('/admin/seo');
  355 |     await expect(page).toHaveURL(/.*admin\/seo/);
  356 |     await page.waitForTimeout(1000);
  357 |   });
  358 | 
  359 |   test('theme page loads', async ({ page }) => {
  360 |     await page.goto('/admin/theme');
  361 |     await expect(page).toHaveURL(/.*admin\/theme/);
  362 |     await page.waitForTimeout(1000);
  363 |   });
  364 | });
  365 | 
  366 | test.describe('Admin - Support', () => {
  367 |   test.beforeEach(async ({ page }) => {
  368 |     await page.goto('/auth/login');
  369 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  370 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  371 |     await page.click('button[type="submit"]');
  372 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  373 |   });
  374 | 
  375 |   test('support tickets page loads', async ({ page }) => {
  376 |     await page.goto('/admin/support');
  377 |     await expect(page).toHaveURL(/.*admin\/support/);
  378 |     await page.waitForTimeout(1000);
  379 |   });
  380 | 
  381 |   test('FAQ page loads', async ({ page }) => {
  382 |     await page.goto('/admin/faq');
  383 |     await expect(page).toHaveURL(/.*admin\/faq/);
  384 |     await page.waitForTimeout(1000);
  385 |   });
  386 | });
  387 | 
  388 | test.describe('Admin - Content Management', () => {
  389 |   test.beforeEach(async ({ page }) => {
  390 |     await page.goto('/auth/login');
  391 |     await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
  392 |     await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
  393 |     await page.click('button[type="submit"]');
  394 |     await page.waitForURL(/.*admin/, { timeout: 10000 });
  395 |   });
  396 | 
  397 |   test('lookbooks page loads', async ({ page }) => {
  398 |     await page.goto('/admin/lookbooks');
  399 |     await expect(page).toHaveURL(/.*admin\/lookbooks/);
  400 |     await page.waitForTimeout(1000);
  401 |   });
  402 | 
  403 |   test('media library loads', async ({ page }) => {
  404 |     await page.goto('/admin/media');
  405 |     await expect(page).toHaveURL(/.*admin\/media/);
  406 |     await page.waitForTimeout(1000);
  407 |   });
  408 | 
  409 |   test('brands page loads', async ({ page }) => {
  410 |     await page.goto('/admin/brands');
  411 |     await expect(page).toHaveURL(/.*admin\/brands/);
  412 |     await page.waitForTimeout(1000);
  413 |   });
  414 | 
  415 |   test('size guides page loads', async ({ page }) => {
  416 |     await page.goto('/admin/size-guides');
  417 |     await expect(page).toHaveURL(/.*admin\/size-guides/);
  418 |     await page.waitForTimeout(1000);
  419 |   });
  420 | 
  421 |   test('labels page loads', async ({ page }) => {
  422 |     await page.goto('/admin/labels');
  423 |     await expect(page).toHaveURL(/.*admin\/labels/);
  424 |     await page.waitForTimeout(1000);
  425 |   });
  426 | 
  427 |   test('collections page loads', async ({ page }) => {
  428 |     await page.goto('/admin/collections');
```