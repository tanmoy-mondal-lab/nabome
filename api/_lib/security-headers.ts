// ─────────────────────────────────────────────────────────────
// SECURITY HEADERS — Comprehensive security header configuration
// Implements OWASP recommended security headers with nonce-based CSP
// ─────────────────────────────────────────────────────────────

export interface SecurityHeaderOptions {
  /** Enable nonce-based CSP (recommended for production) */
  useNonce?: boolean;
  /** Custom CSP directives */
  customCsp?: Record<string, string>;
  /** Cloudinary cloud name for image CDN */
  cloudinaryCloudName?: string;
  /** Enable analytics in CSP */
  allowAnalytics?: boolean;
  /** Environment (development or production) */
  env?: "development" | "production";
}

/**
 * Generate a random nonce for CSP
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Build Content-Security-Policy header
 * Supports Cloudinary, analytics, fonts, and images
 */
function buildCsp(options: SecurityHeaderOptions, nonce?: string): string {
  const { cloudinaryCloudName, allowAnalytics, customCsp, env = "development" } = options;

  const directives: Record<string, string> = {
    // Default to self only for production
    "default-src": "'self'",
    
    // Scripts: self, nonce for inline scripts
    "script-src": nonce 
      ? `'self' 'nonce-${nonce}'` 
      : env === "development" 
        ? "'self' 'unsafe-inline' 'unsafe-eval'" 
        : "'self'",
    
    // Styles: self, nonce for inline styles
    "style-src": nonce 
      ? `'self' 'nonce-${nonce}'` 
      : env === "development" 
        ? "'self' 'unsafe-inline'" 
        : "'self'",
    
    // Images: self, data:, Cloudinary
    "img-src": "'self' data: https:",
    
    // Fonts: self, Google Fonts
    "font-src": "'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    
    // Connect: self, analytics
    "connect-src": "'self'",
    
    // Media: self, Cloudinary
    "media-src": "'self' https:",
    
    // Frame ancestors: none to prevent clickjacking
    "frame-ancestors": "'none'",
    
    // Base URI: self only
    "base-uri": "'self'",
    
    // Form action: self only
    "form-action": "'self'",
    
    // Frame sources: none
    "frame-src": "'none'",
    
    // Object sources: none
    "object-src": "'none'",
    
    // Worker sources: self
    "worker-src": "'self'",
    
    // Manifest: self
    "manifest-src": "'self'",
  };

  // Add Cloudinary domain if provided
  if (cloudinaryCloudName) {
    const cloudinaryDomain = `https://res.cloudinary.com/${cloudinaryCloudName}`;
    directives["img-src"] += ` ${cloudinaryDomain}`;
    directives["media-src"] += ` ${cloudinaryDomain}`;
  }

  // Add analytics if enabled
  if (allowAnalytics) {
    directives["script-src"] += " https://www.googletagmanager.com https://www.google-analytics.com";
    directives["connect-src"] += " https://www.google-analytics.com https://analytics.google.com";
  }

  // Merge custom CSP directives
  if (customCsp) {
    Object.assign(directives, customCsp);
  }

  // Build CSP string
  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources}`)
    .join("; ");
}

/**
 * Apply security headers to a response
 */
export function setSecurityHeaders(
  response: Response,
  options: SecurityHeaderOptions = {}
): Response {
  const { useNonce = true, env = "development" } = options;
  
  const nonce = useNonce ? generateNonce() : undefined;
  const csp = buildCsp(options, nonce);

  // Content-Security-Policy
  response.headers.set("Content-Security-Policy", csp);

  // Strict-Transport-Security (HSTS) - only in production with HTTPS
  if (env === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Referrer-Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy (formerly Feature-Policy)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
  );

  // X-Frame-Options (legacy, but still useful)
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Cross-Origin-Embedder-Policy: "require-corp" is intentionally NOT set because
  // it would block Cloudinary images, Razorpay checkout, Google Fonts, and other
  // third-party resources that don't send CORP headers. Unsafe-none is the safe
  // default that allows loading cross-origin resources without CORP headers while
  // still benefiting from all other security headers (CSP, XFO, COOP, HSTS, etc.).
  // If COEP is needed in the future, the app must migrate all cross-origin resources
  // to same-origin or use credentialless mode: "credentialless"

  // Cross-Origin-Opener-Policy
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  // Cross-Origin-Resource-Policy
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Remove server information disclosure
  response.headers.delete("Server");
  response.headers.delete("X-Powered-By");

  // Add nonce to response headers for frontend use
  if (nonce) {
    response.headers.set("X-Content-Security-Policy-Nonce", nonce);
  }

  return response;
}

/**
 * Get CSP nonce from response headers (for frontend use)
 */
export function getCspNonce(response: Response): string | null {
  return response.headers.get("X-Content-Security-Policy-Nonce");
}
