type RateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
};

type AttemptRecord = {
  count: number;
  firstAttempt: number;
};

const STORAGE_KEY = "nabome-rate-limits";
const DEFAULTS: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  reviewSubmission: { maxAttempts: 10, windowMs: 60 * 60 * 1000 },
  productUpload: { maxAttempts: 20, windowMs: 60 * 60 * 1000 },
  contactForm: { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
  search: { maxAttempts: 60, windowMs: 60 * 1000 },
};

function loadRecords(): Record<string, Record<string, AttemptRecord>> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRecords(records: Record<string, Record<string, AttemptRecord>>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* silently fail */
  }
}

function getKey(identifier: string): string {
  const hash = identifier.split("").reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return String(hash);
}

export function checkRateLimit(
  action: keyof typeof DEFAULTS,
  identifier: string
): { allowed: boolean; remaining: number; resetInMs: number } {
  const config = DEFAULTS[action];
  if (!config) return { allowed: true, remaining: Infinity, resetInMs: 0 };

  const key = getKey(identifier);
  const records = loadRecords();
  const actionRecords = records[action] || {};
  const now = Date.now();
  const record = actionRecords[key];

  if (!record) {
    actionRecords[key] = { count: 1, firstAttempt: now };
    records[action] = actionRecords;
    saveRecords(records);
    return { allowed: true, remaining: config.maxAttempts - 1, resetInMs: config.windowMs };
  }

  if (now - record.firstAttempt > config.windowMs) {
    actionRecords[key] = { count: 1, firstAttempt: now };
    records[action] = actionRecords;
    saveRecords(records);
    return { allowed: true, remaining: config.maxAttempts - 1, resetInMs: config.windowMs };
  }

  const allowed = record.count < config.maxAttempts;
  const remaining = Math.max(0, config.maxAttempts - record.count);
  const resetInMs = Math.max(0, config.windowMs - (now - record.firstAttempt));

  if (allowed) {
    actionRecords[key] = { ...record, count: record.count + 1 };
    records[action] = actionRecords;
    saveRecords(records);
  }

  return { allowed, remaining, resetInMs };
}

export function resetRateLimit(action: string, identifier: string) {
  const key = getKey(identifier);
  const records = loadRecords();
  if (records[action]) {
    delete records[action][key];
    saveRecords(records);
  }
}

export function getRateLimitConfig(action: keyof typeof DEFAULTS): RateLimitConfig {
  return DEFAULTS[action];
}
