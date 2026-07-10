/**
 * Site Settings Seed
 * Seeds global site configuration
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { SEED_CONFIG } from '../utils/constants';

export async function seedSiteSettings() {
  console.log('🌐 Seeding site settings...');

  // Use a fixed UUID for site settings to ensure idempotency
  const siteSettingsId = '00000000-0000-0000-0000-000000000001';

  const settings = await upsertByField(
    prisma.site_settings,
    { id: siteSettingsId },
    {
      id: siteSettingsId,
      site_name: SEED_CONFIG.siteName,
      tagline: SEED_CONFIG.tagline,
      contact_email: SEED_CONFIG.supportEmail,
      contact_phone: '+919876543210',
      address: 'Mumbai, Maharashtra, India',
      currency: SEED_CONFIG.defaultCurrency,
      tax_rate: 18,
      free_shipping_threshold: 999,
      logo_url: null,
      favicon_url: null,
      og_image_url: null,
      google_analytics_id: null,
      facebook_pixel_id: null,
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
      updated_at: new Date(),
    },
    'SiteSettings'
  );

  return settings;
}
