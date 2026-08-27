# NABOME Backup and Recovery Strategy

**Date**: 2026-08-23  
**Auditor**: Cascade AI  
**Scope**: Backup and recovery infrastructure assessment for NABOME V1 deployment  
**Phase**: BACKUP AND RECOVERY

---

## Executive Summary

This document provides a comprehensive assessment of backup and recovery capabilities for the NABOME platform. The inspection confirms that **no automated backup infrastructure exists** in the current codebase. Database backups, media protection, and restore procedures must be implemented before production deployment.

### Overall Assessment

| Category                | Current State                                                              | Required State                         | Gap                              | Priority |
| ----------------------- | -------------------------------------------------------------------------- | -------------------------------------- | -------------------------------- | -------- |
| **Database Provider**   | Development: Docker PostgreSQL; Production: Intended Neon (not configured) | Neon PostgreSQL with automated backups | Provider not selected/configured | 🔴 P0    |
| **Database Backups**    | None                                                                       | Automated daily backups + PITR         | No backup infrastructure         | 🔴 P0    |
| **R2 Media Protection** | Basic storage only                                                         | Versioning + lifecycle rules           | No protection configured         | ⚠️ P1    |
| **Restore Procedures**  | None documented                                                            | Documented + tested                    | No restore capability            | 🔴 P0    |
| **Backup Automation**   | None                                                                       | Scheduled automated backups            | No automation                    | 🔴 P0    |
| **Backup Security**     | N/A                                                                        | Encryption + access control            | Not implemented                  | 🔴 P0    |

**Overall Platform Health**: **3.0/10** (critical gap in data protection)

**Launch Readiness**: **NOT READY** - Backup infrastructure is a critical blocker for production deployment

---

## 1. Current Database Provider

### 1.1 Development Environment

**Provider**: PostgreSQL 17 via Docker Compose  
**Configuration**: `infra/docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: nabome-postgres
    environment:
      POSTGRES_DB: nabome
      POSTGRES_USER: nabome
      POSTGRES_PASSWORD: nabome
    ports:
      - '5432:5432'
    volumes:
      - nabome-pgdata:/var/lib/postgresql/data
```

**Connection String**: `postgresql://nabome:nabome@localhost:5432/nabome?schema=public`

**Backup Status**:

- ❌ No automated backups
- ❌ No manual backup procedures documented
- ⚠️ Data persists in Docker volume only (vulnerable to container deletion)

**Classification**: **DEVELOPMENT ONLY** - Not suitable for production

### 1.2 Production Environment (Intended)

**Provider**: Neon PostgreSQL (via Cloudflare Hyperdrive)  
**Evidence**:

- `HYPERDRIVE_URL` in `.env.example` and `.dev.vars.example`
- `@prisma/adapter-neon@6.19.3` dependency in `apps/api/package.json`
- Hyperdrive binding placeholder in `wrangler.jsonc`

**Current Status**: 🔴 **NOT CONFIGURED**

**Configuration Gap**:

```json
// apps/api/wrangler.jsonc
"hyperdrive": [{
  "binding": "HYPERDRIVE",
  "id": "TODO_REPLACE_WITH_ACTUAL_HYPERDRIVE_CONFIG_ID",  // ❌ Placeholder
  "localConnectionString": "postgres://postgres:postgres@localhost:5432/nabome"
}]
```

**Classification**: **INTENDED BUT NOT IMPLEMENTED** - Requires external setup

### 1.3 Provider Classification Summary

| Environment     | Provider             | Status            | Backup Capability |
| --------------- | -------------------- | ----------------- | ----------------- |
| **Development** | Docker PostgreSQL 17 | ✅ Configured     | ❌ None           |
| **Staging**     | Not configured       | ❌ Not configured | ❌ N/A            |
| **Production**  | Neon (intended)      | ❌ Not configured | ❌ N/A            |

**Conclusion**: Production database provider has not been selected or configured. This is an **external requirement** that must be completed before backup infrastructure can be implemented.

---

## 2. Existing Backup Capabilities

### 2.1 Database Backup Search Results

**Search Terms**: `backup`, `pg_dump`, `pg_restore`, `snapshot`, `database backup`, `scheduled backup`, `retention`, `recovery`

**Findings**:

- ❌ No backup scripts found in repository
- ❌ No `pg_dump` or `pg_restore` commands
- ❌ No scheduled backup jobs in CI/CD workflows
- ❌ No backup documentation
- ❌ No manual backup procedures

**Infrastructure Scripts Reviewed**:

- `infra/scripts/reset-db.mjs` - Development-only database reset (destructive, not backup)
- `infra/scripts/cf-secrets.mjs` - Cloudflare secrets management (no backup functionality)

### 2.2 CI/CD Backup Assessment

**File**: `.github/workflows/ci.yml`

**Jobs**:

- `quality` - Lint, format, typecheck, unit tests, security audit
- `build` - Production build
- `integration` - Integration tests with PostgreSQL service
- `e2e` - Playwright smoke tests

**Scheduled Jobs**: ❌ **NONE** - CI only triggers on push/PR

**File**: `.github/workflows/release.yml`

**Jobs**:

- `verify` - Quality gate before release
- `deploy-staging` - Deploy to staging
- `deploy-production` - Deploy to production
- `changelog` - Changesets release

