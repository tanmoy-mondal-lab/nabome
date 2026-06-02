import { supabase } from "./supabase";
import { neon, isNeonConnected } from "./neon";

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.password_reset"
  | "user.profile_update"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "product.view"
  | "order.create"
  | "order.update_status"
  | "order.cancel"
  | "order.return_request"
  | "review.create"
  | "review.update"
  | "review.delete"
  | "vendor.register"
  | "vendor.approve"
  | "vendor.reject"
  | "vendor.suspend"
  | "coupon.create"
  | "coupon.update"
  | "coupon.delete"
  | "banner.create"
  | "banner.update"
  | "banner.delete"
  | "category.create"
  | "category.update"
  | "category.delete"
  | "admin.action"
  | "system.error"
  | "system.warning";

export type AuditLogEntry = {
  action: AuditAction;
  actor_id?: string;
  actor_role?: string;
  target_id?: string;
  target_type?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
};

const LOG_STORAGE_KEY = "nabome-audit-log";
const MAX_LOCAL_LOGS = 200;

function getClientIp(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return (
      (window as any).__CLIENT_IP ||
      sessionStorage.getItem("nabome-ip") ||
      undefined
    );
  } catch {
    return undefined;
  }
}

function getBrowserInfo(): { ip?: string; ua?: string } {
  if (typeof window === "undefined") return {};
  return {
    ua: navigator.userAgent || undefined,
  };
}

export async function logAudit(entry: AuditLogEntry) {
  const { ua } = getBrowserInfo();
  const fullEntry: AuditLogEntry = {
    ...entry,
    ip_address: entry.ip_address || getClientIp(),
    user_agent: entry.user_agent || ua,
    metadata: {
      ...entry.metadata,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
    },
  };

  const logPayload = {
    action: fullEntry.action,
    actor_id: fullEntry.actor_id || null,
    actor_role: fullEntry.actor_role || null,
    target_id: fullEntry.target_id || null,
    target_type: fullEntry.target_type || null,
    metadata: fullEntry.metadata || null,
    ip_address: fullEntry.ip_address || null,
    user_agent: fullEntry.user_agent || null,
  };

  // Persist to Neon if connected
  if (await isNeonConnected()) {
    try {
      await neon.insert("system_logs", logPayload);
      return;
    } catch { /* fall through */ }
  }

  // Fallback to Supabase if connected
  if (supabase) {
    try {
      await supabase.from("system_logs").insert(logPayload);
    } catch { /* fall through */ }
  }

  // Last resort: localStorage
  persistLocal(fullEntry);
}

function persistLocal(entry: AuditLogEntry) {
  try {
    const existing: AuditLogEntry[] = JSON.parse(
      localStorage.getItem(LOG_STORAGE_KEY) || "[]"
    );
    existing.unshift(entry);
    if (existing.length > MAX_LOCAL_LOGS) {
      existing.length = MAX_LOCAL_LOGS;
    }
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    /* storage quota exceeded - silently ignore */
  }
}

export function getLocalAuditLogs(): AuditLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearLocalAuditLogs() {
  localStorage.removeItem(LOG_STORAGE_KEY);
}
