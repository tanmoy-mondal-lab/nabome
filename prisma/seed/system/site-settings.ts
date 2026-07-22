/**
 * Site Settings Seed
 * Seeds global site configuration
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { SEED_CONFIG } from '../utils/constants';

export async function seedSiteSettings() {
  // eslint-disable-next-line no-console
  console.log('🌐 Seeding site settings...');

  // Use a fixed UUID for site settings to ensure idempotency
  const siteSettingsId = '00000000-0000-0000-0000-000000000001';

  const settings = await upsertByField(
    prisma.site_settings,
    { id: siteSettingsId },
    {
      id: siteSettingsId,
      siteName: SEED_CONFIG.siteName,
      tagline: SEED_CONFIG.tagline,
      contactEmail: SEED_CONFIG.supportEmail,
      contactPhone: '+919876543210',
      address: 'Mumbai, Maharashtra, India',
      currency: SEED_CONFIG.defaultCurrency,
      taxRate: 18,
      freeShippingThreshold: 999,
      logoUrl: null,
      faviconUrl: null,
      ogImageUrl: null,
      googleAnalyticsId: null,
      facebookPixelId: null,
      theme: {
        primaryColor: '#1a1a1a',
        secondaryColor: '#f5f5f5',
        accentColor: '#FF6B6B',
      },
      seo: {
        title: SEED_CONFIG.brandName,
        description: SEED_CONFIG.tagline,
        keywords: 'fashion, ethnic wear, kurtas, sarees, premium clothing',
      },
      preferences: {
        enable_registration: true,
        enable_guest_checkout: true,
        enable_wishlist: true,
        enable_reviews: true,
        enable_loyalty: true,
        enable_referrals: true,
        enable_gift_cards: true,
      },
      updatedAt: new Date(),
    },
    'SiteSettings'
  );

  return settings;
}
