/**
 * Analytics Configuration Seed
 * Seeds default analytics settings
 * Note: Analytics are configured via site settings
 * This seed documents the default analytics configuration
 */

export async function seedAnalytics() {
  // eslint-disable-next-line no-console
  console.log('📊 Seeding analytics configuration...');

  // Analytics configuration is stored in site_settings
  // This documents the default analytics setup
  const defaultAnalyticsConfig = {
    google_analytics_id: null,
    google_tag_manager_id: null,
    facebook_pixel_id: null,
    hotjar_id: null,
    enable_page_view_tracking: true,
    enable_event_tracking: true,
    enable_ecommerce_tracking: true,
    retention_days: 90,
  };

  // eslint-disable-next-line no-console
  console.log('Default analytics configuration:', defaultAnalyticsConfig);

  return defaultAnalyticsConfig;
}
