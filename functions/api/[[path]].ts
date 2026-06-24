import { GET, POST, PUT, DELETE, PATCH, OPTIONS } from "../../api/[...path]";

export const onRequestGet = (context: { request: Request; env?: Record<string, string> }) => {
  console.log("[ADAPTER DEBUG] onRequestGet context keys:", Object.keys(context));
  console.log("[ADAPTER DEBUG] onRequestGet env keys:", context.env ? Object.keys(context.env) : "env is undefined");
  console.log("[ADAPTER DEBUG] onRequestGet env.DATABASE_URL:", context.env?.DATABASE_URL ? "SET" : "UNDEFINED");
  return GET(context.request, { env: context.env });
};
export const onRequestPost = (context: { request: Request; env?: Record<string, string> }) => POST(context.request, { env: context.env });
export const onRequestPut = (context: { request: Request; env?: Record<string, string> }) => PUT(context.request, { env: context.env });
export const onRequestDelete = (context: { request: Request; env?: Record<string, string> }) => DELETE(context.request, { env: context.env });
export const onRequestPatch = (context: { request: Request; env?: Record<string, string> }) => PATCH(context.request, { env: context.env });
export const onRequestOptions = (context: { request: Request; env?: Record<string, string> }) => OPTIONS(context.request, { env: context.env });
