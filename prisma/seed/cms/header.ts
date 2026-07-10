/**
 * Header Seed
 * Seeds header configuration
 * Note: Header is configured via navigation menus
 * This seed documents the header configuration
 */

import { prisma } from '../utils/helpers';

export async function seedHeader() {
  console.log('📋 Seeding header configuration...');

  // Header is configured via navigation_menus with location 'header'
  // This documents the header configuration structure
  const headerConfig = {
    logo: {
      url: '/logo.svg',
      alt: 'NABOME',
    },
    search: {
      enabled: true,
      placeholder: 'Search products...',
    },
    cart: {
      enabled: true,
      showCount: true,
    },
    wishlist: {
      enabled: true,
    },
    user: {
      enabled: true,
    },
  };

  console.log('Header configuration:', headerConfig);

  return headerConfig;
}
