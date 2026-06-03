# NABOME Secret Exposure Audit Report

**Date:** June 3, 2026  
**Project:** NABOME - Premium Bengali Streetwear E-commerce Platform  
**Audit Type:** Complete Secret Exposure & Security Audit

---

## EXECUTIVE SUMMARY

This audit identified **CRITICAL security vulnerabilities** in the NABOME codebase where sensitive API keys, credentials, and secrets are exposed in the frontend code or misconfigured in server-side API routes.

**Critical Issues Found:** 5  
**High Severity Issues:** 3  
**Medium Severity Issues:** 4  
**Low Severity Issues:** 3

**Overall Risk Level:** 🔴 **CRITICAL**

---

## CRITICAL SEVERITY ISSUES

### 1. Brevo API Key Exposed in Frontend

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/email.ts` |
| **Line** | 8 |
| **Exposed Secret** | `VITE_BREVO_API_KEY` |
| **Secret Type** | Brevo (Sendinblue) API Key |
| **Severity** | 🔴 CRITICAL |
| **Current Usage** | Used for sending transactional emails and WhatsApp messages |

**Code:**
```typescript
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY as string | undefined;
```

**Risk:** The Brevo API key is exposed in the frontend bundle. Anyone can extract it from the browser and use it to send emails on your behalf, potentially for phishing or spam campaigns.

**Exact Fix:**
1. Move Brevo API operations to server-side API route
2. Create `/api/send-email.mjs` with `process.env.BREVO_API_KEY`
3. Update frontend to call `/api/send-email` instead of direct API calls
4. Remove `VITE_BREVO_API_KEY` from frontend environment variables

**Implementation Steps:**
```javascript
// Create /api/send-email.mjs
const BREVO_API_KEY = process.env.BREVO_API_KEY; // Server-side only

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!BREVO_API_KEY) return res.status(500).json({ error: 'Email service not configured' });
  
  const { to, subject, htmlContent } = req.body;
  
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: { name: 'নবME', email: 'hello@nabome.online' }, to: [{ email: to }], subject, htmlContent }),
  });
  
  return res.status(response.ok ? 200 : 500).json({ success: response.ok });
}
```

---

### 2. Cloudinary Upload Preset Exposed in Frontend

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/cloudinary.tsx` |
| **Line** | 2 |
| **Exposed Secret** | `VITE_CLOUDINARY_UPLOAD_PRESET` |
| **Secret Type** | Cloudinary Upload Preset (unsigned) |
| **Severity** | 🔴 CRITICAL |
| **Current Usage** | Used for uploading product images, vendor logos, banners |

**Code:**
```typescript
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
```

**Risk:** The upload preset allows anyone to upload images to your Cloudinary account. Attackers could upload malicious content, fill your storage quota, or replace legitimate images.

**Exact Fix:**
1. Move Cloudinary upload to server-side API route
2. Create `/api/cloudinary-upload.mjs` with `process.env.CLOUDINARY_API_SECRET`
3. Use signed uploads instead of unsigned presets
4. Update frontend to call `/api/cloudinary-upload`
5. Remove `VITE_CLOUDINARY_UPLOAD_PRESET` from frontend

**Implementation Steps:**
```javascript
// Create /api/cloudinary-upload.mjs
import crypto from 'crypto';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

function generateSignature(params, timestamp) {
  const toSign = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&') + `&timestamp=${timestamp}`;
  return crypto.createHash('sha1').update(toSign).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { file, folder } = req.body;
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    folder,
    timestamp,
    upload_preset: 'unsigned_preset', // or use signed upload
  };
  
  const signature = generateSignature(params, timestamp);
  
  return res.status(200).json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    signature,
    params,
  });
}
```

---

### 3. Supabase Anon Key Used as Service Role Key (Server-Side)

| Field | Value |
|-------|-------|
| **File Path** | `/api/register-user.mjs`, `/api/send-otp.mjs`, `/api/verify-otp.mjs`, `/api/reset-password.mjs` |
| **Line** | 4 (in all files) |
| **Exposed Secret** | `process.env.VITE_SUPABASE_ANON_KEY` used as `SERVICE_KEY` |
| **Secret Type** | Supabase Service Role Key (incorrectly using anon key) |
| **Severity** | 🔴 CRITICAL |
| **Current Usage** | Used for admin operations like creating users, managing OTPs |

**Code:**
```javascript
const SERVICE_KEY = process.env.VITE_SUPABASE_ANON_KEY; // WRONG!
```

**Risk:** The anon key has limited permissions and is meant for frontend use. Using it as a service role key in server-side admin operations is incorrect and may fail or expose security vulnerabilities. The actual service role key should be used for admin operations.

