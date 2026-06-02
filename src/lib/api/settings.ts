import { neon, isNeonConnected } from "../neon";

export interface SiteSetting {
  key: string;
  value: string;
  group?: string;
  description?: string;
  updatedAt?: string;
}

function mapRow(row: Record<string, unknown>): SiteSetting {
  return {
    key: row.key as string,
    value: row.value as string,
    group: (row.group as string) || undefined,
    description: (row.description as string) || undefined,
    updatedAt: row.updated_at as string || undefined,
  };
}

export async function getSettings(group?: string): Promise<SiteSetting[]> {
  if (!(await isNeonConnected())) return [];
  const filter: Record<string, unknown> = {};
  if (group) filter.group = group;
  const { data } = await neon.select("site_settings", filter, { order: "key", ascending: true });
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function getSetting(key: string): Promise<string | null> {
  if (!(await isNeonConnected())) return null;
  const { data } = await neon.select("site_settings", { key }, { limit: 1 });
  const rows = data as Record<string, unknown>[];
  return rows?.[0]?.value as string || null;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.raw(
    `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value],
  );
}
