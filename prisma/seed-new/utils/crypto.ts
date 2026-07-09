/**
 * Cryptographic utilities for seed data
 */

import { createHash, randomBytes } from 'crypto';

/**
 * Hash a password using bcrypt-like approach (simplified for seed)
 * In production, use actual bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  // This is a simplified hash for seed data only
  // In production, use bcrypt with proper salt rounds
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password
 * @returns True if password matches
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const computedHash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return computedHash === hash;
}

/**
 * Generate a random token
 * @param length - Length of the token in bytes (default 32)
 * @returns A hex-encoded token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a random API key
 * @returns A formatted API key
 */
export function generateApiKey(): string {
  const prefix = 'nab';
  const secret = randomBytes(32).toString('hex');
  return `${prefix}_${secret}`;
}

/**
 * Generate a verification code
 * @param length - Length of the code (default 6)
 * @returns A numeric verification code
 */
export function generateVerificationCode(length: number = 6): string {
  const max = Math.pow(10, length) - 1;
  const code = Math.floor(Math.random() * max).toString();
  return code.padStart(length, '0');
}
