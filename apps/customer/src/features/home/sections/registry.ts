/**
 * Section Registry — maps section types to components (HOMEPAGE_BUILDER_ARCHITECTURE §4.2)
 * All homepage sections must be registered here. Dynamic rendering uses this registry.
 *
 * Registration rules:
 * - Each section type maps to a React component
 * - Components must accept SectionProps<TConfig>
 * - Optional Zod schema for configuration validation
 * - Default configuration for admin UI
 */

import type {
  HomepageSectionType,
  SectionComponent,
  SectionRegistryEntry,
} from '../types';

/**
 * Section Registry — the single source of truth for section type mapping
 * This registry enables dynamic rendering based on CMS configuration.
 */
class SectionRegistry {
  private registry: Map<HomepageSectionType, SectionRegistryEntry> = new Map();

  /**
   * Register a section type with its component
   */
  register(entry: SectionRegistryEntry): void {
    if (this.registry.has(entry.type)) {
      throw new Error(`Section type "${entry.type}" is already registered`);
    }
    this.registry.set(entry.type, entry);
  }

  /**
   * Register multiple sections at once
   */
  registerAll(entries: SectionRegistryEntry[]): void {
    entries.forEach((entry) => this.register(entry));
  }

  /**
   * Get a section entry by type
   */
  get(type: HomepageSectionType): SectionRegistryEntry | undefined {
    return this.registry.get(type);
  }

  /**
   * Check if a section type is registered
   */
  has(type: HomepageSectionType): boolean {
    return this.registry.has(type);
  }

  /**
   * Get all registered section types
   */
  getAllTypes(): HomepageSectionType[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get all registered entries
   */
  getAllEntries(): SectionRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Unregister a section type (useful for testing)
   */
  unregister(type: HomepageSectionType): void {
    this.registry.delete(type);
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.registry.clear();
  }
}

/**
 * Global section registry instance
 */
export const sectionRegistry = new SectionRegistry();

/**
 * Helper function to register a section
 */
export function registerSection(entry: SectionRegistryEntry): void {
  sectionRegistry.register(entry);
}

/**
 * Helper function to register multiple sections
 */
export function registerSections(entries: SectionRegistryEntry[]): void {
  sectionRegistry.registerAll(entries);
}

/**
 * Get section component by type
 */
export function getSectionComponent(
  type: HomepageSectionType,
): SectionComponent | undefined {
  return sectionRegistry.get(type)?.component;
}

/**
 * Get all registered section types
 */
export function getRegisteredSectionTypes(): HomepageSectionType[] {
  return sectionRegistry.getAllTypes();
}

/**
 * Check if section type is registered
 */
export function isSectionRegistered(type: HomepageSectionType): boolean {
  return sectionRegistry.has(type);
}
