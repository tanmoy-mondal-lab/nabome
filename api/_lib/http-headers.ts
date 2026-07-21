export const ALLOWED_ORIGINS = [
  "https://www.nabome.online",
  "https://nabome.online",
  "https://nabome.pages.dev",
  "https://*.nabome.pages.dev",
  "http://localhost:5173",
  "http://localhost:4173",
] as const;

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://checkout.razorpay.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://cloudflare-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: blob: https://*.unsplash.com https://images.unsplash.com https://res.cloudinary.com https://www.google-analytics.com; media-src 'self' blob: https://res.cloudinary.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://www.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com https://cloudflare-insights.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://fonts.googleapis.com https://fonts.gstatic.com https://res.cloudinary.com; frame-src https://checkout.razorpay.com https://api.razorpay.com https://challenges.cloudflare.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), fullscreen=(), display-capture=(), encrypted-media=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const STATIC_HEADER_RULES: Array<{ path: string; headers: Record<string, string> }> = [
  {
    path: "/robots.txt",
    headers: { 
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "index, follow"
    },
  },
  {
    path: "/sitemap.xml",
    headers: { 
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow"
    },
  },
  {
    path: "/*",
    headers: SECURITY_HEADERS,
  },
  {
    path: "/assets/*.js",
    headers: { 
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable" 
    },
  },
  {
    path: "/assets/*.css",
    headers: { 
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable" 
    },
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
      // Exact suffix match: hostname must equal suffix or be a subdomain of suffix
      // Prevents bypass via hostname like "evil.nabome.pages.dev.evil.com"
      if (url.protocol !== "https:") return false;
      if (url.hostname === suffix) return true;
      return url.hostname.endsWith("." + suffix);
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
    return { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate", "CDN-Cache-Control": "no-store", "Surrogate-Control": "no-store" };
  }
  if (path.includes("/api/products") || path.includes("/api/categories") || path.includes("/api/collections") || path.includes("/api/brands")) {
    return { "Cache-Control": "public, max-age=60, stale-while-revalidate=300", "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=300" };
  }
  if (path.includes("/api/cms") || path.includes("/api/settings")) {
    return { "Cache-Control": "public, max-age=300, stale-while-revalidate=600", "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600" };
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

export function getCompressionHeaders(request: Request): Record<string, string> {
  const acceptEncoding = request.headers.get("accept-encoding") || "";
  const headers: Record<string, string> = {};
  
  if (acceptEncoding.includes("br")) {
    headers["Content-Encoding"] = "br";
  } else if (acceptEncoding.includes("gzip")) {
    headers["Content-Encoding"] = "gzip";
  }
  
  return headers;
}

export function generateETag(content: string): string {
  // Simple hash-based ETag generation
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

export function getETagHeaders(content: string): Record<string, string> {
  return {
    "ETag": generateETag(content),
  };
}

export function checkETag(request: Request, currentETag: string): boolean {
  const ifNoneMatch = request.headers.get("if-none-match");
  if (!ifNoneMatch) return false;
  return ifNoneMatch === currentETag;
}