**Backup Workflows**: ❌ **NONE**

### 2.3 R2 Media Backup Assessment

**Configuration**: `apps/api/wrangler.jsonc`

```json
"r2_buckets": [{ "binding": "MEDIA_BUCKET", "bucket_name": "nabome-media" }]
```

**R2 Service**: `apps/api/_lib/storage/r2.ts`

**Current Capabilities**:

- ✅ Upload with validation
- ✅ Delete with shop ownership validation
- ✅ Safe key generation (UUID-based)
- ❌ No versioning enabled
- ❌ No lifecycle rules
- ❌ No replication
- ❌ No backup/export

**Public URL Pattern**: `https://nabome-media.r2.dev/{key}`

**Classification**: ⚠️ **BASIC STORAGE ONLY** - No protection against accidental deletion or data loss

### 2.4 Existing Backup Capability Summary

| Asset Type           | Automated Backups | Manual Backups | Documentation | Restore Procedure |
| -------------------- | ----------------- | -------------- | ------------- | ----------------- |
| **Database**         | ❌ None           | ❌ None        | ❌ None       | ❌ None           |
| **R2 Media**         | ❌ None           | ❌ None        | ❌ None       | ❌ None           |
| **Application Code** | ✅ Git repository | ✅ Git         | ✅ README     | ✅ Git clone      |

**Conclusion**: **NO BACKUP INFRASTRUCTURE EXISTS** - This is a critical production blocker.

---

## 3. Database Backup Strategy

### 3.1 Recommended Provider: Neon PostgreSQL

**Rationale**:

- Native Cloudflare Hyperdrive integration
- Built-in automated backups (no custom infrastructure required)
- Point-in-time recovery (PITR) included
- Branching for development/staging
- Serverless scaling
- Compatible with Prisma ORM

**Backup Capabilities (Neon)**:

- ✅ Automated daily backups (included in all plans)
- ✅ Point-in-time recovery (up to 7 days on free tier, longer on paid)
- ✅ Time travel queries
- ✅ Database branching for testing
- ✅ 99.99% uptime SLA (paid plans)

### 3.2 Backup Configuration Requirements

#### 3.2.1 Minimum V1 Configuration

**Automated Daily Backups**:

- **Frequency**: Daily (Neon default)
- **Retention**: 7 days (free tier) or 30 days (paid tier)
- **Method**: Neon managed backups (no custom code required)
- **Time Window**: 02:00-04:00 UTC (low traffic period)

**Point-in-Time Recovery**:

- **Retention**: 7 days minimum
- **Granularity**: 1 minute
- **Use Cases**:
  - Accidental data deletion
  - Failed migration rollback
  - Data corruption recovery

#### 3.2.2 Enhanced Configuration (Recommended)

**Backup Retention Policy**:

- Daily backups: 30 days
- Weekly backups: 12 weeks
- Monthly backups: 12 months
- PITR: 30 days

**Cross-Region Replication**:

- Primary: Mumbai (ap-south-1)
- Replica: Singapore (ap-southeast-1)
- Purpose: Disaster recovery

### 3.3 Implementation Steps

#### Step 1: Create Neon Project

```bash
# Via Neon CLI or Console
neon projects create nabome-production --region ap-south-1
```

#### Step 2: Configure Hyperdrive

```bash
# Create Hyperdrive config
wrangler hyperdrive create nabome-db \
  --connection-string <neon-connection-string> \
  --database nabome
```

#### Step 3: Update wrangler.jsonc

```json
"hyperdrive": [{
  "binding": "HYPERDRIVE",
  "id": "<actual-hyperdrive-config-id>",
  "localConnectionString": "postgres://postgres:postgres@localhost:5432/nabome"
}]
```

#### Step 4: Enable Backups in Neon Console

- Navigate to project settings
- Enable automated backups
- Configure retention policy
- Enable PITR

#### Step 5: Test Backup Creation

- Verify daily backup creation
- Test PITR to staging branch
- Validate backup integrity

### 3.4 Alternative: Custom PostgreSQL (Not Recommended for V1)

If Neon is not selected, the following would be required:

**Custom Backup Script**:

```bash
#!/bin/bash
# infra/scripts/backup-db.sh
pg_dump $DATABASE_URL | gzip > /backups/nabome-$(date +%Y%m%d).sql.gz
```

**Scheduled Job** (via cron or GitHub Actions):

```yaml
# .github/workflows/backup.yml
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 02:00 UTC
```

**Storage**: Cloudflare R2 or external S3-compatible storage

**Disadvantages**:

- Requires custom infrastructure
- No built-in PITR
- Higher operational overhead
- Additional cost for storage

**Recommendation**: Use Neon for V1 to minimize operational complexity.

---

## 4. R2 Media Protection Strategy

### 4.1 Current R2 Configuration

**Bucket**: `nabome-media`  
**Binding**: `MEDIA_BUCKET`  
**Public Access**: Yes (via `nabome-media.r2.dev`)  
**Key Format**: `shops/{shopId}/products/{productId}/{uuid}.{ext}`

### 4.2 Recommended R2 Protection

#### 4.2.1 Object Versioning

