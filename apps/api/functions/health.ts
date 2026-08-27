/**
 * GET /health — liveness probe (kept as a dedicated sibling function so the
 * health endpoint survives router regressions).
 */
import type { Env } from '../_lib/env.ts';
import type { RequestContext } from '../_lib/http/context.ts';
import { okJson } from '../_lib/http/response.ts';

interface Data {
  requestId: string;
  context: RequestContext;
}

export const onRequest: PagesFunction<Env, 'requestId' | 'context'> = ({
  env,
  data,
}) => {
  const { context } = data as unknown as Data;
  return okJson(
    {
      status: 'ok',
      environment: env.ENVIRONMENT,
      timestamp: new Date().toISOString(),
    },
    context.requestId,
  );
};
