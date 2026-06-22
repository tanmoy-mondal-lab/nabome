import { onRequestDelete as __api___path___ts_onRequestDelete } from "/Users/tanmoymondal/nabome/functions/api/[[path]].ts"
import { onRequestGet as __api___path___ts_onRequestGet } from "/Users/tanmoymondal/nabome/functions/api/[[path]].ts"
import { onRequestOptions as __api___path___ts_onRequestOptions } from "/Users/tanmoymondal/nabome/functions/api/[[path]].ts"
import { onRequestPatch as __api___path___ts_onRequestPatch } from "/Users/tanmoymondal/nabome/functions/api/[[path]].ts"
import { onRequestPost as __api___path___ts_onRequestPost } from "/Users/tanmoymondal/nabome/functions/api/[[path]].ts"
import { onRequestPut as __api___path___ts_onRequestPut } from "/Users/tanmoymondal/nabome/functions/api/[[path]].ts"

export const routes = [
    {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api___path___ts_onRequestDelete],
    },
  {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api___path___ts_onRequestGet],
    },
  {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api___path___ts_onRequestOptions],
    },
  {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "PATCH",
      middlewares: [],
      modules: [__api___path___ts_onRequestPatch],
    },
  {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api___path___ts_onRequestPost],
    },
  {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api___path___ts_onRequestPut],
    },
  ]