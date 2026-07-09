import { PrismaClient } from "@prisma/client";
import type { Env } from "./env";
/**
 * Get a Prisma client instance.
 *
 * IMPORTANT: This must be called with `env` parameter in Cloudflare Pages Functions.
 * The env is injected at request time, not module load time.
 *
 * In production (Cloudflare Pages), we reuse a singleton per isolate to avoid
 * creating a new connection pool on every request. Cloudflare Pages Functions
 * run on isolates that persist between requests, so this is safe and avoids
 * exhausting Neon connection limits.
 *
 * @param env - Cloudflare Pages environment (required in production)
 * @returns PrismaClient instance
 */
export declare function getPrisma(env?: Env): PrismaClient;
