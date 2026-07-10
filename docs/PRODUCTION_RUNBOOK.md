# NABOME Production Runbook

**Version:** 1.0  
**Date:** 2026-07-10  
**Status:** Production Ready

---

## Overview

This runbook provides operational procedures for the NABOME e-commerce platform in production. It covers daily operations, monitoring, incident response, and maintenance procedures.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Production Environment](#production-environment)
3. [Daily Operations](#daily-operations)
4. [Monitoring Procedures](#monitoring-procedures)
5. [Incident Response](#incident-response)
6. [Maintenance Procedures](#maintenance-procedures)
7. [Emergency Procedures](#emergency-procedures)
8. [Contact Information](#contact-information)

---

## System Architecture

### Infrastructure Stack

- **Hosting:** Cloudflare Pages (Edge CDN)
- **Compute:** Cloudflare Pages Functions (Edge Runtime)
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** Prisma 6.6
- **Authentication:** Supabase Auth
- **Media Storage:** Cloudinary
- **Email Service:** Resend
- **Payment Gateway:** Razorpay
- **Bot Protection:** Cloudflare Turnstile
- **CDN:** Cloudflare CDN
- **DNS:** Cloudflare DNS

### Key Services

| Service | Provider | Purpose | SLA |
|---------|----------|---------|-----|
| Frontend | Cloudflare Pages | Static SPA + Edge Functions | 99.9% |
| Database | Neon PostgreSQL | Data persistence | 99.95% |
| Auth | Supabase Auth | User authentication | 99.9% |
| Media | Cloudinary | Image/video storage | 99.9% |
| Email | Resend | Transactional emails | 99.5% |
| Payments | Razorpay | Payment processing | 99.9% |

---

## Production Environment

### Environment Variables

#### Critical Secrets (Never commit to git)

```bash
# Supabase
SUPABASE_URL=https://*.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://user:password@ep-*.aws.neon.tech/nabome
DATABASE_URL_POOLED=postgresql://user:password@ep-*.aws.neon.tech/nabome?pgbouncer=true

# Razorpay
RAZORPAY_KEY_ID=rzp_live_*
RAZORPAY_KEY_SECRET=*
RAZORPAY_WEBHOOK_SECRET=*

# Resend
RESEND_API_KEY=re_*

# Cloudinary
CLOUDINARY_CLOUD_NAME=*
CLOUDINARY_API_KEY=*
CLOUDINARY_API_SECRET=*

# Turnstile
TURNSTILE_SECRET_KEY=0x*

# Admin
ADMIN_EMAILS=admin@nabome.online,ops@nabome.online
```

#### Frontend Environment Variables

```bash
VITE_SUPABASE_URL=https://*.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=rzp_live_*
VITE_SITE_URL=https://www.nabome.online
VITE_GA_ID=G-*
VITE_CLOUDINARY_CLOUD_NAME=*
VITE_CLOUDINARY_UPLOAD_PRESET=*
VITE_TURNSTILE_SITE_KEY=0x*
```

### Cloudflare Configuration

#### Pages Project

- **Project Name:** nabome
- **Production Branch:** production
- **Build Command:** npm run pages:build
- **Build Output:** dist/
- **Environment Variables:** Configured in Cloudflare dashboard

#### Wrangler Configuration

```jsonc
{
  "compatibility_date": "2026-06-30",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": "dist",
  "placement": {
    "mode": "smart"
  },
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "*"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "RATE_LIMIT_STORE",
      "id": "*"
    },
    {
      "binding": "FEATURE_FLAGS_KV",
      "id": "*"
    }
  ]
}
```

---

## Daily Operations

### Morning Checklist (Daily 9:00 AM)

- [ ] Check health endpoint: `GET https://www.nabome.online/api/health`
- [ ] Review error logs in Sentry
- [ ] Check database connection status
- [ ] Verify payment processing (Razorpay dashboard)
- [ ] Review email delivery status (Resend dashboard)
- [ ] Check CDN performance (Cloudflare analytics)
- [ ] Review overnight orders for fraud
- [ ] Check backup completion status

### Evening Checklist (Daily 6:00 PM)

- [ ] Review daily sales metrics
- [ ] Check error rates by endpoint
- [ ] Verify cache hit ratios
- [ ] Review failed webhooks
- [ ] Check for rate limit violations
- [ ] Review security alerts
- [ ] Verify CDN cache status

### Weekly Tasks (Every Monday)

- [ ] Review weekly performance metrics
- [ ] Check database query performance
- [ ] Review failed payment transactions
- [ ] Audit user accounts for suspicious activity
- [ ] Review CDN bandwidth usage
- [ ] Check storage limits (Cloudinary, Neon)
- [ ] Review API rate limiting effectiveness
- [ ] Test backup restore procedure

### Monthly Tasks (1st of Month)

- [ ] Full security audit review
- [ ] Database index optimization review
- [ ] CDN cache strategy review
- [ ] Cost analysis by service
- [ ] Capacity planning review
- [ ] Dependency security audit
- [ ] Compliance checklist review
- [ ] Disaster recovery drill

---

## Monitoring Procedures

### Health Monitoring

#### Health Endpoint

```bash
curl https://www.nabome.online/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-07-10T09:00:00Z",
  "checks": {
    "database": "healthy",
    "supabase": "healthy",
    "razorpay": "healthy",
    "resend": "healthy",
    "cloudinary": "healthy"
  }
}
```

#### Critical Metrics

| Metric | Threshold | Alert Level |
|--------|-----------|-------------|
| Error Rate | > 1% | Warning |
| Error Rate | > 5% | Critical |
| Response Time (P95) | > 2s | Warning |
| Response Time (P95) | > 5s | Critical |
| Database Latency | > 100ms | Warning |
| Database Latency | > 500ms | Critical |
| Cache Hit Rate | < 70% | Warning |
| Cache Hit Rate | < 50% | Critical |
| Failed Payments | > 2% | Warning |
| Failed Payments | > 5% | Critical |

### Log Monitoring

#### Log Levels

- **DEBUG:** Detailed diagnostic information
- **INFO:** General informational messages
- **WARN:** Warning conditions (not errors)
- **ERROR:** Error conditions (requires attention)
- **FATAL:** Critical errors (immediate action required)

#### Log Aggregation

Logs are sent to:
- **Sentry:** Error and fatal logs
- **Cloudflare Analytics:** Request logs
- **Neon Console:** Database query logs

#### Critical Log Patterns to Monitor

```
# Authentication failures
"auth.login_failed"
"auth.token_invalid"
"auth.session_expired"

# Payment failures
"payment.verification_failed"
"payment.webhook_failed"
"payment.duplicate_detected"

# Database errors
"database.connection_failed"
"database.query_timeout"
"database.constraint_violation"

# Rate limiting
"rate_limit.exceeded"
"rate_limit.blocked_ip"

# Security events
"security.csrf_invalid"
"security.webhook_replay"
"security.suspicious_activity"
```

### Performance Monitoring

#### Key Performance Indicators (KPIs)

| KPI | Target | Current | Trend |
|-----|--------|---------|-------|
| Homepage Load Time | < 2s | - | - |
| TTFB | < 500ms | - | - |
| Lighthouse Score | > 90 | - | - |
| Cache Hit Rate | > 80% | - | - |
| Error Rate | < 0.5% | - | - |
| Uptime | > 99.9% | - | - |

#### Monitoring Tools

- **Sentry:** Error tracking and performance monitoring
- **Cloudflare Analytics:** CDN performance and traffic
- **Neon Console:** Database performance
- **Google Analytics:** User behavior and conversions
- **Lighthouse CI:** Performance regression testing

---

## Incident Response

### Incident Severity Levels

| Severity | Description | Response Time | Escalation |
|----------|-------------|---------------|------------|
| P1 - Critical | Site down, payments failing, data loss | 15 minutes | CTO, CEO |
| P2 - High | Major feature broken, degraded performance | 1 hour | Engineering Lead |
| P3 - Medium | Minor feature broken, non-critical errors | 4 hours | Team Lead |
| P4 - Low | Cosmetic issues, minor bugs | 24 hours | Developer |

### Incident Response Procedure

#### 1. Detection

- Automated alerts trigger
- User reports received
- Monitoring dashboard anomalies

#### 2. Assessment

- Verify incident scope
- Determine severity level
- Identify affected systems
- Estimate impact

#### 3. Response

- **P1 Critical:** Immediate incident bridge, all hands on deck
- **P2 High:** Engineering team mobilized, status updates hourly
- **P3 Medium:** Assigned developer, status updates every 4 hours
- **P4 Low:** Added to backlog, normal triage process

#### 4. Resolution

- Implement fix or workaround
- Verify resolution
- Monitor for recurrence
- Document incident

#### 5. Post-Mortem

- Conduct root cause analysis
- Document timeline and actions
- Identify preventive measures
- Update runbook if needed

### Common Incident Scenarios

#### Site Down (P1)

**Symptoms:**
- Health endpoint returning 503
- All pages returning errors
- CDN not serving content

**Immediate Actions:**
1. Check Cloudflare Pages status
2. Verify DNS resolution
3. Check recent deployments
4. Rollback if deployment-related
5. Escalate to Cloudflare support if infrastructure issue

**Rollback Procedure:**
```bash
# Via GitHub Actions
1. Go to Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select "rollback" option
5. Specify commit SHA to rollback to
6. Monitor deployment
```

#### Payment Processing Failure (P1)

**Symptoms:**
- Razorpay webhook failures
- Orders not completing
- Payment verification errors

**Immediate Actions:**
1. Check Razorpay status page
2. Verify webhook secret configuration
3. Check webhook event logs
4. Manually verify stuck payments
5. Contact Razorpay support if needed

#### Database Connection Failure (P1)

**Symptoms:**
- Database health check failing
- All API endpoints returning errors
- Connection timeout errors

**Immediate Actions:**
1. Check Neon status page
2. Verify connection pool status
3. Check database resource limits
4. Enable read replica if available
5. Contact Neon support if needed

#### High Error Rate (P2)

**Symptoms:**
- Error rate > 5%
- Multiple endpoints failing
- Increased 500 errors

**Immediate Actions:**
1. Check Sentry for error patterns
2. Identify common error type
3. Check recent code changes
4. Rollback if deployment-related
5. Implement hotfix if bug

#### Performance Degradation (P2)

**Symptoms:**
- Response times > 5s
- High database latency
- CDN cache miss rate high

**Immediate Actions:**
1. Check CDN cache status
2. Review database query performance
3. Check Cloudflare smart placement
4. Clear CDN cache if needed
5. Scale database resources if needed

---

## Maintenance Procedures

### Scheduled Maintenance Windows

- **Weekly:** Sunday 2:00 AM - 4:00 AM UTC (Low traffic)
- **Monthly:** First Sunday 2:00 AM - 6:00 AM UTC
- **Quarterly:** First Sunday 2:00 AM - 8:00 AM UTC

### Database Maintenance

#### Weekly Database Tasks

```sql
-- Analyze table statistics
ANALYZE;

-- Reindex frequently updated tables
REINDEX TABLE CONCURRENTLY orders;
REINDEX TABLE CONCURRENTLY auth_sessions;
REINDEX TABLE CONCURRENTLY webhook_events;

-- Vacuum analyze
VACUUM ANALYZE;
```

#### Monthly Database Tasks

```sql
-- Full vacuum (during maintenance window)
VACUUM FULL;

-- Check for bloat
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Update statistics
ANALYZE VERBOSE;
```

#### Index Maintenance

```sql
-- Check unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey'
ORDER BY schemaname, tablename;
```

### CDN Cache Maintenance

#### Cache Purge Procedures

**Full Cache Purge (Emergency Only):**
```bash
# Via Cloudflare dashboard
1. Go to Caching > Configuration
2. Click "Purge Everything"
3. Confirm purge
```

**Selective Cache Purge:**
```bash
# Purge specific URLs
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://www.nabome.online/api/products","https://www.nabome.online/api/categories"]}'
```

**Cache Tag Purge:**
```bash
# Purge by cache tag
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"tags":["products","categories"]}'
```

### Backup Verification

#### Weekly Backup Verification

```bash
# Run backup verification script
npm run backup:verify

# Expected output
✓ Database backup verified (size: 2.3GB, checksum: abc123)
✓ Media backup verified (assets: 15,432, size: 45.2GB)
✓ Configuration backup verified (records: 1,234)
✓ All backups verified successfully
```

#### Monthly Restore Test

```bash
# Test restore to staging database
npm run backup:test-restore

# Expected output
✓ Database restore test completed (duration: 45s)
✓ Data integrity verified
✓ No data loss detected
```

### Dependency Updates

#### Weekly Dependency Check

```bash
# Check for security vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Update non-breaking dependencies
npm update
```

#### Monthly Dependency Update

```bash
# Update all dependencies
npm update --save

# Run tests
npm test

# Build verification
npm run build

# Deploy to staging for testing
# If successful, deploy to production
```

---

## Emergency Procedures

### Security Incident Response

#### Data Breach

1. **Immediate Containment**
   - Disable affected accounts
   - Rotate all secrets
   - Enable enhanced monitoring
   - Notify security team

2. **Investigation**
   - Identify breach scope
   - Determine data exposed
   - Preserve evidence
   - Timeline reconstruction

3. **Notification**
   - Notify affected users
   - Notify regulatory bodies (if required)
   - Notify stakeholders
   - Public statement (if needed)

4. **Recovery**
   - Patch vulnerabilities
   - Restore from clean backups
   - Implement additional controls
   - Monitor for recurrence

#### Ransomware

1. **Immediate Actions**
   - Isolate affected systems
   - Shut down network access
   - Preserve evidence
   - Contact security team

2. **Assessment**
   - Determine infection scope
   - Identify ransomware type
   - Assess data impact
   - Evaluate decryption options

3. **Recovery**
   - Restore from offline backups
   - Rebuild systems from scratch
   - Implement enhanced security
   - Monitor for recurrence

### Service Outage Recovery

#### Complete Site Outage

1. **Assessment**
   - Determine outage scope
   - Identify root cause
   - Estimate recovery time
   - Communicate status

2. **Recovery Options**
   - Rollback to last known good state
   - Switch to backup systems
   - Implement temporary workaround
   - Full system rebuild

3. **Verification**
   - Test all critical paths
   - Verify data integrity
   - Monitor for issues
   - Document lessons learned

#### Database Failure

1. **Immediate Actions**
   - Switch to read replica (if available)
   - Enable maintenance mode
   - Preserve database state
   - Contact database support

2. **Recovery**
   - Restore from recent backup
   - Replay transaction logs
   - Verify data integrity
   - Update connection strings

3. **Post-Recovery**
   - Monitor performance
   - Check for data loss
   - Update statistics
   - Optimize queries

---

## Contact Information

### Team Contacts

| Role | Name | Email | Phone | On-Call |
|------|------|-------|-------|---------|
| CTO | - | cto@nabome.online | - | 24/7 |
| Engineering Lead | - | eng@nabome.online | - | 24/7 |
| DevOps Engineer | - | devops@nabome.online | - | Business Hours |
| Security Lead | - | security@nabome.online | - | 24/7 |

### Service Provider Contacts

| Service | Support Email | Support Phone | SLA |
|---------|---------------|---------------|-----|
| Cloudflare | support@cloudflare.com | - | 99.9% |
| Neon Database | support@neon.tech | - | 99.95% |
| Supabase | support@supabase.io | - | 99.9% |
| Cloudinary | support@cloudinary.com | - | 99.9% |
| Resend | support@resend.com | - | 99.5% |
| Razorpay | support@razorpay.com | - | 99.9% |

### Escalation Matrix

| Issue Type | Level 1 | Level 2 | Level 3 |
|------------|---------|---------|---------|
| Site Down | Engineering Lead | CTO | CEO |
| Security Incident | Security Lead | CTO | CEO |
| Payment Issue | Engineering Lead | CTO | CEO |
| Database Issue | DevOps Engineer | Engineering Lead | CTO |
| Performance Issue | DevOps Engineer | Engineering Lead | CTO |

---

## Appendix

### Useful Commands

```bash
# Health check
curl https://www.nabome.online/api/health

# Clear CDN cache
# Via Cloudflare dashboard

# Check database connection
npx prisma db push --accept-data-loss

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Run tests
npm test

# Build for production
npm run build

# Deploy to production
# Via GitHub Actions

# Rollback deployment
# Via GitHub Actions
```

### Quick Reference

| Task | Command | Location |
|------|---------|----------|
| Health Check | `curl /api/health` | Terminal |
| View Logs | Sentry Dashboard | Web |
| CDN Status | Cloudflare Dashboard | Web |
| Database Status | Neon Console | Web |
| Payment Status | Razorpay Dashboard | Web |
| Email Status | Resend Dashboard | Web |
| Deploy | GitHub Actions | Web |
| Rollback | GitHub Actions | Web |

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-10 | Cascade AI | Initial production runbook |

---

**End of Production Runbook**
