#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────
// RECONCILE ORPHANED SUPABASE USERS
//
// Finds Supabase Auth users that have NO matching `profiles` row
// (an "orphaned" auth user) and creates the missing profile, then
// sends a password-reset email so the user can set a password and
// log in. Email is marked verified because the Supabase user was
// created with email_confirm:true.
//
// Reverse orphans (guest `profiles` with no Supabase user) are only
// reported — they are handled automatically at next registration by
// the guest-conversion logic in api/_handlers/auth.ts.
//
// Default is a DRY RUN. Pass --live to actually write profiles and
// send emails.
// ─────────────────────────────────────────────────────────────

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "../api/_lib/env";
import { cleanSecret } from "../api/_lib/secrets";
import { getPrisma } from "../api/_lib/prisma";
import { sendEmailNotification } from "../api/_lib/email";

config();

function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function reconcile(dryRun: boolean) {
  // eslint-disable-next-line no-console
  console.log(`\n${dryRun ? "DRY RUN" : "LIVE"} - Reconciling orphaned Supabase users\n`);

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

  const prisma = getPrisma();

  // 1. Paginate all Supabase users, collecting emails for reverse-orphan check.
  const supabaseEmails = new Set<string>();
  let page = 1;
  const perPage = 1000;
  let totalUsers = 0;

  while (true) {
    const { data, error: listError } = await supabase.auth.admin.listUsers({ page, perPage });
    if (listError) {
      // eslint-disable-next-line no-console
      console.error("❌ Error listing users:", listError.message);
      process.exit(1);
    }
    for (const u of data.users) {
      if (u.email) supabaseEmails.add(u.email.toLowerCase());
    }
    totalUsers += data.users.length;

    // 2. For each user, check for a matching profile.
    for (const u of data.users) {
      if (!u.email) continue;
      const email = u.email.toLowerCase();

      const profile = await prisma.profiles.findUnique({
        where: { email },
        select: { id: true },
      });

      if (profile) continue; // healthy account

      // eslint-disable-next-line no-console
      console.log(`🔎 Orphan found: ${email} (Supabase id: ${u.id})`);

      if (dryRun) {
        // eslint-disable-next-line no-console
        console.log(`   → would create profile + send password-reset email\n`);
        continue;
      }

      const resetToken = generateResetCode();
      const resetExpiry = new Date(Date.now() + 10 * 60 * 1000);

      try {
        await prisma.profiles.create({
          data: {
            id: u.id,
            email,
            role: "customer",
            firstName: email.split("@")[0] || "there",
            emailVerified: true,
            resetPasswordToken: resetToken,
            resetPasswordTokenExpiresAt: resetExpiry,
          },
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`   ❌ Failed to create profile for ${email}:`, err);
        continue;
      }

      const emailResult = await sendEmailNotification(
        "password_reset",
        {
          email,
          firstName: email.split("@")[0] || "there",
          verificationCode: resetToken,
        },
        env,
        true
      );

      if (emailResult.success) {
        // eslint-disable-next-line no-console
        console.log(`   ✅ Profile created + password-reset email sent\n`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`   ⚠️  Profile created but email failed: ${emailResult.error}\n`);
      }
    }

    if (data.users.length < perPage) break;
    page++;
  }

  // 3. Report reverse orphans (guest profiles without a Supabase user).
  try {
    const guestProfiles = await prisma.profiles.findMany({
      where: { email: { notIn: Array.from(supabaseEmails) } },
      select: { email: true, preferences: true },
    });
    const reverseOrphans = guestProfiles.filter(
      (p) => (p.preferences as Record<string, unknown> | null)?.guest === true
    );
    if (reverseOrphans.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`ℹ️  ${reverseOrphans.length} guest profile(s) have no Supabase user.`);
      // eslint-disable-next-line no-console
      console.log(`   These are handled automatically the next time the user registers.\n`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("⚠️  Could not check for reverse orphans:", err);
  }

  // eslint-disable-next-line no-console
  console.log(`Scanned ${totalUsers} Supabase users.\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--live");
  try {
    await reconcile(dryRun);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

void main();