**Exact Fix:**
1. Add `SUPABASE_SERVICE_ROLE_KEY` to server environment variables
2. Update all API routes to use `process.env.SUPABASE_SERVICE_ROLE_KEY`
3. Remove usage of `VITE_SUPABASE_ANON_KEY` from server-side code

**Implementation Steps:**
```javascript
// Update all API routes:
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Correct!
```

**Files to Update:**
- `/api/register-user.mjs`
- `/api/send-otp.mjs`
- `/api/verify-otp.mjs`
- `/api/reset-password.mjs`

---

### 4. Brevo API Key Missing in Server-Side OTP Route

| Field | Value |
|-------|-------|
| **File Path** | `/api/send-otp.mjs` |
| **Line** | 57 |
| **Exposed Secret** | `BREVO_API_KEY` referenced but not defined |
| **Secret Type** | Brevo API Key |
| **Severity** | 🔴 CRITICAL |
| **Current Usage** | Referenced in OTP sending but not loaded from environment |

**Code:**
```javascript
if (!BREVO_API_KEY) {
  return res.status(200).json({ success: true, message: 'OTP stored (email sending not configured)' });
}
```

**Risk:** The variable `BREVO_API_KEY` is used but never defined in the file. This will cause OTP sending to fail silently.

**Exact Fix:**
```javascript
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'hello@nabome.online';
```

---

### 5. Brevo API Key Missing in Server-Side Email Route

| Field | Value |
|-------|-------|
| **File Path** | `/api/send-otp.mjs` |
| **Line** | 63, 101 |
| **Exposed Secret** | `BREVO_API_KEY` used in fetch headers |
| **Secret Type** | Brevo API Key |
| **Severity** | 🔴 CRITICAL |
| **Current Usage** | Used for sending OTP via email and WhatsApp |

**Code:**
```javascript
headers: { 'api-key': BREVO_API_KEY || '', 'Content-Type': 'application/json' },
```

**Risk:** Same as issue #4 - the variable is not defined, causing API calls to fail.

**Exact Fix:** Same as issue #4 - add the environment variable definition.

---

## HIGH SEVERITY ISSUES

### 6. Hardcoded Phone Number in Multiple Files

| Field | Value |
|-------|-------|
| **File Paths** | `/src/lib/email.ts`, `/api/send-otp.mjs`, `/src/lib/mockAdminData.ts`, `/src/lib/mockAccountData.ts`, `/src/lib/mockVendorData.ts`, `/src/pages/SupportCenter.tsx` |
| **Exposed Secret** | `+919163854706` |
| **Secret Type** | Phone Number |
| **Severity** | 🟠 HIGH |
| **Current Usage** | WhatsApp sender, contact number, mock data |

**Risk:** Personal phone number exposed in frontend code and mock data. This could lead to harassment or spam.

**Exact Fix:**
1. Replace hardcoded phone with environment variable `CONTACT_PHONE`
2. Update all references to use the environment variable
3. Remove from mock data files or use placeholder values

**Files to Update:**
- `/src/lib/email.ts:327`
- `/api/send-otp.mjs:5`
- `/src/lib/mockAdminData.ts:85,233`
- `/src/lib/mockAccountData.ts:130,140,149`
- `/src/lib/mockVendorData.ts:16`
- `/src/pages/SupportCenter.tsx:185,187`

---

### 7. Hardcoded Email Address

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/email.ts` |
| **Line** | 7 |
| **Exposed Secret** | `nabome.official@gmail.com` |
| **Secret Type** | Email Address |
| **Severity** | 🟠 HIGH |
| **Current Usage** | Default sender email for Brevo |

**Code:**
```typescript
const SENDER_EMAIL = import.meta.env.VITE_BREVO_SENDER_EMAIL || "nabome.official@gmail.com";
```

**Risk:** Personal Gmail address exposed as fallback. Should use domain email.

**Exact Fix:**
```typescript
const SENDER_EMAIL = import.meta.env.VITE_BREVO_SENDER_EMAIL || "hello@nabome.online";
```

---

### 8. Neon Database URL Exposed in Frontend (Potential)

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/neon.ts` |
| **Line** | N/A (not directly exposed, but pattern exists) |
| **Exposed Secret** | Potential `VITE_NEON_DATABASE_URL` exposure |
| **Secret Type** | Database Connection String |
| **Severity** | 🟠 HIGH |
| **Current Usage** | Neon client communicates via `/api/neon-query` |

**Risk:** While the Neon client uses an API route, if `VITE_NEON_DATABASE_URL` is ever added to frontend, it would expose database credentials.

