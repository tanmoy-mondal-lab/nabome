const PLACEHOLDER_PATTERN = /(\.\.\.|YOUR_|ACTUAL|CHANGEME|PLACEHOLDER|\[[A-Z_]+\])/i;

export function cleanSecret(value: unknown): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed || PLACEHOLDER_PATTERN.test(trimmed)) return "";
  return trimmed;
}

export function hasUsableSecret(value: unknown): boolean {
  return cleanSecret(value).length > 0;
}
