/**
 * Shipping Zones Seed
 * Seeds default shipping zone configuration
 * Note: Shipping zones are configured via site settings or separate table
 * This seed documents the default shipping configuration
 */

import { prisma } from '../utils/helpers';

export async function seedShippingZones() {
  console.log('🚚 Seeding shipping zones...');

  // Shipping zones are typically configured in site settings or a dedicated table
  // For now, we document the default shipping configuration
  const defaultShippingZone = {
    name: 'India Standard',
    countries: ['IN'],
    base_rate: 0,
    free_shipping_threshold: 999,
    estimated_days: '3-5 business days',
  };

  console.log('Default shipping zone:', defaultShippingZone);

  return defaultShippingZone;
}
