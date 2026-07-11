import { test, expect } from '@playwright/test';
import { navigateToAdminPage } from './admin-auth-helper';

// Use storageState for authentication instead of logging in each test
test.use({ storageState: 'playwright/.auth/admin.json' });

// Viewport sizes for testing
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  largeDesktop: { width: 2560, height: 1440 }
};

// All admin page routes
const ADMIN_PAGES = [
  { path: '/admin', name: 'Dashboard' },
  { path: '/admin/products', name: 'Products List' },
  { path: '/admin/categories', name: 'Categories' },
  { path: '/admin/collections', name: 'Collections' },
  { path: '/admin/orders', name: 'Orders List' },
  { path: '/admin/returns', name: 'Returns List' },
  { path: '/admin/customers', name: 'Customers' },
  { path: '/admin/lookbooks', name: 'Lookbooks' },
  { path: '/admin/brands', name: 'Brands' },
  { path: '/admin/size-guides', name: 'Size Guides' },
  { path: '/admin/labels', name: 'Labels' },
  { path: '/admin/inventory', name: 'Inventory' },
  { path: '/admin/cms', name: 'CMS' },
  { path: '/admin/cms/homepage', name: 'Homepage Builder' },
  { path: '/admin/media', name: 'Media Library' },
  { path: '/admin/media/health', name: 'Media Health' },
  { path: '/admin/seo', name: 'SEO' },
  { path: '/admin/theme/builder', name: 'Theme Builder' },
  { path: '/admin/analytics', name: 'Analytics' },
  { path: '/admin/settings', name: 'Settings' },
  { path: '/admin/coupons', name: 'Coupons' },
  { path: '/admin/reviews', name: 'Reviews' },
  { path: '/admin/newsletter', name: 'Newsletter' },
  { path: '/admin/contacts', name: 'Contacts' },
  { path: '/admin/announcements', name: 'Announcements' },
  { path: '/admin/import-export', name: 'Import Export' },
  { path: '/admin/search-index', name: 'Search Index' },
  { path: '/admin/social-links', name: 'Social Links' },
  { path: '/admin/support', name: 'Support Tickets' },
  { path: '/admin/faq', name: 'FAQ' },
  { path: '/admin/notifications', name: 'Notifications' },
  { path: '/admin/webhooks', name: 'Webhooks' },
  { path: '/admin/page-templates', name: 'Page Templates' },
  { path: '/admin/campaigns', name: 'Campaigns' },
  { path: '/admin/abandoned-carts', name: 'Abandoned Carts' },
  { path: '/admin/auth', name: 'Auth Activity' },
  { path: '/admin/audit-log', name: 'Audit Log' },
  { path: '/admin/wishlists', name: 'Wishlists' }
];

test.describe.configure({ mode: 'parallel' });