**Purpose**: Protect against accidental deletion/overwrite

**Configuration** (via Cloudflare Console or API):

```bash
# Enable versioning on bucket
wrangler r2 bucket versioning enable nabome-media
```

**Behavior**:

- Each object modification creates a new version
- Deleted objects remain as non-current versions
- Can restore previous versions

**Retention Policy**:

- Non-current versions: 90 days
- Delete markers: 30 days

#### 4.2.2 Lifecycle Rules

**Purpose**: Automatic cleanup of old versions

**Recommended Rules**:

```json
{
  "rules": [
    {
      "id": "cleanup-old-versions",
      "status": "Enabled",
      "filter": { "prefix": "shops/" },
      "expiration": { "noncurrentDays": 90 }
    },
    {
      "id": "cleanup-delete-markers",
      "status": "Enabled",
      "filter": { "prefix": "shops/" },
      "expiration": { "noncurrentDays": 30 }
    }
  ]
}
```

#### 4.2.3 Replication (Optional for V1)

**Purpose**: Cross-region disaster recovery

**Configuration**:

- Primary: `nabome-media` (ap-south-1)
- Replica: `nabome-media-backup` (ap-southeast-1)
- Sync: R2-to-R2 replication

**Recommendation**: ⚠️ **DEFER TO V2** - Additional cost and complexity

### 4.3 R2 Backup Implementation Steps

#### Step 1: Enable Versioning

```bash
wrangler r2 bucket versioning enable nabome-media
```

#### Step 2: Configure Lifecycle Rules

```bash
# Via Cloudflare Console or Terraform
# Apply lifecycle rules for 90-day retention
```

#### Step 3: Update Application Code

- No code changes required for basic versioning
- Optional: Add version-aware restore functionality

#### Step 4: Test Versioning

- Upload test file
- Modify file
- Delete file
- Restore previous version

### 4.4 R2 Protection Summary

| Feature                 | Current     | Recommended         | Priority |
| ----------------------- | ----------- | ------------------- | -------- |
| **Versioning**          | ❌ Disabled | ✅ Enabled          | 🔴 P0    |
| **Lifecycle Rules**     | ❌ None     | ✅ 90-day retention | ⚠️ P1    |
| **Replication**         | ❌ None     | ⚠️ Optional (V2)    | ℹ️ P2    |
| **Cross-Region Backup** | ❌ None     | ⚠️ Optional (V2)    | ℹ️ P2    |

---

## 5. RPO/RTO Requirements

### 5.1 Current State

**RPO (Recovery Point Objective)**: ❌ **NOT DEFINED**  
**RTO (Recovery Time Objective)**: ❌ **NOT DEFINED**

### 5.2 Recommended V1 Targets

**RPO**: **1 hour**

- Maximum acceptable data loss
- Achievable with Neon PITR (1-minute granularity)
- Reasonable for e-commerce platform

**RTO**: **4 hours**

- Maximum acceptable recovery time
- Includes: backup restoration, validation, application deployment
- Reasonable for V1 launch

### 5.3 Rationale

**Business Context**:

- E-commerce platform with financial transactions
- Orders, payments, and inventory data are critical
- 1-hour data loss is acceptable for V1
- 4-hour recovery allows for manual intervention if needed

**Provider Capabilities**:

- Neon PITR: 1-minute granularity (exceeds RPO)
- Neon branch restore: ~10 minutes (within RTO)
- Application deployment: ~30 minutes (within RTO)

### 5.4 Enhanced Targets (V2)

**RPO**: **5 minutes** (near-zero data loss)  
**RTO**: **1 hour** (rapid recovery)

**Requirements**:

- Real-time replication
- Automated failover
- Hot standby database

**Recommendation**: ⚠️ **DEFER TO V2** - Additional cost and complexity

---

## 6. Backup Retention Policy

### 6.1 Database Backup Retention

**Neon Default (Free Tier)**:

- Daily backups: 7 days
- PITR: 7 days

**Recommended V1 (Paid Tier)**:

- Daily automated backups: 30 days
- PITR: 30 days
- Weekly snapshots: 12 weeks
- Monthly snapshots: 12 months

**Rationale**:

- 30 days covers most recovery scenarios
- Monthly snapshots provide long-term historical reference
- Aligns with financial audit requirements

### 6.2 R2 Media Retention

**Current**: Indefinite (no lifecycle rules)

**Recommended V1**:

- Current versions: Indefinite
- Non-current versions: 90 days
- Delete markers: 30 days

**Rationale**:

- 90 days covers most accidental deletion scenarios
- Prevents unbounded storage costs
- Allows recovery from recent mistakes

### 6.3 Application Code Retention

**Current**: Git repository (indefinite)

**Status**: ✅ **ADEQUATE** - No changes required

---

## 7. Backup Security

### 7.1 Encryption at Rest

**Database (Neon)**:

- ✅ AES-256 encryption by default
- ✅ Transparent data encryption
- ✅ Key management handled by Neon

**R2 Media**:

- ✅ AES-256 encryption by default
- ✅ Server-side encryption
- ✅ Key management handled by Cloudflare

**Status**: ✅ **ADEQUATE** - Provider-managed encryption

### 7.2 Encryption in Transit

**Database**:

