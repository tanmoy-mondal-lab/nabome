#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────
// CLEANUP ALL SUPABASE USERS (except admin)
// ─────────────────────────────────────────────────────────────

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "../api/_lib/env";
import { cleanSecret } from "../api/_lib/secrets";

// Load environment variables from .env file
config();

async function cleanupAllUsers(keepEmails: string[] = ["admin@nabome.com"], dryRun: boolean = true) {
  // eslint-disable-next-line no-console
  console.log(`\n${dryRun ? "DRY RUN" : "LIVE"} - Cleaning up Supabase users\n`);
  // eslint-disable-next-line no-console
  console.log(`Keeping: ${keepEmails.join(", ")}\n`);

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

  const usersToDelete = users.filter(u => !keepEmails.includes(u.email));

  // eslint-disable-next-line no-console
  console.log(`Found ${users.length} total users`);
  // eslint-disable-next-line no-console
  console.log(`Users to delete: ${usersToDelete.length}\n`);

  if (usersToDelete.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No users to delete.");
    return;
  }

  usersToDelete.forEach((user, index) => {
    // eslint-disable-next-line no-console
    console.log(`${index + 1}. ${user.email} (${user.id})`);
  });

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(`\n⚠️  DRY RUN - No data will be deleted`);
    // eslint-disable-next-line no-console
    console.log(`   Run with --live to actually delete the users\n`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\n🗑️  Deleting ${usersToDelete.length} users...`);

  let deleted = 0;
  let failed = 0;

  for (const user of usersToDelete) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      // eslint-disable-next-line no-console
      console.error(`❌ Failed to delete ${user.email}: ${deleteError.message}`);
      failed++;
    } else {
      // eslint-disable-next-line no-console
      console.log(`✅ Deleted: ${user.email}`);
      deleted++;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\n✅ Successfully deleted ${deleted} users`);
  if (failed > 0) {
    // eslint-disable-next-line no-console
    console.log(`❌ Failed to delete ${failed} users`);
  }
  // eslint-disable-next-line no-console
  console.log();
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--live");

  try {
    await cleanupAllUsers(["admin@nabome.com"], dryRun);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

void main();
