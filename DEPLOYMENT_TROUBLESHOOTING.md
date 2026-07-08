# NABOME Deployment Troubleshooting Guide

This guide helps diagnose and resolve common deployment issues for NABOME.

## Table of Contents

- [Frontend Deployment (Cloudflare Pages)](#frontend-deployment-cloudflare-pages)
- [Backend Deployment (Cloudflare Workers)](#backend-deployment-cloudflare-workers)
- [Database Issues](#database-issues)
- [Environment Variables](#environment-variables)
- [Build Errors](#build-errors)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)

## Frontend Deployment (Cloudflare Pages)

### Build Fails

**Symptom:** Build fails during deployment

**Common Causes:**
- Missing dependencies
- TypeScript errors
- Environment variables not set

**Solutions:**

1. Check build logs for specific error
2. Ensure all dependencies are in `package.json`
3. Run `pnpm install` locally to verify
4. Check TypeScript errors: `pnpm tsc --noEmit`
5. Verify environment variables in Cloudflare Pages dashboard

### Assets Not Loading

**Symptom:** Images, CSS, or JS files return 404

**Solutions:**

1. Check file paths are correct
2. Verify files are in `public/` directory
3. Check build output includes assets
4. Clear Cloudflare cache

### Route Not Found

**Symptom:** 404 on specific routes

**Solutions:**

1. Check `src/app/routes.tsx` configuration
2. Verify route paths match file structure
3. Check for case sensitivity issues
4. Review Cloudflare Pages routing rules

## Backend Deployment (Cloudflare Workers)

### Worker Fails to Deploy

**Symptom:** Deployment fails with error

**Common Causes:**
- Syntax errors
- Missing dependencies
- Size limit exceeded
- Environment variables missing

**Solutions:**

1. Check wrangler.toml configuration
2. Verify all dependencies are compatible with Workers
3. Check bundle size (limit: 1MB)
4. Ensure all environment variables are set in Cloudflare dashboard
5. Test locally: `pnpm wrangler dev`

### API Returns 500 Errors

**Symptom:** API endpoints return 500 status

**Solutions:**

1. Check Cloudflare Workers logs
2. Verify database connection string
3. Check Prisma client is generated
4. Test API locally with wrangler dev
5. Review error messages in logs

### Database Connection Issues

**Symptom:** Worker cannot connect to database

**Solutions:**

1. Verify DATABASE_URL is correct
2. Check database allows remote connections
3. Verify SSL certificate configuration
4. Test connection string locally
5. Check Supabase connection pooling settings

### Timeout Errors

**Symptom:** Requests timeout after 25 seconds

**Solutions:**

1. Optimize slow queries
2. Add database indexes
3. Reduce payload size
4. Implement pagination
5. Use background processing for long tasks

## Database Issues

### Migration Fails

**Symptom:** Prisma migration fails

**Solutions:**

1. Check database connection
2. Verify migration file syntax
3. Rollback previous migration if needed
4. Check for schema conflicts
5. Reset database (development only): `pnpm prisma migrate reset`

### Seed Data Fails

**Symptom:** Database seeding fails

**Solutions:**

1. Check seed file syntax
2. Verify data relationships
3. Check for duplicate entries
4. Ensure foreign keys exist
5. Run migrations first: `pnpm prisma migrate dev`

### Slow Queries

**Symptom:** API responses are slow

**Solutions:**

1. Add missing indexes
2. Use selective queries with `select`
3. Avoid deep nested includes
4. Implement query result caching
5. Use batch operations

## Environment Variables

### Variables Not Available

**Symptom:** Code cannot access environment variables

**Solutions:**

1. Verify variable names match exactly
2. Check variable is set in correct environment
3. Restart deployment after adding variables
4. Check for typos in variable names
5. Verify variable scope (production vs preview)

### Secret Leaks

**Symptom:** Secrets exposed in logs or client code

**Solutions:**

1. Never log secrets
2. Use environment variables for all secrets
3. Check .gitignore includes .env files
4. Rotate compromised secrets immediately
5. Use secret management tools

## Build Errors

### TypeScript Errors

**Symptom:** Build fails with TypeScript errors

**Solutions:**

1. Check specific error message
2. Add missing type definitions
3. Fix type mismatches
4. Update tsconfig.json if needed
5. Run `pnpm tsc --noEmit` to see all errors

### Module Not Found

**Symptom:** Import errors during build

**Solutions:**

1. Check import paths are correct
2. Verify module is installed
3. Check for case sensitivity
4. Update package.json if needed
5. Clear node_modules and reinstall

### ESLint Errors

**Symptom:** Build fails due to linting

**Solutions:**

1. Fix specific linting errors
2. Disable rule if not applicable
3. Update .eslintrc configuration
4. Use `// eslint-disable-next-line` for exceptions
5. Run `pnpm lint --fix` to auto-fix

## Runtime Errors

### 401 Unauthorized

**Symptom:** API returns 401 status

**Solutions:**

1. Check Authorization header
2. Verify JWT token is valid
3. Check token expiration
4. Verify user is authenticated
5. Check auth middleware configuration

### 403 Forbidden

**Symptom:** API returns 403 status

**Solutions:**

1. Check user permissions
2. Verify role-based access
3. Check resource ownership
4. Review authorization logic
5. Ensure proper middleware order

### 404 Not Found

**Symptom:** API returns 404 status

**Solutions:**

1. Check endpoint URL
2. Verify route registration
3. Check for HTTP method mismatch
4. Review routing configuration
5. Check for case sensitivity

### CORS Errors

**Symptom:** Browser blocks API requests

**Solutions:**

1. Add CORS headers to responses
2. Configure allowed origins
3. Check preflight requests
4. Verify credentials mode
5. Review Cloudflare Workers CORS config

## Performance Issues

### Slow Page Load

**Symptom:** Frontend loads slowly

**Solutions:**

1. Optimize images (WebP, compression)
2. Enable code splitting
3. Use lazy loading
4. Implement caching headers
5. Minify JavaScript/CSS

### High Memory Usage

**Symptom:** Worker memory limits exceeded

**Solutions:**

1. Reduce payload sizes
2. Stream large responses
3. Use pagination
4. Optimize data structures
5. Implement caching

### High CPU Usage

**Symptom:** Worker CPU limits exceeded

**Solutions:**

1. Optimize algorithms
2. Reduce computation in hot paths
3. Use caching for expensive operations
4. Implement background processing
5. Use Durable Objects for state

## Common Debugging Commands

### Local Development

```bash
# Start frontend dev server
pnpm dev

# Start Workers dev server
pnpm wrangler dev

# Run TypeScript check
pnpm tsc --noEmit

# Run linter
pnpm lint

# Run tests
pnpm test

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed database
pnpm prisma db seed
```

### Deployment

```bash
# Deploy to Cloudflare Pages
pnpm wrangler pages deploy

# Deploy Workers
pnpm wrangler deploy

# Check deployment status
pnpm wrangler deployments list

# View logs
pnpm wrangler tail
```

### Database

```bash
# Open Prisma Studio
pnpm prisma studio

# Reset database (dev only)
pnpm prisma migrate reset

# Create migration
pnpm prisma migrate dev --name migration_name

# Format schema
pnpm prisma format
```

## Getting Help

If you cannot resolve the issue:

1. Check Cloudflare status page: https://www.cloudflarestatus.com/
2. Check Supabase status page: https://status.supabase.com/
3. Review Cloudflare Workers documentation
4. Check GitHub issues for similar problems
5. Contact team in Slack channel

## Emergency Procedures

### Production Down

1. Check status pages for outages
2. Review recent deployment logs
3. Rollback to previous deployment if needed
4. Enable maintenance mode
5. Notify stakeholders

### Data Loss

1. Stop all writes immediately
2. Assess extent of data loss
3. Restore from most recent backup
4. Verify data integrity
5. Implement preventive measures

### Security Incident

1. Identify affected systems
2. Rotate all compromised secrets
3. Review access logs
4. Notify security team
5. Document incident for post-mortem
