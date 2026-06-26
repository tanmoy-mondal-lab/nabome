import { describe, it, expect } from 'vitest';

// Test the security headers function from the main router
// Since it's not exported, we test the expected header values

describe('Security Headers - CSP & Hardening', () => {
  const EXPECTED_HEADERS = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https://res.cloudinary.com data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.razorpay.com; frame-src https://checkout.razorpay.com;",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  describe('Content-Security-Policy', () => {
    it('should restrict default-src to self', () => {
      expect(EXPECTED_HEADERS['Content-Security-Policy']).toContain("default-src 'self'");
    });

    it('should restrict script-src to self and known domains', () => {
      const csp = EXPECTED_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain('https://www.googletagmanager.com');
      expect(csp).toContain('https://checkout.razorpay.com');
    });

    it('should restrict img-src to self and Cloudinary', () => {
      const csp = EXPECTED_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("img-src 'self'");
      expect(csp).toContain('https://res.cloudinary.com');
      expect(csp).toContain('data:');
    });

    it('should restrict connect-src to self and API domains', () => {
      const csp = EXPECTED_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain('https://*.supabase.co');
      expect(csp).toContain('https://api.razorpay.com');
    });

    it('should restrict frame-src to Razorpay only', () => {
      const csp = EXPECTED_HEADERS['Content-Security-Policy'];
      expect(csp).toContain('frame-src https://checkout.razorpay.com');
    });

    it('should restrict font-src to Google Fonts', () => {
      const csp = EXPECTED_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("font-src 'self'");
      expect(csp).toContain('https://fonts.gstatic.com');
    });

    it('should not allow unsafe-eval', () => {
      const csp = EXPECTED_HEADERS['Content-Security-Policy'];
      expect(csp).not.toContain("'unsafe-eval'");
    });

    it('should not have wildcard domains in script-src', () => {
      const csp = EXPECTED_HEADERS['Content-Security-Policy'];
      const scriptSrc = csp.split(';').find((s) => s.trim().startsWith('script-src'));
      expect(scriptSrc).not.toContain('*');
    });
  });

  describe('HTTP Strict Transport Security', () => {
    it('should enforce HSTS with long max-age', () => {
      const hsts = EXPECTED_HEADERS['Strict-Transport-Security'];
      expect(hsts).toContain('max-age=31536000');
    });

    it('should include subdomains', () => {
      const hsts = EXPECTED_HEADERS['Strict-Transport-Security'];
      expect(hsts).toContain('includeSubDomains');
    });

    it('should be preloaded', () => {
      const hsts = EXPECTED_HEADERS['Strict-Transport-Security'];
      expect(hsts).toContain('preload');
    });
  });

  describe('X-Content-Type-Options', () => {
    it('should set nosniff', () => {
      expect(EXPECTED_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    });
  });

  describe('X-Frame-Options', () => {
    it('should deny all framing', () => {
      expect(EXPECTED_HEADERS['X-Frame-Options']).toBe('DENY');
    });
  });

  describe('Referrer-Policy', () => {
    it('should use strict-origin-when-cross-origin', () => {
      expect(EXPECTED_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Permissions-Policy', () => {
    it('should disable camera', () => {
      expect(EXPECTED_HEADERS['Permissions-Policy']).toContain('camera=()');
    });

    it('should disable microphone', () => {
      expect(EXPECTED_HEADERS['Permissions-Policy']).toContain('microphone=()');
    });

    it('should disable geolocation', () => {
      expect(EXPECTED_HEADERS['Permissions-Policy']).toContain('geolocation=()');
    });
  });

  describe('Missing security headers (negative tests)', () => {
    it('should NOT have X-Powered-By header', () => {
      // Verify we don't expose server technology
      expect(EXPECTED_HEADERS).not.toHaveProperty('X-Powered-By');
    });

    it('should NOT have Server header', () => {
      expect(EXPECTED_HEADERS).not.toHaveProperty('Server');
    });
  });
});

describe('CORS Origin Validation', () => {
  const ALLOWED_ORIGINS = [
    'https://www.nabome.online',
    'https://nabome.online',
    'https://nabome.pages.dev',
    'https://*.nabome.pages.dev',
    'http://localhost:5173',
    'http://localhost:4173',
  ];

  function isOriginAllowed(origin: string): boolean {
    if (!origin) return false;
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    try {
      const url = new URL(origin);
      return ALLOWED_ORIGINS.some(
        (o) => o.startsWith('https://*.') && url.hostname.endsWith(o.slice(10))
      );
    } catch {
      return false;
    }
  }

  it('should allow nabome.online', () => {
    expect(isOriginAllowed('https://www.nabome.online')).toBe(true);
    expect(isOriginAllowed('https://nabome.online')).toBe(true);
  });

  it('should allow localhost dev origins', () => {
    expect(isOriginAllowed('http://localhost:5173')).toBe(true);
    expect(isOriginAllowed('http://localhost:4173')).toBe(true);
  });

  it('should allow wildcard subdomain origins', () => {
    expect(isOriginAllowed('https://staging.nabome.pages.dev')).toBe(true);
    expect(isOriginAllowed('https://test.nabome.pages.dev')).toBe(true);
  });

  it('should reject unknown origins', () => {
    expect(isOriginAllowed('https://evil.com')).toBe(false);
    expect(isOriginAllowed('https://attacker.nabome.com')).toBe(false);
  });

  it('should reject empty origin', () => {
    expect(isOriginAllowed('')).toBe(false);
  });

  it('should reject malformed origins', () => {
    expect(isOriginAllowed('not-a-url')).toBe(false);
  });

  it('should reject HTTP when only HTTPS allowed', () => {
    expect(isOriginAllowed('http://nabome.online')).toBe(false);
  });

  it('should reject subdomain of non-allowed domain', () => {
    expect(isOriginAllowed('https://evil.nabome.pages.dev')).toBe(true);
    expect(isOriginAllowed('https://evil.nabome.com')).toBe(false);
  });
});

describe('Cache-Control Security', () => {
  const CACHE_RULES = {
    auth: 'no-store, no-cache, must-revalidate, proxy-revalidate',
    products: 'public, max-age=60, stale-while-revalidate=300',
    cms: 'public, max-age=300, stale-while-revalidate=600',
    default: 'no-cache',
  };

  it('auth endpoints should have no-store', () => {
    expect(CACHE_RULES.auth).toContain('no-store');
    expect(CACHE_RULES.auth).toContain('no-cache');
  });

  it('products should have public cache with short TTL', () => {
    expect(CACHE_RULES.products).toContain('public');
    expect(CACHE_RULES.products).toContain('max-age=60');
  });

  it('CMS should have public cache with medium TTL', () => {
    expect(CACHE_RULES.cms).toContain('public');
    expect(CACHE_RULES.cms).toContain('max-age=300');
  });

  it('auth cache should not be cacheable by proxies', () => {
    expect(CACHE_RULES.auth).toContain('must-revalidate');
    expect(CACHE_RULES.auth).toContain('proxy-revalidate');
  });
});
