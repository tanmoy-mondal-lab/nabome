export const ALLOWED_ORIGINS = [
  "https://www.nabome.online",
  "https://nabome.online",
  "https://nabome.pages.dev",
  "https://*.nabome.pages.dev",
  "http://localhost:5173",
  "http://localhost:4173",
] as const;

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://checkout.razorpay.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https://res.cloudinary.com https://www.google-analytics.com data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://www.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com; frame-src https://checkout.razorpay.com https://api.razorpay.com https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const STATIC_HEADER_RULES: Array<{ path: string; headers: Record<string, string> }> = [
  {
    path: "/*",
    headers: SECURITY_HEADERS,
  },
  {
    path: "/assets/*",
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  },
  {
    path: "/images/*",
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  },
  {
    path: "/favicon*",
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  },
  {
    path: "/site.webmanifest",
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  },
  {
    path: "/sitemap.xml",
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  },
  {
    path: "/robots.txt",
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  },
  {
    path: "/index.html",
    headers: { "Cache-Control": "public, max-age=0, must-revalidate" },
  },
  {
    path: "/api/*",
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "CDN-Cache-Control": "no-store",
      "Surrogate-Control": "no-store",
    },
  },
];

export function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  if ((ALLOWED_ORIGINS as readonly string[]).includes(origin)) return true;
  try {
    const url = new URL(origin);
    return ALLOWED_ORIGINS.some((allowedOrigin) => {
      if (!allowedOrigin.startsWith("https://*.")) return false;
      const suffix = allowedOrigin.slice("https://*.".length);
      return url.protocol === "https:" && url.hostname.endsWith(`.${suffix}`);
    });
  } catch {
    return false;
  }
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = isOriginAllowed(origin) ? origin : "https://www.nabome.online";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function cacheControlHeaders(path: string): Record<string, string> {
  if (
    path.includes("/auth/") ||
    path.includes("/admin/") ||
    path.includes("/checkout") ||
    path.includes("/payments") ||
    path.includes("/orders") ||
    path.includes("/cart")
  ) {
    return { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" };
  }
  if (path.includes("/api/products") || path.includes("/api/categories") || path.includes("/api/collections")) {
    return { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" };
  }
  if (path.includes("/api/cms") || path.includes("/api/settings")) {
    return { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" };
  }
  return { "Cache-Control": "no-cache" };
}

export function renderStaticHeadersFile(): string {
  const lines: string[] = [
    "# Generated from api/_lib/http-headers.ts — do not edit manually.",
    "",
  ];

  for (const rule of STATIC_HEADER_RULES) {
    lines.push(rule.path);
    for (const [header, value] of Object.entries(rule.headers)) {
      lines.push(`  ${header}: ${value}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").replace(/\n$/, "")}\n`;
}
