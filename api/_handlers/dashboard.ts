import { prisma } from "../_lib/prisma";
import { success, badRequest, notFound, unauthorized, error, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase admin credentials");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getAnonClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
}

export async function handleDashboardRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  switch (action) {
    case "overview":
      return handleDashboardOverview(ctx);
    case "profile":
      if (req.method === "GET") return handleGetProfile(ctx);
      if (req.method === "PUT") return handleUpdateProfile(ctx, req);
      return error("Method not allowed", 405);
    case "changePassword":
      return handleChangePassword(ctx, req);
    case "orderStats":
      return handleOrderStats(ctx);
    default:
      return notFound();
  }
}

async function handleDashboardOverview(ctx: RequestContext): Promise<Response> {
  try {
    const [recentOrders, wishlistCount, addressesCount, unreadNotifications] = await Promise.all([
      prisma.order.findMany({
        where: { profileId: ctx.userId },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.wishlistItem.count({ where: { profileId: ctx.userId } }),
      prisma.address.count({ where: { profileId: ctx.userId } }),
      prisma.notification.count({ where: { profileId: ctx.userId, isRead: false } }),
    ]);

    return success({
      recentOrders,
      wishlistCount,
      addressesCount,
      unreadNotifications,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleGetProfile(ctx: RequestContext): Promise<Response> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        preferences: true,
        createdAt: true,
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
            wishlistItems: true,
          },
        },
      },
    });

    if (!profile) return notFound("Profile not found");

    return success({ profile });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateProfile(ctx: RequestContext, req: Request): Promise<Response> {
  const body = await req.json();
  const allowedFields = ["firstName", "lastName", "phone", "preferences"];
  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return badRequest("No valid fields to update");
  }

  try {
    const updated = await prisma.profile.update({
      where: { id: ctx.userId },
      data: updateData as never,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        preferences: true,
      },
    });

    return success({ profile: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleChangePassword(ctx: RequestContext, req: Request): Promise<Response> {
  const body = await req.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return badRequest("Current password and new password are required");
  }

  if (newPassword.length < 8) {
    return badRequest("New password must be at least 8 characters");
  }

  if (currentPassword === newPassword) {
    return badRequest("New password must be different from current password");
  }

  try {
    const user = await prisma.profile.findUnique({ where: { id: ctx.userId } });
    if (!user) return unauthorized();

    const anonClient = getAnonClient();
    const { error: verifyError } = await anonClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return badRequest("Current password is incorrect");
    }

    const supabase = getAdminClient();
    const { error: updateError } = await supabase.auth.admin.updateUserById(ctx.userId!, {
      password: newPassword,
    });

    if (updateError) return badRequest(updateError.message);

    await supabase.auth.admin.signOut(ctx.userId!);
    await prisma.authSession.updateMany({
      where: { profileId: ctx.userId, isActive: true },
      data: { isActive: false },
    }).catch(() => {});

    return success({ message: "Password changed successfully. Please log in again." });
  } catch (err) {
    return serverError(err);
  }
}

async function handleOrderStats(ctx: RequestContext): Promise<Response> {
  try {
    const [orders, aggregation] = await Promise.all([
      prisma.order.findMany({
        where: { profileId: ctx.userId },
        select: { status: true, total: true },
      }),
      prisma.order.aggregate({
        where: { profileId: ctx.userId },
        _count: true,
        _sum: { total: true },
      }),
    ]);

    const totalOrders = aggregation._count;
    const totalSpent = Number(aggregation._sum.total ?? 0);
    const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing").length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

    return success({
      totalOrders,
      totalSpent,
      pendingOrders,
      deliveredOrders,
    });
  } catch (err) {
    return serverError(err);
  }
}
