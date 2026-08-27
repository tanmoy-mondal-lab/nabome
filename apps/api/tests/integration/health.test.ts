/**
 * Integration test — health & meta endpoints against a live worker bundle.
 *
 * Requires: local Postgres (infra/docker-compose.yml or brew) and the API dev
 * server running (`pnpm dev:api`). When either is unavailable the suite skips
 * cleanly instead of failing.
 */
import { afterAll, describe, expect, it } from 'vitest';

import { dbAvailable, disconnectDb } from './helpers/db.ts';

async function apiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:8788/api/v1/health');
    return res.status === 200;
  } catch {
    return false;
  }
}

const dbUp = await dbAvailable();
const apiUp = await apiAvailable();

afterAll(() => disconnectDb());

describe.skipIf(!dbUp || !apiUp)('health & meta endpoints', () => {
  it('responds with the envelope shape', async () => {
    const res = await fetch('http://localhost:8788/api/v1/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { status: string } | null;
      error: { code: string } | null;
      meta: { requestId: string; version: string };
    };
    expect(body.success).toBe(true);
    expect(body.data?.status).toBe('ok');
    expect(body.error).toBeNull();
    expect(body.meta.requestId).toBeTruthy();
    expect(body.meta.version).toBe('v1');
    expect(res.headers.get('x-request-id')).toBe(body.meta.requestId);
  });

  it('reports registered routes at meta/routes', async () => {
    const res = await fetch('http://localhost:8788/api/v1/meta/routes');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { routes: string[] };
    };
    expect(body.success).toBe(true);
    expect(body.data.routes).toContain('GET health');
  });

  it('returns a 404 envelope for unknown routes', async () => {
    const res = await fetch('http://localhost:8788/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    const body = (await res.json()) as {
      success: boolean;
      error: { code: string };
    };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
