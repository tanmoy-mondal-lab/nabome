/**
 * Media Drift Detection Service
 * 
 * Detects and reports inconsistencies between the database and Cloudinary.
 * Helps maintain long-term consistency by identifying:
 * - Orphaned Cloudinary assets (exist in Cloudinary but not in DB)
 * - Missing Cloudinary assets (exist in DB but not in Cloudinary)
 * - Metadata mismatches
 */

import type { PrismaClient } from '@prisma/client';
import type { CloudinaryConfig } from './types';

export interface DriftReport {
  timestamp: string;
  totalAssets: number;
  orphanedInCloudinary: Array<{
    publicId: string;
    resourceType: string;
  }>;
  missingInCloudinary: Array<{
    assetId: string;
    publicId: string;
    resourceType: string;
  }>;
  metadataMismatches: Array<{
    assetId: string;
    publicId: string;
    field: string;
    dbValue: unknown;
    cloudinaryValue: unknown;
  }>;
}

/**
 * Performs drift detection between database and Cloudinary
 */
export async function detectDrift(
  prisma: PrismaClient,
  config: CloudinaryConfig
): Promise<DriftReport> {
  const report: DriftReport = {
    timestamp: new Date().toISOString(),
    totalAssets: 0,
    orphanedInCloudinary: [],
    missingInCloudinary: [],
    metadataMismatches: [],
  };

  try {
    // Get all assets from database
    const assets = await prisma.media_assets.findMany({
      select: {
        id: true,
        assetId: true,
        publicId: true,
        resourceType: true,
        width: true,
        height: true,
        fileSize: true,
      },
    });

    report.totalAssets = assets.length;

    // Check each asset
    for (const asset of assets) {
      if (!asset.publicId) continue;

      try {
        // Check if asset exists in Cloudinary
        const cloudinaryAsset = await getCloudinaryAsset(
          asset.publicId,
          asset.resourceType || 'image',
          config
        );

        if (!cloudinaryAsset) {
          // Asset exists in DB but not in Cloudinary
          report.missingInCloudinary.push({
            assetId: asset.assetId,
            publicId: asset.publicId,
            resourceType: asset.resourceType || 'image',
          });
          continue;
        }

        // Check for metadata mismatches
        if (asset.width !== cloudinaryAsset.width) {
          report.metadataMismatches.push({
            assetId: asset.assetId,
            publicId: asset.publicId,
            field: 'width',
            dbValue: asset.width,
            cloudinaryValue: cloudinaryAsset.width,
          });
        }

        if (asset.height !== cloudinaryAsset.height) {
          report.metadataMismatches.push({
            assetId: asset.assetId,
            publicId: asset.publicId,
            field: 'height',
            dbValue: asset.height,
            cloudinaryValue: cloudinaryAsset.height,
          });
        }

        if (asset.fileSize !== cloudinaryAsset.bytes) {
          report.metadataMismatches.push({
            assetId: asset.assetId,
            publicId: asset.publicId,
            field: 'fileSize',
            dbValue: asset.fileSize,
            cloudinaryValue: cloudinaryAsset.bytes,
          });
        }
      } catch (error) {
        // Error checking asset - mark as missing
        report.missingInCloudinary.push({
          assetId: asset.assetId,
          publicId: asset.publicId,
          resourceType: asset.resourceType || 'image',
        });
      }
    }

    // Note: Detecting orphaned Cloudinary assets requires listing all assets
    // which is expensive and may not be feasible for large accounts
    // This would require Cloudinary's admin API with proper pagination

    return report;
  } catch (error) {
    console.error('[DriftDetection] Failed to detect drift:', error);
    return report;
  }
}

/**
 * Gets asset information from Cloudinary
 */
async function getCloudinaryAsset(
  publicId: string,
  resourceType: string,
  config: CloudinaryConfig
): Promise<{ width: number | null; height: number | null; bytes: number } | null> {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const params: Record<string, string> = {
      public_id: publicId,
      timestamp: String(timestamp),
    };

    const signature = await generateSignature(params, config.apiSecret);
    params.signature = signature;
    params.api_key = config.apiKey;

    const body = new URLSearchParams(params);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/metadata`,
      {
        method: 'POST',
        body,
      }
    );

    if (!res.ok) {
      return null;
    }

    const result = await res.json();
    return {
      width: result.width ?? null,
      height: result.height ?? null,
      bytes: result.bytes ?? 0,
    };
  } catch (error) {
    console.error('[DriftDetection] Failed to get Cloudinary asset:', error);
    return null;
  }
}

/**
 * Generates Cloudinary API signature
 */
async function generateSignature(
  params: Record<string, string>,
  apiSecret: string
): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + apiSecret;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-1', enc.encode(signStr));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Repairs drift by updating database to match Cloudinary
 */
export async function repairDrift(
  prisma: PrismaClient,
  report: DriftReport
): Promise<{
  repaired: number;
  failed: number;
}> {
  let repaired = 0;
  let failed = 0;

  for (const mismatch of report.metadataMismatches) {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (mismatch.field === 'width') {
        updateData.width = mismatch.cloudinaryValue as number;
      } else if (mismatch.field === 'height') {
        updateData.height = mismatch.cloudinaryValue as number;
      } else if (mismatch.field === 'fileSize') {
        updateData.fileSize = mismatch.cloudinaryValue as number;
      }

      await prisma.media_assets.update({
        where: { assetId: mismatch.assetId },
        data: updateData,
      });

      repaired++;
    } catch (error) {
      console.error('[DriftDetection] Failed to repair mismatch:', mismatch, error);
      failed++;
    }
  }

  return { repaired, failed };
}

/**
 * Schedules periodic drift detection (for background jobs)
 */
export function scheduleDriftDetection(
  prisma: PrismaClient,
  config: CloudinaryConfig,
  intervalMs: number = 24 * 60 * 60 * 1000 // Daily by default
): () => void {
  const intervalId = setInterval(async () => {
    try {
      const report = await detectDrift(prisma, config);
      
      // Log if there are issues
      if (
        report.orphanedInCloudinary.length > 0 ||
        report.missingInCloudinary.length > 0 ||
        report.metadataMismatches.length > 0
      ) {
        console.warn('[DriftDetection] Drift detected:', report);
      }
    } catch (error) {
      console.error('[DriftDetection] Scheduled检测 failed:', error);
    }
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
