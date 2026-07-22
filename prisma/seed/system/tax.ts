/**
 * Tax Configuration Seed
 * Seeds default tax configuration
 * Note: Tax is typically calculated based on location
 * This seed documents the default tax configuration
 */

export async function seedTax() {
  // eslint-disable-next-line no-console
  console.log('🧾 Seeding tax configuration...');

  // Tax configuration is typically handled in business logic
  // For India, GST rates vary by product category
  const defaultTaxConfig = {
    name: 'India GST',
    country: 'IN',
    default_rate: 18, // 18% GST for most goods
    rates: {
      clothing: 12,
      luxury: 18,
      essentials: 5,
    },
    inclusive: true,
  };

  // eslint-disable-next-line no-console
  console.log('Default tax configuration:', defaultTaxConfig);

  return defaultTaxConfig;
}
