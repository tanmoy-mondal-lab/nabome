#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Update Razorpay secrets in Cloudflare Pages from .env file
 *
 * This script:
 * 1. Reads Razorpay secrets from the .env file
 * 2. Updates them in the Cloudflare Pages project secrets
 *
 * Note: This updates the backend secrets (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
 * RAZORPAY_WEBHOOK_SECRET) in Cloudflare Pages. The frontend key (VITE_)
 * needs to be updated in Cloudflare Pages settings.
 */

// Razorpay secret keys to update
const RAZORPAY_SECRETS = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];

async function updatePagesSecrets() {
  // Read .env file
  const cwd = process.cwd();
  const envFile = resolve(cwd, ".env");

  if (!existsSync(envFile)) {
    console.error("Error: .env file not found");
    process.exit(1);
  }

  const envContent = await import("node:fs/promises").then((fs) => fs.readFile(envFile, "utf8"));

  // Extract Razorpay secrets from .env
  const envVars = {} as Record<string, string>;
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").trim();
      envVars[key] = value;
    }
  }

  // Check if we have wrangler installed
  try {
    await import("wrangler");
  } catch {
    console.error("Error: wrangler not found. Install with 'npm install wrangler'");
    process.exit(1);
  }

  // Update each Razorpay secret in Cloudflare Pages
  const errors = [];

  for (const secretName of RAZORPAY_SECRETS) {
    const secretValue = envVars[secretName];

    if (!secretValue) {
      console.error(`Error: ${secretName} not found in .env file`);
      errors.push(secretName);
      continue;
    }

    console.log(`\nUpdating ${secretName} in Cloudflare Pages...`);
    console.log(`Value: ${secretName === "RAZORPAY_WEBHOOK_SECRET" ? "..." : secretValue.replace(/./g, "*")}`);

    // Use wrangler to update the secret
    const { execSync } = await import("node:child_process");
    try {
      const envVarFlag = `--env-file=${envFile}`;
      execSync(`npx wrangler pages secret put ${secretName} --project-name=nabome ${envVarFlag}`, {
        stdio: "inherit",
        cwd,
      });
      console.log(`✓ ${secretName} updated successfully`);
    } catch (error) {
      console.error(`✗ Failed to update ${secretName}: ${error.message}`);
      errors.push(secretName);
    }
  }

  if (errors.length > 0) {
    console.error(`\n❌ Failed to update ${errors.length} secret(s): ${errors.join(", ")}`);
    process.exit(1);
  }

  console.log("\n✅ All Razorpay secrets updated in Cloudflare Pages successfully!");
}

updatePagesSecrets().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
