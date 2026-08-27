/**
 * JWT token generation and verification for V1 authentication.
 * Uses jsonwebtoken with HS256 signing.
 * Secret is passed from the Cloudflare Env binding — never reads process.env directly.
 */

import jwt from 'jsonwebtoken';

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'nabome-api';
const JWT_AUDIENCE = 'nabome-clients';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT access token (short-lived: 15 minutes).
 */
export function generateAccessToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: string,
): string {
  return jwt.sign(payload, secret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: '15m',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

/**
 * Generate a JWT refresh token (long-lived: 7 days).
 */
export function generateRefreshToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: string,
): string {
  return jwt.sign(payload, secret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: '7d',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

/**
 * Verify and decode a JWT token.
 */
export function verifyToken(token: string, secret: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode a JWT without verification (for debugging only).
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}
