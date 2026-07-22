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
  // eslint-disable-next-line no-console
  console.log(`\n${dryRun ? "DRY RUN" : "LIVE"} - Deleting Supabase user: ${email}\n`);

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

  // List all users to find the target
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    // eslint-disable-next-line no-console
    console.error("❌ Error listing users:", listError.message);
    process.exit(1);
  }

  const targetUser = users.find(u => u.email === email.toLowerCase());

  if (!targetUser) {
    // eslint-disable-next-line no-console
    console.log(`❌ No user found with email: ${email}`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`📊 Found user:`);
  // eslint-disable-next-line no-console
  console.log(`   ID: ${targetUser.id}`);
  // eslint-disable-next-line no-console
  console.log(`   Email: ${targetUser.email}`);
  // eslint-disable-next-line no-console
  console.log(`   Created: ${targetUser.created_at}`);
  // eslint-disable-next-line no-console
  console.log(`   Last sign in: ${targetUser.last_sign_in_at || "Never"}`);
  // eslint-disable-next-line no-console
  console.log(`   Email confirmed: ${targetUser.email_confirmed_at ? "Yes" : "No"}`);

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(`\n⚠️  DRY RUN - No data will be deleted`);
    // eslint-disable-next-line no-console
    console.log(`   Run with --live to actually delete the user\n`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\n🗑️  Deleting user from Supabase Auth...`);

  const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUser.id);

  if (deleteError) {
    // eslint-disable-next-line no-console
    console.error("❌ Error deleting user:", deleteError.message);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`✅ User successfully deleted from Supabase Auth: ${email}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const dryRun = !args.includes("--live");

  if (!email) {
    // eslint-disable-next-line no-console
    console.error("Usage: tsx scripts/delete-supabase-user.ts <email> [--live]");
    // eslint-disable-next-line no-console
    console.error("Example: tsx scripts/delete-supabase-user.ts user@example.com --live");
    process.exit(1);
  }

  try {
    await deleteSupabaseUser(email, dryRun);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

void main();
