import type { EntityType } from "./types";

const ROOT_FOLDER = "nabome";

export function getRootFolder(): string {
  return ROOT_FOLDER;
}

export function getEntityFolder(entityType: EntityType, slug: string): string {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "_") || slug;
  return `${ROOT_FOLDER}/${entityType}/${safeSlug}`;
}

export function getAssetFolder(entityFolder: string, assetId: string): string {
  return `${entityFolder}/${assetId}`;
}

export function getTempFolder(): string {
  return `${ROOT_FOLDER}/temp`;
}
