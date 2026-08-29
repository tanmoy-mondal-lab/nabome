import { describe, expect, it } from 'vitest';

import type { Env } from '../env.ts';
import type { StorageConfig } from '../storage/s3.ts';
import { getStoragePublicUrl } from '../storage/s3.ts';

import { extractKeyFromUrl } from './service.ts';

const b2PublicUrl = 'https://f000.backblazeb2.com/file/nabome-media';
const b2Env = { STORAGE_PUBLIC_URL: b2PublicUrl } as unknown as Env;
const b2Config = { publicUrl: b2PublicUrl } as StorageConfig;

describe('extractKeyFromUrl - B2 /file/<bucket> regression', () => {
  it('A: B2 publicUrl with /file/<bucket> returns exact shops key (Env)', () => {
    const key = 'shops/test/product/test.png';
    const url = `${b2PublicUrl}/${key}`;
    expect(extractKeyFromUrl(url, b2Env)).toBe(key);
  });

  it('A: B2 publicUrl with /file/<bucket> returns exact shops key (Config)', () => {
    const key = 'shops/test/product/test.png';
    const url = `${b2PublicUrl}/${key}`;
    expect(extractKeyFromUrl(url, b2Config)).toBe(key);
  });

  it('A: B2 publicUrl string variant', () => {
    const key = 'shops/test/product/test.png';
    const url = `${b2PublicUrl}/${key}`;
    expect(extractKeyFromUrl(url, b2PublicUrl)).toBe(key);
  });

  it('A: B2 variant key with /file prefix', () => {
    const key = 'shops/s1/products/p1/variants/v1/abc123.png';
    const url = `${b2PublicUrl}/${key}`;
    expect(extractKeyFromUrl(url, b2Env)).toBe(key);
  });

  it('A: does not return file/<bucket>/ prefix', () => {
    const key = 'shops/test/product/test.png';
    const url = `${b2PublicUrl}/${key}`;
    const extracted = extractKeyFromUrl(url, b2Env);
    expect(extracted).not.toBe(`file/nabome-media/${key}`);
    expect(extracted).toBe(key);
  });

  it('A: trailing slash in publicUrl handled', () => {
    const key = 'shops/test/product/test.png';
    const url = `${b2PublicUrl}/${key}`;
    expect(extractKeyFromUrl(url, `${b2PublicUrl}/`)).toBe(key);
  });

  it('A: roundtrip via getStoragePublicUrl', () => {
    const cfg = {
      endpoint: 'https://s3.us-east-005.backblazeb2.com',
      region: 'us-east-005',
      bucket: 'nabome-media',
      accessKeyId: 'k',
      secretAccessKey: 's',
      publicUrl: b2PublicUrl,
    } as StorageConfig;
    const key = 'shops/shop1/products/prod1/uuid.png';
    const url = getStoragePublicUrl(cfg, key);
    expect(extractKeyFromUrl(url, cfg)).toBe(key);
    expect(extractKeyFromUrl(url, b2Env)).toBe(key);
  });

  it('A: fallback without env still extracts via shops/ heuristic', () => {
    const key = 'shops/test/product/test.png';
    const url = `${b2PublicUrl}/${key}`;
    expect(extractKeyFromUrl(url)).toBe(key);
  });
});

describe('extractKeyFromUrl - normal S3 publicUrl', () => {
  it('B: CDN without bucket prefix', () => {
    const pub = 'https://cdn.example.com';
    const key = 'shops/s1/products/p1/a.jpg';
    expect(extractKeyFromUrl(`${pub}/${key}`, pub)).toBe(key);
  });

  it('B: S3 path-style with prefix', () => {
    const pub = 'https://cdn.example.com/media';
    const key = 'shops/s1/products/p1/a.jpg';
    expect(extractKeyFromUrl(`${pub}/${key}`, pub)).toBe(key);
  });

  it('B: s3 virtual-hosted style bucket in subdomain', () => {
    const pub = 'https://my-bucket.s3.amazonaws.com';
    const key = 'shops/s1/products/p1/a.jpg';
    expect(extractKeyFromUrl(`${pub}/${key}`, pub)).toBe(key);
  });

  it('B: mock storage url without env', () => {
    const key = 'shops/s1/products/p1/a.jpg';
    expect(extractKeyFromUrl(`https://mock-storage.local/${key}`)).toBe(key);
  });
});

describe('extractKeyFromUrl - URL encoding', () => {
  it('C: encoded space decodes to original', () => {
    const key = 'shops/s1/products/p1/hello world.png';
    const encoded = 'shops/s1/products/p1/hello%20world.png';
    const url = `${b2PublicUrl}/${encoded}`;
    expect(extractKeyFromUrl(url, b2Env)).toBe(key);
  });

  it('C: encoded unicode', () => {
    const key = 'shops/s1/products/p1/café.png';
    const encoded = `shops/s1/products/p1/${encodeURIComponent('café.png')}`;
    const url = `${b2PublicUrl}/${encoded}`;
    expect(extractKeyFromUrl(url, b2Env)).toBe(key);
  });

  it('C: preserves existing non-encoded key via roundtrip', () => {
    const cfg = {
      endpoint: 'https://s3.us-east-005.backblazeb2.com',
      region: 'us-east-005',
      bucket: 'nabome-media',
      accessKeyId: 'k',
      secretAccessKey: 's',
      publicUrl: b2PublicUrl,
    } as StorageConfig;
    const key = 'shops/shop1/products/prod1/file with spaces.png';
    const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/');
    const url = `${b2PublicUrl}/${encodedKey}`;
    expect(extractKeyFromUrl(url, cfg)).toBe(key);
  });

  it('C: malformed percent stays raw', () => {
    const url = `${b2PublicUrl}/shops/s1/products/p1/%ZZ.png`;
    const result = extractKeyFromUrl(url, b2Env);
    expect(result).toBe('shops/s1/products/p1/%ZZ.png');
  });
});

describe('extractKeyFromUrl - bucket special characters & regressions', () => {
  it('handles bucket with hyphen and numbers', () => {
    const pub = 'https://f000.backblazeb2.com/file/nabome-media-test123';
    const key = 'shops/s1/products/p1/a.jpg';
    expect(extractKeyFromUrl(`${pub}/${key}`, pub)).toBe(key);
  });

  it('handles bucket with underscore/dot', () => {
    const pub = 'https://f000.backblazeb2.com/file/my_bucket.test';
    const key = 'shops/s1/products/p1/a.jpg';
    expect(extractKeyFromUrl(`${pub}/${key}`, pub)).toBe(key);
  });

  it('returns null for invalid url', () => {
    expect(extractKeyFromUrl('not a url')).toBeNull();
  });

  it('returns null for empty path', () => {
    expect(extractKeyFromUrl('https://example.com/')).toBeNull();
  });

  it('returns null for publicUrl exact match without key', () => {
    expect(extractKeyFromUrl(b2PublicUrl, b2Env)).toBeNull();
  });

  it('ignores query string', () => {
    const key = 'shops/s1/products/p1/a.jpg';
    const url = `${b2PublicUrl}/${key}?v=1`;
    expect(extractKeyFromUrl(url, b2Env)).toBe(key);
  });
});