test.describe('Admin Visual QA', () => {

  ADMIN_PAGES.forEach(({ path, name }) => {
    test.describe(`${name} (${path})`, () => {
      Object.entries(VIEWPORTS).forEach(([viewportName, viewport]) => {
        test(`screenshot regression at ${viewportName} (${viewport.width}x${viewport.height})`, async ({ page }) => {
          await page.setViewportSize(viewport);
          await navigateToAdminPage(page, path);
          
          // Use Playwright's screenshot regression for visual testing
          const screenshotName = `${name.replace(/\s+/g, '-').toLowerCase()}-${viewportName}`;
          
          // Mask dynamic content like timestamps, charts, and live data
          const maskSelectors = [
            '[data-testid="timestamp"]',
            '[data-testid="chart"]',
            '[data-testid="live-data"]',
            '.timestamp',
            '.live-counter',
            '.chart-canvas',
          ];
          
          const masks = maskSelectors
            .map(selector => page.locator(selector).first())
            .filter(locator => locator !== null);
          
          await expect(page).toHaveScreenshot(
            `admin/${screenshotName}.png`,
            {
              fullPage: true,
              animations: 'disabled',
              mask: masks.length > 0 ? masks : undefined,
            }
          );
        });
      });
    });
  });

  test.describe('Interactive States Verification', () => {
    test('products page hover and focus states', async ({ page }) => {
      await navigateToAdminPage(page, '/admin/products');

      const buttons = page.locator('button').first();
      if (await buttons.count() > 0) {
        await buttons.hover();
        await page.waitForTimeout(100);
        const hoverStyle = await buttons.evaluate(el => window.getComputedStyle(el).backgroundColor);
        console.log(`Button hover style: ${hoverStyle}`);
      }

      const inputs = page.locator('input').first();
      if (await inputs.count() > 0) {
        await inputs.focus();
        await page.waitForTimeout(100);
        const focusStyle = await inputs.evaluate(el => window.getComputedStyle(el).outline);
        console.log(`Input focus style: ${focusStyle}`);
      }

      const disabledButtons = await page.locator('button:disabled').count();
      console.log(`Disabled buttons: ${disabledButtons}`);
    });

    test('orders page hover and focus states', async ({ page }) => {
      await navigateToAdminPage(page, '/admin/orders');

      const buttons = page.locator('button').first();
      if (await buttons.count() > 0) {
        await buttons.hover();
        await page.waitForTimeout(100);
        const hoverStyle = await buttons.evaluate(el => window.getComputedStyle(el).backgroundColor);
        console.log(`Button hover style: ${hoverStyle}`);
      }

      const inputs = page.locator('input').first();
      if (await inputs.count() > 0) {
        await inputs.focus();
        await page.waitForTimeout(100);
        const focusStyle = await inputs.evaluate(el => window.getComputedStyle(el).outline);
        console.log(`Input focus style: ${focusStyle}`);
      }

      const disabledButtons = await page.locator('button:disabled').count();
      console.log(`Disabled buttons: ${disabledButtons}`);
    });

    test('customers page hover and focus states', async ({ page }) => {
      await navigateToAdminPage(page, '/admin/customers');

      const buttons = page.locator('button').first();
      if (await buttons.count() > 0) {
        await buttons.hover();
        await page.waitForTimeout(100);
        const hoverStyle = await buttons.evaluate(el => window.getComputedStyle(el).backgroundColor);
        console.log(`Button hover style: ${hoverStyle}`);
      }

      const inputs = page.locator('input').first();
      if (await inputs.count() > 0) {
        await inputs.focus();
        await page.waitForTimeout(100);
        const focusStyle = await inputs.evaluate(el => window.getComputedStyle(el).outline);
        console.log(`Input focus style: ${focusStyle}`);
      }

      const disabledButtons = await page.locator('button:disabled').count();
      console.log(`Disabled buttons: ${disabledButtons}`);
    });
  });

  test.describe('Empty States Verification', () => {
    test('products page empty state', async ({ page }) => {
      await navigateToAdminPage(page, '/admin/products');
      
      const emptyState = page.locator('.empty-state, [data-empty], .no-data');
      const hasEmptyState = await emptyState.count() > 0;
      
      console.log(`Empty state present: ${hasEmptyState}`);
      
      if (hasEmptyState) {
        await expect(page).toHaveScreenshot('admin/empty-state-products.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [page.locator('.timestamp, .live-data').first()],
        });
      }
    });

    test('orders page empty state', async ({ page }) => {
      await navigateToAdminPage(page, '/admin/orders');
      
      const emptyState = page.locator('.empty-state, [data-empty], .no-data');
      const hasEmptyState = await emptyState.count() > 0;
      
      console.log(`Empty state present: ${hasEmptyState}`);
      
      if (hasEmptyState) {
        await expect(page).toHaveScreenshot('admin/empty-state-orders.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [page.locator('.timestamp, .live-data').first()],
        });
      }
    });

    test('customers page empty state', async ({ page }) => {
      await navigateToAdminPage(page, '/admin/customers');
      
      const emptyState = page.locator('.empty-state, [data-empty], .no-data');
      const hasEmptyState = await emptyState.count() > 0;
      
      console.log(`Empty state present: ${hasEmptyState}`);
      
      if (hasEmptyState) {
        await expect(page).toHaveScreenshot('admin/empty-state-customers.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [page.locator('.timestamp, .live-data').first()],
        });
      }
    });
  });

  test.describe('Loading States Verification', () => {
    test('analytics page loading state', async ({ page }) => {
      await navigateToAdminPage(page, '/admin/analytics');
      
      const loadingIndicator = page.locator('.loading, .spinner, [data-loading], .animate-spin');
      const hasLoading = await loadingIndicator.count() > 0;
      
      console.log(`Loading state present: ${hasLoading}`);
      
      if (hasLoading) {
        await expect(page).toHaveScreenshot('admin/loading-state-analytics.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [page.locator('.timestamp, .live-data, .chart-canvas').first()],
        });
      }
    });

    test('dashboard loading state', async ({ page }) => {
      await navigateToAdminPage(page, '/admin');
      
      const loadingIndicator = page.locator('.loading, .spinner, [data-loading], .animate-spin');
      const hasLoading = await loadingIndicator.count() > 0;
      
      console.log(`Loading state present: ${hasLoading}`);
      
      if (hasLoading) {
        await expect(page).toHaveScreenshot('admin/loading-state-dashboard.png', {
          fullPage: true,
          animations: 'disabled',
          mask: [page.locator('.timestamp, .live-data, .chart-canvas').first()],
        });
      }
    });
  });
});
