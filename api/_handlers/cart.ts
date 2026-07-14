import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { authenticate } from "../_lib/auth-middleware";

export async function handleCartRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[] = [],
  action: string = "get"
): Promise<Response> {
  // For guest carts, we don't require auth
  const isGuestAction = action === "sync" || action === "merge";
  
  if (!isGuestAction) {
    const authResult = await authenticate(req, { required: true, requireEmailVerified: true }, ctx.env!);
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
    const prisma = getPrisma(ctx.env!);

    // Clean up expired cart
    await prisma.carts.deleteMany({
      where: {
        profileId: ctx.userId,
        expiresAt: { lt: new Date() },
      },
    });

    const cart = await prisma.carts.findUnique({
      where: { profileId: ctx.userId },
      include: {
        items: {
          include: {
            variant: {
              select: {
                id: true,
                productId: true,
                sku: true,
                size: true,
                color: true,
                colorHex: true,
                stock: true,
                priceAdjustment: true,
              }
            }
          }
        }
      }
    });

    if (!cart) {
      return success({ items: [], couponCode: null, discount: 0, discountType: null });
    }

    // Fetch product data and images in separate queries to avoid deep nesting
    const productIds = [...new Set(cart.items.map(item => item.variant.productId))];
    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        salePrice: true,
        compareAtPrice: true,
      }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    const imageUrls = await prisma.product_images.findMany({
      where: {
        productId: { in: productIds },
        isPrimary: true
      },
      select: { productId: true, url: true }
    });

    const imageMap = new Map(imageUrls.map(img => [img.productId, img.url]));

    const items = cart.items.map(item => {
      const product = productMap.get(item.variant.productId);
      const image = imageMap.get(item.variant.productId) || "";
      return {
        id: item.id,
        productId: item.variant.productId,
        variantId: item.variantId,
        name: product?.name || "",
        slug: product?.slug || "",
        sku: item.variant.sku,
        size: item.variant.size,
        color: item.variant.color,
        colorHex: item.variant.colorHex || "",
        image,
        price: Number(product?.salePrice || product?.basePrice || 0) + Number(item.variant.priceAdjustment),
        compareAtPrice: product?.compareAtPrice ? Number(product.compareAtPrice) : null,
        quantity: item.quantity,
        maxQuantity: item.variant.stock
      };
    });

    return success({
      items,
      couponCode: null,
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
    const prisma = getPrisma(ctx.env!);
    
    // Get or create cart
    let cart = await prisma.carts.findUnique({
      where: { profileId: ctx.userId }
    });

    if (!cart) {
      cart = await prisma.carts.create({
        data: { 
          profileId: ctx.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }
      });
    }

    // Atomically replace all items within a transaction
    await prisma.$transaction(async (tx) => {
      await tx.cart_items.deleteMany({
        where: { cartId: cart.id }
      });

      if (items.length > 0) {
        await tx.cart_items.createMany({
          data: items.map(item => ({
            cartId: cart.id,
            variantId: item.variantId,
            quantity: item.quantity
          })),
          skipDuplicates: true
        });
      }

      await tx.carts.update({
        where: { id: cart.id },
        data: { 
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
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
    const prisma = getPrisma(ctx.env!);
    
    // Get or create cart
    const cart = await prisma.carts.findUnique({
      where: { profileId: ctx.userId },
      include: { items: true }
    });

    const activeCart = cart ?? await prisma.carts.create({
        data: { 
          profileId: ctx.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days,
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
      // Wrapped in transaction to prevent race condition (R4)
      await prisma.$transaction(async (tx) => {
        const existingVariants = new Map(activeCart.items.map(item => [item.variantId, item]));
        
        for (const item of items) {
          const existing = existingVariants.get(item.variantId);
          if (existing) {
            await tx.cart_items.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + item.quantity }
            });
          } else {
            await tx.cart_items.create({
              data: {
                cartId: cart.id,
                variantId: item.variantId,
                quantity: item.quantity
              }
            });
          }
        }

        // Update cart timestamp
        await tx.carts.update({
          where: { id: activeCart.id },
          data: { updatedAt: new Date() }
        });
      });
    }

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
    const prisma = getPrisma(ctx.env!);
    const cart = await prisma.carts.findUnique({
      where: { profileId: ctx.userId }
    });

    if (cart) {
      await prisma.cart_items.deleteMany({
        where: { cartId: cart.id }
      });
    }

    return success({ message: "Cart cleared successfully" });
  } catch (err) {
    return serverError(err);
  }
}
