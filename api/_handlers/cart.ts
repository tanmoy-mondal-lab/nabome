import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { authenticate } from "../_lib/auth-middleware";

export async function handleCartRequest(
  req: Request,
  ctx: RequestContext,
  params: string[] = [],
  action: string = "get"
): Promise<Response> {
  // For guest carts, we don't require auth
  const isGuestAction = action === "sync" || action === "merge";
  
  if (!isGuestAction) {
    const authResult = await authenticate(req, { required: true }, ctx.env);
    if (authResult instanceof Response) return authResult;
    ctx = { ...ctx, ...authResult.ctx };
  }

  switch (action) {
    case "get":
      return handleGetCart(ctx);
    case "sync":
      return handleSyncCart(req, ctx);
    case "merge":
      return handleMergeCart(req, ctx);
    case "clear":
      return handleClearCart(ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleGetCart(ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) {
    return success({ items: [], couponCode: null, discount: 0, discountType: null });
  }

  try {
    const prisma = getPrisma(ctx.env);
    const cart = await prisma.cart.findUnique({
      where: { profileId: ctx.userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    basePrice: true,
                    salePrice: true,
                    compareAtPrice: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                      select: { url: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      return success({ items: [], couponCode: null, discount: 0, discountType: null });
    }

    const items = cart.items.map(item => ({
      id: item.id,
      productId: item.variant.product.id,
      variantId: item.variantId,
      name: item.variant.product.name,
      slug: item.variant.product.slug,
      sku: item.variant.sku,
      size: item.variant.size,
      color: item.variant.color,
      colorHex: item.variant.colorHex || "",
      image: item.variant.product.images[0]?.url || "",
      price: Number(item.variant.product.salePrice || item.variant.product.basePrice) + Number(item.variant.priceAdjustment),
      compareAtPrice: item.variant.product.compareAtPrice ? Number(item.variant.product.compareAtPrice) : null,
      quantity: item.quantity,
      maxQuantity: item.variant.stock
    }));

    return success({
      items,
      couponCode: null, // Coupon codes are stored separately in checkout
      discount: 0,
      discountType: null
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleSyncCart(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) {
    return unauthorized("Authentication required for cart sync");
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { items } = body as { items: Array<{ variantId: string; quantity: number }> };

  if (!Array.isArray(items)) {
    return badRequest("Items array is required");
  }

  try {
    const prisma = getPrisma(ctx.env);
    
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { profileId: ctx.userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { profileId: ctx.userId }
      });
    }

    // Delete all existing items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Add new items
    if (items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map(item => ({
          cartId: cart.id,
          variantId: item.variantId,
          quantity: item.quantity
        })),
        skipDuplicates: true
      });
    }

    // Update cart timestamp
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() }
    });

    return success({ message: "Cart synced successfully" });
  } catch (err) {
    return serverError(err);
  }
}

async function handleMergeCart(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) {
    return unauthorized("Authentication required for cart merge");
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { items } = body as { items: Array<{ variantId: string; quantity: number }> };

  if (!Array.isArray(items)) {
    return badRequest("Items array is required");
  }

  try {
    const prisma = getPrisma(ctx.env);
    
    // Get or create cart
    const cart = await prisma.cart.findUnique({
      where: { profileId: ctx.userId },
      include: { items: true }
    });

    const activeCart = cart ?? await prisma.cart.create({
        data: { 
          profileId: ctx.userId,
          items: items.length > 0 ? {
            create: items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity
            }))
          } : undefined
        },
        include: { items: true }
      });

    if (cart) {
      // Merge items: update quantities for existing variants, add new ones
      const existingVariants = new Map(activeCart.items.map(item => [item.variantId, item]));
      
      for (const item of items) {
        const existing = existingVariants.get(item.variantId);
        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity }
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              variantId: item.variantId,
              quantity: item.quantity
            }
          });
        }
      }
    }

    // Update cart timestamp
    await prisma.cart.update({
      where: { id: activeCart.id },
      data: { updatedAt: new Date() }
    });

    return success({ message: "Cart merged successfully" });
  } catch (err) {
    return serverError(err);
  }
}

async function handleClearCart(ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) {
    return unauthorized("Authentication required");
  }

  try {
    const prisma = getPrisma(ctx.env);
    const cart = await prisma.cart.findUnique({
      where: { profileId: ctx.userId }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    return success({ message: "Cart cleared successfully" });
  } catch (err) {
    return serverError(err);
  }
}