- ✅ TLS 1.3 required for all connections
- ✅ Certificate validation enforced

**R2 Media**:

- ✅ HTTPS required for all access
- ✅ Certificate validation enforced

**Status**: ✅ **ADEQUATE** - Provider-managed encryption

### 7.3 Access Control

**Database Access**:

- ✅ Role-based access control (RBAC)
- ✅ Password authentication
- ⚠️ IP whitelisting not configured (recommended for production)

**R2 Access**:

- ✅ Cloudflare account authentication
- ✅ Bucket-level permissions
- ⚠️ Pre-signed URLs not implemented (recommended for direct access)

**Status**: ⚠️ **ACCEPTABLE FOR V1** - IP whitelisting and pre-signed URLs can be added in V2

### 7.4 Backup Access Permissions

**Current**: ❌ **NOT CONFIGURED**

**Recommended**:

- Database backups: Accessible only to database administrators
- R2 backups: Accessible only to platform administrators
- Audit logging: All backup access logged

**Implementation**:

- Neon: Role-based access control
- R2: Cloudflare Access policies
- Audit: Cloudflare Logs

### 7.5 Backup Deletion

**Current**: ❌ **NOT CONFIGURED**

**Recommended**:

- Database backups: Require multi-factor approval for deletion
- R2 backups: Require multi-factor approval for deletion
- Retention policy: Automatic cleanup after retention period

**Implementation**:

- Neon: Role-based deletion permissions
- R2: Lifecycle rules (automatic cleanup)
- Manual deletion: Require approval workflow

---

## 8. Restore Procedure

### 8.1 Database Restore Procedure

#### 8.1.1 Prerequisites

- Neon project configured with backups
- Hyperdrive config ID available
- Staging environment available
- Database migration scripts available

#### 8.1.2 Restore Steps

**Step 1: Identify Backup Point**

```bash
# List available backups
neon backups list --project-id <project-id>

# Or use PITR timestamp
TIMESTAMP="2026-08-23 14:30:00 UTC"
```

**Step 2: Create Restore Branch**

```bash
# Create branch from backup
neon branches create \
  --project-id <project-id> \
  --source-timestamp "$TIMESTAMP" \
  --name restore-$(date +%Y%m%d-%H%M%S)
```

**Step 3: Update Application Configuration**

```bash
# Update staging DATABASE_URL to point to restore branch
export DATABASE_URL=<restore-branch-connection-string>
```

**Step 4: Run Database Migrations**

```bash
pnpm db:generate
pnpm db:migrate
```

**Step 5: Verify Data Integrity**

```bash
# Run validation script (to be created)
pnpm --filter @nabome/api exec node scripts/validate-backup.mjs
```

**Step 6: Deploy to Staging**

```bash
pnpm build:api
wrangler pages deploy --project-name nabome-api-staging
```

**Step 7: Run Smoke Tests**

```bash
pnpm test:e2e
```

**Step 8: Promote to Production (if successful)**

```bash
# Replace production database with restore branch
neon branches promote \
  --project-id <project-id> \
  --branch-name restore-$(date +%Y%m%d-%H%M%S)
```

#### 8.1.3 Rollback Procedure

If restore fails:

```bash
# Switch back to original database
neon branches switch \
  --project-id <project-id> \
  --branch-name production

# Deploy previous application version
git checkout <previous-commit>
pnpm build:api
wrangler pages deploy --project-name nabome-api
```

### 8.2 R2 Media Restore Procedure

#### 8.2.1 Prerequisites

- R2 versioning enabled
- Bucket versioning configured
- Access to Cloudflare account

#### 8.2.2 Restore Steps

**Step 1: Identify Object Version**

```bash
# List object versions
wrangler r2 object list nabome-media --prefix <key> --include-versions
```

**Step 2: Restore Previous Version**

```bash
# Copy previous version to current
wrangler r2 object copy \
  nabome-media/<key>?versionId=<version-id> \
  nabome-media/<key>
```

**Step 3: Verify Restore**

```bash
# Verify object is accessible
curl -I https://nabome-media.r2.dev/<key>
```

#### 8.2.3 Bulk Restore Procedure

For multiple objects:

```bash
# Script to restore all versions for a shop
# infra/scripts/restore-shop-media.mjs
```

### 8.3 Restore Documentation

**Status**: ❌ **NOT DOCUMENTED**

**Required Documentation**:

- Step-by-step restore procedures
- Contact information for database provider
- Escalation procedures
- Post-restore validation checklist

---

## 9. Restore Verification

### 9.1 Verification Checklist

#### 9.1.1 Database Verification

**Schema Validation**:

- ✅ All 66 models present
- ✅ All 62 enums present
- ✅ All foreign key constraints valid
- ✅ All indexes present
- ✅ No orphaned records

**Data Integrity**:

- ✅ User count matches expected
- ✅ Order count matches expected
- ✅ Payment records consistent with orders
- ✅ Inventory counts accurate
- ✅ Financial records balanced

**Application Validation**:

- ✅ Prisma client generates successfully
- ✅ Typecheck passes
- ✅ Unit tests pass
- ✅ Integration tests pass
- ✅ E2E smoke tests pass

#### 9.1.2 Representative Records Verification

**Required Records**:

