/**
 * Slug generation matching the canonical slug rules (lowercase, hyphens,
 * ASCII + Bengali-safe fallback).
 */

const BENGALI_VOWEL_MAP: Record<string, string> = {
  অ: 'o',
  আ: 'a',
  ই: 'i',
  ঈ: 'i',
  উ: 'u',
  ঊ: 'u',
  ঋ: 'ri',
  এ: 'e',
  ঐ: 'oi',
  ও: 'o',
  ঔ: 'ou',
  // Dependent vowel signs (আ-কার, ই-কার, …) — part of the partial table;
  // the full transliteration table (consonants) ships with i18n work.
  'া': 'a',
  'ি': 'i',
  'ী': 'i',
  'ু': 'u',
  'ূ': 'u',
  'ৃ': 'ri',
  'ে': 'e',
  'ৈ': 'oi',
  'ো': 'o',
  'ৌ': 'ou',
};

export function slugify(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/['"‘’“”]/g, '')
    .replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

  let ascii = '';
  for (const char of normalized) {
    ascii += BENGALI_VOWEL_MAP[char] ?? char;
  }

  return ascii
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
