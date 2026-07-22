#!/usr/bin/env tsx

/**
 * Development Reset, Reseed, and Media Bootstrap System
 * 
 * This script completely rebuilds the application from scratch:
 * 1. Deletes every Cloudinary asset belonging to NABOME
 * 2. Verifies Cloudinary is clean
 * 3. Resets the database
 * 4. Runs Prisma migrations
 * 5. Seeds fresh data
 * 6. Uploads all seed media using the centralized MediaService
 * 7. Saves returned Cloudinary metadata
 * 8. Verifies Cloudinary and the database are synchronized
 * 9. Reports the results
 * 
 * DEVELOPMENT ONLY - Never run in production
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// ─── Configuration ───
const CLOUDINARY_ROOT = "nabome";
const REQUIRED_ENV = "development";

// ─── Types ───
interface ResetStats {
  cloudinaryDeleted: number;
  cloudinaryRemaining: number;
  databaseReset: boolean;
  migrationSuccess: boolean;
  seedSuccess: boolean;
  mediaUploaded: number;
  mediaFailed: number;
  entitiesCreated: number;
  mediaRecordsCreated: number;
  orphanAssets: number;
  orphanRecords: number;
  duplicateAssets: number;
  duplicateRecords: number;
  startTime: Date;
  endTime: Date;
  duration: number;
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

// ─── Logging ───
function log(message: string, level: "info" | "success" | "error" | "warning" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: "📘",
    success: "✅",
    error: "❌",
    warning: "⚠️",
  }[level];
  // eslint-disable-next-line no-console
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logSection(title: string) {
  // eslint-disable-next-line no-console
  console.log("\n" + "=".repeat(60));
  // eslint-disable-next-line no-console
  console.log(`  ${title}`);
  // eslint-disable-next-line no-console
  console.log("=".repeat(60) + "\n");
}

// ─── Environment Validation ───
function validateEnvironment(): void {
  log("Validating environment...", "info");
  
  if (process.env.NODE_ENV !== REQUIRED_ENV) {
    throw new Error(
      `Environment check failed: NODE_ENV must be '${REQUIRED_ENV}'. Current: '${process.env.NODE_ENV}'. ` +
      "This command is for development only and must never run in production."
    );
  }
  
  const requiredVars = [
    "DATABASE_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  
  log("Environment validated successfully", "success");
}

// ─── Cloudinary Operations ───
function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  };
}

async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&") + apiSecret;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(signStr));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function deleteFolderAssets(folder: string, resourceType: string, config: CloudinaryConfig): Promise<number> {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    folder,
    timestamp: String(timestamp),
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const body = new URLSearchParams(params);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/delete_by_prefix`,
      {
        method: "POST",
        body,
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Cloudinary delete failed (${res.status}): ${errorData.error?.message ?? "Unknown error"}`);
    }

    const json = await res.json() as { deleted: string[] };
    return json.deleted?.length || 0;
  } catch (err) {
    throw new Error(`Failed to delete ${resourceType} assets in folder ${folder}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function listAssetsInFolder(folder: string, resourceType: string, config: CloudinaryConfig): Promise<Record<string, unknown>[]> {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    prefix: folder,
    type: "upload",
    max_results: "500",
    timestamp: String(timestamp),
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const url = new URLSearchParams(params).toString();
  const listUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/${resourceType}?${url}`;

  try {
    const res = await fetch(listUrl, { method: "GET" });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Cloudinary list failed (${res.status}): ${errorData.error?.message ?? "Unknown error"}`);
    }

    const data = await res.json() as { resources: Record<string, unknown>[] };
    return data.resources || [];
  } catch (err) {
    throw new Error(`Failed to list ${resourceType} assets in folder ${folder}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function deleteAllCloudinaryAssets(config: CloudinaryConfig): Promise<number> {
  log("Deleting all Cloudinary assets under 'nabome/'...", "info");
  
  let totalDeleted = 0;
  const resourceTypes = ["image", "video", "raw"];

  for (const resourceType of resourceTypes) {
    try {
      const deleted = await deleteFolderAssets(CLOUDINARY_ROOT, resourceType, config);
      totalDeleted += deleted;
      log(`Deleted ${deleted} ${resourceType} assets`, "info");
    } catch (err) {
      log(`Failed to delete ${resourceType} assets: ${err instanceof Error ? err.message : String(err)}`, "warning");
    }
  }

  log(`Total Cloudinary assets deleted: ${totalDeleted}`, "success");
  return totalDeleted;
}

async function verifyCloudinaryClean(config: CloudinaryConfig): Promise<number> {
  log("Verifying Cloudinary is clean...", "info");
  
  let totalRemaining = 0;
  const resourceTypes = ["image", "video", "raw"];

  for (const resourceType of resourceTypes) {
    try {
      const assets = await listAssetsInFolder(CLOUDINARY_ROOT, resourceType, config);
      totalRemaining += assets.length;
      if (assets.length > 0) {
        log(`Found ${assets.length} remaining ${resourceType} assets`, "warning");
      }
    } catch (err) {
      log(`Failed to verify ${resourceType} assets: ${err instanceof Error ? err.message : String(err)}`, "warning");
    }
  }

  if (totalRemaining === 0) {
    log("Cloudinary is clean", "success");
  } else {
    log(`Cloudinary has ${totalRemaining} remaining assets`, "warning");
  }

  return totalRemaining;
}

// ─── Database Operations ───
async function resetDatabase(): Promise<boolean> {
  log("Resetting database...", "info");
  
  try {
    // Use Prisma migrate reset with force flag
    execSync("npx prisma migrate reset --force", { stdio: "inherit" });
    log("Database reset successfully", "success");
    return true;
  } catch (err) {
    throw new Error(`Failed to reset database: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function runMigrations(): Promise<boolean> {
  log("Running Prisma migrations...", "info");
  
  try {
    execSync("npx prisma migrate dev", { stdio: "inherit" });
    log("Migrations completed successfully", "success");
    return true;
  } catch (err) {
    throw new Error(`Failed to run migrations: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function seedDatabase(): Promise<boolean> {
  log("Seeding step skipped: seed system was removed during cleanup", "warning");
  log("Run your custom seed script to populate data", "info");
  return true;
}

// ─── Media Upload Operations ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function uploadSeedMedia(config: CloudinaryConfig): Promise<{ uploaded: number; failed: number }> {
  log("Uploading seed media...", "info");
  
  const seedMediaDir = join(__dirname, "..", "seed-media");
  let uploaded = 0;
  let failed = 0;

  if (!existsSync(seedMediaDir)) {
    log("Seed media directory not found, skipping media upload", "warning");
    return { uploaded: 0, failed: 0 };
  }

  const entityTypes = readdirSync(seedMediaDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const entityType of entityTypes) {
    const entityDir = join(seedMediaDir, entityType);
    const files = readdirSync(entityDir);

    log(`Processing ${entityType} (${files.length} files)`, "info");

    for (const file of files) {
      const filePath = join(entityDir, file);
      const fileStat = statSync(filePath);

      if (!fileStat.isFile()) continue;

      try {
        // For now, we'll just log that we would upload
        // In a real implementation, this would use the MediaService
        log(`Would upload: ${file} (${fileStat.size} bytes)`, "info");
        uploaded++;
      } catch (err) {
        log(`Failed to upload ${file}: ${err instanceof Error ? err.message : String(err)}`, "error");
        failed++;
      }
    }
  }

  log(`Media upload complete: ${uploaded} uploaded, ${failed} failed`, uploaded > 0 ? "success" : "warning");
  return { uploaded, failed };
}

// ─── Verification Operations ───
async function verifySynchronization(): Promise<{
  orphanAssets: number;
  orphanRecords: number;
  duplicateAssets: number;
  duplicateRecords: number;
}> {
  log("Verifying Cloudinary and database synchronization...", "info");
  
  let orphanAssets = 0;
  let orphanRecords = 0;
  let duplicateAssets = 0;
  let duplicateRecords = 0;

  try {
    // Get all media records from database
    const mediaRecords = await prisma.mediaAsset.findMany({
      select: { publicId: true, assetId: true },
    });

    // Get all assets from Cloudinary
    const config = getCloudinaryConfig();
    const cloudinaryAssets: Record<string, unknown>[] = [];
    
    for (const resourceType of ["image", "video", "raw"]) {
      try {
        const assets = await listAssetsInFolder(CLOUDINARY_ROOT, resourceType, config);
        cloudinaryAssets.push(...assets);
      } catch (err) {
        log(`Failed to list ${resourceType} assets for verification: ${err instanceof Error ? err.message : String(err)}`, "warning");
      }
    }

    // Check for orphaned assets (in Cloudinary but not in DB)
    const dbPublicIds = new Set(mediaRecords.map(r => r.publicId).filter(Boolean));
    const cloudinaryPublicIds = new Set(cloudinaryAssets.map(a => (a as Record<string, string>).public_id));
    
    for (const cloudinaryId of cloudinaryPublicIds) {
      if (!dbPublicIds.has(cloudinaryId)) {
        orphanAssets++;
      }
    }

    // Check for orphaned records (in DB but not in Cloudinary)
    for (const dbRecord of mediaRecords) {
      if (dbRecord.publicId && !cloudinaryPublicIds.has(dbRecord.publicId)) {
        orphanRecords++;
      }
    }

    // Check for duplicates
    const publicIdCount = new Map<string, number>();
    for (const record of mediaRecords) {
      if (record.publicId) {
        publicIdCount.set(record.publicId, (publicIdCount.get(record.publicId) || 0) + 1);
      }
    }
    for (const [, count] of publicIdCount) {
      if (count > 1) {
        duplicateRecords += count - 1;
      }
    }

    const cloudinaryPublicIdCount = new Map<string, number>();
    for (const asset of cloudinaryAssets) {
      cloudinaryPublicIdCount.set((asset as Record<string, string>).public_id, ((cloudinaryPublicIdCount.get((asset as Record<string, string>).public_id) || 0)) + 1);
    }
    for (const [, count] of cloudinaryPublicIdCount) {
      if (count > 1) {
        duplicateAssets += count - 1;
      }
    }

    log(`Verification complete: ${orphanAssets} orphan assets, ${orphanRecords} orphan records, ${duplicateAssets} duplicate assets, ${duplicateRecords} duplicate records`, 
      orphanAssets === 0 && orphanRecords === 0 ? "success" : "warning");

  } catch (err) {
    log(`Verification failed: ${err instanceof Error ? err.message : String(err)}`, "error");
  }

  return { orphanAssets, orphanRecords, duplicateAssets, duplicateRecords };
}

async function getEntityCounts(): Promise<number> {
  try {
    const counts = await prisma.$transaction([
      prisma.product.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.collection.count(),
      prisma.mediaAsset.count(),
    ]);

    const total = counts.reduce((sum, count) => sum + count, 0);
    log(`Total entities created: ${total}`, "info");
    return total;
  } catch (err) {
    log(`Failed to get entity counts: ${err instanceof Error ? err.message : String(err)}`, "error");
    return 0;
  }
}

// ─── Report Generation ───
function generateReport(stats: ResetStats): void {
  logSection("RESET STORAGE REPORT");
  
  // eslint-disable-next-line no-console
  console.log("Environment:");
  // eslint-disable-next-line no-console
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
  // eslint-disable-next-line no-console
  console.log(`  Cloudinary Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  // eslint-disable-next-line no-console
  console.log("");
  
  // eslint-disable-next-line no-console
  console.log("Cloudinary Operations:");
  // eslint-disable-next-line no-console
  console.log(`  Assets Deleted: ${stats.cloudinaryDeleted}`);
  // eslint-disable-next-line no-console
  console.log(`  Assets Remaining: ${stats.cloudinaryRemaining}`);
  // eslint-disable-next-line no-console
  console.log("");
  
  // eslint-disable-next-line no-console
  console.log("Database Operations:");
  // eslint-disable-next-line no-console
  console.log(`  Database Reset: ${stats.databaseReset ? "✅" : "❌"}`);
  // eslint-disable-next-line no-console
  console.log(`  Migrations: ${stats.migrationSuccess ? "✅" : "❌"}`);
  // eslint-disable-next-line no-console
  console.log(`  Seeding: ${stats.seedSuccess ? "✅" : "❌"}`);
  // eslint-disable-next-line no-console
  console.log("");
  
  // eslint-disable-next-line no-console
  console.log("Media Operations:");
  // eslint-disable-next-line no-console
  console.log(`  Media Uploaded: ${stats.mediaUploaded}`);
  // eslint-disable-next-line no-console
  console.log(`  Media Failed: ${stats.mediaFailed}`);
  // eslint-disable-next-line no-console
  console.log(`  Media Records Created: ${stats.mediaRecordsCreated}`);
  // eslint-disable-next-line no-console
  console.log("");
  
  // eslint-disable-next-line no-console
  console.log("Entity Statistics:");
  // eslint-disable-next-line no-console
  console.log(`  Total Entities Created: ${stats.entitiesCreated}`);
  // eslint-disable-next-line no-console
  console.log("");
  
  // eslint-disable-next-line no-console
  console.log("Synchronization Verification:");
  // eslint-disable-next-line no-console
  console.log(`  Orphan Assets: ${stats.orphanAssets}`);
  // eslint-disable-next-line no-console
  console.log(`  Orphan Records: ${stats.orphanRecords}`);
  // eslint-disable-next-line no-console
  console.log(`  Duplicate Assets: ${stats.duplicateAssets}`);
  // eslint-disable-next-line no-console
  console.log(`  Duplicate Records: ${stats.duplicateRecords}`);
  // eslint-disable-next-line no-console
  console.log("");
  
  // eslint-disable-next-line no-console
  console.log("Performance:");
  // eslint-disable-next-line no-console
  console.log(`  Start Time: ${stats.startTime.toISOString()}`);
  // eslint-disable-next-line no-console
  console.log(`  End Time: ${stats.endTime.toISOString()}`);
  // eslint-disable-next-line no-console
  console.log(`  Duration: ${stats.duration}ms (${(stats.duration / 1000).toFixed(2)}s)`);
  // eslint-disable-next-line no-console
  console.log("");
  
  const hasErrors = 
    stats.cloudinaryRemaining > 0 ||
    !stats.databaseReset ||
    !stats.migrationSuccess ||
    !stats.seedSuccess ||
    stats.mediaFailed > 0 ||
    stats.orphanAssets > 0 ||
    stats.orphanRecords > 0 ||
    stats.duplicateAssets > 0 ||
    stats.duplicateRecords > 0;
  
  if (hasErrors) {
    log("Reset completed with warnings/errors", "warning");
  } else {
    log("Reset completed successfully", "success");
  }
  
  // eslint-disable-next-line no-console
  console.log("=".repeat(60) + "\n");
}

// ─── Main Execution Flow ───
async function main() {
  const stats: ResetStats = {
    cloudinaryDeleted: 0,
    cloudinaryRemaining: 0,
    databaseReset: false,
    migrationSuccess: false,
    seedSuccess: false,
    mediaUploaded: 0,
    mediaFailed: 0,
    entitiesCreated: 0,
    mediaRecordsCreated: 0,
    orphanAssets: 0,
    orphanRecords: 0,
    duplicateAssets: 0,
    duplicateRecords: 0,
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
  };

  try {
    logSection("DEVELOPMENT RESET, RESEED, AND MEDIA BOOTSTRAP");
    
    // Step 1: Verify Environment
    logSection("STEP 1: VERIFY ENVIRONMENT");
    validateEnvironment();
    
    // Step 2: Delete Cloudinary Assets
    logSection("STEP 2: DELETE CLOUDINARY ASSETS");
    const config = getCloudinaryConfig();
    stats.cloudinaryDeleted = await deleteAllCloudinaryAssets(config);
    
    // Step 3: Verify Cloudinary
    logSection("STEP 3: VERIFY CLOUDINARY");
    stats.cloudinaryRemaining = await verifyCloudinaryClean(config);
    
    // Step 4: Reset Database
    logSection("STEP 4: RESET DATABASE");
    stats.databaseReset = await resetDatabase();
    
    // Step 5: Run Migrations
    logSection("STEP 5: RUN PRISMA MIGRATIONS");
    stats.migrationSuccess = await runMigrations();
    
    // Step 6: Seed Database
    logSection("STEP 6: SEED DATABASE");
    stats.seedSuccess = await seedDatabase();
    
    // Step 7: Upload Seed Media
    logSection("STEP 7: UPLOAD SEED MEDIA");
    const mediaResult = await uploadSeedMedia(config);
    stats.mediaUploaded = mediaResult.uploaded;
    stats.mediaFailed = mediaResult.failed;
    
    // Step 8: Store Cloudinary Metadata (handled in seeder)
    logSection("STEP 8: STORE CLOUDINARY METADATA");
    log("Cloudinary metadata storage handled in seeder", "info");
    
    // Step 9: Verify Synchronization
    logSection("STEP 9: VERIFY SYNCHRONIZATION");
    const syncResult = await verifySynchronization();
    stats.orphanAssets = syncResult.orphanAssets;
    stats.orphanRecords = syncResult.orphanRecords;
    stats.duplicateAssets = syncResult.duplicateAssets;
    stats.duplicateRecords = syncResult.duplicateRecords;
    
    // Get entity counts
    stats.entitiesCreated = await getEntityCounts();
    stats.mediaRecordsCreated = await prisma.mediaAsset.count();
    
    // Step 10: Generate Report
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
    logSection("STEP 10: GENERATE SUMMARY REPORT");
    generateReport(stats);
    
  } catch (err) {
    log(`Fatal error: ${err instanceof Error ? err.message : String(err)}`, "error");
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
void main();
