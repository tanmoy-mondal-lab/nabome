import type { RequestContext } from "../_lib/types";
export declare function handleCMSRequest(req: Request, ctx: RequestContext, params: string[], action: string): Promise<Response>;
export declare function handleHomepage(env: any): Promise<Response>;
