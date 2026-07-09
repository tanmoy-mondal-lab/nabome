import type { RequestContext } from "./types";
export declare function extractTurnstileToken(request: Request): Promise<string>;
export declare function verifyTurnstileToken(request: Request, ctx: RequestContext): Promise<Response | null>;
