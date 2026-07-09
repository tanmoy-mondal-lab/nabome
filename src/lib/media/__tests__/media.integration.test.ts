/**
 * Media Integration Tests
 * 
 * These tests require a real Cloudinary test account.
 * Set the following environment variables before running:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 * 
 * Run with: npm run test -- src/lib/media/__tests__/media.integration.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { uploadMedia, replaceMedia, deleteMedia, deleteEntityMedia } from "../media.service";
import { getCloudinaryConfigFromEnv } from "../cloudinary.config";
import { generateAssetId } from "../asset-id.service";
import { deleteEntityAssets } from "../cloudinary.service";

describe("Media Integration Tests", () => {
  let config: any;
  let testAssetId: string;
  let testPublicId: string;
  let testEntityId: string;
  const testSlug = "test-integration-product";
  const testEntityType = "products" as const;

  beforeAll(() => {
    // Check if Cloudinary credentials are available
    try {
      config = getCloudinaryConfigFromEnv();
      console.log("Cloudinary config loaded successfully");
    } catch (error) {
      console.warn("Cloudinary credentials not found. Skipping integration tests.");
      console.warn("Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to run integration tests.");
    }
  });

  it("should upload a test image", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    // Create a test image file
    const testImage = new File(
      ["test image content"],
      "test-image.jpg",
      { type: "image/jpeg" }
    );

    testEntityId = crypto.randomUUID();
    testAssetId = generateAssetId();

    try {
      const result = await uploadMedia(
        {
          file: testImage,
          entityType: testEntityType,
          entityId: testEntityId,
          slug: testSlug,
          altText: "Test image for integration testing",
          displayName: "Integration Test Image",
          sortOrder: 0,
          isPrimary: true,
        },
        config
      );

      expect(result).toBeDefined();
      expect(result.assetId).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.publicId).toBeDefined();
      expect(result.folder).toContain(testSlug);
      expect(result.mimeType).toBe("image/jpeg");

      testPublicId = result.publicId;
      console.log("Upload successful:", result.publicId);
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  });

  it("should replace the uploaded image", async () => {
    if (!config || !testAssetId || !testPublicId) {
      console.log("Skipping: Cloudinary config or test asset not available");
      return;
    }

    // Create a new test image file
    const newTestImage = new File(
      ["new test image content"],
      "new-test-image.jpg",
      { type: "image/jpeg" }
    );

    try {
      const result = await replaceMedia(
        {
          file: newTestImage,
          entityType: testEntityType,
          entityId: testEntityId,
          slug: testSlug,
          oldAssetId: testAssetId,
          oldPublicId: testPublicId,
          altText: "Updated test image",
          displayName: "Updated Integration Test Image",
        },
        config
      );

      expect(result).toBeDefined();
      expect(result.assetId).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.publicId).toBeDefined();

      testPublicId = result.publicId;
      console.log("Replace successful:", result.publicId);
    } catch (error) {
      console.error("Replace failed:", error);
      throw error;
    }
  });

  it("should delete the uploaded image", async () => {
    if (!config || !testAssetId || !testPublicId) {
      console.log("Skipping: Cloudinary config or test asset not available");
      return;
    }

    try {
      await deleteMedia(
        testAssetId,
        testPublicId,
        "image",
        config
      );
      console.log("Delete successful");
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  });

  it("should delete all assets for an entity", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    // Upload multiple test images
    const testEntityId2 = crypto.randomUUID();
    const uploadedAssets: string[] = [];

    try {
      for (let i = 0; i < 3; i++) {
        const testImage = new File(
          [`test image content ${i}`],
          `test-image-${i}.jpg`,
          { type: "image/jpeg" }
        );

        const result = await uploadMedia(
          {
            file: testImage,
            entityType: testEntityType,
            entityId: testEntityId2,
            slug: testSlug,
            altText: `Test image ${i}`,
            displayName: `Test Image ${i}`,
            sortOrder: i,
          },
          config
        );

        uploadedAssets.push(result.assetId);
      }

      console.log(`Uploaded ${uploadedAssets.length} test images`);

      // Delete all assets for the entity
      const deletedCount = await deleteEntityMedia(testEntityType, testSlug, config);

      expect(deletedCount).toBeGreaterThanOrEqual(0);
      console.log(`Deleted ${deletedCount} assets from entity`);
    } catch (error) {
      console.error("Entity delete test failed:", error);
      throw error;
    } finally {
      // Cleanup: delete any remaining assets
      try {
        const entityFolder = `nabome/${testEntityType}/${testSlug}`;
        await deleteEntityAssets(entityFolder, config);
      } catch (error) {
        console.error("Cleanup failed:", error);
      }
    }
  });

  it("should handle invalid file types", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    const invalidFile = new File(
      ["invalid content"],
      "test.exe",
      { type: "application/x-msdownload" }
    );

    await expect(
      uploadMedia(
        {
          file: invalidFile,
          entityType: testEntityType,
          entityId: crypto.randomUUID(),
          slug: testSlug,
        },
        config
      )
    ).rejects.toThrow();
  });

  it("should handle file size limits", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    // Create a large file (over 10MB limit)
    const largeContent = new Uint8Array(11 * 1024 * 1024); // 11MB
    const largeFile = new File(
      [largeContent],
      "large-image.jpg",
      { type: "image/jpeg" }
    );

    await expect(
      uploadMedia(
        {
          file: largeFile,
          entityType: testEntityType,
          entityId: crypto.randomUUID(),
          slug: testSlug,
        },
        config
      )
    ).rejects.toThrow();
  });

  afterAll(async () => {
    // Cleanup: delete any remaining test assets
    if (config) {
      try {
        const entityFolder = `nabome/${testEntityType}/${testSlug}`;
        await deleteEntityAssets(entityFolder, config);
        console.log("Cleanup completed");
      } catch (error) {
        console.error("Cleanup failed:", error);
      }
    }
  });
});
