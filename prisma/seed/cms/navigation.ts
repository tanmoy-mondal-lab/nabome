/**
 * Navigation Seed
 * Seeds navigation menus
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { CMS_SLUGS } from '../utils/constants';
import type { navigation_menus } from '@prisma/client';

export async function seedNavigation() {
  // eslint-disable-next-line no-console
  console.log('🧭 Seeding navigation menus...');

  // Use fixed UUIDs for navigation menus to ensure idempotency
  const headerMenuId = '00000000-0000-0000-0000-000000000017';
  const footerMenuId = '00000000-0000-0000-0000-000000000018';

  const headerMenu = await upsertByField<navigation_menus>(
    prisma.navigation_menus,
    { id: headerMenuId },
    {
      id: headerMenuId,
      name: CMS_SLUGS.navigation,
      location: 'header',
      items: [
        { label: 'Home', url: '/', children: [] },
        { label: 'Collections', url: '/collections', children: [] },
        { label: 'Categories', url: '/categories', children: [] },
        { label: 'Lookbooks', url: '/lookbooks', children: [] },
        { label: 'About', url: '/about', children: [] },
      ],
      is_active: true,
      updated_at: new Date(),
    },
    'NavigationHeader'
  );

  const footerMenu = await upsertByField<navigation_menus>(
    prisma.navigation_menus,
    { id: footerMenuId },
    {
      id: footerMenuId,
      name: 'footer-links',
      location: 'footer',
      items: [
        { label: 'Privacy Policy', url: '/privacy', children: [] },
        { label: 'Terms of Service', url: '/terms', children: [] },
        { label: 'Shipping Policy', url: '/shipping', children: [] },
        { label: 'Return Policy', url: '/returns', children: [] },
      ],
      is_active: true,
      updated_at: new Date(),
    },
    'NavigationFooter'
  );

  return { headerMenu, footerMenu };
}