**Exact Fix:**
1. Ensure `VITE_NEON_DATABASE_URL` is NEVER used in frontend code
2. Use only `process.env.VITE_NEON_DATABASE_URL` in server-side API routes
3. Add `.env` to `.gitignore` (already done)

---

## MEDIUM SEVERITY ISSUES

### 9. Supabase Anon Key in Frontend

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/supabase.ts` |
| **Line** | 4, 7 |
| **Exposed Secret** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| **Secret Type** | Supabase Project URL and Anon Key |
| **Severity** | 🟡 MEDIUM |
| **Current Usage** | Supabase client initialization |

**Code:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**Risk:** The anon key is designed to be exposed in frontend for Supabase, but it should be verified that RLS policies are properly configured to restrict access. This is acceptable per Supabase best practices, but requires verification.

**Exact Fix:**
1. Verify RLS policies are properly configured on all tables
2. Ensure anon key has only necessary permissions
3. Document that this is intentional per Supabase architecture

---

### 10. Cloudinary Cloud Name in Frontend

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/cloudinary.tsx`, `/src/lib/performance.ts` |
| **Line** | 1, 12 |
| **Exposed Secret** | `VITE_CLOUDINARY_CLOUD_NAME` |
| **Secret Type** | Cloudinary Cloud Name |
| **Severity** | 🟡 MEDIUM |
| **Current Usage** | Cloudinary URL generation and optimization |

**Code:**
```typescript
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
```

**Risk:** Cloud name is a public identifier and is safe to expose, but should be verified that no other Cloudinary secrets are exposed.

