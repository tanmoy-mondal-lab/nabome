import { buildRobotsResponse } from "./_lib/site-files";
import type { Env } from "./_lib/env";

export async function GET(_req: Request, opts?: { env?: Env }): Promise<Response> {
  return buildRobotsResponse(opts?.env);
}
