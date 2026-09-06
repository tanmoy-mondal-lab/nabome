export const ACCESS_TOKEN_MAX_AGE = 900;
export const CSRF_TOKEN_MAX_AGE = 14400;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
export const REFRESH_TOKEN_MAX_AGE_REMEMBER_ME = 30 * 24 * 60 * 60;

function maxAgeForExpiry(expiresAt: Date, fallback: number): number {
  const seconds = Math.round((expiresAt.getTime() - Date.now()) / 1000);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : fallback;
}

function base(): string {
  return `Path=/; HttpOnly; Secure; SameSite=None`;
}

export function accessTokenCookie(token: string): string {
  return `access_token=${token}; ${base()}; Max-Age=${ACCESS_TOKEN_MAX_AGE}`;
}

export function refreshTokenCookie(token: string, expiresAt?: Date): string {
  const maxAge = expiresAt
    ? maxAgeForExpiry(expiresAt, REFRESH_TOKEN_MAX_AGE)
    : REFRESH_TOKEN_MAX_AGE;
  return `refresh_token=${token}; ${base()}; Max-Age=${maxAge}`;
}

export function csrfTokenCookie(token: string): string {
  return `csrf_token=${token}; Path=/; Secure; SameSite=None; Max-Age=${CSRF_TOKEN_MAX_AGE}`;
}

export function clearAuthCookies(): string[] {
  const cleared = [
    'access_token=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0',
    'refresh_token=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0',
    'csrf_token=; Path=/; Secure; SameSite=None; Max-Age=0',
  ];
  for (const legacy of [
    'access_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    'refresh_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    'csrf_token=; Path=/; Secure; SameSite=Lax; Max-Age=0',
  ]) {
    cleared.push(legacy);
  }
  return cleared;
}

export function readCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('cookie') ?? '';
  for (const part of cookies.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) {
      return decodeURIComponent(trimmed.slice(eq + 1));
    }
  }
  return null;
}
