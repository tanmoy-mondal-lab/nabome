import type { RequestContext } from "../_lib/types";
export declare function handlePaymentRequest(req: Request, ctx: RequestContext, action?: string): Promise<Response>;
export declare function handleAdminWebhookRequest(req: Request, ctx: RequestContext, params: string[], action?: string): Promise<Response>;
