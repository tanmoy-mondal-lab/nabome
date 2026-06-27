import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma, makeContext, makeRequest, parseResponse } from "./test-utils";

vi.mock("../../_lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

vi.mock("../../_lib/cloudinary", () => ({
  destroyCloudinaryAsset: vi.fn().mockResolvedValue(true),
  destroyCloudinaryAssets: vi.fn().mockResolvedValue(undefined),
}));

import { getPrisma } from "../../_lib/prisma";
import { destroyCloudinaryAssets } from "../../_lib/cloudinary";
import { handleAdminProductRequest } from "../admin/products";

const mockPrisma = createMockPrisma();
vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);

describe("admin products handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);
  });

  it("replaces variants and cleans removed media during updates", async () => {
    mockPrisma.productVariant.findMany.mockResolvedValue([
      { id: "variant-1", videoPublicId: "old-video" },
      { id: "variant-2", videoPublicId: "removed-video" },
    ]);
    mockPrisma.productImage.findMany.mockResolvedValue([
      { publicId: "removed-image" },
    ]);
    mockPrisma.productVariant.update.mockResolvedValue({ id: "variant-1" });
    mockPrisma.productVariant.create.mockResolvedValue({ id: "variant-3" });

    const req = makeRequest("PUT", "/api/admin/products/prod-1/variants", {
      variants: [
        {
          id: "variant-1",
          sku: "SKU-1",
          size: "M",
          color: "Black",
          colorHex: "#111111",
          priceAdjustment: 0,
          stock: 12,
          weight: 1,
          isActive: true,
          videoUrl: "/video/new.mp4",
          videoPublicId: "new-video",
        },
        {
          sku: "SKU-2",
          size: "L",
          color: "White",
          colorHex: "#ffffff",
          priceAdjustment: 100,
          stock: 4,
          weight: 1,
          isActive: true,
        },
      ],
    });
    const ctx = makeContext("admin-user");
    ctx.userRole = "admin";

    const res = await handleAdminProductRequest(req, ctx as any, ["prod-1"], "variants");
    const body = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(body.data.variants).toEqual([
      { id: "variant-1" },
      { id: "variant-3" },
    ]);
    expect(mockPrisma.productImage.deleteMany).toHaveBeenCalledWith({
      where: { productId: "prod-1", variantId: { in: ["variant-2"] } },
    });
    expect(destroyCloudinaryAssets).toHaveBeenCalledWith(
      expect.arrayContaining(["old-video", "removed-video"]),
      {},
      "video"
    );
    expect(destroyCloudinaryAssets).toHaveBeenCalledWith(["removed-image"], {});
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
