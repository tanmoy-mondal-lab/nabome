/**
 * NewsletterSection — email signup section (HOMEPAGE_BUILDER_ARCHITECTURE §6.3)
 * Collects email addresses for newsletter subscriptions with form validation.
 * Mobile-first responsive design with accessibility support.
 */

import { useState } from 'react';

import { Container } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Input } from '@nabome/ui';
import { Button } from '@nabome/ui';

import type { SectionProps } from '../types';
import type { NewsletterConfig } from '../types';

type NewsletterSectionProps = SectionProps<NewsletterConfig>;

export function NewsletterSection({ id, config }: NewsletterSectionProps) {
  const {
    heading = 'Subscribe to our newsletter',
    description = 'Get the latest updates on new products and upcoming promotions.',
    placeholder = 'Enter your email address',
    submitText = 'Subscribe',
    successMessage = 'Thank you for subscribing!',
  } = config;

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integrate with newsletter API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
      setEmail('');
      trackNewsletterSignup(email);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section
        id={id}
        className="w-full bg-(--color-brand-50) py-12 sm:py-16 lg:py-20"
      >
        <Container size="default" padding="lg">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-success-light)">
                <svg
                  className="h-8 w-8 text-(--color-success-dark)"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <Heading level="h3" className="mb-2 text-2xl font-bold">
              {successMessage}
            </Heading>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="w-full bg-(--color-brand-50) py-12 sm:py-16 lg:py-20"
      aria-labelledby={`${id}-heading`}
    >
      <Container size="default" padding="lg">
        <div className="mx-auto max-w-2xl text-center">
          <Heading
            id={`${id}-heading`}
            level="h2"
            className="mb-4 text-3xl font-bold sm:text-4xl"
          >
            {heading}
          </Heading>
          {description && (
            <Text size="lg" className="mb-8 text-(--text-secondary)">
              {description}
            </Text>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1"
                aria-label="Email address"
                required
              />
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="sm:w-auto"
              >
                {submitText}
              </Button>
            </div>

            {error && (
              <Text size="sm" className="text-(--color-error-dark)">
                {error}
              </Text>
            )}

            <Text size="sm" className="text-(--text-secondary)">
              By subscribing, you agree to our Privacy Policy and consent to
              receive updates.
            </Text>
          </form>
        </div>
      </Container>
    </section>
  );
}

/**
 * Track newsletter signup for analytics
 */
function trackNewsletterSignup(email: string) {
  // TODO: Integrate with analytics service (PostHog)
  console.warn('Newsletter signup:', { email });
}
