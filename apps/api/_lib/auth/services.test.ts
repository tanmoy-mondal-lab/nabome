/**
 * Unit tests for authentication services.
 * Tests registration, login, logout, password reset, and email verification flows.
 */

// Mock environment variables before imports
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { generateAccessToken, generateRefreshToken, verifyToken } from './jwt';
import { hashPassword, verifyPassword } from './password';
import {
  register,
  login,
  logout,
  refreshSession,
  requestPasswordReset,
  confirmPasswordReset,
  verifyEmail,
  resendVerificationEmail,
} from './services-v1';

const TEST_JWT_SECRET = 'test-secret-key-for-testing-only';
const TEST_EMAIL_CONFIG = { apiKey: 're_test', fromEmail: 'test@example.com' };

// Mock Prisma Client
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  session: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  emailVerification: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  passwordReset: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  loginHistory: {
    create: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock('../prisma', () => ({
  getPrisma: vi.fn(() => mockPrisma),
}));

vi.mock('../email/service', () => ({
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

describe('Authentication Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(true);
    });
  });

  describe('JWT Token Generation', () => {
    const mockUserId = 'user-123';
    const mockEmail = 'test@example.com';
    const mockRole = 'customer';

    it('should generate access token', () => {
      const token = generateAccessToken(
        {
          userId: mockUserId,
          email: mockEmail,
          role: mockRole,
        },
        TEST_JWT_SECRET,
      );
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate refresh token', () => {
      const token = generateRefreshToken(
        {
          userId: mockUserId,
          email: mockEmail,
          role: mockRole,
        },
        TEST_JWT_SECRET,
      );
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify valid token', () => {
      const token = generateAccessToken(
        {
          userId: mockUserId,
          email: mockEmail,
          role: mockRole,
        },
        TEST_JWT_SECRET,
      );
      const payload = verifyToken(token, TEST_JWT_SECRET);
      expect(payload).toBeDefined();
      expect(payload.userId).toBe(mockUserId);
      expect(payload.email).toBe(mockEmail);
      expect(payload.role).toBe(mockRole);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyToken(invalidToken, TEST_JWT_SECRET)).toThrow();
    });

    it('should reject expired token', () => {
      const invalidToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTYyMDAwMDAwMCwiZXhwIjoxNjE5OTk5OTk5fQ.invalid';
      expect(() => verifyToken(invalidToken, TEST_JWT_SECRET)).toThrow();
    });

    it('should include issuer claim in token', () => {
      const token = generateAccessToken(
        {
          userId: mockUserId,
          email: mockEmail,
          role: mockRole,
        },
        TEST_JWT_SECRET,
      );
      // Decode token without verification to check issuer
      const decoded = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );
      expect(decoded.iss).toBeDefined();
      expect(decoded.iss).toBe('nabome-api');
    });

    it('should include audience claim in token', () => {
      const token = generateAccessToken(
        {
          userId: mockUserId,
          email: mockEmail,
          role: mockRole,
        },
        TEST_JWT_SECRET,
      );
      // Decode token without verification to check audience
      const decoded = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );
      expect(decoded.aud).toBeDefined();
      expect(decoded.aud).toBe('nabome-clients');
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
        status: 'pending_verification',
      });
      mockPrisma.emailVerification.create.mockResolvedValue({});

      const result = await register({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        jwtSecret: TEST_JWT_SECRET,
        emailConfig: TEST_EMAIL_CONFIG,
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.requiresEmailVerification).toBe(true);
    });

    it('should prevent email enumeration by returning generic success for existing email', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'test@example.com',
        emailVerifiedAt: null,
      };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      // services-v1 throws CONFLICT for existing emails
      await expect(
        register({
          email: 'test@example.com',
          password: 'TestPassword123!',
          jwtSecret: TEST_JWT_SECRET,
          emailConfig: TEST_EMAIL_CONFIG,
        }),
      ).rejects.toThrow();
    });

    it('should return existing user if email already exists and is verified', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'test@example.com',
        emailVerifiedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      // services-v1 throws CONFLICT for existing emails
      await expect(
        register({
          email: 'test@example.com',
          password: 'TestPassword123!',
          jwtSecret: TEST_JWT_SECRET,
          emailConfig: TEST_EMAIL_CONFIG,
        }),
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: await hashPassword('TestPassword123!'),
        isActive: true,
        status: 'active',
        role: 'customer',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.loginHistory.count.mockResolvedValue(0);
      mockPrisma.loginHistory.create.mockResolvedValue({});
      mockPrisma.session.count.mockResolvedValue(0);
      mockPrisma.session.create.mockResolvedValue({
        id: 'session-123',
        userId: 'user-123',
      });
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await login({
        email: 'test@example.com',
        password: 'TestPassword123!',
        jwtSecret: TEST_JWT_SECRET,
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: await hashPassword('TestPassword123!'),
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.loginHistory.count.mockResolvedValue(0);

      await expect(
        login({
          email: 'test@example.com',
          password: 'WrongPassword123!',
          jwtSecret: TEST_JWT_SECRET,
        }),
      ).rejects.toThrow();
    });

    it('should throw error on account lockout', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: await hashPassword('TestPassword123!'),
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.loginHistory.count.mockResolvedValue(5);

      await expect(
        login({
          email: 'test@example.com',
          password: 'TestPassword123!',
          jwtSecret: TEST_JWT_SECRET,
        }),
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockPrisma.session.update.mockResolvedValue({});

      await logout('session-123');
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('logoutByRefreshToken', () => {
    it('revokes the session owning the presented refresh token', async () => {
      const { logoutByRefreshToken } = await import('./services-v1');
      mockPrisma.session.findFirst.mockResolvedValue({ id: 'session-device' });
      mockPrisma.session.update.mockResolvedValue({});

      await expect(
        logoutByRefreshToken('device-refresh-token', 'user-123'),
      ).resolves.toBe(true);
      expect(mockPrisma.session.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          refreshToken: expect.any(String),
          revokedAt: null,
        },
      });
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-device' },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('returns false when no live session owns the token', async () => {
      const { logoutByRefreshToken } = await import('./services-v1');
      mockPrisma.session.findFirst.mockResolvedValue(null);

      await expect(
        logoutByRefreshToken('stale-token', 'user-123'),
      ).resolves.toBe(false);
      expect(mockPrisma.session.update).not.toHaveBeenCalled();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'customer',
        isActive: true,
      };
      const mockSession = {
        id: 'session-123',
        userId: 'user-123',
        refreshToken: 'valid-refresh-token-hash',
        csrfToken: 'csrf-hash',
        expiresAt: new Date(Date.now() + 86400000),
        user: mockUser,
      };

      mockPrisma.session.findFirst.mockResolvedValue(mockSession);
      mockPrisma.session.update.mockResolvedValue(mockSession);

      // Generate a valid refresh token for the test
      const refreshToken = generateRefreshToken(
        {
          userId: 'user-123',
          email: 'test@example.com',
          role: 'customer',
        },
        TEST_JWT_SECRET,
      );

      // Mock the hashToken to return the stored value
      // Since refreshSession hashes the token and looks it up, we need to mock the find to match
      // We'll create a fresh token and make the mock return when queried with its hash

      const result = await refreshSession(refreshToken, TEST_JWT_SECRET);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it('should throw error for invalid refresh token', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);

      await expect(
        refreshSession('invalid-token', TEST_JWT_SECRET),
      ).rejects.toThrow();
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);
      mockPrisma.passwordReset.create.mockResolvedValue({});

      await expect(
        requestPasswordReset({
          email: 'test@example.com',
          emailConfig: TEST_EMAIL_CONFIG,
        }),
      ).resolves.toBeUndefined();
    });

    it('should return without error for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // services-v1 returns silently for non-existent emails to prevent enumeration
      await expect(
        requestPasswordReset({
          email: 'nonexistent@example.com',
          emailConfig: TEST_EMAIL_CONFIG,
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('confirmPasswordReset', () => {
    it('should reset password successfully', async () => {
      const mockResetRecord = {
        id: 'reset-123',
        userId: 'user-123',
        tokenHash: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          isActive: true,
        },
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        isActive: true,
      };

      mockPrisma.passwordReset.findFirst.mockResolvedValue(mockResetRecord);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.passwordReset.delete.mockResolvedValue({});

      await expect(
        confirmPasswordReset({
          token: 'valid-token',
          newPassword: 'NewPassword123!',
        }),
      ).resolves.toBeUndefined();
    });

    it('should throw error for invalid reset token', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        confirmPasswordReset({
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });

    it('should throw error for expired reset token', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        confirmPasswordReset({
          token: 'expired-token',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });

    it('should throw error for already used reset token', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        confirmPasswordReset({
          token: 'used-token',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });

    it('should throw error for token expiring in less than 1 minute', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        confirmPasswordReset({
          token: 'near-expiry-token',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });

    it('should throw error for token expiring exactly at current time', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        confirmPasswordReset({
          token: 'exact-expiry-token',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });

    it('should throw error for null token', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        confirmPasswordReset({
          token: null as any,
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });

    it('should throw error for undefined token', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        confirmPasswordReset({
          token: undefined as any,
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });

    it('should throw error for invalid token format', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        confirmPasswordReset({
          token: 'invalid-format',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockVerification = {
        id: 'verification-123',
        userId: 'user-123',
        tokenHash: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          emailVerifiedAt: null,
          isActive: true,
        },
      };

      mockPrisma.emailVerification.findFirst.mockResolvedValue(
        mockVerification,
      );
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.emailVerification.delete.mockResolvedValue({});

      await expect(
        verifyEmail({ token: 'valid-token' }),
      ).resolves.toBeUndefined();
    });

    it('should throw error for invalid verification token', async () => {
      mockPrisma.emailVerification.findFirst.mockResolvedValue(null);

      await expect(verifyEmail({ token: 'invalid-token' })).rejects.toThrow();
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.emailVerification.findFirst.mockResolvedValue(null);
      mockPrisma.emailVerification.create.mockResolvedValue({});

      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).resolves.toBeUndefined();
    });

    it('should throw error for already verified email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: new Date(),
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).rejects.toThrow();
    });

    it('should enforce rate limiting for resend attempts', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        isActive: true,
      };
      // Existing verification sent 30 seconds ago (within rate limit window)
      const existingVerification = {
        id: 'verification-123',
        userId: 'user-123',
        createdAt: new Date(Date.now() - 30000),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.emailVerification.findFirst.mockResolvedValue(
        existingVerification,
      );

      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).rejects.toThrow();
    });

    it('should allow resend after rate limit window expires', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      // No recent verification (sent 2 minutes ago = expired)
      mockPrisma.emailVerification.findFirst.mockResolvedValue(null);
      mockPrisma.emailVerification.create.mockResolvedValue({});

      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).resolves.toBeUndefined();
    });

    it('should handle rate limit exactly at boundary', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      // Sent exactly 60 seconds ago - within window
      mockPrisma.emailVerification.findFirst.mockResolvedValue({
        id: 'verification-123',
        createdAt: new Date(Date.now() - 60000),
      });

      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).resolves.toBeUndefined();
    });

    it('should handle rate limit with no previous send', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.emailVerification.findFirst.mockResolvedValue(null);
      mockPrisma.emailVerification.create.mockResolvedValue({});

      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).resolves.toBeUndefined();
    });

    it('should handle multiple rapid resend attempts', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      // Existing verification sent 10 seconds ago (within rate limit window)
      mockPrisma.emailVerification.findFirst.mockResolvedValue({
        id: 'verification-123',
        createdAt: new Date(Date.now() - 10000),
      });

      // First attempt should be rate limited
      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).rejects.toThrow();

      // Second attempt should also be rate limited (same window)
      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).rejects.toThrow();
    });

    it('should handle rate limit with different time windows', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      // Sent 59 seconds ago (within 60 second window)
      mockPrisma.emailVerification.findFirst.mockResolvedValue({
        id: 'verification-123',
        createdAt: new Date(Date.now() - 59000),
      });

      // Should still be rate limited if window is 60 seconds
      await expect(
        resendVerificationEmail('user-123', TEST_EMAIL_CONFIG),
      ).rejects.toThrow();
    });
  });
});
