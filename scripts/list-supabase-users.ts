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
  console.log(`\n📋 Listing all Supabase Auth users...\n`);

  const env = getEnv();
  const url = cleanSecret(env.SUPABASE_URL) || cleanSecret(env.VITE_SUPABASE_URL);
  const key = cleanSecret(env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    console.error("❌ Missing Supabase credentials in environment");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("❌ Error listing users:", listError.message);
    process.exit(1);
  }

  console.log(`Total users: ${users.length}\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Last sign in: ${user.last_sign_in_at || "Never"}`);
    console.log(`   Email confirmed: ${user.email_confirmed_at ? "Yes" : "No"}`);
    console.log(`   Role: ${user.user_metadata?.role || "N/A"}`);
    console.log('');
  });
}

listSupabaseUsers().catch(console.error);
