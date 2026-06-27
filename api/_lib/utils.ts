// ─────────────────────────────────────────────────────────────
// SHARED UTILS — API layer
// Avoids cross-layer imports from frontend code
// ─────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from text.
 * Supports Latin + Devanagari (Bengali) characters.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Keep Latin word chars, Devanagari/Bengali chars, spaces, hyphens
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a unique slug by appending a short random suffix.
 */
export function uniqueSlug(text: string): string {
  const base = slugify(text);
  if (base) return base;
  return `item-${Date.now().toString(36)}`;
}

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: ["refunded"],
  refunded: [],
};

/**
 * Parse request body safely, returning null on failure.
 */
export async function parseBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
