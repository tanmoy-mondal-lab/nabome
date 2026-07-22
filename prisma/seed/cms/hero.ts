/**
 * Hero Seed
 * Seeds hero slider configuration
 * Note: Hero is configured via homepage sections
 * This seed documents the hero configuration
 */

export async function seedHero() {
  // eslint-disable-next-line no-console
  console.log('🎨 Seeding hero configuration...');

  // Hero is configured via homepage_sections with section_type 'hero_slider'
  // This documents the hero configuration structure
  const heroConfig = {
    autoplay: true,
    autoplaySpeed: 5000,
    showArrows: true,
    showDots: true,
    animation: 'fade',
  };

  // eslint-disable-next-line no-console
  console.log('Hero configuration:', heroConfig);

  return heroConfig;
}
