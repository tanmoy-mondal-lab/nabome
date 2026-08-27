/**
 * CMS Rendering Pipeline — fetches, validates, and renders homepage (HOMEPAGE_BUILDER_ARCHITECTURE §4.1)
 * Handles the complete lifecycle from CMS config to rendered sections.
 */

import type {
  BaseSectionConfig,
  HomepageConfig,
  HomepageSectionType,
} from '../types';

/**
 * Validate section configuration
 * Checks required fields and data integrity
 */
export function validateSectionConfig(section: BaseSectionConfig): boolean {
  if (!section.id || typeof section.id !== 'string') {
    console.error('Invalid section ID', section);
    return false;
  }

  if (!section.type || typeof section.type !== 'string') {
    console.error('Invalid section type', section);
    return false;
  }

  if (!section.config || typeof section.config !== 'object') {
    console.error('Invalid section config', section);
    return false;
  }

  if (typeof section.order !== 'number') {
    console.error('Invalid section order', section);
    return false;
  }

  return true;
}

/**
 * Check if section is currently visible based on visibility rules
 */
export function isSectionVisible(
  section: BaseSectionConfig,
  context: VisibilityContext,
): boolean {
  // Check explicit visibility flag
  if (section.visible === false) {
    return false;
  }

  // Check visibility rules
  if (section.visibility) {
    const rules = section.visibility;

    // Device type check
    if (rules.devices && rules.devices.length > 0) {
      if (!rules.devices.includes(context.device)) {
        return false;
      }
    }

    // User segment check (if user segments are available)
    if (rules.userSegments && rules.userSegments.length > 0) {
      if (!context.userSegments) {
        return false;
      }
      const hasMatchingSegment = rules.userSegments.some((segment) =>
        context.userSegments?.includes(segment),
      );
      if (!hasMatchingSegment) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if section is currently scheduled to be visible
 */
export function isSectionScheduled(section: BaseSectionConfig): boolean {
  if (!section.schedule) {
    return true; // No schedule means always visible
  }

  const now = new Date();
  const { start, end } = section.schedule;

  if (start) {
    const startDate = new Date(start);
    if (now < startDate) {
      return false;
    }
  }

  if (end) {
    const endDate = new Date(end);
    if (now > endDate) {
      return false;
    }
  }

  return true;
}

/**
 * Filter sections based on visibility and scheduling
 */
export function filterVisibleSections(
  sections: BaseSectionConfig[],
  context: VisibilityContext,
): BaseSectionConfig[] {
  return sections.filter((section) => {
    if (!validateSectionConfig(section)) {
      return false;
    }

    if (!isSectionVisible(section, context)) {
      return false;
    }

    if (!isSectionScheduled(section)) {
      return false;
    }

    return true;
  });
}

/**
 * Sort sections by order
 */
export function sortSections(
  sections: BaseSectionConfig[],
): BaseSectionConfig[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

/**
 * Process homepage configuration
 * Validates, filters, and sorts sections
 */
export function processHomepageConfig(
  config: HomepageConfig,
  context: VisibilityContext,
): ProcessedHomepageConfig {
  const visibleSections = filterVisibleSections(config.sections, context);
  const sortedSections = sortSections(visibleSections);

  return {
    ...config,
    sections: sortedSections,
  };
}

/**
 * Validate complete homepage configuration
 */
export function validateHomepageConfig(config: HomepageConfig): boolean {
  if (!config.id || typeof config.id !== 'string') {
    console.error('Invalid homepage ID');
    return false;
  }

  if (!config.sections || !Array.isArray(config.sections)) {
    console.error('Invalid sections array');
    return false;
  }

  if (config.sections.length === 0) {
    console.warn('Homepage has no sections');
    return false;
  }

  // Validate each section
  const allValid = config.sections.every((section) =>
    validateSectionConfig(section),
  );

  if (!allValid) {
    console.error('One or more sections are invalid');
    return false;
  }

  return true;
}

/**
 * Get section by ID
 */
export function getSectionById(
  sections: BaseSectionConfig[],
  id: string,
): BaseSectionConfig | undefined {
  return sections.find((section) => section.id === id);
}

/**
 * Get sections by type
 */
export function getSectionsByType<T extends HomepageSectionType>(
  sections: BaseSectionConfig[],
  type: T,
): BaseSectionConfig[] {
  return sections.filter((section) => section.type === type);
}

/**
 * Check if section should be lazy loaded
 */
export function shouldLazyLoad(section: BaseSectionConfig): boolean {
  return section.lazy?.enabled ?? false;
}

/**
 * Get lazy loading configuration
 */
export function getLazyConfig(section: BaseSectionConfig) {
  return {
    rootMargin: section.lazy?.rootMargin ?? '200px',
    threshold: section.lazy?.threshold ?? 0.1,
  };
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/**
 * Context for visibility evaluation
 */
export interface VisibilityContext {
  /** Current device type */
  device: 'mobile' | 'tablet' | 'desktop' | 'wide';
  /** User segments (if available) */
  userSegments?: string[];
  /** Current timestamp */
  timestamp?: Date;
}

/**
 * Processed homepage configuration
 */
export interface ProcessedHomepageConfig extends HomepageConfig {
  /** Sections have been filtered and sorted */
  sections: BaseSectionConfig[];
}
