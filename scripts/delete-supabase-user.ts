#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────
// DELETE SUPABASE USER
// Removes a user from Supabase Auth by email
// ─────────────────────────────────────────────────────────────

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "../api/_lib/env";
import { cleanSecret } from "../api/_lib/secrets";

// Load environment variables from .env file
config();

async function deleteSupabaseUser(email: string, dryRun: boolean = true) {
  console.log(`\n${dryRun ? "DRY RUN" : "LIVE"} - Deleting Supabase user: ${email}\n`);

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

  // List all users to find the target
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("❌ Error listing users:", listError.message);
    process.exit(1);
  }

  const targetUser = users.find(u => u.email === email.toLowerCase());

  if (!targetUser) {
    console.log(`❌ No user found with email: ${email}`);
    return;
  }

  console.log(`📊 Found user:`);
  console.log(`   ID: ${targetUser.id}`);
  console.log(`   Email: ${targetUser.email}`);
  console.log(`   Created: ${targetUser.created_at}`);
  console.log(`   Last sign in: ${targetUser.last_sign_in_at || "Never"}`);
  console.log(`   Email confirmed: ${targetUser.email_confirmed_at ? "Yes" : "No"}`);

  if (dryRun) {
    console.log(`\n⚠️  DRY RUN - No data will be deleted`);
    console.log(`   Run with --live to actually delete the user\n`);
    return;
  }

  console.log(`\n🗑️  Deleting user from Supabase Auth...`);

  const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUser.id);

  if (deleteError) {
    console.error("❌ Error deleting user:", deleteError.message);
    process.exit(1);
  }

  console.log(`✅ User successfully deleted from Supabase Auth: ${email}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const dryRun = !args.includes("--live");

  if (!email) {
    console.error("Usage: tsx scripts/delete-supabase-user.ts <email> [--live]");
    console.error("Example: tsx scripts/delete-supabase-user.ts user@example.com --live");
    process.exit(1);
  }

  try {
    await deleteSupabaseUser(email, dryRun);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
