# NABOME Deployment Runbook

**Version:** 1.0  
**Date:** 2026-07-10  
**Status:** Production Ready

---

## Overview

This document outlines the deployment procedures for the NABOME e-commerce platform. It covers deployment pipelines, rollback procedures, and deployment verification steps.

---

## Table of Contents

1. [Deployment Architecture](#deployment-architecture)
2. [Deployment Pipeline](#deployment-pipeline)
3. [Deployment Procedures](#deployment-procedures)
4. [Rollback Procedures](#rollback-procedures)
5. [Database Migrations](#database-migrations)
6. [Build Verification](#build-verification)
7. [Security Scanning](#security-scanning)
8. [Dependency Scanning](#dependency-scanning)
9. [Automatic Release Creation](#automatic-release-creation)

---

## Deployment Architecture

### Deployment Targets

| Environment | Purpose | Branch | URL |
|-------------|---------|--------|-----|
| Production | Live production site | production | https://www.nabome.online |
| Staging | Pre-production testing | staging | https://staging.nabome.online |
| Preview | Pull request testing | PR branches | Auto-generated |

### Deployment Method

**Platform:** Cloudflare Pages  
**CI/CD:** GitHub Actions  
**Build:** Vite (React SPA)  
**API:** Cloudflare Pages Functions (Edge Runtime)

### Deployment Flow

```
Developer Push → GitHub → GitHub Actions → Build → Test → Deploy → Cloudflare Pages
```

---

## Deployment Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

#### Workflow Triggers

- **Push to production:** Automatic deployment
- **Push to staging:** Automatic deployment
- **Pull Request:** Preview deployment
- **Manual:** Workflow dispatch with options

#### Workflow Stages

**1. Quality Gates**
```yaml
- TypeScript check (tsc -b)
- ESLint check
- Unit tests (vitest)
- Security audit (npm audit)
- Dependency audit (npm outdated)
- Bundle size check
```

**2. Build**
```yaml
- Sync public headers
- Prisma generate
- TypeScript compilation
- Vite build
```

**3. Security Scanning**
```yaml
- Security audit (moderate level)
- Dependency audit (moderate level)
- Secret scanning
- SAST scanning
```

**4. Testing**
```yaml
- Smoke tests (health endpoint)
- API routes smoke test
- E2E tests (playwright)
- Lighthouse CI
```

**5. Deployment**
```yaml
- Deploy to Cloudflare Pages
- Post-deployment health check
- Deployment notification
```

### Quality Gates

#### TypeScript Check

```bash
npm run typecheck
# Exit if errors found
```

**Criteria:** Zero TypeScript errors

#### ESLint Check

```bash
npm run lint
# Exit if errors found
```

**Criteria:** Zero ESLint errors

#### Unit Tests

```bash
npm test
# Exit if tests fail
```

**Criteria:** 95%+ test pass rate

#### Security Audit

```bash
npm audit --audit-level=moderate
# Exit if vulnerabilities found
```

**Criteria:** No moderate or high vulnerabilities

#### Dependency Audit

```bash
npm outdated
# Warning if outdated packages
```

**Criteria:** No critical outdated packages

#### Bundle Size Check

```bash
npm run build
# Check bundle sizes
```

**Criteria:**
- vendor-react: < 300KB (gzip)
- vendor-core: < 300KB (gzip)
- route-admin: < 700KB (gzip)
- route-storefront: < 200KB (gzip)

---

## Deployment Procedures

### Production Deployment

#### Automated Deployment (Push to production)

```bash
# Push to production branch
git checkout production
git merge main
git push origin production

# GitHub Actions automatically:
# 1. Runs quality gates
# 2. Builds application
# 3. Runs security scanning
# 4. Runs tests
# 5. Deploys to Cloudflare Pages
# 6. Runs post-deployment checks
```

#### Manual Deployment (Workflow Dispatch)

1. Go to GitHub Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select branch
5. Select deployment options:
   - `skip_tests`: Skip tests (not recommended)
   - `skip_security`: Skip security scan (not recommended)
   - `rollback`: Rollback to previous commit
   - `commit_sha`: Specific commit to deploy
6. Monitor deployment progress
7. Verify deployment success

#### Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] No critical outdated dependencies
- [ ] Bundle sizes within limits
- [ ] Code review approved
- [ ] Database migrations prepared
- [ ] Rollback plan prepared
- [ ] Stakeholders notified

**During Deployment:**
- [ ] Monitor build logs
- [ ] Monitor test results
- [ ] Monitor security scan results
- [ ] Monitor deployment progress
- [ ] Monitor post-deployment checks

**Post-Deployment:**
- [ ] Health check passing
- [ ] Critical paths tested
- [ ] Error rates normal
- [ ] Performance validated
- [ ] CDN cache cleared
- [ ] Monitoring enhanced
- [ ] Documentation updated
- [ ] Stakeholders notified

### Staging Deployment

#### Automated Deployment (Push to staging)

```bash
# Push to staging branch
git checkout staging
git merge main
git push origin staging

# GitHub Actions automatically deploys to staging
```

#### Manual Deployment

Same as production deployment, select staging environment.

### Preview Deployment

#### Automatic Preview (Pull Request)

```bash
# Create pull request
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub

# GitHub Actions automatically:
# 1. Runs quality gates
# 2. Builds application
# 3. Deploys to preview environment
# 4. Comments preview URL on PR
```

#### Preview URL Format

```
https://<commit-sha>.nabome.pages.dev
```

---

## Rollback Procedures

### Automatic Rollback

**Triggered by:**
- Post-deployment health check failure
- Critical error rate increase
- Performance degradation
- Manual rollback request

**Automatic Rollback Process:**
```yaml
1. Detect failure condition
2. Trigger rollback workflow
3. Deploy previous commit
4. Verify rollback success
5. Notify stakeholders
6. Create GitHub issue for investigation
```

### Manual Rollback

#### Via GitHub Actions

1. Go to GitHub Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select `rollback: true`
5. Specify commit SHA to rollback to
6. Monitor rollback progress
7. Verify rollback success

#### Via Cloudflare Dashboard

1. Go to Cloudflare Pages dashboard
2. Select nabome project
3. Go to Deployments tab
4. Select previous deployment
5. Click "Rollback to this deployment"
6. Confirm rollback
7. Monitor rollback progress

#### Rollback Checklist

**Pre-Rollback:**
- [ ] Identify rollback commit
- [ ] Verify rollback commit is stable
- [ ] Notify stakeholders
- [ ] Prepare rollback plan
- [ ] Enable maintenance mode (if needed)

**During Rollback:**
- [ ] Monitor rollback progress
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Verify critical paths

**Post-Rollback:**
- [ ] Health check passing
- [ ] Critical paths working
- [ ] Error rates normal
- [ ] Performance validated
- [ ] CDN cache cleared
- [ ] Monitoring enhanced
- [ ] Documentation updated
- [ ] Stakeholders notified
- [ ] Post-mortem scheduled

### Rollback Strategy

**Immediate Rollback (< 15 minutes):**
- Rollback to previous commit
- No data migration
- No configuration changes

**Delayed Rollback (< 1 hour):**
- Rollback to previous commit
- Rollback database migrations
- Restore configuration

**Full Rollback (< 4 hours):**
- Rollback to previous commit
- Rollback database migrations
- Restore configuration
- Restore data if needed

---

## Database Migrations

### Migration Workflow

**1. Create Migration**

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Review migration SQL
# Test migration locally
# Commit migration file
```

**2. Test Migration**

```bash
# Test on staging database
npx prisma migrate deploy

# Verify data integrity
# Test application functionality
```

**3. Deploy Migration**

```bash
# Deploy to production via GitHub Actions
# Migration runs automatically during deployment
```

### Migration Safety

**Pre-Migration Checks:**
- [ ] Migration reviewed by DBA
- [ ] Migration tested on staging
- [ ] Backup created before migration
- [ ] Rollback plan prepared
- [ ] Maintenance window scheduled (if needed)

**During Migration:**
- [ ] Monitor migration progress
- [ ] Monitor database performance
- [ ] Monitor application errors
- [ ] Verify data integrity

**Post-Migration:**
- [ ] Verify migration success
- [ ] Test application functionality
- [ ] Monitor for issues
- [ ] Update documentation

### Migration Rollback

```bash
# Rollback migration
npx prisma migrate resolve --rolled-back migration_name

# Or restore from backup
npx prisma db restore --backup-id backup_id
```

---

## Build Verification

### Build Process

**1. Sync Headers**
```bash
tsx scripts/sync-public-headers.ts
```

**2. Prisma Generate**
```bash
npx prisma generate
```

**3. TypeScript Compilation**
```bash
npx tsc -b
```

**4. Vite Build**
```bash
npm run build
```

### Build Output

**Expected Output:**
```
dist/index.html                                  3.57 kB │ gzip:   1.47 kB
dist/assets/index-DgcW4itW.css                 124.06 kB │ gzip:  18.54 kB
dist/assets/vendor-react-ME-DhdMJ.js           249.76 kB │ gzip:  80.32 kB
dist/assets/vendor-core-CTaJLmM2.js            265.43 kB │ gzip:  84.86 kB
dist/assets/route-admin-C5BNgslS.js            636.30 kB │ gzip: 118.78 kB
```

### Build Verification

**Size Checks:**
- Total bundle size: < 2MB (gzip)
- vendor-react: < 300KB (gzip)
- vendor-core: < 300KB (gzip)
- route-admin: < 700KB (gzip)
- route-storefront: < 200KB (gzip)

**Integrity Checks:**
- All chunks generated
- No missing assets
- No circular dependencies (warnings acceptable)
- Source maps generated

---

## Security Scanning

### Automated Security Scanning

**npm audit**
```bash
npm audit --audit-level=moderate
```

**Criteria:** No moderate or high vulnerabilities

**SAST Scanning**
```yaml
- CodeQL analysis
- Secret scanning
- Dependency scanning
```

**Criteria:** No critical security issues

### Manual Security Review

**Pre-Deployment:**
- [ ] Code review completed
- [ ] Security review completed
- [ ] Penetration testing (if major change)
- [ ] Third-party audit (if major change)

**Post-Deployment:**
- [ ] Monitor security alerts
- [ ] Review error logs
- [ ] Check for anomalies
- [ ] Update security documentation

---

## Dependency Scanning

### Automated Dependency Scanning

**npm outdated**
```bash
npm outdated
```

**Criteria:** No critical outdated packages

**Dependabot Alerts**
- GitHub Dependabot automatically checks for vulnerabilities
- Alerts created for vulnerable dependencies
- PRs created for dependency updates

### Dependency Update Process

**1. Review Dependabot Alerts**
- Check GitHub Security tab
- Review vulnerability severity
- Assess impact on application

**2. Test Dependency Update**
- Update dependency in branch
- Run tests
- Build application
- Test functionality

**3. Deploy Update**
- Merge PR to main
- Deploy to staging
- Test in staging
- Deploy to production

---

## Automatic Release Creation

### Release Process

**Triggered by:**
- Merge to production branch
- Tag creation (v1.0.0, v1.0.1, etc.)

**Automatic Release Creation:**
```yaml
1. Detect tag push
2. Create GitHub release
3. Generate release notes
4. Attach build artifacts
5. Notify stakeholders
```

### Release Versioning

**Semantic Versioning:**
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

**Version Format:**
```
v{MAJOR}.{MINOR}.{PATCH}
```

**Examples:**
- v1.0.0 (Initial release)
- v1.1.0 (New features)
- v1.1.1 (Bug fix)
- v2.0.0 (Breaking changes)

### Release Notes

**Automatic Generation:**
```markdown
## Release v1.0.0

### Added
- New feature A
- New feature B

### Changed
- Updated feature C
- Improved performance

### Fixed
- Bug fix D
- Bug fix E

### Security
- Security fix F
```

**Manual Updates:**
- Add release notes to GitHub release
- Update CHANGELOG.md
- Notify stakeholders

---

## Appendix

### Useful Commands

```bash
# Build for production
npm run build

# Build for Cloudflare Pages
npm run pages:build

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Run security audit
npm audit

# Run dependency audit
npm outdated

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migration
npx prisma migrate deploy

# Rollback migration
npx prisma migrate resolve --rolled-back migration_name

# Generate Prisma client
npx prisma generate

# Sync public headers
tsx scripts/sync-public-headers.ts
```

### Deployment Scripts

**Pre-Deployment Script:**
```typescript
// scripts/pre-deploy.ts
async function preDeploy() {
  console.log('Running pre-deployment checks...');
  
  // TypeScript check
  await exec('npm run typecheck');
  
  // ESLint check
  await exec('npm run lint');
  
  // Unit tests
  await exec('npm test');
  
  // Security audit
  await exec('npm audit --audit-level=moderate');
  
  console.log('Pre-deployment checks passed!');
}

preDeploy();
```

**Post-Deployment Script:**
```typescript
// scripts/post-deploy.ts
async function postDeploy() {
  console.log('Running post-deployment checks...');
  
  // Health check
  const health = await fetch('https://www.nabome.online/api/health');
  const healthData = await health.json();
  
  if (healthData.status !== 'healthy') {
    throw new Error('Health check failed');
  }
  
  // Clear CDN cache
  await clearCDNCache();
  
  // Verify critical paths
  await verifyCriticalPaths();
  
  console.log('Post-deployment checks passed!');
}

postDeploy();
```

### Deployment Checklist Template

```markdown
## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] No critical outdated dependencies
- [ ] Bundle sizes within limits
- [ ] Code review approved
- [ ] Database migrations prepared
- [ ] Rollback plan prepared
- [ ] Stakeholders notified

### Deployment
- [ ] Build successful
- [ ] Tests passed
- [ ] Security scan passed
- [ ] Deployment successful
- [ ] Health check passed

### Post-Deployment
- [ ] Critical paths tested
- [ ] Error rates normal
- [ ] Performance validated
- [ ] CDN cache cleared
- [ ] Monitoring enhanced
- [ ] Documentation updated
- [ ] Stakeholders notified
```

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-10 | Cascade AI | Initial deployment runbook |

---

**End of Deployment Runbook**
