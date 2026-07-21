import { EntityType as PrismaEntityType } from "@prisma/client";
import type { EntityType } from "./types";
export declare function toPrismaEntityType(entityType: EntityType): PrismaEntityType;
export declare function normalizeEntityTypeForDb(value: unknown, fallback?: PrismaEntityType): PrismaEntityType;
