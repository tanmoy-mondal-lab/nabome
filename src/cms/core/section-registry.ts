import { SECTION_DEFINITIONS, type SectionType, type SectionDefinition, type PageSection } from "./cms-types";

class SectionRegistry {
  private sections = new Map<SectionType, SectionDefinition>();

  constructor() {
    for (const def of SECTION_DEFINITIONS) {
      this.sections.set(def.type, def);
    }
  }

  get(type: SectionType): SectionDefinition | undefined {
    return this.sections.get(type);
  }

  getAll(): SectionDefinition[] {
    return Array.from(this.sections.values());
  }

  getByCategory(category: string): SectionDefinition[] {
    return this.getAll().filter((s) => s.category === category);
  }

  getField(type: SectionType, fieldKey: string) {
    const def = this.get(type);
    if (!def) return undefined;
    return def.fields.find((f) => f.key === fieldKey);
  }

  getDefaultConfig(type: SectionType): Record<string, unknown> {
    const def = this.get(type);
    if (!def) return {};
    return { ...def.defaultConfig };
  }

  validateConfig(type: SectionType, config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const def = this.get(type);
    if (!def) return { valid: false, errors: [`Unknown section type: ${type}`] };

    const errors: string[] = [];
    for (const field of def.fields) {
      if (field.required && (config[field.key] === undefined || config[field.key] === "" || config[field.key] === null)) {
        errors.push(`${field.label} is required`);
      }
      if (field.validation && config[field.key] !== undefined) {
        const val = config[field.key] as number;
        if (field.validation.min !== undefined && val < field.validation.min) {
          errors.push(`${field.label} must be at least ${field.validation.min}`);
        }
        if (field.validation.max !== undefined && val > field.validation.max) {
          errors.push(`${field.label} must be at most ${field.validation.max}`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  mergeConfig(type: SectionType, userConfig: Record<string, unknown>): Record<string, unknown> {
    const defaults = this.getDefaultConfig(type);
    return { ...defaults, ...userConfig };
  }
}

export const sectionRegistry = new SectionRegistry();

export function createSection(
  type: SectionType,
  pageId: string,
  sortOrder: number,
  config?: Record<string, unknown>
): PageSection {
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    pageId,
    sortOrder,
    config: sectionRegistry.mergeConfig(type, config ?? {}),
    visibility: { isVisible: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateSection(section: PageSection): PageSection {
  return {
    ...createSection(section.type, section.pageId, section.sortOrder + 1, section.config),
    styles: section.styles ? { ...section.styles } : undefined,
    visibility: section.visibility ? { ...section.visibility } : undefined,
  };
}

export function getAvailableSectionByCategory() {
  const categories = sectionRegistry.getAll().reduce(
    (acc, section) => {
      if (!acc[section.category]) acc[section.category] = [];
      acc[section.category].push(section);
      return acc;
    },
    {} as Record<string, SectionDefinition[]>
  );
  return categories;
}
