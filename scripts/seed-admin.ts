import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SupabaseAdminClient = ReturnType<typeof createClient>;
type SupabaseAuthUser = {
  id: string;
  email?: string;
};

const adminMetadata = { role: "admin", first_name: "Admin" };

async function findAuthUserByEmail(supabase: SupabaseAdminClient, email: string): Promise<SupabaseAuthUser | null> {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Failed to list Supabase users: ${error.message}`);

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;

    const nextPage = (data as { nextPage?: number | null }).nextPage;
    if (!nextPage) return null;
    page = nextPage;
  }
}

async function ensureAuthUser(
  supabase: SupabaseAdminClient,
  email: string,
  password: string
): Promise<SupabaseAuthUser> {
  const existingUser = await findAuthUserByEmail(supabase, email);

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: adminMetadata,
    });

    if (error) throw new Error(`Failed to update Supabase admin user: ${error.message}`);
    if (!data.user) throw new Error("No user returned from Supabase while updating admin");
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: adminMetadata,
  });

  if (error) throw new Error(`Failed to create Supabase admin user: ${error.message}`);
  if (!data.user) throw new Error("No user returned from Supabase while creating admin");
  return data.user;
}

async function profileHasLinkedData(profileId: string): Promise<boolean> {
  const counts = await Promise.all([
    prisma.authSession.count({ where: { profileId } }),
    prisma.loginAttempt.count({ where: { profileId } }),
    prisma.userActionLog.count({ where: { profileId } }),
    prisma.address.count({ where: { profileId } }),
    prisma.wishlistItem.count({ where: { profileId } }),
    prisma.cart.count({ where: { profileId } }),
    prisma.order.count({ where: { profileId } }),
    prisma.orderStatusHistory.count({ where: { createdBy: profileId } }),
    prisma.couponRedemption.count({ where: { profileId } }),
    prisma.review.count({ where: { profileId } }),
    prisma.returnRequest.count({ where: { profileId } }),
    prisma.refund.count({ where: { initiatedBy: profileId } }),
    prisma.notification.count({ where: { profileId } }),
    prisma.supportTicket.count({ where: { profileId } }),
    prisma.supportTicket.count({ where: { assignedTo: profileId } }),
    prisma.supportTicketReply.count({ where: { profileId } }),
  ]);

  return counts.some((count) => count > 0);
}

async function ensureAdminProfile(authUser: SupabaseAuthUser, email: string): Promise<"created" | "updated" | "reconciled"> {
  const profileByAuthId = await prisma.profile.findUnique({ where: { id: authUser.id } });

  if (profileByAuthId) {
    const profileByEmail = await prisma.profile.findUnique({ where: { email } });
    if (profileByEmail && profileByEmail.id !== authUser.id) {
      throw new Error(
        `A profile for ${email} already exists with a different Supabase auth id. Resolve the duplicate profile manually.`
      );
    }

    await prisma.profile.update({
      where: { id: authUser.id },
      data: {
        email,
        role: "admin",
        firstName: profileByAuthId.firstName || "Admin",
        emailVerified: true,
        isActive: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });
    return "updated";
  }

  const profileByEmail = await prisma.profile.findUnique({ where: { email } });

  if (profileByEmail) {
    if (await profileHasLinkedData(profileByEmail.id)) {
      throw new Error(
        `A profile for ${email} exists with a different Supabase auth id and linked records. Resolve it manually before seeding.`
      );
    }

    await prisma.profile.update({
      where: { id: profileByEmail.id },
      data: {
        id: authUser.id,
        role: "admin",
        firstName: profileByEmail.firstName || "Admin",
        emailVerified: true,
        isActive: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });
    return "reconciled";
  }

  await prisma.profile.create({
    data: {
      id: authUser.id,
      email,
      role: "admin",
      firstName: "Admin",
      emailVerified: true,
      isActive: true,
    },
  });
  return "created";
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];

  if (!email || !password) {
    throw new Error("Usage: npx tsx scripts/seed-admin.ts <email> <password>");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authUser = await ensureAuthUser(supabase, email, password);
  const profileState = await ensureAdminProfile(authUser, email);

  console.log(`Admin ${profileState}: ${email} (${authUser.id})`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
