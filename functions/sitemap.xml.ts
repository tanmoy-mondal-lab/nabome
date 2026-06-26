import { GET } from "../api/sitemap.xml";

export const onRequest: PagesFunction = (context) => {
  return GET(context.request, { env: context.env as Record<string, string> });
};
