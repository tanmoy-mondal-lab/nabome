import type { Env } from "./env";
import { cleanSecret } from "./secrets";

type CloudinaryResourceType = "image" | "video" | "raw";

function normalizePublicId(publicId: unknown): string | null {
  if (publicId === undefined || publicId === null) return null;
  const value = String(publicId).trim();
  return value ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getResourceType(path: string[]): CloudinaryResourceType {
  const joined = path.join(".").toLowerCase();
  if (joined.includes("video")) return "video";
  if (joined.includes("raw")) return "raw";
  return "image";
}

async function cleanupCloudinaryDiff(
  existing: unknown,
  next: unknown,
  env: Env | undefined,
  path: string[] = []
): Promise<void> {
  if (Array.isArray(existing) || Array.isArray(next)) {
    const existingArr = Array.isArray(existing) ? existing : [];
    const nextArr = Array.isArray(next) ? next : [];

    const canKeyById =
      existingArr.some(isRecord) &&
      nextArr.some(isRecord) &&
      existingArr.every((item) => !isRecord(item) || typeof item.id === "string") &&
      nextArr.every((item) => !isRecord(item) || typeof item.id === "string");

    if (canKeyById) {
      const nextById = new Map(
        nextArr
          .filter(isRecord)
          .map((item) => [String(item.id), item] as const)
      );

      for (const item of existingArr) {
        if (!isRecord(item) || typeof item.id !== "string") continue;
        await cleanupCloudinaryDiff(item, nextById.get(item.id), env, path);
      }
      return;
    }

    const length = Math.max(existingArr.length, nextArr.length);
    for (let index = 0; index < length; index += 1) {
      await cleanupCloudinaryDiff(existingArr[index], nextArr[index], env, [...path, String(index)]);
    }
    return;
  }

  if (isRecord(existing) || isRecord(next)) {
    const existingRecord = isRecord(existing) ? existing : {};
    const nextRecord = isRecord(next) ? next : {};
    const keys = new Set([...Object.keys(existingRecord), ...Object.keys(nextRecord)]);

    for (const key of keys) {
      await cleanupCloudinaryDiff(existingRecord[key], nextRecord[key], env, [...path, key]);
    }
    return;
  }

  const key = path[path.length - 1];
  if (!key || !/publicId$/i.test(key)) return;

  const normalizedExisting = normalizePublicId(existing);
  const normalizedNext = normalizePublicId(next);
  if (normalizedExisting && normalizedExisting !== normalizedNext) {
    await destroyCloudinaryAsset(normalizedExisting, env, getResourceType(path));
  }
}

export async function destroyCloudinaryAsset(
  publicId: string,
  env?: Env,
  resourceType: CloudinaryResourceType = "image"
): Promise<boolean> {
  const cloudName = cleanSecret(env?.CLOUDINARY_CLOUD_NAME);
  const apiKey = cleanSecret(env?.CLOUDINARY_API_KEY);
  const apiSecret = cleanSecret(env?.CLOUDINARY_API_SECRET);
  if (!cloudName || !apiKey || !apiSecret) return false;

  const timestamp = Math.round(Date.now() / 1000);
  const signStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(signStr));
  const signature = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const body = new URLSearchParams({
    public_id: publicId, api_key: apiKey, timestamp: String(timestamp), signature,
  });

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: "POST", body,
    });
    const json = await res.json() as { result: string };
    return json.result === "ok";
  } catch {
    return false;
  }
}

export async function destroyCloudinaryAssets(
  publicIds: string[],
  env?: Env,
  resourceType: CloudinaryResourceType = "image"
): Promise<void> {
  await Promise.all(publicIds.map((id) => id ? destroyCloudinaryAsset(id, env, resourceType) : Promise.resolve()));
}

export async function destroyCloudinaryAssetIfReplaced(
  existingPublicId: string | null | undefined,
  nextPublicId: unknown,
  env?: Env,
  resourceType: CloudinaryResourceType = "image"
): Promise<string | null> {
  const normalizedExisting = normalizePublicId(existingPublicId);
  const normalizedNext = normalizePublicId(nextPublicId);

  if (normalizedExisting && normalizedExisting !== normalizedNext) {
    await destroyCloudinaryAsset(normalizedExisting, env, resourceType);
  }

  return normalizedNext;
}

export async function destroyCloudinaryDiff(
  existing: unknown,
  next: unknown,
  env?: Env
): Promise<void> {
  await cleanupCloudinaryDiff(existing, next, env);
}
