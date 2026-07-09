import { type SectionType, type SectionDefinition, type PageSection } from "./cms-types";
declare class SectionRegistry {
    private sections;
    constructor();
    get(type: SectionType): SectionDefinition | undefined;
    getAll(): SectionDefinition[];
    getByCategory(category: string): SectionDefinition[];
    getField(type: SectionType, fieldKey: string): import("./cms-types").SectionField | undefined;
    getDefaultConfig(type: SectionType): Record<string, unknown>;
    validateConfig(type: SectionType, config: Record<string, unknown>): {
        valid: boolean;
        errors: string[];
    };
    mergeConfig(type: SectionType, userConfig: Record<string, unknown>): Record<string, unknown>;
}
export declare const sectionRegistry: SectionRegistry;
export declare function createSection(type: SectionType, pageId: string, sortOrder: number, config?: Record<string, unknown>): PageSection;
export declare function duplicateSection(section: PageSection): PageSection;
export declare function getAvailableSectionByCategory(): Record<string, SectionDefinition[]>;
export {};
