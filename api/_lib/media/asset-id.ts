const ASSET_ID_PREFIX = "asset_";

export function generateAssetId(): string {
  const uuid = crypto.randomUUID();
  const shortId = uuid.slice(0, 13).toUpperCase();
  return `${ASSET_ID_PREFIX}${shortId}`;
}
