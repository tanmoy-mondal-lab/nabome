/**
 * Lookbooks Seed
 * Seeds lookbook configuration
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { CMS_SLUGS } from '../utils/constants';
import type { lookbooks } from '@prisma/client';

export async function seedLookbooks() {
  console.log('📸 Seeding lookbooks...');

  // Use a fixed UUID for lookbook to ensure idempotency
  const lookbookId = '00000000-0000-0000-0000-000000000015';

  const lookbook = await upsertByField<lookbooks>(
    prisma.lookbooks,
    { id: lookbookId },
    {
      id: lookbookId,
      name: 'Festive Lookbook',
      slug: CMS_SLUGS.lookbook,
      description: 'Our festive collection lookbook featuring traditional elegance',
      cover_image_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nabome/lookbooks/festive-cover.jpg',
      season: 'Festive',
      year: 2024,
      layout: 'grid',
      story: {
        title: 'Celebrating Tradition',
        description: 'A journey through our handcrafted festive collection',
      },
      tags: ['festive', 'traditional', 'handcrafted'],
      meta_title: 'Festive Lookbook | NABOME',
      meta_desc: 'Explore our festive collection lookbook',
      is_active: true,
      sort_order: 1,
      published_at: new Date(),
      updated_at: new Date(),
    },
    'Lookbook'
  );

  return lookbook;
}
