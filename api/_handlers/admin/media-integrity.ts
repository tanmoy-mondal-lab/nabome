import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";
import { cleanSecret } from "../../_lib/secrets";
import type { Env } from "../../_lib/env";
import { createMediaIntegrityService } from "../../../src/lib/media/integrity.service";
import type { CloudinaryConfig } from "../../../src/lib/media/media.types";

/**
 * Handles media integrity requests
 * 
 * Endpoints:
 * - GET /api/admin/media-integrity/health - Get media health status
 * - POST /api/admin/media-integrity/scan - Trigger a full integrity scan
 * - GET /api/admin/media-integrity/scan/:scanId - Get scan results by ID
 * - GET /api/admin/media-integrity/history - Get scan history
 * - POST /api/admin/media-integrity/repair - Perform repairs (Super Admin only)
 */

export async function handleMediaIntegrityRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "health":
      return handleHealthCheck(req, ctx.env);
    case "scan":
      return handleScan(req, ctx.env, params[0]);
    case "history":
      return handleHistory(req, ctx.env);
    case "repair":
      return handleRepair(req, ctx.env, ctx);
    default:
      return badRequest("Unknown action");
  }
}

/**
 * Get media health status
 */
async function handleHealthCheck(_req: Request, env: Env | undefined): Promise<Response> {
  if (!env) return serverError("Environment not available");
  
  try {
    const prisma = getPrisma(env);
    const config = getCloudinaryConfig(env);
    const integrityService = createMediaIntegrityService(prisma, config);

    const health = await integrityService.getHealthCheck();

    return success(health);
  } catch (error) {
    console.error("[MediaIntegrity] Health check failed:", error);
    return serverError(error);
  }
}

/**
 * Trigger a full integrity scan
 */
async function handleScan(req: Request, env: Env | undefined, scanId?: string): Promise<Response> {
  if (!env) return serverError("Environment not available");
  
  // If scanId is provided, return specific scan results
  if (scanId) {
    return handleGetScanById(req, env, scanId);
  }

  // Otherwise, trigger a new scan
  try {
    const url = new URL(req.url);
    const entityType = url.searchParams.get("entityType") as any;
    const entityId = url.searchParams.get("entityId") || undefined;
    const includeOrphans = url.searchParams.get("includeOrphans") !== "false";
    const includeDuplicates = url.searchParams.get("includeDuplicates") !== "false";
    const includeFolderValidation = url.searchParams.get("includeFolderValidation") !== "false";
    const includeMetadataValidation = url.searchParams.get("includeMetadataValidation") !== "false";
    const maxResults = parseInt(url.searchParams.get("maxResults") || "1000");
    const dryRun = url.searchParams.get("dryRun") === "true";

    const prisma = getPrisma(env);
    const config = getCloudinaryConfig(env);
    const integrityService = createMediaIntegrityService(prisma, config);

    const scanResult = await integrityService.performFullScan({
      entityType,
      entityId,
      includeOrphans,
      includeDuplicates,
      includeFolderValidation,
      includeMetadataValidation,
      maxResults,
      dryRun,
    });

    return success(scanResult);
  } catch (error) {
    console.error("[MediaIntegrity] Scan failed:", error);
    return serverError(error);
  }
}

/**
 * Get scan results by ID
 */
async function handleGetScanById(_req: Request, env: Env, scanId: string): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const config = getCloudinaryConfig(env);
    const integrityService = createMediaIntegrityService(prisma, config);

    const scanResult = integrityService.getScanById(scanId);
    if (!scanResult) {
      return notFound("Scan not found");
    }

    return success(scanResult);
  } catch (error) {
    console.error("[MediaIntegrity] Get scan failed:", error);
    return serverError(error);
  }
}

/**
 * Get scan history
 */
async function handleHistory(req: Request, env: Env | undefined): Promise<Response> {
  if (!env) return serverError("Environment not available");
  
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const prisma = getPrisma(env);
    const config = getCloudinaryConfig(env);
    const integrityService = createMediaIntegrityService(prisma, config);

    const history = integrityService.getScanHistory(limit);

    return success({ history, count: history.length });
  } catch (error) {
    console.error("[MediaIntegrity] Get history failed:", error);
    return serverError(error);
  }
}

/**
 * Perform repairs (Super Admin only)
 */
async function handleRepair(req: Request, env: Env | undefined, ctx: RequestContext): Promise<Response> {
  if (!env) return serverError("Environment not available");
  
  // Super Admin check - since there's no dedicated super admin role, we'll use admin role
  // In a production system, you would have a separate super admin role check here
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const {
      scanId,
      deleteOrphanedAssets = false,
      deleteOrphanedRecords = false,
      fixIncorrectFolders = false,
      fixIncorrectPublicIds = false,
      removeDuplicates = false,
      validateBeforeRepair = true,
      createBackup = true,
    } = body;

    if (!scanId) {
      return badRequest("scanId is required");
    }

    const prisma = getPrisma(env);
    const config = getCloudinaryConfig(env);
    const integrityService = createMediaIntegrityService(prisma, config);

    // Get the scan results
    const scanResult = integrityService.getScanById(scanId);
    if (!scanResult) {
      return notFound("Scan not found");
    }

    // Perform repairs
    const repairResult = await integrityService.performRepairs(scanResult.issues, {
      deleteOrphanedAssets,
      deleteOrphanedRecords,
      fixIncorrectFolders,
      fixIncorrectPublicIds,
      removeDuplicates,
      validateBeforeRepair,
      createBackup,
    });

    return success(repairResult);
  } catch (error) {
    console.error("[MediaIntegrity] Repair failed:", error);
    return serverError(error);
  }
}

/**
 * Get Cloudinary configuration from environment
 */
function getCloudinaryConfig(env: Env): CloudinaryConfig {
  return {
    cloudName: cleanSecret(env.CLOUDINARY_CLOUD_NAME),
    apiKey: cleanSecret(env.CLOUDINARY_API_KEY),
    apiSecret: cleanSecret(env.CLOUDINARY_API_SECRET),
  };
}
