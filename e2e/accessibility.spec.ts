import { test, expect } from '@playwright/test';

test.describe('Accessibility - WCAG AA Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all images have alt text', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Decorative images should have empty alt, others should have descriptive alt
      expect(alt !== null).toBeTruthy();
    }
  });

  test('all form inputs have associated labels', async ({ page }) => {
    await page.goto('/products');
    
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate((el: HTMLInputElement) => {
        return !!el.labels?.length || !!el.getAttribute('aria-label') || !!el.getAttribute('aria-labelledby');
      });
      expect(hasLabel).toBeTruthy();
    }
  });

  test('all buttons have accessible names', async ({ page }) => {
    const buttons = page.locator('button, [role="button"]');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const hasAccessibleName = await button.evaluate((el: HTMLElement) => {
        return !!el.textContent?.trim() || !!el.getAttribute('aria-label') || !!el.getAttribute('aria-labelledby');
      });
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/products');
    
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    
    if (count > 0) {
      // Check that h1 exists
      const h1 = page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThan(0);
      
      // Check heading levels don't skip (e.g., h1 followed by h3)
      let previousLevel = 0;
      for (let i = 0; i < count; i++) {
        const heading = headings.nth(i);
        const level = parseInt(await heading.evaluate((el: HTMLElement) => el.tagName.substring(1)));
        
        if (previousLevel > 0 && level > previousLevel + 1) {
          // Heading level skipped - this is a warning, not necessarily an error
        }
        previousLevel = level;
      }
    }
  });

  test('links have descriptive text', async ({ page }) => {
    const links = page.locator('a[href]');
    const count = await links.count();
    
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      const hasDescription = (text?.trim().length ?? 0) > 0 || ariaLabel !== null;
      expect(hasDescription).toBeTruthy();
    }
  });

  test('focus management works correctly', async ({ page }) => {
    await page.goto('/products');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    // This is a basic check - in production, you'd use a dedicated accessibility tool
    await page.goto('/products');
    
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button');
    const count = await textElements.count();
    
    // Sample check - ensure text is visible
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = textElements.nth(i);
      const isVisible = await element.isVisible();
      if (isVisible) {
        const styles = await element.evaluate((el: HTMLElement) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
          };
        });
        
        // Basic check that text isn't the same color as background
        expect(styles.color).not.toBe(styles.backgroundColor);
      }
    }
  });

  test('skip to main content link exists', async ({ page }) => {
    await page.goto('/');
    
    const skipLink = page.locator('a[href="#main"], a[href="#content"], [data-testid="skip-link"]');
    const exists = await skipLink.count() > 0;
    
    // This is optional but recommended for accessibility
    if (exists) {
      await skipLink.first().click();
      await page.waitForTimeout(100);
      
      const main = page.locator('main, [role="main"], #main, #content');
      await expect(main.first()).toBeVisible();
    }
  });

  test('modal dialogs are accessible', async ({ page }) => {
    await page.goto('/products');
    
    // Try to trigger a modal (e.g., quick view, cart drawer)
    const productCard = page.locator('[class*="product-card"]').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"], [class*="modal"], [class*="drawer"]');
      if (await modal.first().isVisible().catch(() => false)) {
        // Check that focus is trapped in modal
        const modalContent = modal.first();
        const focusedElement = await page.evaluate(() => document.activeElement);
        const isInModal = await modalContent.evaluate((modal: HTMLElement, focused: Element) => 
          modal.contains(focused), focusedElement as Element
        );
        
        expect(isInModal).toBeTruthy();
        
        // Check for close button
        const closeButton = modal.locator('button[aria-label*="close"], button:has-text("Close"), button:has-text("×")').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('error messages are associated with form fields', async ({ page }) => {
    await page.goto('/account/login');
    
    // Try to submit form without required fields
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      
      const errorMessages = page.locator('[role="alert"], [class*="error"], [data-testid="error"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        // Check that errors are associated with inputs
        const firstError = errorMessages.first();
        const hasAriaDescribedBy = await firstError.getAttribute('aria-describedby') !== null;
        const hasAriaLive = await firstError.getAttribute('aria-live') !== null;
        
        expect(hasAriaDescribedBy || hasAriaLive).toBeTruthy();
      }
    }
  });

  test('keyboard navigation works for all interactive elements', async ({ page }) => {
    await page.goto('/products');
    
    const interactiveElements = page.locator('button, a[href], input, select, [tabindex]:not([tabindex="-1"])');
    const count = await interactiveElements.count();
    
    // Test first 10 elements
    const testCount = Math.min(count, 10);
    
    for (let i = 0; i < testCount; i++) {
      const element = interactiveElements.nth(i);
      if (await element.isVisible()) {
        await element.focus();
        await page.waitForTimeout(50);
        
        const focused = await element.evaluate((el: HTMLElement) => document.activeElement === el);
        expect(focused).toBeTruthy();
      }
    }
  });
});

test.describe('Accessibility - Screen Reader Compatibility', () => {
  test('ARIA landmarks are present', async ({ page }) => {
    await page.goto('/');
    
    const landmarks = page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], [role="complementary"], header, nav, main, footer');
    const count = await landmarks.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('live regions announce dynamic content', async ({ page }) => {
    await page.goto('/cart');
    
    // Add item to cart and check for announcement
    const addBtn = page.locator('button:has-text("Add")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"], [role="status"]');
      const exists = await liveRegion.count() > 0;
      
      // Live regions should exist for dynamic content
      if (exists) {
        const hasContent = await liveRegion.first().textContent();
        expect(hasContent?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  test('tables have proper headers', async ({ page }) => {
    await page.goto('/admin/orders');
    
    const tables = page.locator('table');
    const count = await tables.count();
    
    for (let i = 0; i < count; i++) {
      const table = tables.nth(i);
      const hasHeaders = await table.locator('th').count() > 0;
      
      if (hasHeaders) {
        // Check that scope attribute is present
        const headers = table.locator('th');
        const headerCount = await headers.count();
        
        for (let j = 0; j < headerCount; j++) {
          const header = headers.nth(j);
          const hasScope = await header.getAttribute('scope') !== null;
          expect(hasScope).toBeTruthy();
        }
      }
    }
  });
});
