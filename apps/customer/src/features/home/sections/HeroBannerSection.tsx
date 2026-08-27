/**
 * HeroBannerSection — full-width hero banner (HOMEPAGE_BUILDER_ARCHITECTURE §6.1)
 * Displays a large banner with background image, heading, subheading, and CTAs.
 * Mobile-first responsive design with accessibility and SEO support.
 */

import { Container } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Link } from '@nabome/ui';

import type { SectionProps } from '../types';
import type { HeroBannerConfig } from '../types';

type HeroBannerSectionProps = SectionProps<HeroBannerConfig>;

export function HeroBannerSection({ id, config }: HeroBannerSectionProps) {
  const {
    backgroundImage,
    backgroundVideo,
    overlay = { color: 'rgba(0, 0, 0, 0.4)', opacity: 0.4 },
    heading,
    subheading,
    primaryCTA,
    secondaryCTA,
    alignment = 'left',
    height = 'large',
  } = config;

  const heightClasses = {
    small: 'h-64 sm:h-80',
    medium: 'h-80 sm:h-96',
    large: 'h-96 sm:h-[500px]',
    full: 'h-screen',
  };

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <section
      id={id}
      className="relative w-full overflow-hidden"
      aria-label="Hero banner"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
        role="img"
        aria-label={heading}
      />

      {/* Background Video (optional) */}
      {backgroundVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlay.color,
          opacity: overlay.opacity,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={`relative flex h-full w-full ${heightClasses[height]} ${alignmentClasses[alignment]}`}
      >
        <Container size="wide" padding="lg" className="flex h-full">
          <div className="flex flex-col justify-center">
            <Heading
              level="h1"
              className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
            >
              {heading}
            </Heading>

            {subheading && (
              <Text
                size="lg"
                className="mb-8 max-w-2xl text-white/90 sm:text-xl"
              >
                {subheading}
              </Text>
            )}

            <div className="flex gap-4">
              {primaryCTA && (
                <Link
                  href={primaryCTA.url}
                  external={primaryCTA.openInNewTab}
                  onClick={() => handleCTAClick(primaryCTA.text, 'primary')}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1 bg-(--button-primary-bg) text-(--button-primary-text) hover:bg-(--button-primary-bg-hover) active:bg-(--button-primary-bg-active) h-12 px-6 text-lg"
                >
                  {primaryCTA.text}
                </Link>
              )}

              {secondaryCTA && (
                <Link
                  href={secondaryCTA.url}
                  external={secondaryCTA.openInNewTab}
                  onClick={() => handleCTAClick(secondaryCTA.text, 'secondary')}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1 bg-(--button-secondary-bg) text-(--button-secondary-text) border border-(--border-default) hover:bg-(--button-secondary-bg-hover) active:bg-(--button-secondary-bg-active) h-12 px-6 text-lg"
                >
                  {secondaryCTA.text}
                </Link>
              )}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

/**
 * Handle CTA click for analytics
 */
function handleCTAClick(ctaText: string, position: 'primary' | 'secondary') {
  // TODO: Integrate with analytics service (PostHog)
  console.warn('Hero CTA clicked:', { ctaText, position });
}
