/**
 * Webhook API handlers — PAY-07 gateway webhooks (REST_API_SPECIFICATION §7.16).
 *
 * Access class I (provider-registered): the route is public, but every payload
 * must pass provider signature verification + freshness + nonce checks.
 * Failures return non-2xx so the gateway retries (PAYMENT §15.3).
 */
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { handleGatewayWebhook } from '../../_lib/payment/webhook-service.ts';
import { register } from '../register.ts';

/** PAY-07 — POST /webhooks/gateway/:provider */
async function gatewayWebhook(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  const provider = params.provider;
  if (!provider) throw ApiError.notFound('Webhook route not found');

  const rawBody = await request.text();
  if (!rawBody) {
    return errorJson(
      ApiError.validation('Webhook payload is required'),
      context.requestId,
    );
  }

  await handleGatewayWebhook(context.env, provider, rawBody, request.headers);
  return okJson({ success: true }, context.requestId);
}

register('POST', 'webhooks/gateway/{provider}', gatewayWebhook);
