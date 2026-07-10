# NABOME Monitoring & Alerting Strategy

**Version:** 1.0  
**Date:** 2026-07-10  
**Status:** Production Ready

---

## Overview

This document outlines the comprehensive monitoring and alerting strategy for the NABOME e-commerce platform. It covers monitoring systems, alert configurations, and response procedures.

---

## Table of Contents

1. [Monitoring Architecture](#monitoring-architecture)
2. [Monitoring Systems](#monitoring-systems)
3. [Alerting Strategy](#alerting-strategy)
4. [Alert Configurations](#alert-configurations)
5. [Response Procedures](#response-procedures)
6. [Dashboard Configuration](#dashboard-configuration)

---

## Monitoring Architecture

### Monitoring Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Error Tracking | Sentry | Error aggregation and alerting |
| Performance Monitoring | Sentry + Custom | Performance metrics |
| Database Monitoring | Neon Console | Database health and performance |
| CDN Monitoring | Cloudflare Analytics | CDN performance and traffic |
| User Analytics | Google Analytics | User behavior and conversions |
| Uptime Monitoring | UptimeRobot + Custom | Site availability |
| Log Aggregation | Sentry + Cloudflare | Log collection and analysis |

### Data Flow

```
Application → Sentry (Errors, Performance)
            → Cloudflare (CDN, Traffic)
            → Neon (Database)
            → Google Analytics (User Behavior)
            → Custom Dashboards (Aggregated Metrics)
```

### Monitoring Levels

**Level 1: Infrastructure**
- Server uptime
- Database health
- CDN status
- External service health

**Level 2: Application**
- Error rates
- Response times
- Throughput
- Resource utilization

**Level 3: Business**
- Order volume
- Conversion rate
- Revenue
- User engagement

---

## Monitoring Systems

### Sentry Monitoring

**Configuration:**
```typescript
// api/_lib/sentry.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.GIT_SHA,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  sessionSampleRate: 1.0,
});
```

**Monitored Events:**
- JavaScript errors
- API errors
- Database errors
- External service errors
- Performance issues

**Key Metrics:**
- Error rate by endpoint
- Error rate by user
- Error rate by browser
- Error rate by geography
- Performance metrics (P95, P99)

**Alerting:**
- Error rate > 1% (Warning)
- Error rate > 5% (Critical)
- New error type detected
- Performance degradation

### Neon Database Monitoring

**Monitored Metrics:**
- Connection pool usage
- Query performance
- Database size
- Storage utilization
- Compute utilization

**Key Queries:**
```sql
-- Connection pool usage
SELECT state, count(*) 
FROM pg_stat_activity 
GROUP BY state;

-- Slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Database size
SELECT pg_size_pretty(pg_database_size('nabome'));

-- Table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Alerting:**
- Connection pool > 80% (Warning)
- Connection pool > 95% (Critical)
- Query latency > 100ms (Warning)
- Query latency > 500ms (Critical)
- Storage > 80% (Warning)
- Storage > 95% (Critical)

### Cloudflare Monitoring

**Monitored Metrics:**
- CDN cache hit ratio
- Edge response time
- Bandwidth usage
- Request volume
- Error rate
- Threat level

**Key Metrics:**
- Cache hit ratio (target > 80%)
- Edge response time (target < 200ms)
- Bandwidth usage
- Request volume
- HTTP error rate (4xx, 5xx)
- Threat level (DDoS, attacks)

**Alerting:**
- Cache hit ratio < 70% (Warning)
- Cache hit ratio < 50% (Critical)
- Edge response time > 500ms (Warning)
- Edge response time > 2s (Critical)
- Error rate > 1% (Warning)
- Error rate > 5% (Critical)
- DDoS attack detected (Critical)

### Google Analytics Monitoring

**Monitored Metrics:**
- Active users
- Page views
- Sessions
- Bounce rate
- Conversion rate
- Revenue

**Key Metrics:**
- Active users (real-time)
- Page views (per hour)
- Sessions (per day)
- Bounce rate (target < 40%)
- Conversion rate (target > 3%)
- Revenue (per day)

**Alerting:**
- Active users drop > 50% (Warning)
- Bounce rate > 60% (Warning)
- Conversion rate drop > 50% (Warning)
- Revenue drop > 50% (Warning)

### Custom Health Monitoring

**Health Endpoint:**
```typescript
// api/health.ts
export async function GET(request: Request) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      supabase: await checkSupabase(),
      razorpay: await checkRazorpay(),
      resend: await checkResend(),
      cloudinary: await checkCloudinary(),
    },
  };
  
  return Response.json(health);
}
```

**Monitored Checks:**
- Database connectivity
- Supabase connectivity
- Razorpay connectivity
- Resend connectivity
- Cloudinary connectivity

**Alerting:**
- Health check failing (Critical)
- Multiple checks failing (Critical)
- Single check failing (Warning)

### Performance Monitoring

**Web Vitals:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Interaction to Next Paint (INP)

**API Latency:**
- P50 response time
- P95 response time
- P99 response time
- Error rate

**Database Latency:**
- Query latency (P50, P95, P99)
- Connection latency
- Transaction latency

**Alerting:**
- FCP > 2.5s (Warning)
- LCP > 4s (Critical)
- CLS > 0.25 (Critical)
- API P95 > 2s (Warning)
- API P95 > 5s (Critical)
- DB P95 > 100ms (Warning)
- DB P95 > 500ms (Critical)

---

## Alerting Strategy

### Alert Severity Levels

| Severity | Description | Response Time | Escalation |
|----------|-------------|---------------|------------|
| P1 - Critical | Site down, data loss, security breach | 15 minutes | CTO, CEO |
| P2 - High | Major feature broken, degraded performance | 1 hour | Engineering Lead |
| P3 - Medium | Minor feature broken, non-critical errors | 4 hours | Team Lead |
| P4 - Low | Cosmetic issues, minor bugs | 24 hours | Developer |

### Alert Channels

**Primary Channels:**
- Email (all alerts)
- Slack (P2-P4)
- SMS (P1)
- PagerDuty (P1 on-call)

**Channel Configuration:**
```yaml
P1:
  - SMS
  - PagerDuty
  - Slack (#alerts-critical)
  - Email (on-call team)

P2:
  - Slack (#alerts-high)
  - Email (engineering team)

P3:
  - Slack (#alerts-medium)
  - Email (team lead)

P4:
  - Slack (#alerts-low)
  - Email (developer)
```

### Alert Escalation

**Escalation Matrix:**
```
Level 1: On-call Engineer (15 minutes)
  ↓ No response
Level 2: Engineering Lead (30 minutes)
  ↓ No response
Level 3: CTO (1 hour)
  ↓ No response
Level 4: CEO (2 hours)
```

**Escalation Triggers:**
- No acknowledgment within response time
- Issue not resolved within SLA
- Severity level increases
- Multiple related alerts

---

## Alert Configurations

### Build Failures

**Alert Condition:**
- GitHub Actions workflow fails

**Severity:** P2 - High

**Response Time:** 1 hour

**Alert Message:**
```
BUILD FAILURE

Workflow: Deploy to Production
Branch: production
Commit: abc123
Author: developer
Error: Build failed with exit code 1

Action Required: Review build logs and fix build errors
```

**Response Procedure:**
1. Review build logs
2. Identify build error
3. Fix build error
4. Re-run workflow
5. Monitor deployment

### Deployment Failures

**Alert Condition:**
- Cloudflare Pages deployment fails
- Post-deployment health check fails

**Severity:** P1 - Critical

**Response Time:** 15 minutes

**Alert Message:**
```
DEPLOYMENT FAILURE

Environment: production
Commit: abc123
Error: Deployment failed
Health Check: FAILED

Action Required: Immediate investigation and rollback if needed
```

**Response Procedure:**
1. Check deployment logs
2. Identify deployment error
3. Rollback if critical
4. Fix deployment issue
5. Redeploy

### Payment Failures

**Alert Condition:**
- Payment failure rate > 2%
- Razorpay webhook failures
- Payment verification failures

**Severity:** P1 - Critical

**Response Time:** 15 minutes

**Alert Message:**
```
PAYMENT FAILURE ALERT

Failure Rate: 5.2%
Threshold: 2%
Time Window: Last 15 minutes
Affected Orders: 23

Action Required: Immediate investigation of payment processing
```

**Response Procedure:**
1. Check Razorpay status
2. Review payment logs
3. Identify failure pattern
4. Contact Razorpay support if needed
5. Communicate with affected customers

### Database Failures

**Alert Condition:**
- Database health check fails
- Connection pool > 95%
- Query latency > 500ms
- Database size > 95%

**Severity:** P1 - Critical

**Response Time:** 15 minutes

**Alert Message:**
```
DATABASE FAILURE ALERT

Health Check: FAILED
Connection Pool: 97%
Query Latency: 750ms
Database Size: 96%

Action Required: Immediate database investigation
```

**Response Procedure:**
1. Check Neon status
2. Review database logs
3. Identify issue (connection, query, storage)
4. Scale resources if needed
5. Contact Neon support if needed

### Authentication Failures

**Alert Condition:**
- Authentication failure rate > 5%
- Supabase health check fails
- Session creation failures

**Severity:** P1 - Critical

**Response Time:** 15 minutes

**Alert Message:**
```
AUTHENTICATION FAILURE ALERT

Failure Rate: 7.3%
Threshold: 5%
Time Window: Last 15 minutes
Supabase Health: FAILED

Action Required: Immediate investigation of authentication system
```

**Response Procedure:**
1. Check Supabase status
2. Review auth logs
3. Identify failure pattern
4. Contact Supabase support if needed
5. Communicate with affected users

### Media Failures

**Alert Condition:**
- Cloudinary health check fails
- Image upload failures > 5%
- CDN delivery failures

**Severity:** P2 - High

**Response Time:** 1 hour

**Alert Message:**
```
MEDIA FAILURE ALERT

Cloudinary Health: FAILED
Upload Failure Rate: 6.2%
CDN Delivery: DEGRADED

Action Required: Investigation of media processing and delivery
```

**Response Procedure:**
1. Check Cloudinary status
2. Review media logs
3. Identify failure pattern
4. Enable fallback if needed
5. Contact Cloudinary support if needed

### Cloudflare Failures

**Alert Condition:**
- Cloudflare Pages status fails
- CDN error rate > 5%
- DDoS attack detected

**Severity:** P1 - Critical

**Response Time:** 15 minutes

**Alert Message:**
```
CLOUDFLARE FAILURE ALERT

Pages Status: FAILED
CDN Error Rate: 6.8%
DDoS Attack: DETECTED

Action Required: Immediate investigation of Cloudflare infrastructure
```

**Response Procedure:**
1. Check Cloudflare status page
2. Review Cloudflare logs
3. Enable Cloudflare protection
4. Contact Cloudflare support if needed
5. Communicate status to users

### Rate Limiting

**Alert Condition:**
- Rate limit violations > 100/hour
- IP blocking rate > 50/hour
- API rate limit > 80%

**Severity:** P2 - High

**Response Time:** 1 hour

**Alert Message:**
```
RATE LIMITING ALERT

Violations: 156/hour
IP Blocks: 67/hour
API Rate Limit: 85%

Action Required: Investigation of rate limiting and potential abuse
```

**Response Procedure:**
1. Review rate limit logs
2. Identify abusive IPs
3. Adjust rate limits if needed
4. Block malicious IPs
5. Monitor for recurrence

### Storage Limits

**Alert Condition:**
- Database storage > 80%
- Cloudinary storage > 80%
- Cloudflare R2 storage > 80%

**Severity:** P2 - High

**Response Time:** 1 hour

**Alert Message:**
```
STORAGE LIMIT ALERT

Database Storage: 82%
Cloudinary Storage: 85%
Cloudflare R2 Storage: 78%

Action Required: Storage cleanup or expansion
```

**Response Procedure:**
1. Review storage usage
2. Identify large data sets
3. Clean up old data
4. Expand storage if needed
5. Monitor for recurrence

### API Latency

**Alert Condition:**
- API P95 response time > 2s
- API P99 response time > 5s
- Error rate > 1%

**Severity:** P2 - High

**Response Time:** 1 hour

**Alert Message:**
```
API LATENCY ALERT

P95 Response Time: 2.3s
P99 Response Time: 5.8s
Error Rate: 1.2%

Action Required: Investigation of API performance
```

**Response Procedure:**
1. Review API logs
2. Identify slow endpoints
3. Optimize queries
4. Implement caching
5. Scale resources if needed

---

## Response Procedures

### Standard Response Procedure

**1. Acknowledge Alert**
- Acknowledge within response time
- Update alert status
- Communicate acknowledgment

**2. Investigate Issue**
- Review logs and metrics
- Identify root cause
- Assess impact scope
- Estimate resolution time

**3. Implement Fix**
- Apply fix or workaround
- Monitor fix effectiveness
- Adjust if needed
- Verify resolution

**4. Document Incident**
- Document timeline
- Document root cause
- Document resolution
- Update runbook if needed

**5. Post-Incident Review**
- Conduct post-mortem
- Identify preventive measures
- Update procedures
- Schedule follow-up

### Critical Incident Response (P1)

**Immediate Actions (0-15 minutes):**
- Acknowledge alert
- Join incident bridge
- Enable maintenance mode if needed
- Begin investigation

**Investigation (15-30 minutes):**
- Identify root cause
- Assess impact scope
- Determine resolution strategy
- Estimate resolution time

**Resolution (30 minutes - 4 hours):**
- Implement fix or workaround
- Monitor resolution progress
- Adjust strategy if needed
- Verify resolution

**Post-Resolution (4-5 hours):**
- Disable maintenance mode
- Monitor for recurrence
- Document incident
- Conduct post-mortem

### High Priority Response (P2)

**Immediate Actions (0-1 hour):**
- Acknowledge alert
- Begin investigation
- Assess impact scope

**Investigation (1-2 hours):**
- Identify root cause
- Determine resolution strategy
- Estimate resolution time

**Resolution (2-8 hours):**
- Implement fix
- Monitor resolution
- Verify resolution

**Post-Resolution (8-9 hours):**
- Document incident
- Update procedures if needed

### Medium Priority Response (P3)

**Immediate Actions (0-4 hours):**
- Acknowledge alert
- Add to backlog
- Assess impact

**Investigation (4-8 hours):**
- Investigate when available
- Identify root cause
- Plan resolution

**Resolution (8-24 hours):**
- Implement fix
- Test resolution
- Deploy fix

**Post-Resolution (24-48 hours):**
- Document incident
- Update procedures if needed

### Low Priority Response (P4)

**Immediate Actions (0-24 hours):**
- Acknowledge alert
- Add to backlog
- Assess impact

**Investigation (24-48 hours):**
- Investigate when available
- Identify root cause
- Plan resolution

**Resolution (48-168 hours):**
- Implement fix during next sprint
- Test resolution
- Deploy fix

**Post-Resolution (168-192 hours):**
- Document incident
- Update procedures if needed

---

## Dashboard Configuration

### Main Dashboard

**Metrics Displayed:**
- Site uptime (24 hours, 7 days, 30 days)
- Error rate (24 hours, 7 days, 30 days)
- Response time (P50, P95, P99)
- Active users (real-time)
- Orders (24 hours, 7 days, 30 days)
- Revenue (24 hours, 7 days, 30 days)

**Refresh Rate:** Every 30 seconds

### Infrastructure Dashboard

**Metrics Displayed:**
- Database health
- Database connection pool
- Database storage
- CDN cache hit ratio
- CDN error rate
- External service health

**Refresh Rate:** Every 1 minute

### Application Dashboard

**Metrics Displayed:**
- Error rate by endpoint
- Response time by endpoint
- Throughput by endpoint
- User sessions
- Page views
- Conversion rate

**Refresh Rate:** Every 1 minute

### Business Dashboard

**Metrics Displayed:**
- Orders (hourly, daily, weekly)
- Revenue (hourly, daily, weekly)
- Conversion rate (daily, weekly)
- Average order value (daily, weekly)
- Customer acquisition cost (weekly)
- Customer lifetime value (weekly)

**Refresh Rate:** Every 5 minutes

### Security Dashboard

**Metrics Displayed:**
- Failed authentication attempts
- Rate limit violations
- Blocked IPs
- Security events
- Vulnerability alerts
- Compliance status

**Refresh Rate:** Every 5 minutes

---

## Appendix

### Alert Configuration Examples

**Sentry Alert Configuration:**
```yaml
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    threshold: 5%
    timeWindow: 15m
    severity: critical
    channels: [sms, pagerduty, slack, email]
    
  - name: Performance Degradation
    condition: p95_response_time > 5s
    threshold: 5s
    timeWindow: 15m
    severity: high
    channels: [slack, email]
    
  - name: New Error Type
    condition: new_error_detected
    severity: medium
    channels: [slack, email]
```

**Cloudflare Alert Configuration:**
```yaml
alerts:
  - name: High Error Rate
    condition: http_error_rate > 5%
    threshold: 5%
    timeWindow: 15m
    severity: critical
    channels: [sms, pagerduty, slack, email]
    
  - name: Low Cache Hit Ratio
    condition: cache_hit_ratio < 50%
    threshold: 50%
    timeWindow: 1h
    severity: high
    channels: [slack, email]
    
  - name: DDoS Attack
    condition: ddos_attack_detected
    severity: critical
    channels: [sms, pagerduty, slack, email]
```

### Useful Commands

```bash
# Check health endpoint
curl https://www.nabome.online/api/health

# Check Sentry error rate
# Via Sentry dashboard

# Check Cloudflare analytics
# Via Cloudflare dashboard

# Check Neon database health
# Via Neon console

# Check Google Analytics
# Via Google Analytics dashboard
```

### Contact Information

| Role | Email | Phone | On-Call |
|------|-------|-------|---------|
| Incident Commander | incident@nabome.online | - | 24/7 |
| Database Lead | db@nabome.online | - | 24/7 |
| Security Lead | security@nabome.online | - | 24/7 |
| DevOps Lead | devops@nabome.online | - | 24/7 |

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-10 | Cascade AI | Initial monitoring and alerting strategy |

---

**End of Monitoring & Alerting Strategy**
