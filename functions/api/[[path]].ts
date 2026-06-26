import { GET, POST, PUT, DELETE, PATCH, OPTIONS } from "../../api/[...path]";
import type { Env } from "../../api/_lib/env";

export const onRequestGet: PagesFunction<Env> = (context) => {
  return GET(context.request, { env: context.env as unknown as Env });
};
export const onRequestPost: PagesFunction<Env> = (context) => {
  return POST(context.request, { env: context.env as unknown as Env });
};
export const onRequestPut: PagesFunction<Env> = (context) => {
  return PUT(context.request, { env: context.env as unknown as Env });
};
export const onRequestDelete: PagesFunction<Env> = (context) => {
  return DELETE(context.request, { env: context.env as unknown as Env });
};
export const onRequestPatch: PagesFunction<Env> = (context) => {
  return PATCH(context.request, { env: context.env as unknown as Env });
};
export const onRequestOptions: PagesFunction<Env> = (context) => {
  return OPTIONS(context.request, { env: context.env as unknown as Env });
};
