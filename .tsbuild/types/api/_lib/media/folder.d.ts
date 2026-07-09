import type { EntityType } from "./types";
export declare function getRootFolder(): string;
export declare function getEntityFolder(entityType: EntityType, slug: string): string;
export declare function getAssetFolder(entityFolder: string, assetId: string): string;
export declare function getTempFolder(): string;
