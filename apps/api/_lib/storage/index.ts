import { MEDIA } from '@nabome/constants';

import type { Env } from '../env.ts';
import { ApiError } from '../http/errors.ts';

import {
  getStorageConfig,
  getStoragePublicUrl,
  s3Delete,
  s3Upload,
} from './s3.ts';

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

export interface StorageProvider {
  upload(key: string, data: ArrayBuffer, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
}

class S3StorageProvider implements StorageProvider {
  constructor(private config: ReturnType<typeof getStorageConfig>) {}
  async upload(
    key: string,
    data: ArrayBuffer,
    contentType: string,
  ): Promise<void> {
    await s3Upload(this.config, key, data, contentType);
  }
  async delete(key: string): Promise<void> {
    await s3Delete(this.config, key);
  }
  async exists(key: string): Promise<boolean> {
    const { s3Exists } = await import('./s3.ts');
    return s3Exists(this.config, key);
  }
  getPublicUrl(key: string): string {
    return getStoragePublicUrl(this.config, key);
  }
}

class MockStorageProvider implements StorageProvider {
  private store = new Map<string, { data: ArrayBuffer; contentType: string }>();
  async upload(
    key: string,
    data: ArrayBuffer,
    contentType: string,
  ): Promise<void> {
    this.store.set(key, { data, contentType });
  }
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }
  getPublicUrl(key: string): string {
    return `https://mock-storage.local/${key}`;
  }
}

let mockInstance: MockStorageProvider | null = null;

export function getStorageProvider(env: Env): StorageProvider {
  try {
    const config = getStorageConfig(env);
    return new S3StorageProvider(config);
  } catch (e) {
    if (env.ENVIRONMENT === 'local' || env.ENVIRONMENT === 'preview') {
      if (!mockInstance) mockInstance = new MockStorageProvider();
      return mockInstance;
    }
    throw e instanceof ApiError
      ? e
      : ApiError.internal('Storage not configured: STORAGE_* env vars missing');
  }
}

export function validateFile(file: File): FileValidation {
  if (file.size > MEDIA.maxFileSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MEDIA.maxFileSizeBytes / 1024 / 1024}MB`,
    };
  }
  if (!MEDIA.allowedTypes.includes(file.type as any)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) return { valid: false, error: 'File must have an extension' };
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  if (!allowedExtensions.includes(extension))
    return {
      valid: false,
      error: `File extension .${extension} is not allowed`,
    };
  return { valid: true };
}

export function generateStorageKey(
  shopId: string,
  productId: string,
  file: File,
): string {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const uuid = crypto.randomUUID();
  return `shops/${shopId}/products/${productId}/${uuid}.${extension}`;
}

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

export async function uploadToStorage(
  env: Env,
  key: string,
  file: File,
  contentType: string,
): Promise<UploadResult> {
  const provider = getStorageProvider(env);
  const data = await file.arrayBuffer();
  try {
    await provider.upload(key, data, contentType);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Failed to upload file to storage');
  }
  return { key, url: provider.getPublicUrl(key), size: file.size, contentType };
}

export async function deleteFromStorage(env: Env, key: string): Promise<void> {
  const provider = getStorageProvider(env);
  try {
    await provider.delete(key);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Failed to delete file from storage');
  }
}

export function validateShopOwnership(key: string, shopId: string): boolean {
  const prefix = `shops/${shopId}/`;
  return key.startsWith(prefix);
}

export function extractShopIdFromKey(key: string): string | null {
  const match = key.match(/^shops\/([^/]+)\//);
  return match?.[1] ?? null;
}

export function extractProductIdFromKey(key: string): string | null {
  const match = key.match(/^shops\/[^/]+\/products\/([^/]+)\//);
  return match?.[1] ?? null;
}

export function _resetMockForTests(): void {
  mockInstance = null;
}
