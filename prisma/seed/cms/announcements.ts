/**
 * Announcements Seed
 * Seeds announcement bars
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import type { announcement_bars } from '@prisma/client';

export async function seedAnnouncements() {
  // eslint-disable-next-line no-console
  console.log('📢 Seeding announcements...');

  // Use a fixed UUID for announcement to ensure idempotency
  const announcementId = '00000000-0000-0000-0000-000000000029';

  const announcement = await upsertByField<announcement_bars>(
    prisma.announcement_bars,
    { id: announcementId },
    {
      id: announcementId,
      text: 'Free shipping on orders above ₹999',
      link_url: '/collections/all',
      link_text: 'Shop Now',
      bg_color: '#1a1a1a',
      text_color: '#ffffff',
      position: 'top',
      is_active: true,
      start_date: new Date(),
      end_date: null,
      updated_at: new Date(),
    },
    'Announcement'
  );

  return announcement;
}
