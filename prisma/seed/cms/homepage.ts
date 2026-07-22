/**
 * Homepage Seed
 * Seeds homepage sections
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import type { homepage_sections } from '@prisma/client';

export async function seedHomepage() {
  // eslint-disable-next-line no-console
  console.log('🏠 Seeding homepage...');

  // Use fixed UUIDs for homepage sections to ensure idempotency
  const heroSectionId = '00000000-0000-0000-0000-000000000023';
  const featuredCollectionsId = '00000000-0000-0000-0000-000000000024';

  const heroSection = await upsertByField<homepage_sections>(
    prisma.homepage_sections,
    { id: heroSectionId },
    {
      id: heroSectionId,
      section_type: 'hero_slider',
      title: 'Welcome to NABOME',
      subtitle: 'Where heritage craftsmanship meets contemporary elegance',
      content: {
        slides: [
          {
            image: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nabome/hero/slide1.jpg',
            title: 'Festive Collection 2024',
            subtitle: 'Discover our exclusive handcrafted pieces',
            cta_text: 'Shop Now',
            cta_link: '/collections/festive-collection',
          },
        ],
      },
      sort_order: 1,
      is_active: true,
      visibility: 'all',
      updated_at: new Date(),
    },
    'HomepageHero'
  );

  const featuredCollections = await upsertByField<homepage_sections>(
    prisma.homepage_sections,
    { id: featuredCollectionsId },
    {
      id: featuredCollectionsId,
      section_type: 'featured_collections',
      title: 'Featured Collections',
      subtitle: 'Curated collections for every occasion',
      content: {
        collections: ['festive-collection'],
      },
      sort_order: 2,
      is_active: true,
      visibility: 'all',
      updated_at: new Date(),
    },
    'HomepageCollections'
  );

  return { heroSection, featuredCollections };
}
