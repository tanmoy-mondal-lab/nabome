# NABOME Backup Strategy

**Version:** 1.0  
**Date:** 2026-07-10  
**Status:** Production Ready

---

## Overview

This document outlines the comprehensive backup strategy for the NABOME e-commerce platform. It covers backup procedures, retention policies, restoration processes, and verification steps to ensure data protection and business continuity.

---

## Table of Contents

1. [Backup Scope](#backup-scope)
2. [Backup Schedule](#backup-schedule)
3. [Backup Procedures](#backup-procedures)
4. [Backup Storage](#backup-storage)
5. [Backup Retention](#backup-retention)
6. [Backup Verification](#backup-verification)
7. [Backup Restoration](#backup-restoration)
8. [Backup Security](#backup-security)

---

## Backup Scope

### Data Categories

#### 1. Database Backup

**Tables Included:**
- Critical Business Data (18 tables)
  - profiles
  - orders
  - order_items
  - products
  - product_variants
  - product_images
  - categories
  - subcategories
  - collections
  - brands
  - carts
  - cart_items
  - addresses
  - reviews
  - coupons
  - coupon_redemptions
  - gift_cards
  - loyalty_points

- Configuration Data (8 tables)
  - site_settings
  - homepage_sections
  - navigation_items
  - footer_items
  - announcements
  - feature_flags
  - media_assets
  - media_folders

- Authentication & Security (5 tables)
  - auth_sessions
  - verification_tokens
  - password_reset_tokens
  - login_attempts
  - verification_attempts

- Marketing & Engagement (6 tables)
  - newsletter_subscribers
  - contact_submissions
  - analytics_events
  - lookbooks
  - lookbook_items
  - wishlist_items

- Support & Operations (5 tables)
  - return_requests
  - refunds
  - support_tickets
  - support_ticket_replies
  - notifications

- Referral System (3 tables)
  - referral_codes
  - referrals
  - referral_rewards

**Excluded:**
- Temporary data (job_queue, webhook_events with status=processed)
- Logs (user_action_logs older than 90 days)

#### 2. Media Backup

**Assets Included:**
- Product images
- Category images
- Collection images
- Brand logos
- Lookbook images
- Homepage banners
- CMS section images
- User avatars

**Metadata Included:**
- Asset URLs
- Asset metadata (alt text, tags, folders)
- Asset transformations
- Asset usage tracking

**Excluded:**
- Temporary uploads
- Deleted assets (older than 30 days)

#### 3. Configuration Backup

**Items Included:**
- Site settings (theme, SEO, features)
- Navigation menus
- Footer configuration
- Homepage sections
- Announcement bars
- Feature flags
- Email templates
- SMS templates

#### 4. Environment Variable Backup

**Items Included:**
- Production environment variables
- Staging environment variables
- Development environment variables (optional)
- Secret keys (encrypted)

**Excluded:**
- Temporary test variables
- Local development variables

#### 5. CMS Export

**Items Included:**
- All CMS pages
- All CMS sections
- All CMS components
- Page versions
- Draft content

#### 6. Media Export

**Items Included:**
- Media asset metadata
- Media folder structure
- Asset transformations
- Asset permissions

---

## Backup Schedule

### Automated Backups

#### Database Backups

| Backup Type | Frequency | Time | Retention | Method |
|-------------|-----------|------|-----------|--------|
| Point-in-Time | Every 15 minutes | Continuous | 7 days | Neon Automated |
| Daily Full | Daily | 2:00 AM UTC | 30 days | Neon Automated |
| Weekly Full | Weekly | Sunday 2:00 AM UTC | 12 months | Neon Automated |
| Monthly Full | Monthly | 1st 2:00 AM UTC | 36 months | Neon Automated |

#### Application Backups

| Backup Type | Frequency | Time | Retention | Method |
|-------------|-----------|------|-----------|--------|
| Media Metadata | Hourly | :00 | 30 days | Application Script |
| Configuration | Daily | 3:00 AM UTC | 90 days | Application Script |
| Environment Variables | On Change | Real-time | 90 days | Application Script |
| CMS Content | Daily | 4:00 AM UTC | 90 days | Application Script |
| Search Index | Daily | 5:00 AM UTC | 30 days | Application Script |

### Manual Backups

**Before Major Changes:**
- Database schema changes
- Major feature deployments
- Configuration updates
- Security patches

**On Demand:**
- Before data migrations
- Before bulk operations
- Before third-party integrations

---

## Backup Procedures

### Database Backup Procedure

#### Automated Backup (Neon)

Neon provides automated backups with point-in-time recovery. No manual intervention required for scheduled backups.

**Configuration:**
```json
{
  "backup_retention_period": "7d",
  "pitr_retention_period": "7d",
  "backup_schedule": {
    "daily": "02:00 UTC",
    "weekly": "Sunday 02:00 UTC",
    "monthly": "1st 02:00 UTC"
  }
}
```

#### Manual Database Backup

```bash
# Export database to SQL file
npx prisma db export --output backup-$(date +%Y%m%d-%H%M%S).sql

# Export specific tables
npx prisma db export --tables profiles,orders,products --output critical-backup.sql

# Export with schema only
npx prisma db export --schema-only --output schema-backup.sql

# Export with data only
npx prisma db export --data-only --output data-backup.sql
```

#### Application-Level Database Backup

```bash
# Run backup script
npm run backup:database

# Output: JSON backup with metadata
{
  "timestamp": "2026-07-10T02:00:00Z",
  "version": "1.0",
  "tables": {
    "profiles": { "count": 1234, "size": "2.3MB" },
    "orders": { "count": 5678, "size": "15.6MB" },
    "products": { "count": 890, "size": "8.9MB" }
  },
  "checksum": "abc123...",
  "duration": "45s"
}
```

### Media Backup Procedure

#### Media Metadata Backup

```bash
# Run media metadata backup
npm run backup:media

# Output: JSON backup with asset metadata
{
  "timestamp": "2026-07-10T03:00:00Z",
  "version": "1.0",
  "assets": {
    "total": 15432,
    "by_type": {
      "product_images": 8920,
      "category_images": 45,
      "collection_images": 123,
      "brand_logos": 56
    }
  },
  "checksum": "def456...",
  "duration": "120s"
}
```

#### Full Media Asset Backup

```bash
# Sync media assets to backup location
npm run backup:media-full

# Uses Cloudinary backup API
# Stores in Cloudflare R2 or S3 compatible storage
```

### Configuration Backup Procedure

```bash
# Run configuration backup
npm run backup:config

# Output: JSON backup with configuration
{
  "timestamp": "2026-07-10T04:00:00Z",
  "version": "1.0",
  "config": {
    "site_settings": { ... },
    "navigation": { ... },
    "homepage_sections": [ ... ]
  },
  "checksum": "ghi789...",
  "duration": "15s"
}
```

### Environment Variable Backup Procedure

```bash
# Run environment backup
npm run backup:env

# Output: Encrypted JSON backup
{
  "timestamp": "2026-07-10T05:00:00Z",
  "version": "1.0",
  "environment": "production",
  "variables": {
    "SUPABASE_URL": "encrypted...",
    "DATABASE_URL": "encrypted...",
    "RAZORPAY_KEY_SECRET": "encrypted..."
  },
  "checksum": "jkl012...",
  "duration": "5s"
}
```

### CMS Export Procedure

```bash
# Run CMS export
npm run backup:cms

# Output: JSON export with CMS content
{
  "timestamp": "2026-07-10T06:00:00Z",
  "version": "1.0",
  "pages": [ ... ],
  "sections": [ ... ],
  "components": [ ... ],
  "checksum": "mno345...",
  "duration": "30s"
}
```

### Search Index Backup Procedure

```bash
# Run search index backup
npm run backup:search

# Output: JSON export with search index
{
  "timestamp": "2026-07-10T07:00:00Z",
  "version": "1.0",
  "index": {
    "products": [ ... ],
    "categories": [ ... ],
    "collections": [ ... ]
  },
  "checksum": "pqr678...",
  "duration": "60s"
}
```

---

## Backup Storage

### Primary Storage

**Neon Database:**
- Automated backups stored in Neon infrastructure
- Point-in-time recovery available
- Geographic redundancy within region
- Encryption at rest and in transit

**Cloudinary:**
- Media assets stored in Cloudinary infrastructure
- Automatic redundancy and backup
- CDN delivery with caching
- Encryption at rest and in transit

### Secondary Storage

**Cloudflare R2:**
- Full media asset backups
- Configuration backups
- CMS exports
- Search index backups
- S3-compatible API
- Geographic redundancy

**Git Repository:**
- Configuration files
- Environment variable templates (no secrets)
- Database schema
- Migration files

### Offsite Storage

**Encrypted Cloud Storage:**
- Monthly full backups
- Quarterly archive backups
- Annual long-term retention
- Encrypted with AES-256
- Access restricted to authorized personnel

### Storage Locations

| Data Type | Primary | Secondary | Offsite |
|-----------|---------|-----------|---------|
| Database | Neon | - | Monthly |
| Media | Cloudinary | R2 | Monthly |
| Configuration | Application | R2 | Monthly |
| Environment Variables | Application | R2 | Monthly |
| CMS Content | Application | R2 | Monthly |
| Search Index | Application | R2 | Monthly |

---

## Backup Retention

### Retention Policy

#### Database Retention

| Backup Type | Retention | Purpose |
|-------------|-----------|---------|
| Point-in-Time | 7 days | Quick recovery |
| Daily | 30 days | Recent recovery |
| Weekly | 12 months | Medium-term recovery |
| Monthly | 36 months | Long-term recovery |
| Quarterly Archive | 7 years | Compliance |

#### Application Retention

| Backup Type | Retention | Purpose |
|-------------|-----------|---------|
| Media Metadata | 30 days | Quick recovery |
| Configuration | 90 days | Medium-term recovery |
| Environment Variables | 90 days | Medium-term recovery |
| CMS Content | 90 days | Medium-term recovery |
| Search Index | 30 days | Quick recovery |

#### Archive Retention

| Backup Type | Retention | Purpose |
|-------------|-----------|---------|
| Monthly Full | 36 months | Long-term recovery |
| Quarterly Archive | 7 years | Compliance |
| Annual Archive | Permanent | Historical record |

### Retention Enforcement

**Automated Cleanup:**
- Old backups automatically deleted per retention policy
- Cleanup runs daily at 1:00 AM UTC
- Cleanup logs retained for 90 days

**Manual Cleanup:**
- Can be triggered on demand
- Requires approval for early deletion
- Audit trail maintained

**Archive Exports:**
- Quarterly exports to offsite storage
- Annual exports to cold storage
- Compliance requirements met

---

## Backup Verification

### Automated Verification

#### Daily Verification

```bash
# Run daily backup verification
npm run backup:verify-daily

# Checks:
# - Backup completion
# - Backup size validation
# - Checksum verification
# - Backup integrity
```

**Expected Output:**
```
✓ Database backup verified (size: 2.3GB, checksum: abc123)
✓ Media metadata backup verified (assets: 15,432, checksum: def456)
✓ Configuration backup verified (records: 1,234, checksum: ghi789)
✓ Environment backup verified (variables: 45, checksum: jkl012)
✓ All daily backups verified successfully
```

#### Weekly Verification

```bash
# Run weekly backup verification
npm run backup:verify-weekly

# Additional checks:
# - Restore test to staging
# - Data integrity validation
# - Performance measurement
```

**Expected Output:**
```
✓ Database restore test completed (duration: 45s)
✓ Data integrity verified (no corruption detected)
✓ Media metadata verified (all assets accessible)
✓ Configuration verified (all settings valid)
✓ All weekly backups verified successfully
```

#### Monthly Verification

```bash
# Run monthly backup verification
npm run backup:verify-monthly

# Additional checks:
# - Full disaster recovery drill
# - All systems recovery test
# - Documentation review
```

### Manual Verification

**Before Major Changes:**
- Verify latest backup completion
- Test restore to staging environment
- Validate data integrity
- Confirm backup accessibility

**After Major Changes:**
- Create new backup
- Verify backup completion
- Test restore procedure
- Update documentation

### Verification Checklist

- [ ] Backup completed successfully
- [ ] Backup size within expected range
- [ ] Checksum matches expected value
- [ ] Backup file accessible
- [ ] Restore test successful
- [ ] Data integrity verified
- [ ] No corruption detected
- [ ] Documentation updated

---

## Backup Restoration

### Restoration Procedures

#### Database Restoration

**Point-in-Time Recovery:**
```bash
# Restore to specific point in time
npx prisma db restore --timestamp 2026-07-10T12:00:00Z

# Restore to specific backup
npx prisma db restore --backup-id backup_20260710_020000

# Restore specific tables
npx prisma db restore --tables profiles,orders,products
```

**Full Database Restoration:**
```bash
# Restore from backup file
npx prisma db restore --file backup-20260710-020000.sql

# Verify restoration
npm run backup:verify-database
```

**Selective Restoration:**
```bash
# Restore specific data
npx prisma db restore --table profiles --filter "role = 'admin'"

# Restore with transformations
npx prisma db restore --transform "anonymize_emails"
```

#### Media Restoration

**Metadata Restoration:**
```bash
# Restore media metadata
npm run backup:restore-media

# Output: Restoration report
{
  "timestamp": "2026-07-10T10:00:00Z",
  "assets_restored": 15432,
  "assets_failed": 0,
  "duration": "180s"
}
```

**Full Asset Restoration:**
```bash
# Restore from backup storage
npm run backup:restore-media-full

# Syncs assets back to Cloudinary
# May take significant time for large libraries
```

#### Configuration Restoration

```bash
# Restore configuration
npm run backup:restore-config

# Output: Restoration report
{
  "timestamp": "2026-07-10T10:00:00Z",
  "settings_restored": 123,
  "navigation_restored": 45,
  "sections_restored": 67,
  "duration": "20s"
}
```

#### Environment Variable Restoration

```bash
# Restore environment variables
npm run backup:restore-env

# Output: Restoration report
{
  "timestamp": "2026-07-10T10:00:00Z",
  "variables_restored": 45,
  "duration": "10s"
}
```

#### CMS Content Restoration

```bash
# Restore CMS content
npm run backup:restore-cms

# Output: Restoration report
{
  "timestamp": "2026-07-10T10:00:00Z",
  "pages_restored": 89,
  "sections_restored": 234,
  "components_restored": 567,
  "duration": "45s"
}
```

### Restoration Testing

**Staging Environment Test:**
```bash
# Restore to staging
npm run backup:test-restore-staging

# Verify restoration
npm run backup:verify-restoration
```

**Production Restoration Test:**
```bash
# WARNING: Only run during maintenance window
# Test restoration to production read replica
npm run backup:test-restore-production
```

### Restoration Checklist

- [ ] Backup identified
- [ ] Restoration procedure selected
- [ ] Maintenance window scheduled (if needed)
- [ ] Stakeholders notified
- [ ] Restoration executed
- [ ] Data integrity verified
- [ ] Functionality tested
- [ ] Performance validated
- [ ] Documentation updated
- [ ] Post-restoration monitoring enabled

---

## Backup Security

### Encryption

**At Rest:**
- All backups encrypted with AES-256
- Encryption keys stored separately
- Key rotation every 90 days
- Hardware security modules (HSM) for key storage

**In Transit:**
- TLS 1.3 for all transfers
- Certificate pinning
- Mutual TLS for critical transfers

### Access Control

**Authentication:**
- Multi-factor authentication required
- Role-based access control
- Temporary credentials for restoration
- Audit trail for all access

**Authorization:**
- Least privilege principle
- Separation of duties
- Regular access reviews
- Automated access revocation

### Audit Trail

**Logging:**
- All backup operations logged
- All restoration operations logged
- All access attempts logged
- Logs retained for 90 days

**Monitoring:**
- Backup completion monitored
- Restoration attempts monitored
- Access anomalies detected
- Automated alerts on suspicious activity

### Compliance

**Data Protection:**
- GDPR compliance for EU data
- CCPA compliance for California data
- SOC 2 Type II compliance
- PCI DSS compliance for payment data

**Retention:**
- Data retention policy enforced
- Right to deletion honored
- Data minimization practiced
- Privacy by design

---

## Appendix

### Backup Scripts

**Database Backup Script:**
```typescript
// scripts/backup-database.ts
import { PrismaClient } from '@prisma/client';
import { backupDatabase } from '../api/_lib/backup-recovery';

const prisma = new PrismaClient();

async function main() {
  const result = await backupDatabase(prisma, {
    scope: 'critical',
    compression: true,
    encryption: true,
  });
  
  console.log('Backup completed:', result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Media Backup Script:**
```typescript
// scripts/backup-media.ts
import { backupMedia } from '../api/_lib/backup-recovery';

async function main() {
  const result = await backupMedia({
    includeMetadata: true,
    includeAssets: false,
    compression: true,
  });
  
  console.log('Backup completed:', result);
}

main()
  .catch(console.error);
```

**Configuration Backup Script:**
```typescript
// scripts/backup-config.ts
import { backupConfiguration } from '../api/_lib/backup-recovery';

async function main() {
  const result = await backupConfiguration({
    includeSettings: true,
    includeNavigation: true,
    includeHomepage: true,
  });
  
  console.log('Backup completed:', result);
}

main()
  .catch(console.error);
```

### Useful Commands

```bash
# Database backup
npm run backup:database

# Media backup
npm run backup:media

# Configuration backup
npm run backup:config

# Environment backup
npm run backup:env

# CMS backup
npm run backup:cms

# Search index backup
npm run backup:search

# Full backup
npm run backup:full

# Verify backups
npm run backup:verify

# Restore database
npm run backup:restore-database

# Restore media
npm run backup:restore-media

# Restore configuration
npm run backup:restore-config
```

### Backup Status Dashboard

**Metrics to Monitor:**
- Backup completion rate
- Backup success rate
- Backup duration
- Backup size
- Restore success rate
- Restore duration
- Storage utilization
- Cost per backup

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-10 | Cascade AI | Initial backup strategy |

---

**End of Backup Strategy**
