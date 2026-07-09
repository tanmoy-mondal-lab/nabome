import type { RequestContext } from "../../_lib/types";
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
export declare function handleMediaIntegrityRequest(req: Request, ctx: RequestContext, params: string[], action: string): Promise<Response>;
