export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL ?? process.env.ADMIN_EMAILS?.split(",")[0]?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD before running admin e2e tests. " +
        "Create or repair the account with: npx tsx scripts/seed-admin.ts \"$ADMIN_EMAIL\" \"$ADMIN_PASSWORD\""
    );
  }

  return { email, password };
}
