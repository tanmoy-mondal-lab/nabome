import { badRequest, unauthorized, serverError, success, rateLimitExceeded } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { requireAdmin } from "../_lib/auth-middleware";
import { uploadMedia, validateFile, validateFileContent } from "../_lib/media-service";
import { checkRateLimit, getRateLimitKey } from "../_lib/rate-limit";
import type { EntityType } from "../_lib/media/types";

const UPLOAD_RATE_LIMIT = { maxRequests: 20, windowMs: 60_000 };

const VALID_ENTITY_TYPES = [
  "settings", "homepage", "products", "product-videos", "categories", "collections",
  "brands", "labels", "lookbooks", "blogs", "cms", "sellers", "users",
] as const satisfies readonly EntityType[];

function resolveUploadEntityType(value: FormDataEntryValue | null): { type: EntityType } | { error: Response } {
  if (typeof value === "string" && (VALID_ENTITY_TYPES as readonly string[]).includes(value)) {
    return { type: value as EntityType };
  }
  return { error: badRequest(`Invalid entity type. Must be one of: ${VALID_ENTITY_TYPES.join(", ")}`) };
}

async function checkUploadRateLimit(req: Request, ctx: RequestContext): Promise<Response | null> {
  const clientIp = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "unknown";
  const key = getRateLimitKey(clientIp, "/api/upload", ctx.userId);
  const result = await checkRateLimit(key, UPLOAD_RATE_LIMIT, ctx.env!);
  if (!result.allowed) return rateLimitExceeded("Upload rate limit exceeded. Please try again later.");
  return null;
}

export async function handleCustomerUploadRequest(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  const rl = await checkUploadRateLimit(req, ctx);
  if (rl) return rl;
  return doUpload(req, ctx);
}

export async function handleUploadRequest(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;
  const rl = await checkUploadRateLimit(req, ctx);
  if (rl) return rl;
  return doUpload(req, ctx);
}

async function doUpload(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.env!) return serverError(new Error("Environment not available"));

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return badRequest("No file provided");

    const validation = validateFile(file);
    if (!validation.valid) return badRequest(validation.error!);

    const contentValidation = await validateFileContent(file, file.type);
    if (!contentValidation.valid) return badRequest(contentValidation.error!);

    const entityTypeResult = resolveUploadEntityType(formData.get("entityType"));
    if ("error" in entityTypeResult) return entityTypeResult.error;
    const entityType = entityTypeResult.type;
    const entityId = (formData.get("entityId") as string) || crypto.randomUUID();
    const slug = (formData.get("slug") as string) || `upload-${Date.now().toString(36)}`;
    const altText = (formData.get("altText") as string) || file.name;
    const displayName = (formData.get("displayName") as string) || altText;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const isPrimary = formData.get("isPrimary") === "true";

    const result = await uploadMedia({
      entityType,
      entityId,
      slug,
      file,
      altText,
      displayName,
      sortOrder,
      isPrimary,
    }, ctx.env!);

    return success({
      success: true,
      message: "File uploaded successfully",
      media: {
        id: result.id,
        assetId: result.assetId,
        url: result.url,
        publicId: result.publicId,
        folder: result.folder,
        secureUrl: result.secureUrl,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        mimeType: result.mimeType,
        resourceType: result.resourceType,
        originalFilename: result.originalFilename,
      },
      entity: {
        entityType,
        entityId,
        slug,
      },
      metadata: {
        altText,
        displayName,
        sortOrder,
        isPrimary,
      },
    });
  } catch (err) {
    console.error("[Upload] Upload failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const isClientError = err instanceof Error && (
      msg.includes("Validation") || msg.includes("validation") ||
      msg.includes("Unsupported") || msg.includes("No file") ||
      msg.includes("too large") || msg.includes("Invalid")
    );
    if (isClientError) return badRequest(msg);
    return serverError(err);
  }
}
