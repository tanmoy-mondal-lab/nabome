/**
 * Page Templates Seed
 * Seeds reusable page templates
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { CMS_SLUGS } from '../utils/constants';
import type { page_templates } from '@prisma/client';

export async function seedPageTemplates() {
  console.log('📄 Seeding page templates...');

  // Use a fixed UUID for page template to ensure idempotency
  const templateId = '00000000-0000-0000-0000-000000000016';

  const template = await upsertByField<page_templates>(
    prisma.page_templates,
    { id: templateId },
    {
      id: templateId,
      name: 'Default Template',
      slug: CMS_SLUGS.pageTemplate,
      description: 'Default page template with standard sections',
      category: 'custom',
      thumbnail: null,
      sections: {
        hero: true,
        featured: true,
        categories: true,
      },
      metadata: {
        layout: 'standard',
        sidebar: false,
      },
      is_active: true,
      use_count: 0,
      updated_at: new Date(),
    },
    'PageTemplate'
  );

  return template;
}
