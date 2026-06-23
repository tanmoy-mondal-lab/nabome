// Sanitize empty strings to null for Prisma UUID/ID fields.
// Frontend forms use "" as default for optional fields; Prisma rejects "" for UUID columns.
export const toNull = (v: unknown): string | null =>
  v === "" || v === undefined || v === null ? null : (v as string);

// Map over an object, converting specified keys from "" to null.
export function sanitizeUuids<T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): T {
  const result = { ...obj };
  for (const key of keys) {
    if (key in result) {
      (result as Record<string, unknown>)[key] = toNull(result[key]);
    }
  }
  return result;
}
