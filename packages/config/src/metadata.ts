/** Application metadata shared across the platform. */

export const APP_METADATA = {
  name: 'Nabome',
  nameBn: 'নবME',
  tagline: 'Commerce Operating System',
  domain: 'nabome.online',
  defaultLocale: 'en-IN',
  supportedLocales: ['en-IN', 'bn-IN', 'hi-IN'] as const,
  currency: 'INR',
  contactEmail: 'support@nabome.online',
} as const;

export type AppLocale = (typeof APP_METADATA.supportedLocales)[number];
