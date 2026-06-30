import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";

export async function handleAdminInventoryRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "overview": return handleOverview(ctx.env);
    case "productMovements": return handleProductMovements(params[0], ctx.env);
    case "variantMovements": return handleVariantMovements(params[0], ctx.env);
    case "adjustVariant": return handleAdjustVariant(params[0], req, ctx.env);
    case "alerts": return handleAlerts(req, ctx.env);
    case "resolveAlert": return handleResolveAlert(params[0], ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleOverview(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    // Read low stock threshold from site settings
    const siteSettings = await prisma.siteSetting.findFirst();
    const lowStockThreshold = (siteSettings?.preferences as Record<string, unknown> | null)?.lowStockThreshold as number ?? 5;

    const [totalVariants, totalStock, lowStockCount, outOfStockCount, recentMovements, recentAlerts] = await Promise.all([
      prisma.productVariant.count({ where: { isActive: true } }),
      prisma.productVariant.aggregate({ _sum: { stock: true }, where: { isActive: true } }),
      prisma.productVariant.count({ where: { stock: { gt: 0, lte: lowStockThreshold }, isActive: true } }),
      prisma.productVariant.count({ where: { stock: 0, isActive: true } }),
      prisma.inventoryMovement.findMany({
        take: 20,
        orderBy: { createdAt: "desc" as const },
        include: { variant: { select: { id: true, sku: true, size: true, color: true, product: { select: { id: true, name: true, slug: true } } } } },
      }),
      prisma.inventoryAlert.findMany({
        where: { isResolved: false },
        orderBy: { createdAt: "desc" as const },
        include: { variant: { select: { id: true, sku: true, size: true, color: true, product: { select: { id: true, name: true, slug: true } } } } },
      }),
    ]);
    return success({
      stats: {
        totalVariants, totalStock: totalStock._sum.stock ?? 0, lowStockCount, outOfStockCount,
      },
      recentMovements, alerts: recentAlerts,
    });
  } catch (err) { return serverError(err); }
}

async function handleProductMovements(productId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: { id: true, sku: true, size: true, color: true, stock: true },
    });
    const variantIds = variants.map((v) => v.id);
    const movements = await prisma.inventoryMovement.findMany({
      where: { variantId: { in: variantIds } },
      orderBy: { createdAt: "desc" as const },
      take: 100,
    });
    return success({ variants, movements });
  } catch (err) { return serverError(err); }
}

async function handleVariantMovements(variantId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const [, movements] = await Promise.all([
      prisma.productVariant.findUnique({ where: { id: variantId } }),
      prisma.inventoryMovement.findMany({
        where: { variantId },
        orderBy: { createdAt: "desc" as const },
      }),
    ]);
    return success({ movements });
  } catch (err) { return serverError(err); }
}

async function handleAdjustVariant(variantId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { quantityChange, reason, note } = body;
  if (quantityChange === undefined || !reason) return badRequest("quantityChange and reason are required");
  if (typeof quantityChange !== "number" || quantityChange === 0) return badRequest("quantityChange must be a non-zero number");

  try {
    const prisma = getPrisma(env);
    // Read low stock threshold from site settings
    const siteSettings = await prisma.siteSetting.findFirst();
    const lowStockThreshold = (siteSettings?.preferences as Record<string, unknown> | null)?.lowStockThreshold as number ?? 5;

    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) return notFound("Variant not found");
    const newStock = variant.stock + quantityChange;
    if (newStock < 0) return badRequest(`Insufficient stock. Current: ${variant.stock}, attempted change: ${quantityChange}`);

    const [movement] = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: { variantId, quantityChange, stockAfter: newStock, reason, note: note ?? null },
      }),
      prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock },
      }),
    ]);

    // Create alert if stock is low
    if (newStock <= lowStockThreshold && newStock > 0) {
      await prisma.inventoryAlert.create({
        data: {
          variantId, type: "low_stock", currentStock: newStock, threshold: lowStockThreshold,
          message: `Low stock: "${variant.sku}" (${variant.size}/${variant.color}) — only ${newStock} left`,
        },
      }).catch(() => {});
    } else if (newStock <= 0) {
      await prisma.inventoryAlert.create({
        data: {
          variantId, type: "out_of_stock", currentStock: 0,
          message: `Out of stock: "${variant.sku}" (${variant.size}/${variant.color})`,
        },
      }).catch(() => {});
    }

    return success(movement);
  } catch (err) { return serverError(err); }
}

async function handleAlerts(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const resolved = url.searchParams.get("resolved") === "true";
  const type = url.searchParams.get("type");
  const where: Record<string, unknown> = { isResolved: resolved };
  if (type) where.type = type;
  try {
    const prisma = getPrisma(env);
    const alerts = await prisma.inventoryAlert.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" as const },
      include: { variant: { select: { id: true, sku: true, size: true, color: true, stock: true, product: { select: { id: true, name: true, slug: true } } } } },
    });
    return success({ alerts, count: alerts.length });
  } catch (err) { return serverError(err); }
}

async function handleResolveAlert(alertId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const alert = await prisma.inventoryAlert.update({
      where: { id: alertId },
      data: { isResolved: true, resolvedAt: new Date() },
    });
    return success(alert);
  } catch (err) { return notFound("Alert not found"); }
}
