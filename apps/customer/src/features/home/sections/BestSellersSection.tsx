/**
 * BestSellersSection — displays best-selling products (HOMEPAGE_BUILDER_ARCHITECTURE §6.2)
 * Reuses ProductSectionBase with section type tracking for analytics.
 */

import type { SectionProps } from '../types';
import type { ProductSectionConfig } from '../types';

import { ProductSectionBase } from './ProductSectionBase';

type BestSellersSectionProps = SectionProps<ProductSectionConfig>;

export function BestSellersSection({ id, config }: BestSellersSectionProps) {
  return (
    <ProductSectionBase id={id} config={config} sectionType="best-sellers" />
  );
}
