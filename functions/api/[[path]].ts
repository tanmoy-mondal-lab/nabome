import { GET, POST, PUT, DELETE, PATCH, OPTIONS } from "../../api/[...path]";

export const onRequestGet = ({ request, env }: { request: Request; env?: Record<string, string> }) => GET(request, { env });
export const onRequestPost = ({ request, env }: { request: Request; env?: Record<string, string> }) => POST(request, { env });
export const onRequestPut = ({ request, env }: { request: Request; env?: Record<string, string> }) => PUT(request, { env });
export const onRequestDelete = ({ request, env }: { request: Request; env?: Record<string, string> }) => DELETE(request, { env });
export const onRequestPatch = ({ request, env }: { request: Request; env?: Record<string, string> }) => PATCH(request, { env });
export const onRequestOptions = ({ request, env }: { request: Request; env?: Record<string, string> }) => OPTIONS(request, { env });
