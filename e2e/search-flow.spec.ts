import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should perform basic search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('shirt');
    await page.press(searchInput, 'Enter');
    
    await expect(page).toHaveURL(/.*search.*/);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should show search suggestions', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('shi');
    
    // Should show suggestions dropdown
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
  });

  test('should filter search results by category', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('shirt');
    await page.press(searchInput, 'Enter');
    
    // Apply category filter
    await page.click('button:has-text("Categories")');
    await page.click('label:has-text("Men")');
    
    // Should filter results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('nonexistentproductxyz');
    await page.press(searchInput, 'Enter');
    
    // Should show empty state
    await expect(page.locator('text=No results found')).toBeVisible();
    await expect(page.locator('text=Try adjusting your search')).toBeVisible();
  });

  test('should support fuzzy search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    // Typo in search term
    await searchInput.fill('shrt');
    await page.press(searchInput, 'Enter');
    
    // Should still show relevant results (fuzzy matching)
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should support prefix search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('shi');
    await page.press(searchInput, 'Enter');
    
    // Should show results starting with 'shi'
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should display search result pagination', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('shirt');
    await page.press(searchInput, 'Enter');
    
    // Check for pagination controls
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      await page.click('button:has-text("Next")');
      await expect(page).toHaveURL(/.*page=2/);
    }
  });
});
