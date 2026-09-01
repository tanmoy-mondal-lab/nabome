import type { ProductMedia } from '@prisma/client';

import type { Env } from '../env.ts';
import { ApiError } from '../http/errors.ts';
import { getPrisma } from '../prisma.ts';
import {
  deleteFromStorage,
  generateStorageKey,
  generateVariantStorageKey,
  uploadToStorage,
  validateFile,
  type UploadResult,
} from '../storage/index.ts';
import type { StorageConfig } from '../storage/s3.ts';

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

export async function uploadProductMedia(
  input: MediaUploadInput & { env: Env },
): Promise<MediaUploadResult> {
  const {
    productId,
    variantId,
    file,
    shopId,
    altText,
    sortOrder = 0,
    env,
  } = input;
  const validation = validateFile(file);
  if (!validation.valid)
    throw ApiError.validation(validation.error ?? 'Invalid file');
  const prisma = getPrisma();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { shopId: true },
  });
  if (!product) throw ApiError.notFound('Product not found');
  if (product.shopId !== shopId)
    throw ApiError.forbidden('Product does not belong to this shop');
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true },
    });
    if (!variant || variant.productId !== productId)
      throw ApiError.forbidden('Variant does not belong to this product');
  }
  const key = variantId
    ? generateVariantStorageKey(shopId, productId, variantId, file)
    : generateStorageKey(shopId, productId, file);
  const uploadResult: UploadResult = await uploadToStorage(
    env,
    key,
    file,
    file.type || 'application/octet-stream',
  );
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

export async function deleteProductMedia(
  mediaId: string,
  shopId: string,
  env: Env,
): Promise<void> {
  const prisma = getPrisma();
  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: { product: { select: { shopId: true } } },
  });
  if (!media) throw ApiError.notFound('Media not found');
  if (media.product.shopId !== shopId)
    throw ApiError.forbidden('Media does not belong to this shop');
  const key = extractKeyFromUrl(media.url, env);
  if (key) {
    try {
      await deleteFromStorage(env, key);
    } catch (error) {
      console.error('Failed to delete from storage:', error);
    }
  }
  await prisma.productMedia.delete({ where: { id: mediaId } });
}

export async function updateProductMedia(
  mediaId: string,
  shopId: string,
  updates: { altText?: string; sortOrder?: number },
): Promise<ProductMedia> {
  const prisma = getPrisma();
  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: { product: { select: { shopId: true } } },
  });
  if (!media) throw ApiError.notFound('Media not found');
  if (media.product.shopId !== shopId)
    throw ApiError.forbidden('Media does not belong to this shop');
  return prisma.productMedia.update({ where: { id: mediaId }, data: updates });
}

export async function getProductMedia(
  productId: string,
): Promise<ProductMedia[]> {
  const prisma = getPrisma();
  return prisma.productMedia.findMany({
    where: { productId, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export function extractKeyFromUrl(
  url: string,
  envOrPublicUrl?: Env | StorageConfig | string | null,
): string | null {
  try {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;
    let publicUrl: string | null = null;
    if (typeof envOrPublicUrl === 'string') {
      publicUrl = envOrPublicUrl.trim() || null;
    } else if (envOrPublicUrl && typeof envOrPublicUrl === 'object') {
      if ('STORAGE_PUBLIC_URL' in envOrPublicUrl) {
        publicUrl = (envOrPublicUrl as Env).STORAGE_PUBLIC_URL?.trim() || null;
      } else if ('publicUrl' in envOrPublicUrl) {
        publicUrl = (envOrPublicUrl as StorageConfig).publicUrl?.trim() || null;
      }
    }
    if (publicUrl) {
      try {
        const pub = new URL(publicUrl);
        const publicPath = pub.pathname.replace(/\/+$/, '');
        if (publicPath && pathname === publicPath) {
          pathname = '';
        } else if (publicPath && pathname.startsWith(`${publicPath}/`)) {
          pathname = pathname.slice(publicPath.length);
        } else if (publicPath) {
          const shopsIdx = pathname.indexOf('/shops/');
          if (shopsIdx !== -1) pathname = pathname.slice(shopsIdx);
        }
      } catch (error) {
        // If URL parsing fails, continue with original pathname
        console.warn('Failed to parse URL pathname:', error);
      }
      const key = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      if (!key) return null;
      try {
        return decodeURIComponent(key);
      } catch {
        return key;
      }
    }
    const shopsIdx = pathname.indexOf('/shops/');
    if (shopsIdx !== -1) pathname = pathname.slice(shopsIdx);
    const key = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    if (!key) return null;
    try {
      return decodeURIComponent(key);
    } catch {
      return key;
    }
  } catch {
    return null;
  }
}

export const mediaService = {
  uploadProductMedia,
  deleteProductMedia,
  updateProductMedia,
  getProductMedia,
};
