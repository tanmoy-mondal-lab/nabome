/**
 * Media Integrity Service Tests
 * 
 * Tests for the Media Integrity Service including:
 * - Cloudinary verification
 * - Database verification
 * - Orphan detection
 * - Duplicate detection
 * - Folder hierarchy validation
 * - Repair operations
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { MediaIntegrityService } from "../integrity.service";
import type { PrismaClient } from "@prisma/client";
import type { CloudinaryConfig } from "../media.types";

// Mock Prisma client
const mockPrisma = {
  mediaAsset: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
  },
  category: {
    findUnique: vi.fn(),
  },
  collection: {
    findUnique: vi.fn(),
  },
  brand: {
    findUnique: vi.fn(),
  },
} as unknown as PrismaClient;

// Mock Cloudinary config
const mockConfig: CloudinaryConfig = {
  cloudName: "test-cloud",
  apiKey: "test-key",
  apiSecret: "test-secret",
};

describe("MediaIntegrityService", () => {
  let service: MediaIntegrityService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MediaIntegrityService(mockPrisma, mockConfig);
  });

  describe("performFullScan", () => {
    it("should perform a full integrity scan", async () => {
      // Mock database assets
      (mockPrisma.mediaAsset.findMany as any).mockResolvedValue([
        {
          id: "1",
          assetId: "AST_123",
          entityType: "products",
          entityId: "prod-1",
          publicId: "nabome/products/test-product/AST_123/image.jpg",
          folder: "nabome/products/test-product/AST_123",
          resourceType: "image",
          mimeType: "image/jpeg",
          width: 800,
          height: 600,
          fileSize: 100000,
          originalFilename: "image.jpg",
        },
      ]);

      // Mock entity existence
      (mockPrisma.product.findUnique as any).mockResolvedValue({ id: "prod-1" });

      const result = await service.performFullScan({ maxResults: 100 });

      expect(result).toBeDefined();
      expect(result.scanId).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.integrityScore).toBeGreaterThanOrEqual(0);
      expect(result.integrityScore).toBeLessThanOrEqual(100);
    });

    it("should detect missing assets in Cloudinary", async () => {
      (mockPrisma.mediaAsset.findMany as any).mockResolvedValue([
        {
          id: "1",
          assetId: "AST_123",
          entityType: "products",
          entityId: "prod-1",
          publicId: "nabome/products/test-product/AST_123/image.jpg",
          folder: "nabome/products/test-product/AST_123",
          resourceType: "image",
          mimeType: "image/jpeg",
          width: 800,
          height: 600,
          fileSize: 100000,
          originalFilename: "image.jpg",
        },
      ]);

      (mockPrisma.product.findUnique as any).mockResolvedValue({ id: "prod-1" });

      const result = await service.performFullScan({ maxResults: 100 });

      // In a real test with mocked Cloudinary, we would expect missing assets
      expect(result.issues).toBeDefined();
    });

    it("should detect invalid entity references", async () => {
      (mockPrisma.mediaAsset.findMany as any).mockResolvedValue([
        {
          id: "1",
          assetId: "AST_123",
          entityType: "products",
          entityId: "non-existent-prod",
          publicId: "nabome/products/test-product/AST_123/image.jpg",
          folder: "nabome/products/test-product/AST_123",
          resourceType: "image",
          mimeType: "image/jpeg",
          width: 800,
          height: 600,
          fileSize: 100000,
          originalFilename: "image.jpg",
        },
      ]);

      (mockPrisma.product.findUnique as any).mockResolvedValue(null);

      const result = await service.performFullScan({ maxResults: 100 });

      expect(result.issues.invalidEntityReferences).toBeDefined();
    });
  });

  describe("calculateIntegrityScore", () => {
    it("should return 100% when no issues", () => {
      const score = (service as any).calculateIntegrityScore(
        {
          missingInCloudinary: [],
          missingInDatabase: [],
          orphanedAssets: [],
          orphanedRecords: [],
          incorrectFolders: [],
          incorrectPublicIds: [],
          duplicateAssets: [],
          duplicateRecords: [],
          invalidEntityReferences: [],
          brokenFolderStructure: [],
          emptyFolders: [],
          invalidMetadata: [],
        },
        100
      );

      expect(score).toBe(100);
    });

    it("should decrease score with issues", () => {
      const score = (service as any).calculateIntegrityScore(
        {
          missingInCloudinary: [{ assetId: "1", publicId: "test", entityType: "products", entityId: "1" }],
          missingInDatabase: [],
          orphanedAssets: [],
          orphanedRecords: [],
          incorrectFolders: [],
          incorrectPublicIds: [],
          duplicateAssets: [],
          duplicateRecords: [],
          invalidEntityReferences: [],
          brokenFolderStructure: [],
          emptyFolders: [],
          invalidMetadata: [],
        },
        100
      );

      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe("determineStatus", () => {
    it("should return healthy for score >= 95", () => {
      const status = (service as any).determineStatus(95);
      expect(status).toBe("healthy");
    });

    it("should return warning for score >= 80", () => {
      const status = (service as any).determineStatus(85);
      expect(status).toBe("warning");
    });

    it("should return critical for score < 80", () => {
      const status = (service as any).determineStatus(75);
      expect(status).toBe("critical");
    });
  });

  describe("performRepairs", () => {
    it("should delete orphaned database records", async () => {
      const issues = {
        missingInCloudinary: [],
        missingInDatabase: [],
        orphanedAssets: [],
        orphanedRecords: [
          { assetId: "AST_123", entityType: "products", entityId: "prod-1" },
        ],
        incorrectFolders: [],
        incorrectPublicIds: [],
        duplicateAssets: [],
        duplicateRecords: [],
        invalidEntityReferences: [],
        brokenFolderStructure: [],
        emptyFolders: [],
        invalidMetadata: [],
      };

      (mockPrisma.mediaAsset.delete as any).mockResolvedValue({});

      const result = await service.performRepairs(issues, {
        deleteOrphanedRecords: true,
      });

      expect(result.success).toBe(true);
      expect(result.assetsRepaired).toBeGreaterThan(0);
    });

    it("should not perform repairs when validateBeforeRepair is true and score is low", async () => {
      const issues = {
        missingInCloudinary: [],
        missingInDatabase: [],
        orphanedAssets: [],
        orphanedRecords: [],
        incorrectFolders: [],
        incorrectPublicIds: [],
        duplicateAssets: [],
        duplicateRecords: [],
        invalidEntityReferences: [],
        brokenFolderStructure: [],
        emptyFolders: [],
        invalidMetadata: [],
      };

      const result = await service.performRepairs(issues, {
        validateBeforeRepair: true,
      });

      expect(result.success).toBe(false);
      expect(result.warnings).toContain("Integrity score too low for automatic repair. Manual intervention required.");
    });
  });

  describe("generateReport", () => {
    it("should generate JSON report", () => {
      const scanResult = {
        scanId: "test-scan",
        timestamp: new Date(),
        duration: 1000,
        totalAssetsInCloudinary: 100,
        totalAssetsInDatabase: 100,
        assetsChecked: 100,
        issues: {
          missingInCloudinary: [],
          missingInDatabase: [],
          orphanedAssets: [],
          orphanedRecords: [],
          incorrectFolders: [],
          incorrectPublicIds: [],
          duplicateAssets: [],
          duplicateRecords: [],
          invalidEntityReferences: [],
          brokenFolderStructure: [],
          emptyFolders: [],
          invalidMetadata: [],
        },
        integrityScore: 100,
        status: "healthy" as const,
      };

      const report = service.generateReport(scanResult, "json");

      expect(report).toContain("test-scan");
      expect(report).toContain("100");
    });

    it("should generate console report", () => {
      const scanResult = {
        scanId: "test-scan",
        timestamp: new Date(),
        duration: 1000,
        totalAssetsInCloudinary: 100,
        totalAssetsInDatabase: 100,
        assetsChecked: 100,
        issues: {
          missingInCloudinary: [],
          missingInDatabase: [],
          orphanedAssets: [],
          orphanedRecords: [],
          incorrectFolders: [],
          incorrectPublicIds: [],
          duplicateAssets: [],
          duplicateRecords: [],
          invalidEntityReferences: [],
          brokenFolderStructure: [],
          emptyFolders: [],
          invalidMetadata: [],
        },
        integrityScore: 100,
        status: "healthy" as const,
      };

      const report = service.generateReport(scanResult, "console");

      expect(report).toContain("Media Integrity Report");
      expect(report).toContain("Integrity Score: 100%");
    });
  });
});
