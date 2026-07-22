/**
 * Collections Seed
 * Seeds product collections
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { PRODUCT_SLUGS } from '../utils/constants';
import type { collections } from '@prisma/client';

export async function seedCollections() {
  // eslint-disable-next-line no-console
  console.log('🎨 Seeding collections...');

  // Use a fixed UUID for collection to ensure idempotency
  const collectionId = '00000000-0000-0000-0000-000000000010';

  const collection = await upsertByField<collections>(
    prisma.collections,
    { id: collectionId },
    {
      id: collectionId,
      name: 'Festive Collection',
      slug: PRODUCT_SLUGS.collection,
      description: 'Celebrate with our exclusive festive collection featuring handcrafted pieces',
      hero_image_url: null,
      hero_image_public_id: null,
      is_active: true,
      is_featured: true,
      start_date: new Date(),
      end_date: null,
      sort_order: 1,
      meta_title: 'Festive Collection | NABOME',
      meta_desc: 'Exclusive festive collection with handcrafted ethnic wear',
      updated_at: new Date(),
    },
    'Collection'
  );

  return collection;
}
