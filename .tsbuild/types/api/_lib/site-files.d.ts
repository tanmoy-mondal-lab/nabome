import type { Env } from "./env";
export declare function defaultRobots(siteUrlValue: string): string;
export declare function buildRobotsResponse(env?: Env): Promise<Response>;
export declare function buildSitemapResponse(env?: Env): Promise<Response>;
