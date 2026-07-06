const PLACEHOLDER_PATTERN = /(\.\.\.|YOUR_|ACTUAL|CHANGEME|PLACEHOLDER|\[[A-Z_]+\])/i;

export function usablePublicConfig(value: unknown): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed || PLACEHOLDER_PATTERN.test(trimmed)) return "";
  return trimmed;
}

export const turnstileSiteKey = usablePublicConfig(import.meta.env.VITE_TURNSTILE_SITE_KEY);

export const turnstileEnabled = turnstileSiteKey.length > 0;

export const razorpayKeyId = usablePublicConfig(import.meta.env.VITE_RAZORPAY_KEY_ID);

export const razorpayEnabled = razorpayKeyId.length > 0;

export const gaId = usablePublicConfig(import.meta.env.VITE_GA_ID);

export const gaEnabled = gaId.length > 0;
