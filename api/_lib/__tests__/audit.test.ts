import { describe, it, expect } from 'vitest';
import { extractRequestMeta } from '../audit';

describe('extractRequestMeta', () => {
  it('should extract IP from x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
        'user-agent': 'Mozilla/5.0',
      },
    });
    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBe('1.2.3.4');
  });

  it('should extract IP from cf-connecting-ip', () => {
    const req = new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '9.10.11.12',
        'user-agent': 'Mozilla/5.0',
      },
    });
    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBe('9.10.11.12');
  });

  it('should extract IP from x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-real-ip': '13.14.15.16',
        'user-agent': 'Mozilla/5.0',
      },
    });
    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBe('13.14.15.16');
  });

  it('should return null when no IP headers present', () => {
    const req = new Request('http://localhost', {
      headers: { 'user-agent': 'Mozilla/5.0' },
    });
    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBeNull();
  });

  it('should prefer x-forwarded-for over others', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '1.1.1.1',
        'cf-connecting-ip': '2.2.2.2',
        'x-real-ip': '3.3.3.3',
      },
    });
    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBe('1.1.1.1');
  });

  it('should extract user-agent', () => {
    const req = new Request('http://localhost', {
      headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    });
    const meta = extractRequestMeta(req);
    expect(meta.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
  });

  it('should return null userAgent when not present', () => {
    const req = new Request('http://localhost');
    const meta = extractRequestMeta(req);
    expect(meta.userAgent).toBeNull();
  });

  it('should trim IP whitespace', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '  1.2.3.4  , 5.6.7.8',
      },
    });
    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBe('1.2.3.4');
  });
});
