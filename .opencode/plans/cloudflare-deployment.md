# Cloudflare Pages Deployment Plan

## Target: Cloudflare Pages Functions
(Chosen over Workers because they natively serve SPAs and support `process.env`)

---

## Phase 1: Replace Node.js Crypto with Web Crypto API

### 1a. `api/_handlers/auth.ts` — `crypto.randomInt`

**Remove** line 6: `import crypto from "crypto";`

**Add** a helper function (after imports, before route dispatch):

```typescript
function generateVerificationCode(): string {
  const buf = new Uint8Array(4);
  crypto.getRandomValues(buf);
  const num = 100000 + ((buf[0]! << 8 | buf[1]!) % 900000);
  return num.toString();
}
```

**Replace** line 107:
```
const verificationToken = crypto.randomInt(100000, 999999).toString();
```
→
```
const verificationToken = generateVerificationCode();
```

**Replace** line 229 (in `handleResendVerification`):
```
const verificationToken = crypto.randomInt(100000, 999999).toString();
```
→
```
const verificationToken = generateVerificationCode();
```

Note: The global `crypto` (Web Crypto) is already available in the scope — no import needed.

---

### 1b. `api/_handlers/payments.ts` — `createHmac` + `Buffer`

#### Replace `createHmac` import + usage

**Line 4** — Replace:
```typescript
import { createHmac } from "crypto";
```
→
```typescript
async function createHMACSHA256(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
```

**Lines 75-77** (in `handleVerify`):
```typescript
const expected = createHmac("sha256", keySecret)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest("hex");
```
→
```typescript
const expected = await createHMACSHA256(keySecret, `${razorpayOrderId}|${razorpayPaymentId}`);
```

**Lines 708-710** (in `handleWebhook`):
```typescript
const expected = createHmac("sha256", webhookSecret)
  .update(rawBody)
  .digest("hex");
```
→
```typescript
const expected = await createHMACSHA256(webhookSecret, rawBody);
```

#### Replace `Buffer.from(...).toString("base64")`

**Line 22** (in `callRazorpay`):
```typescript
Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
```
→
```typescript
Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
```

---

## Phase 2: Make Prisma Work in Cloudflare Workers

### 2a. Install packages

```bash
npm install @prisma/adapter-neon @neondatabase/serverless
```

### 2b. Rewrite `api/_lib/prisma.ts`

Replace the entire file with:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED || "";
}

function createPrismaClient(): PrismaClient {
  const connectionString = getDatabaseUrl();
  const sql = neon(connectionString);
  const adapter = new PrismaNeon(sql);
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

**Why this works**: Neon's WebSocket-based driver replaces Prisma's default TCP connection, which is the only part that doesn't work in Cloudflare Workers. The database URL already points to a Neon endpoint (`ep-*.aws.neon.tech`) in the `.env` file.

### 2c. Verify Prisma schema

The current `prisma/schema.prisma` already has:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres", "postgresqlExtensions"]
}
```

In Prisma 6, driver adapters are GA (no preview feature flag needed). **No schema changes required.**

---

## Phase 3: Create `wrangler.toml`

Create `/Users/tanmoymondal/nabome/wrangler.toml`:

```toml
name = "nabome"
pages_build_output_dir = "dist"
compatibility_date = "2025-06-01"
compatibility_flags = ["nodejs_compat"]

# Bind environment variables from Cloudflare dashboard secrets
# Set via: wrangler pages secret put SUPABASE_URL
#          wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
#          wrangler pages secret put DATABASE_URL
#          wrangler pages secret put RESEND_API_KEY
#          wrangler pages secret put EMAIL_FROM
#          wrangler pages secret put RAZORPAY_KEY_ID
#          wrangler pages secret put RAZORPAY_KEY_SECRET
#          wrangler pages secret put RAZORPAY_WEBHOOK_SECRET
#          wrangler pages secret put ADMIN_EMAILS
```

---

## Phase 4: Update Build Configuration

### 4a. Add `pages:build` script to `package.json`

```json
"pages:build": "prisma generate && tsc -b && vite build"
```

Change existing `"build"` to call the same:
```json
"build": "prisma generate && tsc -b && vite build"
```
(The current `"build"` is `"tsc -b && vite build"` — add `prisma generate` before it.)

### 4b. Deploy commands

```bash
# One-time: set up secrets
wrangler pages secret put SUPABASE_URL
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
wrangler pages secret put DATABASE_URL
wrangler pages secret put RESEND_API_KEY
wrangler pages secret put EMAIL_FROM
wrangler pages secret put RAZORPAY_KEY_ID
wrangler pages secret put RAZORPAY_KEY_SECRET
wrangler pages secret put RAZORPAY_WEBHOOK_SECRET
wrangler pages secret put ADMIN_EMAILS

# Build & deploy
npm run pages:build
wrangler pages deploy dist --branch production
```

### 4c. Add Cloudflare adapter note to `vite.config.ts`

The output already targets `es2020`, which is compatible. No changes to Vite config needed.

---

## Phase 5: Verifying the Fixes

### Expected behavior after changes:

| Issue | Before (Workers) | After |
|-------|------------------|-------|
| `import crypto from "crypto"` | ❌ Module not found | ✅ Removed, uses global Web Crypto |
| `crypto.randomInt()` | ❌ Not a function | ✅ `crypto.getRandomValues()` |
| `createHmac()` | ❌ Module not found | ✅ `crypto.subtle.sign()` with `importKey` |
| `Buffer.from(...)` | ❌ Buffer not defined | ✅ `btoa()` |
| `new PrismaClient()` | ❌ `net` module not found | ✅ WebSocket via Neon adapter |

### Build verification:
```bash
npm run pages:build          # Must succeed
npx tsc --noEmit            # Frontend TS check
npx tsc -p tsconfig.api.json --noEmit  # API TS check
```

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `api/_handlers/auth.ts` | Remove `import crypto`, add `generateVerificationCode()` helper, replace `randomInt` calls |
| `api/_handlers/payments.ts` | Remove `import { createHmac }`, add `createHMACSHA256()` helper, replace all `createHmac` + `Buffer.from` calls |
| `api/_lib/prisma.ts` | Rewrite to use `@prisma/adapter-neon` + `@neondatabase/serverless` |
| `package.json` | Add `@prisma/adapter-neon` + `@neondatabase/serverless` deps, update `build` script |
| `wrangler.toml` | New file — Cloudflare Pages config |
