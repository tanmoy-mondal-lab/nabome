# Secret Rotation Guide - CRITICAL SECURITY ISSUE

## 🚨 CRITICAL: Production Secrets Exposed

**Severity: CVSS 10.0 (Critical)**

### Current Issues Found:
1. **Local `.env` file contains real production secrets**
2. **Git history contains secrets in `.env.example`** (commits 7eeb255, 9c967ed)
3. **Database password exposed**: `npg_VoS3k7eRvHuF`
4. **Cloudinary API secret exposed**: `T0uOlg44yhqijJTYHU3ADADyLtk`
5. **Razorpay key secret exposed**: `uRfrWxCokvIZhgoe2eW3UBWo`
6. **Supabase service role key exposed**

## Immediate Actions Required

### Step 1: Rotate All Secrets (Do This Immediately)

#### 1.1 Database Password (Neon PostgreSQL)
- Go to Neon Dashboard → Project → Settings → Reset Password
- Generate new strong password
- Update Cloudflare Pages secrets: `DATABASE_URL`, `DATABASE_URL_POOLED`
- Update local `.env` file (DO NOT commit)

#### 1.2 Cloudinary Credentials
- Go to Cloudinary Dashboard → Settings → Security → API Keys
- Regenerate API Secret
- Update Cloudflare Pages secrets: `CLOUDINARY_API_SECRET`
- Update local `.env` file (DO NOT commit)

#### 1.3 Razorpay Keys
- Go to Razorpay Dashboard → Settings → API Keys
- Regenerate Key Secret
- Update Cloudflare Pages secrets: `RAZORPAY_KEY_SECRET`
- Update webhook secret if needed: `RAZORPAY_WEBHOOK_SECRET`
- Update local `.env` file (DO NOT commit)

#### 1.4 Supabase Service Role Key
- Go to Supabase Dashboard → Project Settings → API
- Regenerate service_role key
- Update Cloudflare Pages secrets: `SUPABASE_SERVICE_ROLE_KEY`
- Update local `.env` file (DO NOT commit)

### Step 2: Clean Git History

```bash
# Remove secrets from git history using BFG or git filter-repo
# WARNING: This rewrites history - coordinate with team

# Option 1: Using BFG Repo-Cleaner
brew install bfg
bfg --replace-text passwords.txt  # Create passwords.txt with the secrets
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option 2: Using git-filter-repo (recommended)
pip install git-filter-repo
git filter-repo --invert-paths --path .env.example
```

### Step 3: Verify No Secrets Remain

```bash
# Scan for secrets in git history
git log --all --full-history -S "npg_VoS3k7eRvHuF" --oneline
git log --all --full-history -S "T0uOlg44yhqijJTYHU3ADADyLtk" --oneline
git log --all --full-history -S "uRfrWxCokvIZhgoe2eW3UBWo" --oneline

# Scan current files
grep -r "npg_VoS3k7eRvHuF" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "T0uOlg44yhqijJTYHU3ADADyLtk" . --exclude-dir=node_modules --exclude-dir=.git
```

### Step 4: Update Cloudflare Pages Secrets

Use the provided script or manually update in Cloudflare Dashboard:

```bash
# Using the update script
npx tsx scripts/update-razorpay-secrets.ts

# Or manually via Cloudflare Dashboard:
# Project → Settings → Environment Variables → Add/Update
```

Required secrets to set in Cloudflare Pages:
- `DATABASE_URL`
- `DATABASE_URL_POOLED`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `TURNSTILE_SECRET_KEY`
- `SITE_URL`

### Step 5: Force Push Cleaned History

```bash
# After cleaning history, force push
git push origin main --force
git push origin production --force

# Notify all team members to re-clone repository
```

## Prevention Measures

### 1. Add Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Prevent committing secrets
if git diff --cached --name-only | xargs grep -l "DATABASE_URL\|SECRET\|PASSWORD\|TOKEN" | grep -v node_modules; then
  echo "ERROR: Attempting to commit secrets!"
  exit 1
fi
```

### 2. Add .env to .gitignore (Already done)

Verify `.gitignore` contains:
```
.env
.env.local
.env.*.local
```

### 3. Use Secret Scanning

Install and configure:
```bash
npm install -g trufflehog
trufflehog git . --json
```

### 4. Regular Rotation Schedule

- **Database passwords**: Every 90 days
- **API keys**: Every 180 days
- **Webhook secrets**: Immediately after suspected exposure

## Verification Checklist

- [ ] All secrets rotated in respective dashboards
- [ ] Cloudflare Pages secrets updated
- [ ] Local `.env` file cleaned (no real secrets)
- [ ] Git history cleaned of secrets
- [ ] Force pushed to all branches
- [ ] Team notified to re-clone
- [ ] Pre-commit hook installed
- [ ] Secret scanning configured
- [ ] Production deployment tested
- [ ] All services functioning with new secrets

## Emergency Contacts

If you suspect ongoing unauthorized access:
1. Immediately disable all API keys
2. Revoke all active sessions
3. Rotate all credentials
4. Review audit logs
5. Contact Cloudflare, Neon, Supabase, Razorpay support

## Timeline Estimate

- Secret rotation: 2-3 hours
- Git history cleanup: 1-2 hours
- Verification: 1 hour
- **Total: 4-6 hours**