- User (customer, shop_owner, admin)
- Shop (active shop)
- Product (with variants and media)
- Inventory (stock levels)
- Order (with items and payment)
- Payment (captured payment)
- Return (return request with items)
- Coupon (active coupon)

**Verification Queries**:

```sql
-- User count
SELECT COUNT(*) FROM users WHERE isActive = true;

-- Order count
SELECT COUNT(*) FROM orders WHERE isActive = true;

-- Payment consistency
SELECT COUNT(*) FROM payments WHERE orderId IS NULL;

-- Foreign key integrity
SELECT COUNT(*) FROM orders WHERE userId NOT IN (SELECT id FROM users);
```

#### 9.1.3 R2 Media Verification

**Access Verification**:

- ✅ Sample images accessible via public URL
- ✅ Shop ownership validation works
- ✅ Key generation produces valid URLs

**Integrity Verification**:

- ✅ File sizes match expected
- ✅ Content types correct
- ✅ No corrupted files

### 9.2 Automated Verification Script

**Required Script**: `infra/scripts/verify-backup.mjs`

**Functionality**:

- Connect to database
- Run verification queries
- Check representative records
- Validate foreign keys
- Report results
- Exit with appropriate status code

**Implementation**: ⚠️ **TO BE CREATED** - Not currently implemented

### 9.3 Verification Frequency

**Recommended Schedule**:

- After every restore: ✅ **MANDATORY**
- Weekly automated verification: ⚠️ **RECOMMENDED**
- Monthly full verification: ⚠️ **RECOMMENDED**

---

## 10. Automation

### 10.1 Current Automation

**Database Backups**: ❌ **NONE**  
**R2 Backups**: ❌ **NONE**  
**Restore Verification**: ❌ **NONE**

### 10.2 Recommended Automation

#### 10.2.1 Database Backup Automation

**Provider-Managed (Neon)**:

- ✅ Automated daily backups (included)
- ✅ Automated PITR (included)
- ✅ No custom automation required

**Status**: ✅ **ADEQUATE** - Provider-managed automation

#### 10.2.2 Backup Health Monitoring

**Recommended**: GitHub Actions workflow

```yaml
# .github/workflows/backup-health.yml
name: Backup Health Check

on:
  schedule:
    - cron: '0 6 * * *' # Daily at 06:00 UTC

jobs:
  check-backups:
    runs-on: ubuntu-latest
    steps:
      - name: Check Neon backups
        run: |
          # Use Neon CLI to verify latest backup
          neon backups list --project-id ${{ secrets.NEON_PROJECT_ID }}
          # Fail if no backup in last 24 hours
```

**Status**: ⚠️ **TO BE IMPLEMENTED** - Not currently implemented

#### 10.2.3 Restore Verification Automation

**Recommended**: Monthly scheduled workflow

```yaml
# .github/workflows/restore-verification.yml
name: Restore Verification

on:
  schedule:
    - cron: '0 3 1 * *' # Monthly on 1st at 03:00 UTC

jobs:
  verify-restore:
    runs-on: ubuntu-latest
    steps:
      - name: Create restore branch
        run: |
          # Create branch from latest backup
          neon branches create --project-id ${{ secrets.NEON_PROJECT_ID }}
      - name: Run verification
        run: |
          # Run verification script
          node infra/scripts/verify-backup.mjs
```

**Status**: ⚠️ **TO BE IMPLEMENTED** - Not currently implemented

### 10.3 Automation Summary

| Automation Type          | Current | Recommended                | Priority |
| ------------------------ | ------- | -------------------------- | -------- |
| **Database Backups**     | ❌ None | ✅ Provider-managed (Neon) | 🔴 P0    |
| **Backup Health Check**  | ❌ None | ⚠️ GitHub Actions          | ⚠️ P1    |
| **Restore Verification** | ❌ None | ⚠️ Monthly scheduled       | ⚠️ P1    |
| **R2 Lifecycle Cleanup** | ❌ None | ✅ Lifecycle rules         | ⚠️ P1    |

---

## 11. Failure Scenarios

### 11.1 Database Corruption

**Scenario**: Database becomes corrupted due to hardware failure or software bug

**Detection**:

- Application errors (database connection failures)
- Data inconsistency errors
- Performance degradation

**Recovery Procedure**:

1. Identify corruption timestamp
2. Create restore branch from backup before corruption
3. Verify restore branch integrity
4. Switch production to restore branch
5. Run smoke tests
6. Monitor for issues

**RPO**: 1 hour (latest backup)  
**RTO**: 4 hours

### 11.2 Accidental Destructive Operation

**Scenario**: Admin accidentally deletes critical data (users, orders, products)

**Detection**:

- User reports missing data
- Application errors
- Audit logs show deletion

**Recovery Procedure**:

1. Identify deletion timestamp
2. Use PITR to restore to before deletion
3. Extract deleted records
4. Restore records to production
5. Verify data integrity
6. Update audit logs

**RPO**: 1 minute (PITR granularity)  
**RTO**: 2 hours

### 11.3 Migration Failure

**Scenario**: Database migration fails and corrupts schema

**Detection**:

- Migration script fails
- Application errors
- Schema validation fails

**Recovery Procedure**:

