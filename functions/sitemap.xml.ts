import { buildSitemapResponse } from "../api/_lib/site-files";

export const onRequestGet: PagesFunction = (context) => {
  return buildSitemapResponse(context.env as Record<string, string>);
};
