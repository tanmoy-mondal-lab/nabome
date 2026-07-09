import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dmzbh87bi";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

const ROOT_FOLDER = "nabome";

interface CloudinaryResource {
  public_id: string;
  asset_id: string;
  resource_type: string;
  type: string;
  format: string;
  bytes: number;
  secure_url: string;
  folder: string;
  created_at: string;
}

async function sha1Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchCloudinaryApi(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<any> {
  const timestamp = Math.round(Date.now() / 1000);
  const allParams = { ...params, timestamp: String(timestamp), api_key: CLOUDINARY_API_KEY };
  const sortedKeys = Object.keys(allParams).sort();
  const signStr = sortedKeys.map((k) => `${k}=${allParams[k]}`).join("&") + CLOUDINARY_API_SECRET;
  const signature = await sha1Hex(signStr);
  allParams.signature = signature;

  const url = new URL(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}${endpoint}`);
  url.search = new URLSearchParams(allParams).toString();

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Cloudinary API error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function listCloudinaryAssets(cursor?: string): Promise<{
  resources: CloudinaryResource[];
  next_cursor: string | null;
}> {
  const params: Record<string, string> = {
    type: "upload",
    prefix: `${ROOT_FOLDER}/`,
    max_results: "500",
  };
  if (cursor) params.next_cursor = cursor;
  if (params.prefix) params.prefix = params.prefix;

  const data = await fetchCloudinaryApi("/resources/image", params);
  const videoData = await fetchCloudinaryApi("/resources/video", params);
  const rawData = await fetchCloudinaryApi("/resources/raw", params);

  return {
    resources: [
      ...(data.resources || []),
      ...(videoData.resources || []),
      ...(rawData.resources || []),
    ],
    next_cursor: data.next_cursor || videoData.next_cursor || rawData.next_cursor || null,
  };
}

async function deleteCloudinaryFolder(folderPath: string): Promise<void> {
  const params: Record<string, string> = {
    folder: folderPath,
    all: "true",
  };
  const timestamp = Math.round(Date.now() / 1000);
  const allParams = { ...params, timestamp: String(timestamp), api_key: CLOUDINARY_API_KEY };
  const sortedKeys = Object.keys(allParams).sort();
  const signStr = sortedKeys.map((k) => `${k}=${allParams[k]}`).join("&") + CLOUDINARY_API_SECRET;
  const signature = await sha1Hex(signStr);
  allParams.signature = signature;

  const url = new URL(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/folders/delete`);
  url.search = new URLSearchParams(allParams).toString();

  try {
    const res = await fetch(url.toString(), { method: "DELETE" });
    if (res.ok) {
      console.log(`  Deleted folder: ${folderPath}`);
    }
  } catch (err) {
    console.error(`  Failed to delete folder ${folderPath}:`, err);
  }
}

async function migrateExistingRecords(): Promise<number> {
  console.log("\n=== Migrating Existing MediaAsset Records ===");
  let migrated = 0;

  const assets = await prisma.mediaAsset.findMany({
    where: {
      OR: [
        { assetId: "" },
        { entityType: "" },
        { entityId: "" },
      ],
    },
  });

  for (const asset of assets) {
    const updates: Record<string, unknown> = {};
    if (!asset.assetId) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = crypto.randomUUID().slice(0, 8).toUpperCase();
      updates.assetId = `AST_${timestamp}_${random}`;
    }
    if (!asset.entityType) {
      updates.entityType = asset.folder?.startsWith("nabome/")
        ? asset.folder.split("/")[1] || "cms"
        : "cms";
    }
    if (!asset.entityId) {
      updates.entityId = crypto.randomUUID();
    }
    if (!asset.secureUrl) {
      updates.secureUrl = asset.url;
    }
    if (!asset.resourceType) {
      updates.resourceType = asset.type === "video" ? "video" : asset.type === "document" ? "raw" : "image";
    }

    if (Object.keys(updates).length > 0) {
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: updates as never,
      });
      migrated++;
    }
  }

  console.log(`  Migrated ${migrated} records`);
  return migrated;
}

async function cleanupMediaAssets(): Promise<void> {
  console.log("\n=== Media Asset Cleanup ===");
  let cleaned = 0;

  const assets = await prisma.mediaAsset.findMany({
    select: { id: true, publicId: true, resourceType: true },
  });

  for (const asset of assets) {
    if (!asset.publicId) {
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      console.log(`  Removed asset with no publicId: ${asset.id}`);
      cleaned++;
      continue;
    }
  }

  console.log(`  Cleaned ${cleaned} invalid records`);
}

async function findOrphanedCloudinaryAssets(): Promise<{
  orphaned: CloudinaryResource[];
  dbOnly: { id: string; publicId: string | null }[];
}> {
  console.log("\n=== Finding Orphaned Assets ===");
  let allCloudinary: CloudinaryResource[] = [];
  let cursor: string | null = null;
  do {
    const result = await listCloudinaryAssets(cursor || undefined);
    allCloudinary = allCloudinary.concat(result.resources);
    cursor = result.next_cursor;
  } while (cursor);

  console.log(`  Total Cloudinary assets under ${ROOT_FOLDER}/: ${allCloudinary.length}`);

  const cloudinaryPublicIds = new Set(allCloudinary.map((r) => r.public_id));
  const dbAssets = await prisma.mediaAsset.findMany({
    select: { id: true, publicId: true },
  });
  const dbPublicIds = new Set(dbAssets.map((a) => a.publicId).filter(Boolean));

  const orphaned = allCloudinary.filter((r) => !dbPublicIds.has(r.public_id));
  const dbOnly = dbAssets.filter((a) => a.publicId && !cloudinaryPublicIds.has(a.publicId));

  console.log(`  Orphaned Cloudinary assets (not in DB): ${orphaned.length}`);
  console.log(`  DB records with missing Cloudinary assets: ${dbOnly.length}`);

  return { orphaned, dbOnly };
}

async function cleanupOrphanedAssets(): Promise<void> {
  const { orphaned, dbOnly } = await findOrphanedCloudinaryAssets();

  if (orphaned.length > 0) {
    console.log("\n  Orphaned Cloudinary assets to investigate:");
    for (const asset of orphaned.slice(0, 20)) {
      console.log(`    ${asset.public_id} (${asset.resource_type})`);
    }
    if (orphaned.length > 20) {
      console.log(`    ... and ${orphaned.length - 20} more`);
    }
  }

  if (dbOnly.length > 0) {
    console.log("\n  DB records pointing to missing Cloudinary assets:");
    for (const asset of dbOnly.slice(0, 20)) {
      console.log(`    ${asset.id} -> ${asset.publicId}`);
    }
    if (dbOnly.length > 20) {
      console.log(`    ... and ${dbOnly.length - 20} more`);
    }
  }
}

async function main() {
  console.log("=== NABOME Media Cleanup Script ===");
  console.log(`Cloudinary Cloud: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`Root Folder: ${ROOT_FOLDER}`);

  const migrated = await migrateExistingRecords();
  const cleaned = await cleanupMediaAssets();
  await cleanupOrphanedAssets();

  console.log("\n=== Summary ===");
  console.log(`  Records migrated: ${migrated}`);
  console.log(`  Records cleaned: ${cleaned}`);

  const totalAssets = await prisma.mediaAsset.count();
  console.log(`  Total MediaAsset records: ${totalAssets}`);
  console.log("\n=== Cleanup Complete ===");
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
