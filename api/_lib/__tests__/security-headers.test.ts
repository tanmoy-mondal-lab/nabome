import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ALLOWED_ORIGINS, SECURITY_HEADERS, cacheControlHeaders, isOriginAllowed } from '../http-headers';

function parseRootHeaders(): Record<string, string> {
  const content = readFileSync(`${process.cwd()}/public/_headers`, 'utf8');
  const lines = content.split(/\r?\n/);
  const rootIndex = lines.findIndex((line) => line.trim() === '/*');
  const headers: Record<string, string> = {};
  for (let index = rootIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) break;
    const match = line.match(/^\s+([^:]+):\s*(.*)$/);
    if (match) headers[match[1]] = match[2];
  }
  return headers;
}

describe('Security Headers - CSP & Hardening', () => {
  describe('Content-Security-Policy', () => {
    it('should restrict default-src to self', () => {
      expect(SECURITY_HEADERS['Content-Security-Policy']).toContain("default-src 'self'");
    });

    it('should restrict script-src to self and known domains', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain('https://www.googletagmanager.com');
      expect(csp).toContain('https://checkout.razorpay.com');
      expect(csp).toContain('https://challenges.cloudflare.com');
    });

    it('should restrict img-src to self and Cloudinary', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("img-src 'self'");
      expect(csp).toContain('https://res.cloudinary.com');
      expect(csp).toContain('data:');
    });

    it('should restrict connect-src to self and API domains', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain('https://*.supabase.co');
      expect(csp).toContain('https://api.razorpay.com');
    });

    it('should restrict frame-src to checkout providers only', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      expect(csp).toContain('frame-src https://checkout.razorpay.com');
      expect(csp).toContain('https://challenges.cloudflare.com');
    });

    it('should restrict font-src to Google Fonts', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("font-src 'self'");
      expect(csp).toContain('https://fonts.gstatic.com');
    });

    it('should block plugin objects and unsafe base URIs', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
    });

    it('should not allow unsafe-eval', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      expect(csp).not.toContain("'unsafe-eval'");
    });

    it('should not have wildcard domains in script-src', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      const scriptSrc = csp.split(';').find((s) => s.trim().startsWith('script-src'));
      expect(scriptSrc).not.toContain('*');
    });
  });

  describe('HTTP Strict Transport Security', () => {
    it('should enforce HSTS with long max-age', () => {
      const hsts = SECURITY_HEADERS['Strict-Transport-Security'];
      expect(hsts).toContain('max-age=31536000');
    });

    it('should include subdomains', () => {
      const hsts = SECURITY_HEADERS['Strict-Transport-Security'];
      expect(hsts).toContain('includeSubDomains');
    });

    it('should be preloaded', () => {
      const hsts = SECURITY_HEADERS['Strict-Transport-Security'];
      expect(hsts).toContain('preload');
    });
  });

  describe('X-Content-Type-Options', () => {
    it('should set nosniff', () => {
      expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    });
  });

  describe('X-Frame-Options', () => {
    it('should deny all framing', () => {
      expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    });
  });

  describe('Referrer-Policy', () => {
    it('should use strict-origin-when-cross-origin', () => {
      expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Permissions-Policy', () => {
    it('should disable camera', () => {
      expect(SECURITY_HEADERS['Permissions-Policy']).toContain('camera=()');
    });

    it('should disable microphone', () => {
      expect(SECURITY_HEADERS['Permissions-Policy']).toContain('microphone=()');
    });

    it('should disable geolocation', () => {
      expect(SECURITY_HEADERS['Permissions-Policy']).toContain('geolocation=()');
    });
  });

  describe('Cloudflare static header parity', () => {
    it('keeps root static headers aligned with Function security headers', () => {
      expect(parseRootHeaders()).toMatchObject(SECURITY_HEADERS);
    });
  });

  describe('Missing security headers (negative tests)', () => {
    it('should NOT have X-Powered-By header', () => {
      expect(SECURITY_HEADERS).not.toHaveProperty('X-Powered-By');
    });

    it('should NOT have Server header', () => {
      expect(SECURITY_HEADERS).not.toHaveProperty('Server');
    });
  });
});

describe('CORS Origin Validation', () => {
  it('documents the production and local origins', () => {
    expect(ALLOWED_ORIGINS).toContain('https://www.nabome.online');
    expect(ALLOWED_ORIGINS).toContain('http://localhost:5173');
  });

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
  it('auth endpoints should have no-store', () => {
    const auth = cacheControlHeaders('/api/auth/me')['Cache-Control'];
    expect(auth).toContain('no-store');
    expect(auth).toContain('no-cache');
  });

  it('products should have public cache with short TTL', () => {
    const products = cacheControlHeaders('/api/products')['Cache-Control'];
    expect(products).toContain('public');
    expect(products).toContain('max-age=60');
  });

  it('CMS should have public cache with medium TTL', () => {
    const cms = cacheControlHeaders('/api/cms/pages/privacy')['Cache-Control'];
    expect(cms).toContain('public');
    expect(cms).toContain('max-age=300');
  });

  it('auth cache should not be cacheable by proxies', () => {
    const auth = cacheControlHeaders('/api/auth/me')['Cache-Control'];
    expect(auth).toContain('must-revalidate');
    expect(auth).toContain('proxy-revalidate');
  });
});
