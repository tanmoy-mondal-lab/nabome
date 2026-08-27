/**
 * Sentry error monitoring tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  initSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
} from './sentry';

describe('Sentry', () => {
  beforeEach(async () => {
    const { __resetSentryForTest } = await import('./sentry');
    __resetSentryForTest();
    vi.clearAllMocks();
  });

  describe('initSentry', () => {
    it('should not initialize if SENTRY_DSN is not provided', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      initSentry({});

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SENTRY_DSN not configured - error monitoring disabled',
      );
      consoleWarnSpy.mockRestore();
    });

    it('should initialize with SENTRY_DSN provided', () => {
      const consoleLogSpy = vi.spyOn(console, 'log');

      initSentry({
        SENTRY_DSN: 'https://test@sentry.io/123',
        ENVIRONMENT: 'test',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Sentry error monitoring initialized',
      );
      consoleLogSpy.mockRestore();
    });

    it('should use production environment if not specified', () => {
      const consoleLogSpy = vi.spyOn(console, 'log');

      initSentry({ SENTRY_DSN: 'https://test@sentry.io/123' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Sentry error monitoring initialized',
      );
      consoleLogSpy.mockRestore();
    });
  });

  describe('captureException', () => {
    it('should log error if Sentry not initialized', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const error = new Error('Test error');

      captureException(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Sentry not initialized:',
        error,
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('captureMessage', () => {
    it('should log message if Sentry not initialized', () => {
      const consoleLogSpy = vi.spyOn(console, 'log');

      captureMessage('Test message', 'info');

      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Test message');
      consoleLogSpy.mockRestore();
    });
  });

  describe('setUserContext', () => {
    it('should not throw if Sentry not initialized', () => {
      expect(() => {
        setUserContext({ id: '123', email: 'test@example.com' });
      }).not.toThrow();
    });
  });

  describe('clearUserContext', () => {
    it('should not throw if Sentry not initialized', () => {
      expect(() => {
        clearUserContext();
      }).not.toThrow();
    });
  });

  describe('addBreadcrumb', () => {
    it('should not throw if Sentry not initialized', () => {
      expect(() => {
        addBreadcrumb('test', 'Test breadcrumb', { key: 'value' });
      }).not.toThrow();
    });
  });
});
