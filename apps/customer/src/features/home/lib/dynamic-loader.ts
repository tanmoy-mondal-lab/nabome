/**
 * Dynamic Section Loader — loads section components from registry (HOMEPAGE_BUILDER_ARCHITECTURE §4.3)
 * Uses the Section Registry to get components dynamically.
 */

import { getSectionComponent } from '../sections/registry';
import type {
  HomepageSectionType,
  SectionProps,
  SectionConfigMap,
} from '../types';

/**
 * Get a section component by type from the registry
 * Returns null if section type is not registered
 */
export function getSectionComponentByType<T extends HomepageSectionType>(
  type: T,
): React.ComponentType<SectionProps<SectionConfigMap[T]>> | null {
  const component = getSectionComponent(type);
  if (!component) {
    console.warn(`Section type "${type}" is not registered`);
    return null;
  }
  return component.component as React.ComponentType<
    SectionProps<SectionConfigMap[T]>
  >;
}
