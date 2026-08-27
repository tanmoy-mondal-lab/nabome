/**
 * R2 Storage Service
 * Secure file upload and management for Cloudflare R2
 */

import type { R2Bucket } from '@cloudflare/workers-types';

import { MEDIA } from '@nabome/constants';

import { ApiError } from '../http/errors.ts';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validate file before upload
 * Checks size, type, and extension
 */
export function validateFile(file: File): FileValidation {
  // Check file size
  if (file.size > MEDIA.maxFileSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MEDIA.maxFileSizeBytes / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!MEDIA.allowedTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    return {
      valid: false,
      error: 'File must have an extension',
    };
  }

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension .${extension} is not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Generate a safe storage key
 * Never trust client-provided filenames
 * Format: shops/{shopId}/products/{productId}/{uuid}.{ext}
 */
export function generateStorageKey(
  shopId: string,
  productId: string,
  file: File,
): string {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const uuid = crypto.randomUUID();
  return `shops/${shopId}/products/${productId}/${uuid}.${extension}`;
}

/**
 * Generate a safe storage key for variant media
 * Format: shops/{shopId}/products/{productId}/variants/{variantId}/{uuid}.{ext}
 */
export function generateVariantStorageKey(
  shopId: string,
  productId: string,
  variantId: string,
  file: File,
): string {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const uuid = crypto.randomUUID();
  return `shops/${shopId}/products/${productId}/variants/${variantId}/${uuid}.${extension}`;
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  file: File,
  contentType: string,
): Promise<UploadResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType,
      },
    });

    const publicBase =
      (globalThis as any).R2_PUBLIC_URL ??
      (typeof process !== 'undefined'
        ? (process as any).env?.R2_PUBLIC_URL
        : undefined) ??
      'https://nabome-media.r2.dev';
    const url = `${String(publicBase).replace(/\/+$/, '')}/${key}`;

    return {
      key,
      url,
      size: file.size,
      contentType,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    throw ApiError.internal('Failed to upload file to storage');
  }
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  try {
    await bucket.delete(key);
  } catch (error) {
    console.error('R2 delete error:', error);
    throw ApiError.internal('Failed to delete file from storage');
  }
}

/**
 * Check if storage key belongs to a shop
 * Prevents cross-shop access
 */
export function validateShopOwnership(key: string, shopId: string): boolean {
  const prefix = `shops/${shopId}/`;
  return key.startsWith(prefix);
}

/**
 * Extract shop ID from storage key
 */
export function extractShopIdFromKey(key: string): string | null {
  const match = key.match(/^shops\/([^/]+)\//);
  return match?.[1] ?? null;
}

/**
 * Extract product ID from storage key
 */
export function extractProductIdFromKey(key: string): string | null {
  const match = key.match(/^shops\/[^/]+\/products\/([^/]+)\//);
  return match?.[1] ?? null;
}
