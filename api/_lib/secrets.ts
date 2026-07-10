const PLACEHOLDER_PATTERN = /^(?:YOUR_|your_|\[YOUR_|placeholder|changeme|INSERT_)/i;

const KNOWN_PLACEHOLDERS = new Set([
  "your_value_here",
  "your_key_here",
  "your_secret_here",
  "your_api_key_here",
  "your_database_url_here",
  "change_me",
  "change-me",
  "changeme",
]);

export function cleanSecret(value: unknown): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "";
  if (KNOWN_PLACEHOLDERS.has(trimmed.toLowerCase().replace(/\s+/g, "_"))) return "";
  if (PLACEHOLDER_PATTERN.test(trimmed)) return "";
  return trimmed;
}

export function hasUsableSecret(value: unknown): boolean {
  return cleanSecret(value).length > 0;
}