1. Stop application deployment
2. Identify migration that failed
3. Restore database to pre-migration state
4. Fix migration script
5. Test migration on staging
6. Re-run migration on production

**RPO**: 0 (migration should be transactional)  
**RTO**: 2 hours

### 11.4 Cloudflare Failure

**Scenario**: Cloudflare Pages or Workers outage

**Detection**:

- Application unavailable
- Cloudflare status page
- Monitoring alerts

**Recovery Procedure**:

1. Verify Cloudflare status
2. Check application logs
3. If Cloudflare outage: Wait for resolution
4. If application-specific: Redeploy from backup
5. Verify deployment

**RPO**: 0 (application code in git)  
**RTO**: 1 hour (deployment time)

### 11.5 R2 Media Loss

**Scenario**: R2 bucket accidentally deleted or objects lost

**Detection**:

- Media URLs return 404
- Application errors
- User reports missing images

**Recovery Procedure**:

1. Identify lost objects
2. Restore from version history (if versioning enabled)
3. If no versioning: Restore from local backups (if available)
4. If no backups: Request re-upload from shop owners
5. Verify media accessibility

**RPO**: 24 hours (if versioning enabled)  
**RTO**: 4 hours

**Mitigation**: Enable R2 versioning (P0 requirement)

### 11.6 Security Incident

**Scenario**: Database compromised, data exfiltrated or modified

**Detection**:

- Security monitoring alerts
- Anomalous access patterns
- User reports of unauthorized changes

**Recovery Procedure**:

1. Isolate affected systems
2. Identify compromise scope
3. Restore database to pre-compromise state
4. Rotate all credentials
5. Audit all access logs
6. Implement additional security measures
7. Notify affected users if required

**RPO**: 1 hour (latest backup)  
**RTO**: 8 hours (includes investigation)

---

## 12. Secret Management

### 12.1 Current Secret Management

**Secrets**:

- `DATABASE_URL`
- `SESSION_SECRET`
- `CSRF_SECRET`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `WEBHOOK_SECRET`

**Storage**:

- Development: `.env` (git-ignored)
- Production: Cloudflare Pages secrets (via `wrangler secret put`)

**Backup Status**: ❌ **NOT BACKED UP**

### 12.2 Secret Backup Strategy

**Principle**: **Never back up secrets into application repositories**

**Recommended Approach**:

1. Use Cloudflare Secrets Manager (if available)
2. Or use external secret manager (AWS Secrets Manager, HashiCorp Vault)
3. Store secret backup in secure, offline location (encrypted USB, password manager)
4. Document secret rotation procedure

**Secret Rotation**:

- Rotate secrets quarterly
- Rotate immediately after security incident
- Document rotation in audit log

### 12.3 Secret Recovery Procedure

**Scenario**: Secret lost or compromised

**Recovery Steps**:

1. Retrieve secret from secure backup
2. Update Cloudflare Pages secrets
3. Update application environment variables
4. Restart application
5. Verify application functionality
6. Rotate other potentially compromised secrets

**Prevention**:

- Use secret manager with versioning
- Implement secret rotation automation
- Document secret locations

---

## 13. Required Production Configuration

### 13.1 External Requirements

**Database Provider Setup**:

- [ ] Create Neon project
- [ ] Configure database branch structure (main, staging, development)
- [ ] Enable automated backups
- [ ] Configure PITR retention (30 days)
- [ ] Set up IP whitelisting (if required)
- [ ] Create database roles with appropriate permissions
- [ ] Document connection strings

**Cloudflare Configuration**:

- [ ] Create KV namespace for rate limiting
- [ ] Create R2 bucket `nabome-media`
- [ ] Enable R2 versioning
- [ ] Configure R2 lifecycle rules
- [ ] Create Hyperdrive config
- [ ] Update `wrangler.jsonc` with actual IDs
- [ ] Configure Cloudflare Access policies (if required)

**Secret Management**:

- [ ] Generate all production secrets
- [ ] Store secrets in secure backup location
- [ ] Push secrets to Cloudflare Pages via `cf-secrets.mjs`
- [ ] Document secret rotation procedure

### 13.2 Internal Configuration

**Application Configuration**:

- [ ] Update `.env` with production values
- [ ] Update `apps/api/.dev.vars` with production values
- [ ] Validate environment variables via `scripts/validate-env.mjs`
- [ ] Test application with production configuration

**Backup Configuration**:

- [ ] Configure Neon backup retention policy
- [ ] Configure R2 lifecycle rules
- [ ] Set up backup health monitoring
- [ ] Create restore verification script
- [ ] Document restore procedures

---

## 14. Remaining Gaps

### 14.1 Critical Gaps (Block Launch)

**Database Provider**:

- 🔴 Neon project not created
- 🔴 Hyperdrive config not created
- 🔴 Production database not provisioned
- 🔴 Database backups not configured

**Backup Infrastructure**:

- 🔴 No automated backups configured
- 🔴 No restore procedures documented
- 🔴 No restore verification script
- 🔴 No backup health monitoring

**R2 Protection**:

- 🔴 R2 versioning not enabled
- 🔴 R2 lifecycle rules not configured

### 14.2 High Priority Gaps (Should Complete Soon)

**Documentation**:

