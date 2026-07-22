/**
 * Newsletter Seed
 * Seeds newsletter configuration
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import type { newsletter_subscribers } from '@prisma/client';

export async function seedNewsletter() {
  // eslint-disable-next-line no-console
  console.log('📧 Seeding newsletter configuration...');

  // Use a fixed UUID for newsletter subscriber to ensure idempotency
  const subscriberId = '00000000-0000-0000-0000-000000000030';

  // Seed a sample newsletter subscriber
  const subscriber = await upsertByField<newsletter_subscribers>(
    prisma.newsletter_subscribers,
    { id: subscriberId },
    {
      id: subscriberId,
      email: 'newsletter@example.com',
      is_active: true,
    },
    'NewsletterSubscriber'
  );

  // Document newsletter configuration
  const newsletterConfig = {
    enabled: true,
    doubleOptIn: true,
    welcomeEmail: true,
    weeklyDigest: false,
    promotionalEmails: true,
  };

  // eslint-disable-next-line no-console
  console.log('Newsletter configuration:', newsletterConfig);

  return { subscriber, newsletterConfig };
}
