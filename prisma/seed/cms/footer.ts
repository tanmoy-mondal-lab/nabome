/**
 * Footer Seed
 * Seeds footer sections
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import type { footer_sections } from '@prisma/client';

export async function seedFooter() {
  // eslint-disable-next-line no-console
  console.log('📝 Seeding footer sections...');

  // Use fixed UUIDs for footer sections to ensure idempotency
  const column1Id = '00000000-0000-0000-0000-000000000025';
  const column2Id = '00000000-0000-0000-0000-000000000026';
  const column3Id = '00000000-0000-0000-0000-000000000027';
  const column4Id = '00000000-0000-0000-0000-000000000028';

  const column1 = await upsertByField<footer_sections>(
    prisma.footer_sections,
    { id: column1Id },
    {
      id: column1Id,
      column: 1,
      title: 'Shop',
      content_type: 'links',
      content: {
        links: [
          { label: 'New Arrivals', url: '/collections/new-arrivals' },
          { label: 'Best Sellers', url: '/collections/best-sellers' },
          { label: 'Categories', url: '/categories' },
          { label: 'Collections', url: '/collections' },
        ],
      },
      sort_order: 1,
      is_active: true,
      updated_at: new Date(),
    },
    'FooterColumn1'
  );

  const column2 = await upsertByField<footer_sections>(
    prisma.footer_sections,
    { id: column2Id },
    {
      id: column2Id,
      column: 2,
      title: 'Company',
      content_type: 'links',
      content: {
        links: [
          { label: 'About Us', url: '/about' },
          { label: 'Contact', url: '/contact' },
          { label: 'Careers', url: '/careers' },
          { label: 'Press', url: '/press' },
        ],
      },
      sort_order: 1,
      is_active: true,
      updated_at: new Date(),
    },
    'FooterColumn2'
  );

  const column3 = await upsertByField<footer_sections>(
    prisma.footer_sections,
    { id: column3Id },
    {
      id: column3Id,
      column: 3,
      title: 'Support',
      content_type: 'links',
      content: {
        links: [
          { label: 'FAQ', url: '/faq' },
          { label: 'Shipping', url: '/shipping' },
          { label: 'Returns', url: '/returns' },
          { label: 'Size Guide', url: '/size-guide' },
        ],
      },
      sort_order: 1,
      is_active: true,
      updated_at: new Date(),
    },
    'FooterColumn3'
  );

  const column4 = await upsertByField<footer_sections>(
    prisma.footer_sections,
    { id: column4Id },
    {
      id: column4Id,
      column: 4,
      title: 'Newsletter',
      content_type: 'newsletter',
      content: {
        title: 'Subscribe to our newsletter',
        description: 'Get updates on new arrivals and exclusive offers',
      },
      sort_order: 1,
      is_active: true,
      updated_at: new Date(),
    },
    'FooterColumn4'
  );

  return { column1, column2, column3, column4 };
}
