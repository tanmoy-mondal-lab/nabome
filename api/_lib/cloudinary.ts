import type { Env } from "./env";

export async function destroyCloudinaryAsset(
  publicId: string,
  env?: Env
): Promise<boolean> {
  const cloudName = env?.CLOUDINARY_CLOUD_NAME;
  const apiKey = env?.CLOUDINARY_API_KEY;
  const apiSecret = env?.CLOUDINARY_API_SECRET;
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
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
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
  env?: Env
): Promise<void> {
  await Promise.all(publicIds.map((id) => id ? destroyCloudinaryAsset(id, env) : Promise.resolve()));
}