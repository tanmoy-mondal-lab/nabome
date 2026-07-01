import { GET } from "./api/robots.txt";
import type { Env } from "./api/_lib/env";

export const onRequest: PagesFunction<Env> = async (context) => {
  return GET(context.request, { env: context.env as unknown as Env });
};