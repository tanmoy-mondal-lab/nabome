export declare const ALLOWED_ORIGINS: readonly ["https://www.nabome.online", "https://nabome.online", "https://nabome.pages.dev", "https://*.nabome.pages.dev", "http://localhost:5173", "http://localhost:4173"];
export declare const SECURITY_HEADERS: Record<string, string>;
export declare function isOriginAllowed(origin: string): boolean;
export declare function corsHeaders(request: Request): Record<string, string>;
export declare function cacheControlHeaders(path: string): Record<string, string>;
export declare function renderStaticHeadersFile(): string;
export declare function getCompressionHeaders(request: Request): Record<string, string>;
