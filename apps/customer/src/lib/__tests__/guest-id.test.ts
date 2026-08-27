import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  getGuestId,
  setGuestId,
  clearGuestId,
  getOrCreateGuestId,
} from '../guest-id';

describe('Guest ID Management', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  afterEach(() => {
    // Clean up after each test
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  describe('getGuestId', () => {
    it('should return null when no guest ID cookie exists', () => {
      const result = getGuestId();
      expect(result).toBeNull();
    });

    it('should return the guest ID when cookie exists', () => {
      setGuestId('test-guest-id-123');
      const result = getGuestId();
      expect(result).toBe('test-guest-id-123');
    });
  });

  describe('setGuestId', () => {
    it('should set the guest ID cookie', () => {
      setGuestId('new-guest-id');
      const result = getGuestId();
      expect(result).toBe('new-guest-id');
    });

    it('should overwrite existing guest ID', () => {
      setGuestId('old-guest-id');
      setGuestId('new-guest-id');
      const result = getGuestId();
      expect(result).toBe('new-guest-id');
    });
  });

  describe('clearGuestId', () => {
    it('should remove the guest ID cookie', () => {
      setGuestId('test-guest-id');
      clearGuestId();
      const result = getGuestId();
      expect(result).toBeNull();
    });

    it('should handle clearing when no guest ID exists', () => {
      expect(() => clearGuestId()).not.toThrow();
    });
  });

  describe('getOrCreateGuestId', () => {
    it('should create a new guest ID when none exists', () => {
      const result = getOrCreateGuestId();
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return existing guest ID when one exists', () => {
      setGuestId('existing-guest-id');
      const result = getOrCreateGuestId();
      expect(result).toBe('existing-guest-id');
    });

    it('should persist the created guest ID in a cookie', () => {
      const result = getOrCreateGuestId();
      const retrieved = getGuestId();
      expect(retrieved).toBe(result);
    });
  });
});
