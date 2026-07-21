import { describe, expect, it } from "vitest";
import { EntityType as PrismaEntityType } from "@prisma/client";
import {
  normalizeEntityTypeForDb,
  toPrismaEntityType,
} from "../entity-type";

describe("media entity type normalization", () => {
  it("maps product video API entity names to the Prisma enum", () => {
    expect(toPrismaEntityType("product-videos")).toBe(PrismaEntityType.product_videos);
    expect(normalizeEntityTypeForDb("product-videos")).toBe(PrismaEntityType.product_videos);
    expect(normalizeEntityTypeForDb("product_videos")).toBe(PrismaEntityType.product_videos);
  });

  it("falls back to cms for unsupported input", () => {
    expect(normalizeEntityTypeForDb("unknown")).toBe(PrismaEntityType.cms);
    expect(normalizeEntityTypeForDb(null)).toBe(PrismaEntityType.cms);
  });
});

