/**
 * Locale/currency formatting for Indian e-commerce display (en-IN, INR).
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md B.7 (locale en-IN, bn-IN, hi-IN).
 */

export function formatINR(
  amount: number | string,
  options?: { maximumFractionDigits?: number },
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

export function formatNumber(value: number, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(
  value: string | number | Date,
  locale = 'en-IN',
): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(
  value: string | number | Date,
  locale = 'en-IN',
): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatRelativeTime(
  value: string | number | Date,
  locale = 'en-IN',
): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const deltaMs = new Date(value).getTime() - Date.now();
  const absSec = Math.abs(deltaMs) / 1000;

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, seconds] of units) {
    if (absSec >= seconds) {
      return formatter.format(Math.round(deltaMs / (seconds * 1000)), unit);
    }
  }
  return formatter.format(Math.round(deltaMs / 1000), 'second');
}

/** Convert INR major units to paise (gateway boundary, B.7). */
export function inrToPaise(amount: number | string): number {
  return Math.round(
    (typeof amount === 'string' ? Number(amount) : amount) * 100,
  );
}

/** Convert paise back to INR major units (gateway boundary, B.7). */
export function paiseToInr(paise: number): number {
  return paise / 100;
}
