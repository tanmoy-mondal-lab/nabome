# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> user can logout
- Location: e2e/auth.spec.ts:47:3

# Error details

```
Test timeout of 30000ms exceeded.
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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('user can register', async ({ page }) => {
  9  |     await page.click('text=Register');
  10 |     await expect(page).toHaveURL(/.*register/);
  11 | 
  12 |     const randomEmail = `test${Date.now()}@example.com`;
  13 |     await page.fill('input[name="email"]', randomEmail);
  14 |     await page.fill('input[name="password"]', 'Test123456!');
  15 |     await page.fill('input[name="confirmPassword"]', 'Test123456!');
  16 |     await page.fill('input[name="fullName"]', 'Test User');
  17 |     await page.click('button[type="submit"]');
  18 | 
  19 |     // Should redirect to verification page or dashboard
  20 |     await expect(page).toHaveURL(/.*(verify-email|dashboard)/, { timeout: 10000 });
  21 |   });
  22 | 
  23 |   test('user can login with valid credentials', async ({ page }) => {
  24 |     await page.click('text=Login');
  25 |     await expect(page).toHaveURL(/.*login/);
  26 | 
  27 |     await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
  28 |     await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Test123456!');
  29 |     await page.click('button[type="submit"]');
  30 | 
  31 |     // Should redirect to dashboard or home
  32 |     await expect(page).toHaveURL(/.*(dashboard|\/)/, { timeout: 10000 });
  33 |   });
  34 | 
  35 |   test('login fails with invalid credentials', async ({ page }) => {
  36 |     await page.click('text=Login');
  37 |     await expect(page).toHaveURL(/.*login/);
  38 | 
  39 |     await page.fill('input[name="email"]', 'invalid@example.com');
  40 |     await page.fill('input[name="password"]', 'wrongpassword');
  41 |     await page.click('button[type="submit"]');
  42 | 
  43 |     // Should show error message
  44 |     await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  45 |   });
  46 | 
  47 |   test('user can logout', async ({ page }) => {
  48 |     // First login
  49 |     await page.goto('/login');
> 50 |     await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  51 |     await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Test123456!');
  52 |     await page.click('button[type="submit"]');
  53 |     await page.waitForURL(/.*(dashboard|\/)/);
  54 | 
  55 |     // Then logout
  56 |     await page.click('button[aria-label="User menu"], .user-menu-button');
  57 |     await page.click('text=Logout');
  58 |     
  59 |     // Should redirect to home or login
  60 |     await expect(page).toHaveURL(/.*(login|\/)/);
  61 |   });
  62 | });
  63 | 
```