/**
 * Countries Seed
 * Seeds supported countries (using ISO codes)
 * Note: Countries are typically handled as string fields in addresses
 * This seed documents the supported countries for reference
 */

import { prisma } from '../utils/helpers';

export async function seedCountries() {
  console.log('🌍 Seeding countries...');

  // Countries are stored as string fields in the addresses table
  // This function documents the supported countries
  const supportedCountries = [
    { code: 'IN', name: 'India', dialCode: '+91' },
    { code: 'US', name: 'United States', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
    { code: 'CA', name: 'Canada', dialCode: '+1' },
    { code: 'AU', name: 'Australia', dialCode: '+61' },
    { code: 'SG', name: 'Singapore', dialCode: '+65' },
    { code: 'MY', name: 'Malaysia', dialCode: '+60' },
  ];

  console.log('Supported countries:', supportedCountries.map(c => c.name).join(', '));

  return supportedCountries;
}
