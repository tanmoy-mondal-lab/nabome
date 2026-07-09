/**
 * Media Performance Tests
 * 
 * These tests measure the performance of media operations.
 * They help establish performance baselines and detect regressions.
 * 
 * Run with: npm run test -- src/lib/media/__tests__/media.performance.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { uploadMedia, replaceMedia, deleteMedia, deleteEntityMedia } from "../media.service";
import { getCloudinaryConfigFromEnv } from "../cloudinary.config";
import { deleteEntityAssets } from "../cloudinary.service";
import type { CloudinaryConfig } from "../media.types";

describe("Media Performance Tests", () => {
  let config: CloudinaryConfig | undefined;
  const testSlug = "test-performance-product";
  const testEntityType = "products" as const;

  beforeAll(() => {
    try {
      config = getCloudinaryConfigFromEnv();
      console.log("Cloudinary config loaded successfully");
    } catch {
      console.warn("Cloudinary credentials not found. Skipping performance tests.");
    }
  });

  it("should upload a small image within acceptable time", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    const testImage = new File(
      ["test image content"],
      "test-image.jpg",
      { type: "image/jpeg" }
    );

    const startTime = performance.now();
    
    const result = await uploadMedia(
      {
        file: testImage,
        entityType: testEntityType,
        entityId: crypto.randomUUID(),
        slug: testSlug,
      },
      config
    );

    const duration = performance.now() - startTime;

    expect(result).toBeDefined();
    console.log(`Upload duration: ${duration.toFixed(2)}ms`);
    
    // Upload should complete within 10 seconds
    expect(duration).toBeLessThan(10000);
  });

  it("should replace an image within acceptable time", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    // First upload an image
    const testImage = new File(
      ["test image content"],
      "test-image.jpg",
      { type: "image/jpeg" }
    );

    const entityId = crypto.randomUUID();
    const uploadResult = await uploadMedia(
      {
        file: testImage,
        entityType: testEntityType,
        entityId,
        slug: testSlug,
      },
      config
    );

    // Then replace it
    const newTestImage = new File(
      ["new test image content"],
      "new-test-image.jpg",
      { type: "image/jpeg" }
    );

    const startTime = performance.now();
    
    const replaceResult = await replaceMedia(
      {
        file: newTestImage,
        entityType: testEntityType,
        entityId,
        slug: testSlug,
        oldAssetId: uploadResult.assetId,
        oldPublicId: uploadResult.publicId,
      },
      config
    );

    const duration = performance.now() - startTime;

    expect(replaceResult).toBeDefined();
    console.log(`Replace duration: ${duration.toFixed(2)}ms`);
    
    // Replace should complete within 15 seconds (includes upload + delete)
    expect(duration).toBeLessThan(15000);

    // Cleanup
    await deleteMedia(replaceResult.assetId, replaceResult.publicId, "image", config);
  });

  it("should delete an image within acceptable time", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    // First upload an image
    const testImage = new File(
      ["test image content"],
      "test-image.jpg",
      { type: "image/jpeg" }
    );

    const uploadResult = await uploadMedia(
      {
        file: testImage,
        entityType: testEntityType,
        entityId: crypto.randomUUID(),
        slug: testSlug,
      },
      config
    );

    const startTime = performance.now();
    
    await deleteMedia(uploadResult.assetId, uploadResult.publicId, "image", config);

    const duration = performance.now() - startTime;

    console.log(`Delete duration: ${duration.toFixed(2)}ms`);
    
    // Delete should complete within 5 seconds
    expect(duration).toBeLessThan(5000);
  });

  it("should handle batch uploads efficiently", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    const entityId = crypto.randomUUID();
    const uploadCount = 5;
    const uploadPromises: Promise<unknown>[] = [];

    const startTime = performance.now();

    for (let i = 0; i < uploadCount; i++) {
      const testImage = new File(
        [`test image content ${i}`],
        `test-image-${i}.jpg`,
        { type: "image/jpeg" }
      );

      uploadPromises.push(
        uploadMedia(
          {
            file: testImage,
            entityType: testEntityType,
            entityId,
            slug: testSlug,
          },
          config
        )
      );
    }

    const results = await Promise.all(uploadPromises);

    const duration = performance.now() - startTime;

    expect(results).toHaveLength(uploadCount);
    console.log(`Batch upload duration (${uploadCount} files): ${duration.toFixed(2)}ms`);
    console.log(`Average per file: ${(duration / uploadCount).toFixed(2)}ms`);
    
    // Batch upload should complete within 30 seconds for 5 files
    expect(duration).toBeLessThan(30000);

    // Cleanup
    await deleteEntityMedia(testEntityType, testSlug, config);
  });

  it("should handle concurrent operations efficiently", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    const operations = 10;
    const promises: Promise<unknown>[] = [];

    const startTime = performance.now();

    for (let i = 0; i < operations; i++) {
      const testImage = new File(
        [`test image content ${i}`],
        `test-image-${i}.jpg`,
        { type: "image/jpeg" }
      );

      // Mix of upload and delete operations
      if (i % 2 === 0) {
        promises.push(
          uploadMedia(
            {
              file: testImage,
              entityType: testEntityType,
              entityId: crypto.randomUUID(),
              slug: testSlug,
            },
            config
          )
        );
      } else {
        // Upload first, then delete
        const uploadResult = await uploadMedia(
          {
            file: testImage,
            entityType: testEntityType,
            entityId: crypto.randomUUID(),
            slug: testSlug,
          },
          config
        );
        promises.push(
          deleteMedia(uploadResult.assetId, uploadResult.publicId, "image", config)
        );
      }
    }

    await Promise.all(promises);

    const duration = performance.now() - startTime;

    console.log(`Concurrent operations duration (${operations} ops): ${duration.toFixed(2)}ms`);
    console.log(`Average per operation: ${(duration / operations).toFixed(2)}ms`);
    
    // Concurrent operations should complete within 60 seconds
    expect(duration).toBeLessThan(60000);
  });

  it("should measure memory usage during operations", async () => {
    if (!config) {
      console.log("Skipping: Cloudinary config not available");
      return;
    }

    const testImage = new File(
      ["test image content"],
      "test-image.jpg",
      { type: "image/jpeg" }
    );

    const memoryBefore = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

    await uploadMedia(
      {
        file: testImage,
        entityType: testEntityType,
        entityId: crypto.randomUUID(),
        slug: testSlug,
      },
      config
    );

    const memoryAfter = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
    const memoryDelta = memoryAfter - memoryBefore;

    console.log(`Memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
    
    // Memory increase should be reasonable (less than 50MB for a single operation)
    if (memoryBefore > 0 && memoryAfter > 0) {
      expect(memoryDelta).toBeLessThan(50 * 1024 * 1024);
    }
  });

  afterAll(async () => {
    // Cleanup: delete any remaining test assets
    if (config) {
      try {
        const entityFolder = `nabome/${testEntityType}/${testSlug}`;
        await deleteEntityAssets(entityFolder, config);
        console.log("Performance test cleanup completed");
      } catch (error) {
        console.error("Cleanup failed:", error);
      }
    }
  });
});
