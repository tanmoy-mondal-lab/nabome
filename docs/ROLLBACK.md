# Rollback / Recovery

## Previous deployment identification

- Cloudflare Pages: `wrangler pages deployment list --project-name nabome-api`
- Note deployment ID and commit before promoting.

## Rollback steps

1. `wrangler pages deployment list --project-name nabome-api` → pick previous ID
2. `wrangler pages deployment rollback <id> --project-name nabome-api` or redeploy previous commit: `git checkout <prev-commit> && pnpm build && wrangler pages deploy dist --project-name nabome-api`
3. Verify `GET https://api.nabome.online/health` → 200

## Database

- Migrations are forward-only. `prisma migrate deploy` never destructive.
- To rollback code without rolling back DB: ensure new code is backward compatible with previous schema.
- If migration must be reverted: create new migration that undoes changes, never `migrate reset` on production.

## Config

- Secrets are versioned per deployment. Rollback automatically restores previous env/secrets if redeployed.
- `wrangler.jsonc` placeholders: ensure correct env values for target deployment.

## Incident

- Log incident: deployment ID, commit, time, reason, health check result.
- Run smoke: `pnpm test:e2e` against rolled-back deployment.

## Health check after rollback

- `curl https://api.nabome.online/health`
- `curl https://nabome.online`
- Verify login, cart, checkout (staging first).
