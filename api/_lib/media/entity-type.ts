import { EntityType as PrismaEntityType } from "@prisma/client";
import type { EntityType } from "./types";

const ENTITY_TYPE_ALIASES: Record<string, PrismaEntityType> = {
  settings: PrismaEntityType.settings,
  homepage: PrismaEntityType.homepage,
  products: PrismaEntityType.products,
  "product-videos": PrismaEntityType.product_videos,
  product_videos: PrismaEntityType.product_videos,
  categories: PrismaEntityType.categories,
  collections: PrismaEntityType.collections,
  brands: PrismaEntityType.brands,
  labels: PrismaEntityType.labels,
  lookbooks: PrismaEntityType.lookbooks,
  blogs: PrismaEntityType.blogs,
  cms: PrismaEntityType.cms,
  sellers: PrismaEntityType.sellers,
  users: PrismaEntityType.users,
  temp: PrismaEntityType.temp,
};

export function toPrismaEntityType(entityType: EntityType): PrismaEntityType {
  return ENTITY_TYPE_ALIASES[entityType] ?? PrismaEntityType.cms;
}

export function normalizeEntityTypeForDb(
  value: unknown,
  fallback: PrismaEntityType = PrismaEntityType.cms
): PrismaEntityType {
  if (typeof value !== "string") return fallback;
  return ENTITY_TYPE_ALIASES[value] ?? fallback;
}

