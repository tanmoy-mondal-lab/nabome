/**
 * Guest ID Management
 *
 * Generates and manages guest identifiers for guest cart functionality.
 * Guest IDs are stored in cookies and sent to the backend via x-guest-id header.
 * The backend validates guest IDs server-side.
 */

const GUEST_ID_COOKIE = 'nabome_guest_id';
const GUEST_ID_LENGTH = 32;

/**
 * Generate a random guest ID
 */
function generateGuestId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < GUEST_ID_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Read guest ID from cookie
 */
export function getGuestId(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${GUEST_ID_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1] ?? '') : null;
}

/**
 * Set guest ID cookie
 */
export function setGuestId(guestId: string): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 days
  document.cookie = `${GUEST_ID_COOKIE}=${encodeURIComponent(guestId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Get or create guest ID
 * Returns existing guest ID from cookie, or generates a new one
 */
export function getOrCreateGuestId(): string {
  let guestId = getGuestId();
  if (!guestId) {
    guestId = generateGuestId();
    setGuestId(guestId);
  }
  return guestId;
}

/**
 * Clear guest ID cookie (called on login when cart is merged)
 */
export function clearGuestId(): void {
  document.cookie = `${GUEST_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}
