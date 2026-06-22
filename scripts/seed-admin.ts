import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/seed-admin.ts <email> <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  // Check if any admin already exists
  const existingAdmin = await prisma.profile.findFirst({ where: { role: "admin" } });
  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
    console.log("Skipping creation.");
    process.exit(0);
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin", first_name: "Admin" },
  });

  if (authError) {
    console.error("Failed to create Supabase user:", authError.message);
    process.exit(1);
  }

  if (!authData.user) {
    console.error("No user returned from Supabase");
    process.exit(1);
  }

  // Create profile in database
  try {
    await prisma.profile.create({
      data: {
        id: authData.user.id,
        email,
        role: "admin",
        firstName: "Admin",
      },
    });
  } catch (err) {
    await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
    console.error("Failed to create profile:", err);
    process.exit(1);
  }

  console.log(`Admin created: ${email} (${authData.user.id})`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
