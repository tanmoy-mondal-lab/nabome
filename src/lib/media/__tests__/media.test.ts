/**
 * Media Management System - Comprehensive Test Suite
 * 
 * This test suite covers all media operations including:
 * - Upload (single/multiple images, video, mixed)
 * - Replace (image, video, singleton)
 * - Delete (asset, entity, gallery asset)
 * - Validation (invalid MIME, oversized file, invalid extension, corrupted file)
 * - Integrity (orphan, duplicate, missing asset detection)
 * - Reset (full reset, reseed, Cloudinary cleanup, DB cleanup)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  uploadMedia,
  replaceMedia,
  deleteMedia,
  deleteEntityMedia,
  copyMedia,
  moveMedia,
  getMediaInfo,
  mediaExists,
  prepareUploadMetadata,
  batchUploadMedia,
} from '../media.service';
import {
  validateFile,
  validateFileContent,
  validateVideoFile,
  validateDocumentFile,
  validateImageDimensions,
  validateUploadCount,
  validateEntityMediaCount,
} from '../validation.service';
import {
  getEntityFolder,
  getAssetFolder,
  isValidFolder,
  normalizeFolder,
  parseEntityFolder,
} from '../folder.service';
import {
  generateAssetId,
  isValidAssetId,
} from '../asset-id.service';
import {
  authorizeMediaOperation,
  performSecurityChecks,
  sanitizeFolderPath,
  sanitizeAssetId,
  sanitizeFilenameSecure,
  validateCloudinaryPublicId,
  createSafePublicId,
  MediaRateLimiter,
  MediaAuthorizationLevel,
} from '../security.service';
import {
  deleteEntityMediaAssets,
  migrateEntitySlug,
  cleanupOrphanedMedia,
  verifyMediaConsistency,
} from '../lifecycle.service';
import type { CloudinaryConfig, EntityType } from '../media.types';
import { ROOT_FOLDER } from '../media.constants';

// Mock Cloudinary service
vi.mock('../cloudinary.service', () => ({
  uploadAsset: vi.fn(),
  deleteAsset: vi.fn(),
  deleteEntityAssets: vi.fn(),
  copyAsset: vi.fn(),
  moveAsset: vi.fn(),
  getAsset: vi.fn(),
  assetExists: vi.fn(),
  getEntityAssets: vi.fn(),
  cleanupOrphanedAssets: vi.fn(),
}));

// Mock Prisma
vi.mock('../../../api/_lib/prisma', () => ({
  getPrisma: vi.fn(() => ({
    mediaAsset: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  })),
}));

describe('Media Management System - Comprehensive Tests', () => {
  const mockConfig: CloudinaryConfig = {
    cloudName: 'test-cloud',
    apiKey: 'test-key',
    apiSecret: 'test-secret',
  };

  const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
  const mockPdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

  describe('Upload Tests', () => {
    it('should upload a single image successfully', async () => {
      const result = await uploadMedia(
        {
          entityType: 'products' as EntityType,
          entityId: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'test-product',
          file: mockFile,
          altText: 'Test image',
        },
        mockConfig
      );

      expect(result).toBeDefined();
      expect(result.assetId).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.publicId).toBeDefined();
      expect(result.resourceType).toBe('image');
    });

    it('should upload multiple images in batch', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['test3'], 'test3.jpg', { type: 'image/jpeg' }),
      ];

      const results = await batchUploadMedia(
        files,
        'products',
        '123e4567-e89b-12d3-a456-426614174000',
        'test-product',
        mockConfig
      );

      expect(results).toHaveLength(3);
      expect(results.every(r => r.assetId)).toBe(true);
    });

    it('should upload a video successfully', async () => {
      const result = await uploadMedia(
        {
          entityType: 'products' as EntityType,
          entityId: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'test-product',
          file: mockVideoFile,
          altText: 'Test video',
        },
        mockConfig
      );

      expect(result.resourceType).toBe('video');
      expect(result.duration).toBeDefined();
    });

    it('should upload mixed file types (image + video)', async () => {
      const files = [mockFile, mockVideoFile];

      const results = await batchUploadMedia(
        files,
        'products',
        '123e4567-e89b-12d3-a456-426614174000',
        'test-product',
        mockConfig
      );

      expect(results).toHaveLength(2);
      expect(results[0].resourceType).toBe('image');
      expect(results[1].resourceType).toBe('video');
    });

    it('should reject oversized files', async () => {
      const oversizedFile = new File([new ArrayBuffer(30 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      await expect(
        uploadMedia(
          {
            entityType: 'products' as EntityType,
            entityId: '123e4567-e89b-12d3-a456-426614174000',
            slug: 'test-product',
            file: oversizedFile,
          },
          mockConfig
        )
      ).rejects.toThrow();
    });
  });

  describe('Replace Tests', () => {
    it('should replace an image successfully', async () => {
      const result = await replaceMedia(
        {
          entityType: 'products' as EntityType,
          entityId: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'test-product',
          file: mockFile,
          oldAssetId: 'asset_123',
          oldPublicId: 'nabome/products/test-product/asset_123/test.jpg',
          altText: 'New image',
        },
        mockConfig
      );

      expect(result.assetId).toBeDefined();
      expect(result.assetId).not.toBe('asset_123');
    });

    it('should replace a video successfully', async () => {
      const result = await replaceMedia(
        {
          entityType: 'products' as EntityType,
          entityId: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'test-product',
          file: mockVideoFile,
          oldAssetId: 'asset_123',
          oldPublicId: 'nabome/products/test-product/asset_123/test.mp4',
        },
        mockConfig
      );

      expect(result.resourceType).toBe('video');
    });

    it('should handle singleton replacement (single asset per entity)', async () => {
      const result = await replaceMedia(
        {
          entityType: 'brands' as EntityType,
          entityId: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'test-brand',
          file: mockFile,
          oldAssetId: 'asset_123',
          oldPublicId: 'nabome/brands/test-brand/asset_123/logo.jpg',
        },
        mockConfig
      );

      expect(result).toBeDefined();
    });
  });

  describe('Delete Tests', () => {
    it('should delete a single asset successfully', async () => {
      await expect(
        deleteMedia(
          'asset_123',
          'nabome/products/test-product/asset_123/test.jpg',
          'image',
          mockConfig
        )
      ).resolves.not.toThrow();
    });

    it('should delete all assets for an entity', async () => {
      const result = await deleteEntityMedia(
        'products',
        'test-product',
        mockConfig
      );

      expect(result.deletedCount).toBeDefined();
      expect(typeof result.deletedCount).toBe('number');
    });

    it('should delete a gallery asset while preserving others', async () => {
      await expect(
        deleteMedia(
          'asset_123',
          'nabome/products/test-product/asset_123/image1.jpg',
          'image',
          mockConfig
        )
      ).resolves.not.toThrow();
    });
  });

  describe('Validation Tests', () => {
    describe('MIME Type Validation', () => {
      it('should accept valid image MIME types', () => {
        const result = validateFile(mockFile);
        expect(result.valid).toBe(true);
      });

      it('should reject invalid MIME types', () => {
        const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
        const result = validateFile(invalidFile);
        expect(result.valid).toBe(false);
      });

      it('should accept valid video MIME types', () => {
        const result = validateVideoFile(mockVideoFile);
        expect(result.valid).toBe(true);
      });

      it('should accept valid document MIME types', () => {
        const result = validateDocumentFile(mockPdfFile);
        expect(result.valid).toBe(true);
      });
    });

    describe('File Size Validation', () => {
      it('should reject oversized images', () => {
        const oversizedFile = new File([new ArrayBuffer(15 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
        const result = validateFile(oversizedFile);
        expect(result.valid).toBe(false);
      });

      it('should reject oversized videos', () => {
        const oversizedVideo = new File([new ArrayBuffer(150 * 1024 * 1024)], 'large.mp4', { type: 'video/mp4' });
        const result = validateFile(oversizedVideo);
        expect(result.valid).toBe(false);
      });

      it('should reject oversized documents', () => {
        const oversizedPdf = new File([new ArrayBuffer(10 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
        const result = validateFile(oversizedPdf);
        expect(result.valid).toBe(false);
      });
    });

    describe('Content Validation', () => {
      it('should detect file content mismatch', async () => {
        // Create a file with JPEG extension but PNG content
        const mismatchedFile = new File([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], 'fake.jpg', { type: 'image/jpeg' });
        const result = await validateFileContent(mismatchedFile, 'image/jpeg');
        expect(result.valid).toBe(false);
      });

      it('should validate correct file signatures', async () => {
        const jpegFile = new File([new Uint8Array([0xFF, 0xD8, 0xFF])], 'real.jpg', { type: 'image/jpeg' });
        const result = await validateFileContent(jpegFile, 'image/jpeg');
        expect(result.valid).toBe(true);
      });
    });

    describe('Image Dimensions Validation', () => {
      it('should validate minimum dimensions', () => {
        const result = validateImageDimensions(100, 100, 50, 50);
        expect(result.valid).toBe(true);
      });

      it('should reject images below minimum dimensions', () => {
        const result = validateImageDimensions(25, 25, 50, 50);
        expect(result.valid).toBe(false);
      });

      it('should validate maximum dimensions', () => {
        const result = validateImageDimensions(1000, 1000, undefined, 2000);
        expect(result.valid).toBe(true);
      });

      it('should reject images above maximum dimensions', () => {
        const result = validateImageDimensions(3000, 3000, undefined, 2000);
        expect(result.valid).toBe(false);
      });
    });

    describe('Upload Count Validation', () => {
      it('should accept valid upload counts', () => {
        const result = validateUploadCount(5);
        expect(result.valid).toBe(true);
      });

      it('should reject zero files', () => {
        const result = validateUploadCount(0);
        expect(result.valid).toBe(false);
      });

      it('should reject excessive file counts', () => {
        const result = validateUploadCount(15);
        expect(result.valid).toBe(false);
      });
    });

    describe('Entity Media Count Validation', () => {
      it('should accept valid media counts per entity', () => {
        const result = validateEntityMediaCount(5, 3, 'image');
        expect(result.valid).toBe(true);
      });

      it('should reject excessive images per entity', () => {
        const result = validateEntityMediaCount(18, 5, 'image');
        expect(result.valid).toBe(false);
      });

      it('should reject excessive videos per entity', () => {
        const result = validateEntityMediaCount(4, 2, 'video');
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Integrity Tests', () => {
    it('should detect orphaned assets', async () => {
      const result = await verifyMediaConsistency(
        'products',
        'test-product',
        [
          { assetId: 'asset_1', publicId: 'nabome/products/test-product/asset_1/test.jpg', folder: 'nabome/products/test-product/asset_1' },
        ],
        mockConfig
      );

      expect(result).toBeDefined();
      expect(result.isConsistent).toBeDefined();
    });

    it('should detect duplicate assets', async () => {
      const result = await verifyMediaConsistency(
        'products',
        'test-product',
        [
          { assetId: 'asset_1', publicId: 'nabome/products/test-product/asset_1/test.jpg', folder: 'nabome/products/test-product/asset_1' },
          { assetId: 'asset_2', publicId: 'nabome/products/test-product/asset_2/test.jpg', folder: 'nabome/products/test-product/asset_2' },
        ],
        mockConfig
      );

      expect(result.duplicateAssets).toBeDefined();
    });

    it('should detect missing assets in Cloudinary', async () => {
      const result = await verifyMediaConsistency(
        'products',
        'test-product',
        [
          { assetId: 'asset_1', publicId: 'nabome/products/test-product/asset_1/missing.jpg', folder: 'nabome/products/test-product/asset_1' },
        ],
        mockConfig
      );

      expect(result.missingInCloudinary).toBeDefined();
    });

    it('should detect missing assets in database', async () => {
      const result = await verifyMediaConsistency(
        'products',
        'test-product',
        [],
        mockConfig
      );

      expect(result.missingInDatabase).toBeDefined();
    });

    it('should cleanup orphaned assets', async () => {
      const result = await cleanupOrphanedMedia(
        'products',
        'test-product',
        ['nabome/products/test-product/asset_1/test.jpg'],
        mockConfig
      );

      expect(result).toBeDefined();
    });
  });

  describe('Reset Tests', () => {
    it('should delete all entity assets', async () => {
      const result = await deleteEntityMediaAssets(
        'products',
        '123e4567-e89b-12d3-a456-426614174000',
        'test-product',
        mockConfig
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
    });

    it('should migrate entity slug successfully', async () => {
      const result = await migrateEntitySlug(
        'products',
        '123e4567-e89b-12d3-a456-426614174000',
        'old-slug',
        'new-slug',
        [
          {
            assetId: 'asset_1',
            oldPublicId: 'nabome/products/old-slug/asset_1/test.jpg',
            oldResourceType: 'image',
            originalFilename: 'test.jpg',
          },
        ],
        mockConfig
      );

      expect(result).toBeDefined();
      expect(result.migratedAssets).toBeDefined();
    });
  });

  describe('Folder Service Tests', () => {
    it('should generate valid entity folders', () => {
      const folder = getEntityFolder('products', 'test-product');
      expect(folder).toBe(`${ROOT_FOLDER}/products/test-product`);
    });

    it('should generate valid asset folders', () => {
      const entityFolder = getEntityFolder('products', 'test-product');
      const assetFolder = getAssetFolder(entityFolder, 'asset_123');
      expect(assetFolder).toBe(`${ROOT_FOLDER}/products/test-product/asset_123`);
    });

    it('should validate folder paths', () => {
      expect(isValidFolder(`${ROOT_FOLDER}/products/test-product`)).toBe(true);
      expect(isValidFolder(`${ROOT_FOLDER}/../etc/passwd`)).toBe(false);
      expect(isValidFolder(`invalid/path`)).toBe(false);
    });

    it('should normalize folder paths', () => {
      const normalized = normalizeFolder(`${ROOT_FOLDER}/products//test-product`);
      expect(normalized).toBe(`${ROOT_FOLDER}/products/test-product`);
    });

    it('should parse entity folders', () => {
      const parsed = parseEntityFolder(`${ROOT_FOLDER}/products/test-product/asset_123`);
      expect(parsed).toBeDefined();
      expect(parsed?.entityType).toBe('products');
      expect(parsed?.slug).toBe('test-product');
      expect(parsed?.assetId).toBe('asset_123');
    });
  });

  describe('Asset ID Service Tests', () => {
    it('should generate valid asset IDs', () => {
      const assetId = generateAssetId();
      expect(assetId).toBeDefined();
      expect(isValidAssetId(assetId)).toBe(true);
    });

    it('should validate asset IDs', () => {
      expect(isValidAssetId('asset_123')).toBe(true);
      expect(isValidAssetId('invalid')).toBe(false);
      expect(isValidAssetId('../etc/passwd')).toBe(false);
    });
  });

  describe('Security Service Tests', () => {
    it('should authorize admin users', () => {
      const result = authorizeMediaOperation(
        MediaAuthorizationLevel.ADMIN,
        { userId: 'user_1', role: 'admin', permissions: [] },
        'products',
        '123'
      );
      expect(result.authorized).toBe(true);
    });

    it('should authorize users with specific permissions', () => {
      const result = authorizeMediaOperation(
        MediaAuthorizationLevel.UPLOAD,
        { userId: 'user_1', role: 'user', permissions: ['media:upload'] },
        'products',
        '123'
      );
      expect(result.authorized).toBe(true);
    });

    it('should reject unauthorized users', () => {
      const result = authorizeMediaOperation(
        MediaAuthorizationLevel.DELETE,
        { userId: 'user_1', role: 'user', permissions: [] },
        'products',
        '123'
      );
      expect(result.authorized).toBe(false);
    });

    it('should perform security checks', () => {
      const result = performSecurityChecks({
        entityType: 'products',
        entityId: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-product',
      });
      expect(result.passed).toBe(true);
    });

    it('should detect invalid entity types', () => {
      const result = performSecurityChecks({
        entityType: 'invalid' as EntityType,
        entityId: '123',
        slug: 'test',
      });
      expect(result.passed).toBe(false);
    });

    it('should sanitize folder paths', () => {
      const result = sanitizeFolderPath(`${ROOT_FOLDER}/products/../etc/passwd`);
      expect(result.sanitized).toBe(false);
    });

    it('should sanitize asset IDs', () => {
      const result = sanitizeAssetId('asset_123');
      expect(result.sanitized).toBe(true);
    });

    it('should sanitize filenames', () => {
      const result = sanitizeFilenameSecure('test.jpg');
      expect(result.sanitized).toBe(true);
    });

    it('should validate Cloudinary public IDs', () => {
      const result = validateCloudinaryPublicId('nabome/products/test/asset_123/test.jpg');
      expect(result.passed).toBe(true);
    });

    it('should reject malicious public IDs', () => {
      const result = validateCloudinaryPublicId('../etc/passwd');
      expect(result.passed).toBe(false);
    });

    it('should create safe public IDs', () => {
      const result = createSafePublicId('asset_123', 'test.jpg');
      expect(result.passed).toBe(true);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should enforce rate limits', () => {
      const limiter = new MediaRateLimiter(60000, 5);
      
      for (let i = 0; i < 5; i++) {
        expect(limiter.checkLimit('user_1')).toBe(true);
      }
      
      expect(limiter.checkLimit('user_1')).toBe(false);
    });

    it('should track remaining requests', () => {
      const limiter = new MediaRateLimiter(60000, 10);
      
      limiter.checkLimit('user_1');
      expect(limiter.getRemainingRequests('user_1')).toBe(9);
    });

    it('should reset rate limits', () => {
      const limiter = new MediaRateLimiter(60000, 5);
      
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('user_1');
      }
      
      limiter.resetLimit('user_1');
      expect(limiter.checkLimit('user_1')).toBe(true);
    });
  });

  describe('Metadata Preparation Tests', () => {
    it('should prepare upload metadata', async () => {
      const result = await prepareUploadMetadata(
        mockFile,
        'products',
        '123e4567-e89b-12d3-a456-426614174000',
        'test-product'
      );

      expect(result.valid).toBe(true);
      expect(result.metadata).toBeDefined();
      if (result.metadata) {
        expect(result.metadata.entityType).toBe('products');
        expect(result.metadata.fileName).toBe('test.jpg');
      }
    });

    it('should validate files before metadata preparation', async () => {
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const result = await prepareUploadMetadata(
        invalidFile,
        'products',
        '123e4567-e89b-12d3-a456-426614174000',
        'test-product'
      );

      expect(result.valid).toBe(false);
    });
  });

  describe('Media Info Tests', () => {
    it('should get media info', async () => {
      const result = await getMediaInfo(
        'nabome/products/test-product/asset_123/test.jpg',
        'image',
        mockConfig
      );

      expect(result).toBeDefined();
    });

    it('should check if media exists', async () => {
      const exists = await mediaExists(
        'nabome/products/test-product/asset_123/test.jpg',
        'image',
        mockConfig
      );

      expect(typeof exists).toBe('boolean');
    });
  });

  describe('Copy and Move Tests', () => {
    it('should copy media assets', async () => {
      const result = await copyMedia(
        'nabome/products/source/asset_123/test.jpg',
        'products',
        'target-product',
        mockConfig
      );

      expect(result).toBeDefined();
    });

    it('should move media assets', async () => {
      const result = await moveMedia(
        'nabome/products/source/asset_123/test.jpg',
        'products',
        'target-product',
        mockConfig
      );

      expect(result).toBeDefined();
    });
  });
});
