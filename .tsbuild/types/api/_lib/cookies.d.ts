export interface CookieOptions {
    name: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    maxAge: number;
    path: string;
}
export declare const COOKIE_CONFIG: {
    readonly ACCESS_TOKEN: {
        readonly name: "access_token";
        readonly httpOnly: true;
        readonly secure: true;
        readonly sameSite: "lax";
        readonly maxAge: number;
        readonly path: "/";
    };
    readonly REFRESH_TOKEN: {
        readonly name: "refresh_token";
        readonly httpOnly: true;
        readonly secure: true;
        readonly sameSite: "strict";
        readonly maxAge: number;
        readonly path: "/";
    };
    readonly CSRF_TOKEN: {
        readonly name: "csrf_token";
        readonly httpOnly: false;
        readonly secure: true;
        readonly sameSite: "lax";
        readonly maxAge: number;
        readonly path: "/";
    };
};
/**
 * Set a cookie with the given options
 */
export declare function setCookie(response: Response, name: string, value: string, options: CookieOptions, env?: any): Response;
/**
 * Build a cookie string without setting it (for batch setting)
 */
export declare function buildCookieString(name: string, value: string, options: CookieOptions, env?: any): string;
/**
 * Clear a cookie by setting Max-Age to 0
 */
export declare function clearCookie(response: Response, name: string, options: Pick<CookieOptions, "path" | "sameSite">, env?: any, httpOnly?: boolean): Response;
/**
 * Parse cookies from a Cookie header string
 */
export declare function parseCookies(cookieHeader: string): Record<string, string>;
