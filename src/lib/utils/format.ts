const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  notation: "compact",
});

/**
 * Formats a numeric amount as Indian Rupee (INR) currency string.
 * @param amount - Numeric value, string number, or object with toString()
 * @returns Formatted currency string (e.g., "₹1,234")
 */
export function formatPrice(amount: number | string | { toString(): string }): string {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return "₹0";
  return currencyFormatter.format(num);
}

/**
 * Formats a numeric amount as compact Indian Rupee (INR) string.
 * @param amount - Numeric value or string number
 * @returns Compact currency string (e.g., "₹1.2K")
 */
export function formatCompactPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return compactCurrencyFormatter.format(num);
}

/**
 * Formats a date as a readable Indian locale date string.
 * @param date - Date object, ISO string, or null
 * @returns Formatted date string (e.g., "Jul 15, 2026") or "—" for null
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date as a readable Indian locale date-time string.
 * @param date - Date object, ISO string, or null
 * @returns Formatted date-time string (e.g., "Jul 15, 2026, 02:30 PM") or "—" for null
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const prefix = "NB";
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trimEnd() + "…";
}
