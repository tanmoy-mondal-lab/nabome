/**
 * TestimonialsSection — customer testimonials (HOMEPAGE_BUILDER_ARCHITECTURE §6.3)
 * Displays customer reviews with ratings in grid or carousel layout.
 * Mobile-first responsive design with accessibility support.
 */

import { Container } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Avatar } from '@nabome/ui';
import { Grid } from '@nabome/ui';

import type { SectionProps } from '../types';
import type { TestimonialsConfig } from '../types';

type TestimonialsSectionProps = SectionProps<TestimonialsConfig>;

interface Testimonial {
  name: string;
  avatar?: string;
  text: string;
  rating?: number;
  product?: string;
}

export function TestimonialsSection({ id, config }: TestimonialsSectionProps) {
  const { testimonials, layout = 'grid' } = config;

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      className="w-full bg-(--color-neutral-50) py-12 sm:py-16 lg:py-20"
      aria-labelledby={`${id}-title`}
    >
      <Container size="default" padding="lg">
        <div className="mb-8 text-center sm:mb-12">
          <Heading
            id={`${id}-title`}
            level="h2"
            className="mb-4 text-3xl font-bold sm:text-4xl"
          >
            What Our Customers Say
          </Heading>
          <Text size="lg" className="mx-auto max-w-2xl text-(--text-secondary)">
            Real reviews from real customers who love our products.
          </Text>
        </div>

        {layout === 'grid' && (
          <Grid cols={1} colsSm={2} colsLg={3} gap="md">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Grid>
        )}

        {layout === 'carousel' && (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex-shrink-0 w-full sm:w-auto">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/**
 * Testimonial Card Component
 */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="h-full p-6">
      {/* Rating */}
      {testimonial.rating && (
        <div className="mb-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Text
              key={i}
              size="sm"
              className={
                testimonial.rating && i < testimonial.rating
                  ? 'text-(--color-accent-gold)'
                  : 'text-(--color-neutral-300)'
              }
            >
              ★
            </Text>
          ))}
        </div>
      )}

      {/* Testimonial Text */}
      <Text size="base" className="mb-4 line-clamp-4 text-(--text-secondary)">
        "{testimonial.text}"
      </Text>

      {/* Customer Info */}
      <div className="flex items-center gap-3">
        {testimonial.avatar ? (
          <Avatar src={testimonial.avatar} alt={testimonial.name} size="md" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand-100) text-(--text-brand)">
            {testimonial.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <Text size="sm" weight="semibold" className="text-(--text-primary)">
            {testimonial.name}
          </Text>
          {testimonial.product && (
            <Text size="xs" className="text-(--text-secondary)">
              Purchased: {testimonial.product}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}
