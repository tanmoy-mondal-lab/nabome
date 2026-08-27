/**
 * Section Registration — registers all homepage sections (HOMEPAGE_BUILDER_ARCHITECTURE §4.2)
 * This file registers all section components with the Section Registry.
 */

import type { SectionRegistryEntry } from '../types';

import { BestSellersSection } from './BestSellersSection';
import { FeaturedProductsSection } from './FeaturedProductsSection';
import { HeroBannerSection } from './HeroBannerSection';
import { NewArrivalsSection } from './NewArrivalsSection';
import { NewsletterSection } from './NewsletterSection';
import { PromotionalBannerSection } from './PromotionalBannerSection';
import { registerSections } from './registry';
import { TestimonialsSection } from './TestimonialsSection';
import { TrendingProductsSection } from './TrendingProductsSection';

/**
 * Register all homepage sections
 * This should be called during app initialization
 */
export function registerAllSections(): void {
  const sections: SectionRegistryEntry[] = [
    {
      type: 'hero-banner',
      component: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: HeroBannerSection as React.ComponentType<any>,
      },
      displayName: 'Hero Banner',
      description: 'Full-width hero banner with background image and CTAs',
    },
    {
      type: 'featured-products',
      component: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: FeaturedProductsSection as React.ComponentType<any>,
      },
      displayName: 'Featured Products',
      description: 'Display featured products in grid or carousel layout',
    },
    {
      type: 'trending-products',
      component: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: TrendingProductsSection as React.ComponentType<any>,
      },
      displayName: 'Trending Products',
      description: 'Display trending products in grid or carousel layout',
    },
    {
      type: 'best-sellers',
      component: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: BestSellersSection as React.ComponentType<any>,
      },
      displayName: 'Best Sellers',
      description: 'Display best-selling products in grid or carousel layout',
    },
    {
      type: 'new-arrivals',
      component: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: NewArrivalsSection as React.ComponentType<any>,
      },
      displayName: 'New Arrivals',
      description: 'Display new arrivals in grid or carousel layout',
    },
    {
      type: 'newsletter',
      component: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: NewsletterSection as React.ComponentType<any>,
      },
      displayName: 'Newsletter',
      description: 'Email subscription form for newsletter',
    },
    {
      type: 'promotional-banner',
      component: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: PromotionalBannerSection as React.ComponentType<any>,
      },
      displayName: 'Promotional Banner',
      description: 'Promotional banner with background color and CTA',
    },
    {
      type: 'testimonials',
      component: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: TestimonialsSection as React.ComponentType<any>,
      },
      displayName: 'Testimonials',
      description: 'Customer testimonials with ratings',
    },
    // Additional sections will be registered here as they are implemented
  ];

  registerSections(sections);
}
