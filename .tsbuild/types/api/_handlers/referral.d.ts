import type { RequestContext } from "../_lib/types";
export declare function handleReferralRequest(req: Request, ctx: RequestContext, _params: string[], action: string): Promise<Response>;
/**
 * Completes any pending referral tied to the given order email, credits the
 * referrer (counters + loyalty points), and links the order. Called from the
 * checkout/payment flow once an order has been placed.
 */
export declare function completeReferralForOrder(prisma: any, email: string, orderId: string, profileId: string | null): Promise<void>;
