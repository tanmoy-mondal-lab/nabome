import { AwsClient } from 'aws4fetch';

import type { Env } from '../env.ts';
import { ApiError } from '../http/errors.ts';

export interface StorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

export function getStorageConfig(env: Env): StorageConfig {
  const endpoint = env.STORAGE_ENDPOINT?.trim();
  const region = env.STORAGE_REGION?.trim();
  const bucket = env.STORAGE_BUCKET?.trim();
  const accessKeyId = env.STORAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.STORAGE_SECRET_ACCESS_KEY?.trim();
  const publicUrl = env.STORAGE_PUBLIC_URL?.trim();
  if (
    !endpoint ||
    !region ||
    !bucket ||
    !accessKeyId ||
    !secretAccessKey ||
    !publicUrl
  ) {
    throw ApiError.internal(
      'Storage not configured: STORAGE_* env vars missing',
    );
  }
  return { endpoint, region, bucket, accessKeyId, secretAccessKey, publicUrl };
}

export function getStoragePublicUrl(
  config: StorageConfig,
  key: string,
): string {
  return `${config.publicUrl.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
}

function buildS3Url(config: StorageConfig, key: string): string {
  const base = config.endpoint.replace(/\/+$/, '');
  return `${base}/${config.bucket}/${key.replace(/^\/+/, '')}`;
}

export async function s3Upload(
  config: StorageConfig,
  key: string,
  data: ArrayBuffer,
  contentType: string,
): Promise<void> {
  const url = buildS3Url(config, key);
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
    service: 's3',
  });
  const response = await client.fetch(url, {
    method: 'PUT',
    headers: { 'content-type': contentType },
    body: data as any,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw ApiError.internal(
      `S3 upload failed: ${response.status} ${text.slice(0, 200)}`,
    );
  }
}

export async function s3Delete(
  config: StorageConfig,
  key: string,
): Promise<void> {
  const url = buildS3Url(config, key);
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
    service: 's3',
  });
  const response = await client.fetch(url, {
    method: 'DELETE',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok && response.status !== 404) {
    const text = await response.text().catch(() => '');
    throw ApiError.internal(
      `S3 delete failed: ${response.status} ${text.slice(0, 200)}`,
    );
  }
}

export async function s3Exists(
  config: StorageConfig,
  key: string,
): Promise<boolean> {
  const url = buildS3Url(config, key);
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
    service: 's3',
  });
  const response = await client.fetch(url, {
    method: 'HEAD',
    signal: AbortSignal.timeout(15000),
  });
  if (response.ok) return true;
  if (response.status === 404) return false;
  const text = await response.text().catch(() => '');
  throw ApiError.internal(
    `S3 exists check failed: ${response.status} ${text.slice(0, 200)}`,
  );
}
