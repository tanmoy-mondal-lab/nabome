import { neon, isNeonConnected } from "../neon";

export interface LogEntry {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): LogEntry {
  return {
    id: row.id as string,
    userId: (row.user_id as string) || undefined,
    action: row.action as string,
    entityType: row.entity_type as string,
    entityId: (row.entity_id as string) || undefined,
    details: row.details ? (typeof row.details === "string" ? JSON.parse(row.details as string) : row.details as Record<string, unknown>) : undefined,
    ipAddress: (row.ip_address as string) || undefined,
    createdAt: row.created_at as string,
  };
}

export async function getLogs(params?: { action?: string; entityType?: string; limit?: number; offset?: number }): Promise<LogEntry[]> {
  if (!(await isNeonConnected())) return [];
  let query = `SELECT * FROM system_logs WHERE 1=1`;
  const values: unknown[] = [];
  let idx = 1;

  if (params?.action) { query += ` AND action = $${idx++}`; values.push(params.action); }
  if (params?.entityType) { query += ` AND entity_type = $${idx++}`; values.push(params.entityType); }
  query += ` ORDER BY created_at DESC`;
  if (params?.limit) { query += ` LIMIT ${params.limit} OFFSET ${params.offset || 0}`; }

  const { data } = await neon.raw(query, values.length > 0 ? values : undefined);
  return ((data as Record<string, unknown>[]) || []).map(mapRow);
}

export async function createLog(entry: Omit<LogEntry, "id" | "createdAt">): Promise<void> {
  if (!(await isNeonConnected())) return;
  await neon.insert("system_logs", {
    user_id: entry.userId || null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId || null,
    details: entry.details ? JSON.stringify(entry.details) : null,
    ip_address: entry.ipAddress || null,
  });
}
