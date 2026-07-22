/**
 * Currencies Seed
 * Seeds supported currencies
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { SYSTEM_SLUGS } from '../utils/constants';

export async function seedCurrencies() {
  // eslint-disable-next-line no-console
  console.log('💰 Seeding currencies...');

  const inr = await upsertByField(
    prisma.currencies,
    { code: SYSTEM_SLUGS.currency },
    {
      code: SYSTEM_SLUGS.currency,
      name: 'Indian Rupee',
      symbol: '₹',
      exchangeRate: 1.0,
      isBase: true,
      isActive: true,
      decimalPlaces: 2,
      formattingLocale: 'en-IN',
      updatedAt: new Date(),
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
      exchangeRate: 0.012,
      isBase: false,
      isActive: true,
      decimalPlaces: 2,
      formattingLocale: 'en-US',
      updatedAt: new Date(),
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
      exchangeRate: 0.011,
      isBase: false,
      isActive: true,
      decimalPlaces: 2,
      formattingLocale: 'de-DE',
      updatedAt: new Date(),
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
      exchangeRate: 0.0095,
      isBase: false,
      isActive: true,
      decimalPlaces: 2,
      formattingLocale: 'en-GB',
      updatedAt: new Date(),
    },
    'Currency-GBP'
  );

  return { inr, usd, eur, gbp };
}
