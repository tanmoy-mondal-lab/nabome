/**
 * Currencies Seed
 * Seeds supported currencies
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { SYSTEM_SLUGS } from '../utils/constants';

export async function seedCurrencies() {
  console.log('💰 Seeding currencies...');

  const inr = await upsertByField(
    prisma.currencies,
    { code: SYSTEM_SLUGS.currency },
    {
      code: SYSTEM_SLUGS.currency,
      name: 'Indian Rupee',
      symbol: '₹',
      exchange_rate: 1.0,
      is_base: true,
      is_active: true,
      decimal_places: 2,
      formatting_locale: 'en-IN',
      updated_at: new Date(),
    },
    'Currency-INR'
  );

  const usd = await upsertByField(
    prisma.currencies,
    { code: 'USD' },
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      exchange_rate: 0.012,
      is_base: false,
      is_active: true,
      decimal_places: 2,
      formatting_locale: 'en-US',
      updated_at: new Date(),
    },
    'Currency-USD'
  );

  const eur = await upsertByField(
    prisma.currencies,
    { code: 'EUR' },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      exchange_rate: 0.011,
      is_base: false,
      is_active: true,
      decimal_places: 2,
      formatting_locale: 'de-DE',
      updated_at: new Date(),
    },
    'Currency-EUR'
  );

  const gbp = await upsertByField(
    prisma.currencies,
    { code: 'GBP' },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      exchange_rate: 0.0095,
      is_base: false,
      is_active: true,
      decimal_places: 2,
      formatting_locale: 'en-GB',
      updated_at: new Date(),
    },
    'Currency-GBP'
  );

  return { inr, usd, eur, gbp };
}