**Exact Fix:**
1. Verify no API secret or API key is exposed
2. Ensure all uploads go through server-side route (see issue #2)

---

### 11. Admin Email in Frontend

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/db.ts`, `/src/pages/Checkout.tsx` |
| **Line** | 743, 801, 804, 807, 811, 816, 183 |
| **Exposed Secret** | `VITE_ADMIN_EMAIL` |
| **Secret Type** | Admin Email Address |
| **Severity** | 🟡 MEDIUM |
| **Current Usage** | Admin role verification, email notifications |

**Risk:** Admin email exposed in frontend could be targeted for phishing attacks.

**Exact Fix:**
1. Move admin role verification to server-side
2. Create `/api/verify-admin.mjs` endpoint
3. Remove `VITE_ADMIN_EMAIL` from frontend

---

### 12. WhatsApp Sender in Frontend

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/email.ts` |
| **Line** | 327 |
| **Exposed Secret** | `VITE_WHATSAPP_SENDER` |
| **Secret Type** | WhatsApp Sender Number |
| **Severity** | 🟡 MEDIUM |
| **Current Usage** | WhatsApp message sending |

**Code:**
```typescript
const senderNumber = import.meta.env.VITE_WHATSAPP_SENDER || "+919163854706";
```

**Risk:** Phone number exposed, could receive spam calls.

**Exact Fix:**
1. Move WhatsApp sending to server-side (see issue #1)
2. Remove from frontend environment variables

---

## LOW SEVERITY ISSUES

### 13. Google Analytics ID in Frontend

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/analytics.ts`, `/index.html` |
| **Line** | 1, 41, 46 |
| **Exposed Secret** | `VITE_GA_ID` |
| **Secret Type** | Google Analytics Measurement ID |
| **Severity** | 🟢 LOW |
| **Current Usage** | Analytics tracking |

**Risk:** GA ID is designed to be public. No security risk.

**Exact Fix:** None required - this is intentional.

---

### 14. Brevo Sender Email in Frontend

| Field | Value |
|-------|-------|
| **File Path** | `/src/lib/email.ts` |
| **Line** | 7 |
| **Exposed Secret** | `VITE_BREVO_SENDER_EMAIL` |
| **Secret Type** | Email Address |
| **Severity** | 🟢 LOW |
| **Current Usage** | Email sender address |

**Risk:** Email address is public contact info. Minimal risk.

**Exact Fix:** None required, but consider using domain email instead of personal Gmail.

---

### 15. Site URL in Server-Side

| Field | Value |
|-------|-------|
| **File Path** | `/api/sitemap.mjs` |
| **Line** | 7 |
| **Exposed Secret** | `VITE_SITE_URL` |
| **Secret Type** | Site URL |
| **Severity** | 🟢 LOW |
| **Current Usage** | Sitemap generation |

**Risk:** Site URL is public. No security risk.

**Exact Fix:** None required.

---

## RECOMMENDED ENVIRONMENT VARIABLES

### Frontend (VITE_ - Safe to Expose)
```bash
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_GA_ID=G-XXXXXXXXXX
VITE_SITE_URL=https://nabome.online
```

### Server-Side (process.env - Never Exposed)
```bash
# Database
VITE_NEON_DATABASE_URL=postgresql://user:pass@host/db
SUPABASE_URL=your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brevo (Sendinblue)
BREVO_API_KEY=xkeysib-xxxxx
BREVO_SENDER_EMAIL=hello@nabome.online

# WhatsApp
WHATSAPP_SENDER=+919163854706

# Admin
ADMIN_EMAIL=admin@nabome.online

# Contact
CONTACT_PHONE=+919163854706
CONTACT_EMAIL=support@nabome.online
```

---

## IMMEDIATE ACTION PLAN

### Phase 1: Critical Fixes (Do Immediately)

1. **Move Brevo API to server-side** (2 hours)
   - Create `/api/send-email.mjs`
   - Create `/api/send-whatsapp.mjs`
   - Update `/src/lib/email.ts` to use API routes
   - Remove `VITE_BREVO_API_KEY` from frontend

2. **Move Cloudinary upload to server-side** (2 hours)
   - Create `/api/cloudinary-upload.mjs`
   - Update `/src/lib/cloudinary.tsx` to use API route
   - Remove `VITE_CLOUDINARY_UPLOAD_PRESET` from frontend

3. **Fix Supabase service role key** (1 hour)
   - Add `SUPABASE_SERVICE_ROLE_KEY` to server environment
   - Update all API routes to use service role key
   - Remove `VITE_SUPABASE_ANON_KEY` from server-side code

4. **Fix missing Brevo API key in OTP route** (30 minutes)
   - Add `BREVO_API_KEY` to `/api/send-otp.mjs`
   - Add `BREVO_SENDER_EMAIL` to `/api/send-otp.mjs`

### Phase 2: High Priority Fixes (Do Within 24 Hours)

5. **Replace hardcoded phone number** (1 hour)
   - Add `CONTACT_PHONE` to environment variables
   - Update all file references
   - Update mock data to use placeholders

6. **Replace hardcoded email** (30 minutes)
   - Update fallback email to domain email
   - Remove personal Gmail references

### Phase 3: Medium Priority Fixes (Do Within 1 Week)

7. **Move admin verification to server-side** (2 hours)
   - Create `/api/verify-admin.mjs`
   - Remove `VITE_ADMIN_EMAIL` from frontend

8. **Move WhatsApp to server-side** (1 hour)
   - Already covered in Phase 1 with Brevo API fix

9. **Verify RLS policies** (2 hours)
   - Audit all Supabase RLS policies
   - Ensure anon key has minimal permissions

---

## SECURITY BEST PRACTICES

### 1. Environment Variable Naming
- Use `VITE_*` prefix for frontend-only variables
- Use regular names for server-side variables
- Never use `VITE_*` for secrets

### 2. API Route Security
- All API routes should validate requests
- Use rate limiting on sensitive endpoints
- Implement CORS properly
- Never expose service role keys

### 3. Frontend Security
- Assume all frontend code is public
- Never store secrets in localStorage
- Use HTTPS for all API calls
- Implement CSP headers

### 4. Database Security
- Use RLS policies on Supabase
- Never expose database connection strings
- Use connection pooling
- Implement query parameterization

---

## VERIFICATION CHECKLIST

After implementing fixes, verify:

- [ ] No API keys in frontend bundle (check dist/assets/*.js)
- [ ] All API routes use server-side environment variables
- [ ] No hardcoded credentials in source code
- [ ] Service role key used for admin operations
- [ ] RLS policies verified on Supabase
- [ ] Cloudinary uploads use signed URLs
- [ ] Brevo API calls go through server
- [ ] Admin verification moved to server
- [ ] Mock data uses placeholder values
- [ ] Environment variables documented

---

## CONCLUSION

The NABOME application has **5 CRITICAL security vulnerabilities** that must be fixed immediately before production deployment. The most severe issues are:

1. Brevo API key exposed in frontend
2. Cloudinary upload preset exposed in frontend
3. Supabase anon key incorrectly used as service role key
4. Missing Brevo API key in server-side OTP route
5. Brevo API key referenced but not defined in server code

These vulnerabilities could lead to:
- Unauthorized email sending
- Unauthorized image uploads
- Database access issues
- OTP sending failures
- Potential account takeover

**Estimated Time to Fix:** 6-8 hours for critical issues

**Recommendation:** Fix all CRITICAL and HIGH severity issues immediately before any production deployment or beta testing with real users.

---

**Audit Completed By:** Cascade AI Assistant  
**Audit Date:** June 3, 2026  
**Next Review:** After critical fixes implemented
