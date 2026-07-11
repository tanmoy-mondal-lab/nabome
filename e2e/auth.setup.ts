import { FullConfig } from '@playwright/test';
import { loginAsAdmin } from './admin-auth-helper';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Create a browser context for authentication
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    // Perform admin login
    await loginAsAdmin(page);

    // Save storage state to file
    await context.storageState({ path: 'playwright/.auth/admin.json' });
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✓ Admin authentication state saved to playwright/.auth/admin.json');
}

export default globalSetup;
