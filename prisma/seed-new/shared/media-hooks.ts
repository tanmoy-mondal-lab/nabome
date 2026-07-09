/**
 * Media service integration hooks
 * Provides hooks for the centralized MediaService
 * All media uploads should go through MediaService, never hardcode URLs
 */

import type { PrismaClient } from '@prisma/client';

/**
 * Media upload options
 */
export interface MediaUploadOptions {
  entityType: string;
  entityId: string;
  file: Buffer | string;
  filename: string;
  mimeType: string;
  folder?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  altText?: string;
  displayName?: string;
  tags?: string[];
}

/**
 * Media upload result
 */
export interface MediaUploadResult {
  id: string;
  url: string;
  publicId: string;
  folder: string;
  assetId: string;
  width?: number;
  height?: number;
  fileSize?: number;
}

/**
 * Media service interface
 * This is a placeholder for the actual MediaService integration
 */
export interface MediaService {
  upload(options: MediaUploadOptions): Promise<MediaUploadResult>;
  delete(publicId: string): Promise<void>;
  getUrl(publicId: string): Promise<string>;
}

/**
 * Mock media service for development
 * In production, this would be replaced with actual Cloudinary integration
 */
class MockMediaService implements MediaService {
  async upload(options: MediaUploadOptions): Promise<MediaUploadResult> {
    // In development, return a mock result
    // In production, this would upload to Cloudinary via MediaService
    const assetId = this.generateAssetId();
    const folder = options.folder || `nabome/${options.entityType}/${options.entityId}`;
    const publicId = `${folder}/${assetId}`;
    
    return {
      id: assetId,
      url: `https://res.cloudinary.com/mock/${publicId}`,
      publicId,
      folder,
      assetId,
    };
  }

  async delete(publicId: string): Promise<void> {
    // Mock delete operation
    console.log(`[MockMediaService] Deleting ${publicId}`);
  }

  async getUrl(publicId: string): Promise<string> {
    return `https://res.cloudinary.com/mock/${publicId}`;
  }

  private generateAssetId(): string {
    return Math.random().toString(36).substring(2, 18);
  }
}

/**
 * Media service instance
 * In production, this would be the actual MediaService
 */
let mediaServiceInstance: MediaService;

export function getMediaService(): MediaService {
  if (!mediaServiceInstance) {
    // Check if we should use real Cloudinary uploads
    if (process.env.SEED_UPLOAD_MEDIA === 'true') {
      try {
        const { uploadSeedMedia: cloudinaryUpload, getCloudinaryConfig } = require('../../seed-media-service');
        mediaServiceInstance = new CloudinaryMediaService(cloudinaryUpload, getCloudinaryConfig());
      } catch (error) {
        console.warn('⚠️  Cloudinary media service not available, falling back to mock');
        mediaServiceInstance = new MockMediaService();
      }
    } else {
      mediaServiceInstance = new MockMediaService();
    }
  }
  return mediaServiceInstance;
}

export const mediaService: MediaService = getMediaService();

/**
 * Cloudinary media service implementation
 */
class CloudinaryMediaService implements MediaService {
  private uploadFn: any;
  private configFn: any;

  constructor(uploadFn: any, configFn: any) {
    this.uploadFn = uploadFn;
    this.configFn = configFn;
  }

  async upload(options: MediaUploadOptions): Promise<MediaUploadResult> {
    try {
      const config = this.configFn();
      
      // For Cloudinary upload, we need a local file path
      // If options.file is a buffer, we can't use the seed-media-service directly
      // Fall back to mock service for buffer uploads
      if (Buffer.isBuffer(options.file) || typeof options.file === 'string') {
        console.warn('⚠️  Cloudinary service requires local file paths, using mock service');
        const mockService = new MockMediaService();
        return mockService.upload(options);
      }
      
      const result = await this.uploadFn(
        options.entityType as any,
        options.entityId,
        options.file as string,
        config
      );

      return {
        id: result.assetId,
        url: result.secureUrl,
        publicId: result.publicId,
        folder: result.folder,
        assetId: result.assetId,
        width: result.width || undefined,
        height: result.height || undefined,
        fileSize: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to mock:', error);
      const mockService = new MockMediaService();
      return mockService.upload(options);
    }
  }

  async delete(publicId: string): Promise<void> {
    // Cloudinary delete would go here
    console.log(`[CloudinaryMediaService] Deleting ${publicId}`);
  }

  async getUrl(publicId: string): Promise<string> {
    return `https://res.cloudinary.com/${this.configFn().cloudName}/${publicId}`;
  }
}

/**
 * Upload media for seed data
 * This is the hook that seed modules should use
 */
export async function uploadSeedMedia(
  prisma: PrismaClient,
  options: MediaUploadOptions
): Promise<MediaUploadResult> {
  // Upload via media service
  const result = await mediaService.upload(options);

  // Create media asset record in database
  const mediaAsset = await prisma.mediaAsset.create({
    data: {
      assetId: result.assetId,
      entityType: options.entityType as any,
      entityId: options.entityId,
      url: result.url,
      secureUrl: result.url,
      publicId: result.publicId,
      folder: result.folder,
      resourceType: options.mimeType.startsWith('video') ? 'video' : 'image',
      mimeType: options.mimeType,
      originalFilename: options.filename,
      displayName: options.displayName || options.filename,
      altText: options.altText,
      sortOrder: options.sortOrder || 0,
      isPrimary: options.isPrimary || false,
      tags: options.tags || [],
    },
  });

  return {
    ...result,
    id: mediaAsset.id,
  };
}

/**
 * Upload multiple media items in batch
 */
export async function uploadSeedMediaBatch(
  prisma: PrismaClient,
  items: MediaUploadOptions[]
): Promise<MediaUploadResult[]> {
  const results: MediaUploadResult[] = [];

  for (const item of items) {
    const result = await uploadSeedMedia(prisma, item);
    results.push(result);
  }

  return results;
}

/**
 * Generate a mock media URL for development
 * This should only be used when actual media upload is disabled
 */
export function generateMockMediaUrl(
  entityType: string,
  entityId: string,
  index: number = 0
): string {
  const mockUrls = [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1434389677669-e08b4cda3ea7?w=600&h=800&fit=crop',
  ];

  return mockUrls[index % mockUrls.length];
}
