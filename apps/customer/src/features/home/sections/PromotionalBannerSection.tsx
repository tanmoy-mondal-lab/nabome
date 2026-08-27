/**
 * PromotionalBannerSection — promotional banner with CTA (HOMEPAGE_BUILDER_ARCHITECTURE §6.3)
 * Displays a promotional banner with background color, text, and optional CTA button.
 * Mobile-first responsive design with dismissible option.
 */

import { useState } from 'react';

import { Container } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Link } from '@nabome/ui';

import type { SectionProps } from '../types';
import type { PromotionalBannerConfig } from '../types';

type PromotionalBannerSectionProps = SectionProps<PromotionalBannerConfig>;

export function PromotionalBannerSection({
  id,
  config,
}: PromotionalBannerSectionProps) {
  const { backgroundColor, content, cta, dismissible = false } = config;
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    // TODO: Store dismissal state in localStorage or cookie
    console.warn('Promotional banner dismissed');
  };

  if (isDismissed) {
    return null;
  }

  return (
    <section
      id={id}
      className="w-full"
      style={{ backgroundColor }}
      aria-label="Promotional banner"
    >
      <Container size="default" padding="md">
        <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
          {/* Content */}
          <Text
            size="base"
            weight="medium"
            className="text-center text-white sm:text-left"
          >
            {content}
          </Text>

          {/* CTA Button and Dismiss */}
          <div className="flex items-center gap-4">
            {cta && (
              <Link
                href={cta.url}
                external={cta.openInNewTab}
                onClick={() => handleBannerClick(cta.text)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1 bg-white text-(--text-primary) hover:bg-(--color-neutral-100) h-8 px-4 text-sm"
              >
                {cta.text}
              </Link>
            )}

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Dismiss promotional banner"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Handle banner click for analytics
 */
function handleBannerClick(ctaText: string) {
  // TODO: Integrate with analytics service (PostHog)
  console.warn('Promotional banner clicked:', { ctaText });
}
