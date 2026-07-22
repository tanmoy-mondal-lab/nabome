#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────
// LIST ALL SUPABASE USERS
// ─────────────────────────────────────────────────────────────

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "../api/_lib/env";
import { cleanSecret } from "../api/_lib/secrets";

// Load environment variables from .env file
config();

async function listSupabaseUsers() {
  // eslint-disable-next-line no-console
  console.log(`\n📋 Listing all Supabase Auth users...\n`);

  const env = getEnv();
  const url = cleanSecret(env.SUPABASE_URL) || cleanSecret(env.VITE_SUPABASE_URL);
  const key = cleanSecret(env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    // eslint-disable-next-line no-console
    console.error("❌ Missing Supabase credentials in environment");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    // eslint-disable-next-line no-console
    console.error("❌ Error listing users:", listError.message);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`Total users: ${users.length}\n`);

  users.forEach((user, index) => {
    // eslint-disable-next-line no-console
    console.log(`${index + 1}. ${user.email}`);
    // eslint-disable-next-line no-console
    console.log(`   ID: ${user.id}`);
    // eslint-disable-next-line no-console
    console.log(`   Created: ${user.created_at}`);
    // eslint-disable-next-line no-console
    console.log(`   Last sign in: ${user.last_sign_in_at || "Never"}`);
    // eslint-disable-next-line no-console
    console.log(`   Email confirmed: ${user.email_confirmed_at ? "Yes" : "No"}`);
    // eslint-disable-next-line no-console
    console.log(`   Role: ${user.user_metadata?.role || "N/A"}`);
    // eslint-disable-next-line no-console
    console.log('');
  });
}

listSupabaseUsers()
  // eslint-disable-next-line no-console
  .catch(console.error);
