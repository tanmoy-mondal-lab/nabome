import { buildRobotsResponse } from "../../api/_lib/site-files";
import type { Env } from "../../api/_lib/env";

export const onRequestGet: PagesFunction<Env> = (context) => {
  return buildRobotsResponse(context.env as unknown as Env);
};
