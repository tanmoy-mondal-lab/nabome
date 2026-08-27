/**
 * NewArrivalsSection — displays new arrivals (HOMEPAGE_BUILDER_ARCHITECTURE §6.2)
 * Reuses ProductSectionBase with section type tracking for analytics.
 */

import type { SectionProps } from '../types';
import type { ProductSectionConfig } from '../types';

import { ProductSectionBase } from './ProductSectionBase';

type NewArrivalsSectionProps = SectionProps<ProductSectionConfig>;

export function NewArrivalsSection({ id, config }: NewArrivalsSectionProps) {
  return (
    <ProductSectionBase id={id} config={config} sectionType="new-arrivals" />
  );
}
