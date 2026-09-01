# 0003 — App Settings Persistence

Adds `app_settings` table for Global Settings Persistence (Phase 1.2).
Survives worker restart, deployment, cold start; DB is source of truth, not wrangler vars or in-memory.

Keys: global, tax, commission, shipping, payment, cms, notifications, feature_flags
