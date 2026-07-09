import type { RequestContext } from "../_lib/types";
export declare function createNotification(profileId: string, type: string, title: string, body?: string, orderId?: string, channel?: string, env?: any): Promise<void>;
export declare function handleNotificationRequest(req: Request, ctx: RequestContext, params: string[], action?: string): Promise<Response>;
