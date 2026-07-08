import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";

const DEFAULT_FLAGS: Record<string, boolean> = {
  loyalty_program: false,
  referral_program: false,
  gift_cards: false,
  subscriptions: false,
  multi_currency: false,
  multi_language: false,
  dark_mode: false,
  abandoned_cart_recovery: false,
  stock_notifications: false,
  social_sharing: false,
  order_tracking: false,
  saved_payment_methods: false,
  reviews_enhanced: false,
  new_checkout: false,
  express_checkout: false,
};

export async function handleAdminFeatureFlagRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList(ctx);
    case "toggle":
      return handleToggle(req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(ctx: RequestContext): Promise<Response> {
  try {
    const kv = ctx.env?.FEATURE_FLAGS_KV;
    let flags = { ...DEFAULT_FLAGS };
    if (kv) {
      const stored = await kv.get("feature_flags");
      if (stored) {
        const parsed = JSON.parse(stored);
        flags = { ...flags, ...parsed };
      }
    }
    return success({ flags });
  } catch (e) {
    return serverError(e);
  }
}

async function handleToggle(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const { key, value } = await req.json() as { key: string; value: boolean };
    const kv = ctx.env?.FEATURE_FLAGS_KV;
    if (!kv) return badRequest("Feature flags KV not configured");
    const stored = await kv.get("feature_flags");
    const current = stored ? JSON.parse(stored) : {};
    current[key] = value;
    await kv.put("feature_flags", JSON.stringify(current));
    return success({ [key]: value });
  } catch (e) {
    return serverError(e);
  }
}