- ⚠️ Restore procedures not documented
- ⚠️ Failure scenarios not documented
- ⚠️ Secret recovery procedure not documented

**Automation**:

- ⚠️ Backup health monitoring not implemented
- ⚠️ Restore verification automation not implemented

**Security**:

- ⚠️ IP whitelisting not configured
- ⚠️ Pre-signed URLs not implemented

### 14.3 Medium Priority Gaps (Can Defer)

**Enhanced Protection**:

- ℹ️ Cross-region replication not configured
- ℹ️ R2 cross-region backup not configured
- ℹ️ Real-time replication not configured

**Monitoring**:

- ℹ️ Backup performance metrics not tracked
- ℹ️ Restore time metrics not tracked

---

## 15. Launch Impact

### 15.1 Database Backup Status

**Current**: ❌ **NOT IMPLEMENTED**  
**Required**: ✅ **AUTOMATED BACKUPS + PITR**  
**Impact**: 🔴 **BLOCKS V1 LAUNCH**

**Rationale**:

- No backup capability means total data loss risk
- E-commerce platform cannot operate without data protection
- Financial and legal liability for data loss

**Estimated Effort**: 4 hours (external setup + configuration)

### 15.2 R2 Protection Status

**Current**: ❌ **NOT PROTECTED**  
**Required**: ⚠️ **VERSIONING + LIFECYCLE RULES**  
**Impact**: ⚠️ **SHOULD COMPLETE BEFORE V1 LAUNCH**

**Rationale**:

- Media loss is not catastrophic (can be re-uploaded)
- However, manual recovery is time-consuming
- Versioning provides low-cost protection

**Estimated Effort**: 1 hour (configuration)

### 15.3 Restore Testing Status

**Current**: ❌ **NOT TESTED**  
**Required**: ✅ **RESTORE VERIFICATION**  
**Impact**: 🔴 **BLOCKS V1 LAUNCH**

**Rationale**:

- Backup is useless if restore cannot be verified
- Must test restore before production launch
- Restore failure would be catastrophic

**Estimated Effort**: 2 hours (testing)

### 15.4 Overall Launch Impact

**Backup and Recovery**: 🔴 **BLOCKS V1 LAUNCH**

**Summary**:

- Database backup infrastructure is a critical blocker
- R2 protection should be completed before launch
- Restore testing is mandatory
- Total estimated effort: 7 hours

**Recommendation**: Complete backup infrastructure before V1 launch. Do not launch without data protection.

---

## 16. Implementation Plan

### 16.1 Phase 1: Database Provider Setup (2 hours)

**Objective**: Set up Neon PostgreSQL with automated backups

**Steps**:

1. Create Neon project (30 minutes)
2. Configure database branches (30 minutes)
3. Enable automated backups (15 minutes)
4. Configure PITR (15 minutes)
5. Create Hyperdrive config (30 minutes)

**Success Criteria**:

- Neon project created and accessible
- Automated backups enabled
- PITR configured
- Hyperdrive config ID available

### 16.2 Phase 2: Cloudflare Configuration (1 hour)

**Objective**: Configure Cloudflare resources for production

**Steps**:

1. Create KV namespace (15 minutes)
2. Create R2 bucket (15 minutes)
3. Enable R2 versioning (15 minutes)
4. Configure R2 lifecycle rules (15 minutes)
5. Update wrangler.jsonc with actual IDs (10 minutes)

**Success Criteria**:

- KV namespace created
- R2 bucket with versioning enabled
- Lifecycle rules configured
- wrangler.jsonc updated

### 16.3 Phase 3: Secret Management (1 hour)

**Objective**: Configure production secrets

**Steps**:

1. Generate all production secrets (30 minutes)
2. Store secrets in secure backup location (15 minutes)
3. Push secrets to Cloudflare Pages (10 minutes)
4. Validate environment variables (5 minutes)

**Success Criteria**:

- All secrets generated and stored
- Secrets pushed to Cloudflare
- Environment validation passes

### 16.4 Phase 4: Restore Testing (2 hours)

**Objective**: Verify backup and restore capability

**Steps**:

1. Create test backup (15 minutes)
2. Create restore branch (15 minutes)
3. Restore database (30 minutes)
4. Run verification queries (30 minutes)
5. Run smoke tests (30 minutes)
6. Document results (10 minutes)

**Success Criteria**:

- Backup created successfully
- Restore completed successfully
- Verification queries pass
- Smoke tests pass
- Results documented

### 16.5 Phase 5: Documentation (1 hour)

**Objective**: Document backup and restore procedures

**Steps**:

1. Document restore procedures (30 minutes)
2. Document failure scenarios (15 minutes)
3. Create operational runbook (15 minutes)

**Success Criteria**:

- Restore procedures documented
- Failure scenarios documented
- Operational runbook created

**Total Estimated Effort**: 7 hours

---

## 17. Operational Checklist

### 17.1 Pre-Launch Checklist

**Database**:

- [ ] Neon project created
- [ ] Database branches configured (main, staging, development)
- [ ] Automated backups enabled
- [ ] PITR configured (30-day retention)
- [ ] Hyperdrive config created
- [ ] wrangler.jsonc updated with Hyperdrive ID
- [ ] Database connection tested
- [ ] Migration scripts tested on staging

