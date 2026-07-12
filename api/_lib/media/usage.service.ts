// Centralized in-use detection for media assets.
// Mirrors the reference checks performed in the admin media usage endpoint so
// that both single and bulk deletes enforce the same integrity guarantees.

import type { PrismaClient } from "@prisma/client";

export interface UsageReference {
  type: string;
  id: string;
  name: string;
}

/**
 * Returns the list of entities currently referencing the given Cloudinary public_id.
 * Returns an empty array when the asset is not in use.
 */
export async function getAssetReferences(
  prisma: PrismaClient,
  publicId: string | null | undefined
): Promise<UsageReference[]> {
  if (!publicId) return [];

  const references: UsageReference[] = [];

  try {
    const categories = await prisma.categories.findMany({
      where: { imagePublicId: publicId },
      select: { id: true, name: true },
    });
    categories.forEach((c) => references.push({ type: "Category", id: c.id, name: c.name }));

    const subcategories = await prisma.subcategories.findMany({
      where: { imagePublicId: publicId },
      select: { id: true, name: true },
    });
    subcategories.forEach((s) => references.push({ type: "Subcategory", id: s.id, name: s.name }));

    const collections = await prisma.collections.findMany({
      where: { heroImagePublicId: publicId },
      select: { id: true, name: true },
    });
    collections.forEach((c) => references.push({ type: "Collection", id: c.id, name: c.name }));

    const brands = await prisma.brands.findMany({
      where: { logoPublicId: publicId },
      select: { id: true, name: true },
    });
    brands.forEach((b) => references.push({ type: "Brand", id: b.id, name: b.name }));

    const sizeGuides = await prisma.size_guides.findMany({
      where: { imagePublicId: publicId },
      select: { id: true, name: true },
    });
    sizeGuides.forEach((s) => references.push({ type: "Size Guide", id: s.id, name: s.name }));

    const products = await prisma.products.findMany({
      where: { sizeChartPublicId: publicId },
      select: { id: true, name: true },
    });
    products.forEach((p) => references.push({ type: "Product", id: p.id, name: p.name }));

    const variants = await prisma.product_variants.findMany({
      where: { videoPublicId: publicId },
      select: { id: true },
    });
    for (const variant of variants) {
      const product = await prisma.products.findUnique({
        where: { id: variant.id },
        select: { name: true },
      });
      if (product) references.push({ type: "Product Variant", id: variant.id, name: product.name });
    }

    const productImages = await prisma.product_images.findMany({
      where: { publicId: publicId },
      select: { id: true, productId: true },
    });
    for (const img of productImages) {
      const product = await prisma.products.findUnique({
        where: { id: img.productId },
        select: { name: true },
      });
      if (product) references.push({ type: "Product Image", id: img.id, name: product.name });
    }

    const lookbooks = await prisma.lookbooks.findMany({
      where: { coverImagePublicId: publicId },
      select: { id: true, name: true },
    });
    lookbooks.forEach((l) => references.push({ type: "Lookbook", id: l.id, name: l.name }));

    const lookbookItems = await prisma.lookbook_items.findMany({
      where: { imagePublicId: publicId },
      select: { id: true, lookbookId: true },
    });
    for (const item of lookbookItems) {
      const lookbook = await prisma.lookbooks.findUnique({
        where: { id: item.lookbookId },
        select: { name: true },
      });
      if (lookbook) references.push({ type: "Lookbook Item", id: item.id, name: lookbook.name });
    }

    const siteSettings = await prisma.site_settings.findFirst({
      select: { id: true, siteName: true, logoPublicId: true, faviconPublicId: true, ogImagePublicId: true },
    });
    if (siteSettings) {
      if (siteSettings.logoPublicId === publicId) references.push({ type: "Site Settings", id: siteSettings.id, name: "Logo" });
      if (siteSettings.faviconPublicId === publicId) references.push({ type: "Site Settings", id: siteSettings.id, name: "Favicon" });
      if (siteSettings.ogImagePublicId === publicId) references.push({ type: "Site Settings", id: siteSettings.id, name: "OG Image" });
    }
  } catch (err) {
    console.error("[UsageService] Failed to compute asset references:", err);
  }

  return references;
}

export async function isAssetInUse(
  prisma: PrismaClient,
  publicId: string | null | undefined
): Promise<boolean> {
  const refs = await getAssetReferences(prisma, publicId);
  return refs.length > 0;
}
