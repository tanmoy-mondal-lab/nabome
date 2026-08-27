/**
 * Media Service
 * Business logic for product media management
 */

import type { ProductMedia } from '@prisma/client';

import { ApiError } from '../http/errors.ts';
import { getPrisma } from '../prisma.ts';
import {
  validateFile,
  generateStorageKey,
  generateVariantStorageKey,
  uploadToR2,
  deleteFromR2,
  type UploadResult,
} from '../storage/r2.ts';

export interface MediaUploadInput {
  productId: string;
  variantId?: string;
  file: File;
  shopId: string;
  altText?: string;
  sortOrder?: number;
}

export interface MediaUploadResult {
  id: string;
  url: string;
  key: string;
  size: number;
  type: string;
  altText?: string;
  sortOrder: number;
}

/**
 * Upload media for a product
 * Validates file, uploads to R2, and creates database record
 */
export async function uploadProductMedia(
  input: MediaUploadInput,
  bucket: R2Bucket,
): Promise<MediaUploadResult> {
  const { productId, variantId, file, shopId, altText, sortOrder = 0 } = input;

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw ApiError.validation(validation.error ?? 'Invalid file');
  }

  // Verify product belongs to shop
  const prisma = getPrisma();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { shopId: true },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (product.shopId !== shopId) {
    throw ApiError.forbidden('Product does not belong to this shop');
  }

  // If variantId is provided, verify it belongs to the product
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true },
    });

    if (!variant || variant.productId !== productId) {
      throw ApiError.forbidden('Variant does not belong to this product');
    }
  }

  // Generate storage key
  const key = variantId
    ? generateVariantStorageKey(shopId, productId, variantId, file)
    : generateStorageKey(shopId, productId, file);

  // Upload to R2
  const uploadResult: UploadResult = await uploadToR2(
    bucket as any,
    key,
    file,
    file.type || 'application/octet-stream',
  );

  // Create database record
  const media = await prisma.productMedia.create({
    data: {
      productId,
      variantId,
      type: file.type || 'application/octet-stream',
      url: uploadResult.url,
      altText,
      sortOrder,
    },
  });

  return {
    id: media.id,
    url: media.url,
    key: uploadResult.key,
    size: uploadResult.size,
    type: media.type,
    altText: media.altText ?? undefined,
    sortOrder: media.sortOrder,
  };
}

/**
 * Delete media
 * Verifies ownership, deletes from R2 and database
 */
export async function deleteProductMedia(
  mediaId: string,
  shopId: string,
  bucket: R2Bucket,
): Promise<void> {
  const prisma = getPrisma();

  // Get media with product info
  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: {
      product: {
        select: { shopId: true },
      },
    },
  });

  if (!media) {
    throw ApiError.notFound('Media not found');
  }

  // Verify shop ownership
  if (media.product.shopId !== shopId) {
    throw ApiError.forbidden('Media does not belong to this shop');
  }

  // Extract key from URL
  const key = extractKeyFromUrl(media.url);
  if (key) {
    // Delete from R2
    try {
      await deleteFromR2(bucket as any, key);
    } catch (error) {
      console.error('Failed to delete from R2:', error);
      // Continue with database deletion even if R2 fails
    }
  }

  // Delete from database
  await prisma.productMedia.delete({
    where: { id: mediaId },
  });
}

/**
 * Update media (alt text, sort order)
 */
export async function updateProductMedia(
  mediaId: string,
  shopId: string,
  updates: {
    altText?: string;
    sortOrder?: number;
  },
): Promise<ProductMedia> {
  const prisma = getPrisma();

  // Get media with product info
  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: {
      product: {
        select: { shopId: true },
      },
    },
  });

  if (!media) {
    throw ApiError.notFound('Media not found');
  }

  // Verify shop ownership
  if (media.product.shopId !== shopId) {
    throw ApiError.forbidden('Media does not belong to this shop');
  }

  // Update
  return prisma.productMedia.update({
    where: { id: mediaId },
    data: updates,
  });
}

/**
 * Get media for a product
 */
export async function getProductMedia(
  productId: string,
): Promise<ProductMedia[]> {
  const prisma = getPrisma();
  return prisma.productMedia.findMany({
    where: { productId, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Extract R2 key from URL
 * Assumes URL format: https://nabome-media.r2.dev/shops/{shopId}/products/{productId}/{uuid}.{ext}
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    // Remove leading slash
    return path.startsWith('/') ? path.slice(1) : path;
  } catch {
    return null;
  }
}

// Export service object for handlers
export const mediaService = {
  uploadProductMedia,
  deleteProductMedia,
  updateProductMedia,
  getProductMedia,
};
