/**
 * TrendingProductsSection — displays trending products (HOMEPAGE_BUILDER_ARCHITECTURE §6.2)
 * Reuses ProductSectionBase with section type tracking for analytics.
 */

import type { SectionProps } from '../types';
import type { ProductSectionConfig } from '../types';

import { ProductSectionBase } from './ProductSectionBase';

type TrendingProductsSectionProps = SectionProps<ProductSectionConfig>;

export function TrendingProductsSection({
  id,
  config,
}: TrendingProductsSectionProps) {
  return <ProductSectionBase id={id} config={config} sectionType="trending" />;
}
