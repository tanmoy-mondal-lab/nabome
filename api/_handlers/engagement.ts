import { badRequest } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleEngagementRequest(
  _req: Request,
  _ctx: RequestContext,
  _params: string[],
  _action: string
): Promise<Response> {
  // Engagement features temporarily disabled - models not in schema
  return badRequest("Engagement features not yet implemented");
}