**R2**:

- [ ] R2 bucket created
- [ ] R2 versioning enabled
- [ ] Lifecycle rules configured (90-day retention)
- [ ] Bucket access tested
- [ ] Public URL pattern verified

**Secrets**:

- [ ] All production secrets generated
- [ ] Secrets stored in secure backup location
- [ ] Secrets pushed to Cloudflare Pages
- [ ] Environment validation passes
- [ ] Secret rotation procedure documented

**Backup Verification**:

- [ ] Backup creation tested
- [ ] Restore procedure tested
- [ ] Verification queries tested
- [ ] Smoke tests pass
- [ ] Results documented

**Documentation**:

- [ ] Restore procedures documented
- [ ] Failure scenarios documented
- [ ] Operational runbook created
- [ ] Contact information documented
- [ ] Escalation procedures documented

### 17.2 Post-Launch Checklist

**Monitoring**:

- [ ] Backup health monitoring configured
- [ ] Backup failure alerts configured
- [ ] Restore verification scheduled (monthly)
- [ ] Performance metrics tracked

**Maintenance**:

- [ ] Secret rotation scheduled (quarterly)
- [ ] Backup retention policy reviewed (quarterly)
- [ ] Restore procedure tested (quarterly)
- [ ] Documentation updated (as needed)

---

## 18. Conclusion

### 18.1 Current State

The NABOME platform currently has **no backup infrastructure**. Database backups, media protection, and restore procedures are completely absent. This represents a critical production blocker.

### 18.2 Required Actions

**Critical (Block Launch)**:

1. Set up Neon PostgreSQL with automated backups
2. Configure Hyperdrive for database connection
3. Enable R2 versioning and lifecycle rules
4. Test backup and restore procedures
5. Document restore procedures

**High Priority (Should Complete Soon)**:

1. Implement backup health monitoring
2. Implement restore verification automation
3. Document failure scenarios
4. Configure IP whitelisting

### 18.3 Launch Readiness

**Status**: 🔴 **NOT READY** - Backup infrastructure is a critical blocker

**Estimated Effort**: 7 hours

**Recommendation**: Complete backup infrastructure before V1 launch. Do not launch without data protection.

### 18.4 Next Phase

After completing backup and recovery infrastructure, the next phase is:

**FINAL STAGING DEPLOYMENT + END-TO-END V1 SMOKE TESTING**

This phase will:

- Deploy to staging environment
- Run comprehensive smoke tests
- Validate all critical flows
- Verify backup and restore procedures
- Prepare for production launch

---

---

## Staging Validation Update (2026-08-23)

### Validation Status: ❌ BLOCKED

A comprehensive staging validation was performed on 2026-08-23 (see `docs/work/12-staging-validation.md`). The validation confirmed that **backup infrastructure cannot be implemented** until external prerequisites are completed.

### Key Findings

| Backup Component       | Status             | Blocker                                         |
| ---------------------- | ------------------ | ----------------------------------------------- |
| **Neon PostgreSQL**    | ❌ Not Configured  | No Neon project created                         |
| **Automated Backups**  | ❌ Not Implemented | Requires Neon database first                    |
| **PITR**               | ❌ Not Implemented | Requires Neon database first                    |
| **R2 Versioning**      | ❌ Not Implemented | Cannot verify R2 bucket without Cloudflare auth |
| **Restore Procedures** | ❌ Not Documented  | No backup system to document                    |
| **Restore Test**       | ❌ Not Performed   | No backup system to test                        |

### Prerequisite Dependencies

The staging validation identified that backup implementation is blocked by:

1. **Cloudflare Authentication** - CLOUDFLARE_API_TOKEN not set
2. **Neon PostgreSQL Setup** - No Neon project configured
3. **R2 Bucket Verification** - Cannot verify without Cloudflare auth
4. **Staging Environment** - No staging deployment to test against

### Updated Implementation Path

**Original Estimate**: 7 hours

**Revised Path**:

1. **Prerequisites** (5.5 hours):
   - Cloudflare authentication (30 min)
   - Neon PostgreSQL setup (2 hours)
   - External service configuration (2 hours)
   - Cloudflare resources verification (1 hour)

2. **Backup Implementation** (7 hours - as originally estimated):
   - Neon automated backups configuration (1 hour)
   - PITR enablement (1 hour)
   - R2 versioning and lifecycle rules (2 hours)
   - Restore procedures documentation (2 hours)
   - Restore test execution (1 hour)

**Total Revised Effort**: ~12.5 hours

### Validation Confirmation

The staging validation **confirms** the assessment in this document:

- No automated backup infrastructure exists
- Backup infrastructure is a **P0 V1 launch blocker**
- Neon PostgreSQL is the recommended provider
- R2 protection requires versioning and lifecycle rules

### Recommendation

1. Complete external infrastructure prerequisites (see docs/work/12-staging-validation.md)
2. Implement backup infrastructure per this document's recommendations
3. Perform restore test before production deployment
4. Do not proceed to production launch without verified backup capability

---

**Document Completed**: 2026-08-23
**Last Updated**: 2026-08-23 (Staging validation section added)  
**Next Review**: After backup infrastructure implementation  
**Auditor**: Cascade AI
