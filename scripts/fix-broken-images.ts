import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Working Unsplash replacement images
const REPLACEMENT_IMAGES = {
  products: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1434389677669-e08b4cda3ea7?w=600&h=800&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop&crop=center",
  ],
  categories: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1434389677669-e08b4cda3ea7?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=600&fit=crop&crop=center",
  ],
  collections: [
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1067&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1067&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1518622358385-8ea7d5792795?w=800&h=1067&fit=crop&crop=center",
  ],
  hero: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&crop=center",
  ],
};

function isBrokenCloudinaryUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes("res.cloudinary.com") && /\b\d{13}/.test(url);
}

function isPartialUnsplashUrl(url: string | null): boolean {
  if (!url) return false;
  return /^photo-[a-z0-9-]+$/.test(url) && !url.includes("unsplash.com");
}

function isBareFilename(url: string | null): boolean {
  if (!url) return false;
  return (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("/") &&
    !/^photo-[a-z0-9-]+$/.test(url) &&
    /\.(jpg|jpeg|png|gif|webp|avif|bmp|tiff|tif|svg)$/i.test(url)
  );
}

function fixPartialUnsplashUrl(url: string): string {
  return `https://images.unsplash.com/${url}?w=600&h=800&fit=crop&crop=center`;
}

function getReplacementImage(type: keyof typeof REPLACEMENT_IMAGES, index: number): string {
  const images = REPLACEMENT_IMAGES[type];
  return images[index % images.length];
}

async function main() {
  // eslint-disable-next-line no-console
  console.log("🔧 Fixing broken Cloudinary image URLs...");

  let totalFixed = 0;

  // Debug: Check what URLs exist in the database
  const sampleImages = await prisma.productImage.findMany({ take: 10 });
  // eslint-disable-next-line no-console
  console.log("🔍 Sample product image URLs:", sampleImages.map(img => img.url));
  // eslint-disable-next-line no-console
  console.log("🔍 Database URL:", process.env.DATABASE_URL?.substring(0, 30) + "...");
  
  // Debug: Check products with primary images
  const productsWithImages = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    take: 5,
  });
  // eslint-disable-next-line no-console
  console.log("🔍 Products with primary images:", productsWithImages.map(p => ({ name: p.name, hasPrimaryImage: p.images.length > 0, imageUrl: p.images[0]?.url })));
  
  // Debug: Check if images have isPrimary flag set correctly
  const allImages = await prisma.productImage.findMany({ take: 20 });
  const primaryCount = allImages.filter(img => img.isPrimary).length;
  // eslint-disable-next-line no-console
  console.log(`🔍 Total images checked: ${allImages.length}, Primary images: ${primaryCount}`);
  // eslint-disable-next-line no-console
  console.log("🔍 Image sample with flags:", allImages.slice(0, 5).map(img => ({ url: img.url, isPrimary: img.isPrimary })));
  
  // Fix: Ensure each product has at least one primary image
  // eslint-disable-next-line no-console
  console.log("🔧 Ensuring each product has a primary image...");
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true },
  });
  
  for (const product of allProducts) {
    const productImages = await prisma.productImage.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' },
    });
    
    if (productImages.length > 0) {
      const hasPrimary = productImages.some(img => img.isPrimary);
      if (!hasPrimary) {
        await prisma.productImage.update({
          where: { id: productImages[0].id },
          data: { isPrimary: true },
        });
        // eslint-disable-next-line no-console
        console.log(`✅ Set primary image for product: ${product.name}`);
        totalFixed++;
      }
    }
  }

  // Fix Product Images
  const productImages = await prisma.productImage.findMany();
  for (const image of productImages) {
    if (isBrokenCloudinaryUrl(image.url)) {
      const replacement = getReplacementImage("products", Math.floor(Math.random() * REPLACEMENT_IMAGES.products.length));
      await prisma.productImage.update({
        where: { id: image.id },
        data: { url: replacement },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed product image: ${image.url} → ${replacement}`);
      totalFixed++;
    } else if (isPartialUnsplashUrl(image.url)) {
      const fixedUrl = fixPartialUnsplashUrl(image.url);
      await prisma.productImage.update({
        where: { id: image.id },
        data: { url: fixedUrl },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed partial Unsplash URL: ${image.url} → ${fixedUrl}`);
      totalFixed++;
    } else if (isBareFilename(image.url)) {
      const replacement = getReplacementImage("products", Math.floor(Math.random() * REPLACEMENT_IMAGES.products.length));
      await prisma.productImage.update({
        where: { id: image.id },
        data: { url: replacement },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed bare filename: ${image.url} → ${replacement}`);
      totalFixed++;
    }
  }

  // Fix Category Images
  const categories = await prisma.category.findMany();
  for (const category of categories) {
    if (isBrokenCloudinaryUrl(category.imageUrl)) {
      const replacement = getReplacementImage("categories", Math.floor(Math.random() * REPLACEMENT_IMAGES.categories.length));
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl: replacement },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed category image: ${category.imageUrl} → ${replacement}`);
      totalFixed++;
    } else if (isPartialUnsplashUrl(category.imageUrl)) {
      const fixedUrl = fixPartialUnsplashUrl(category.imageUrl);
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl: fixedUrl },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed partial Unsplash URL: ${category.imageUrl} → ${fixedUrl}`);
      totalFixed++;
    } else if (isBareFilename(category.imageUrl)) {
      const replacement = getReplacementImage("categories", Math.floor(Math.random() * REPLACEMENT_IMAGES.categories.length));
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl: replacement },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed bare filename: ${category.imageUrl} → ${replacement}`);
      totalFixed++;
    }
  }

  // Fix Collection Images
  const collections = await prisma.collection.findMany();
  for (const collection of collections) {
    if (isBrokenCloudinaryUrl(collection.heroImageUrl)) {
      const replacement = getReplacementImage("collections", Math.floor(Math.random() * REPLACEMENT_IMAGES.collections.length));
      await prisma.collection.update({
        where: { id: collection.id },
        data: { heroImageUrl: replacement },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed collection image: ${collection.heroImageUrl} → ${replacement}`);
      totalFixed++;
    } else if (isPartialUnsplashUrl(collection.heroImageUrl)) {
      const fixedUrl = fixPartialUnsplashUrl(collection.heroImageUrl);
      await prisma.collection.update({
        where: { id: collection.id },
        data: { heroImageUrl: fixedUrl },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed partial Unsplash URL: ${collection.heroImageUrl} → ${fixedUrl}`);
      totalFixed++;
    } else if (isBareFilename(collection.heroImageUrl)) {
      const replacement = getReplacementImage("collections", Math.floor(Math.random() * REPLACEMENT_IMAGES.collections.length));
      await prisma.collection.update({
        where: { id: collection.id },
        data: { heroImageUrl: replacement },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed bare filename: ${collection.heroImageUrl} → ${replacement}`);
      totalFixed++;
    }
  }

  // Fix Media Assets
  const mediaAssets = await prisma.mediaAsset.findMany();
  for (const asset of mediaAssets) {
    if (isBrokenCloudinaryUrl(asset.url)) {
      const replacement = getReplacementImage("products", Math.floor(Math.random() * REPLACEMENT_IMAGES.products.length));
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { url: replacement },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed media asset: ${asset.url} → ${replacement}`);
      totalFixed++;
    } else if (isPartialUnsplashUrl(asset.url)) {
      const fixedUrl = fixPartialUnsplashUrl(asset.url);
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { url: fixedUrl },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed media asset partial Unsplash: ${asset.url} → ${fixedUrl}`);
      totalFixed++;
    } else if (isBareFilename(asset.url)) {
      const replacement = getReplacementImage("products", Math.floor(Math.random() * REPLACEMENT_IMAGES.products.length));
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { url: replacement },
      });
      // eslint-disable-next-line no-console
      console.log(`✅ Fixed media asset bare filename: ${asset.url} → ${replacement}`);
      totalFixed++;
    }
  }

  // Fix Homepage Sections (Hero Slides)
  const homepageSections = await prisma.homepageSection.findMany({
    where: { sectionType: "hero_slider" },
  });
  for (const section of homepageSections) {
    const content = section.content as Record<string, unknown>;
    if ((content as Record<string, unknown>)?.["slides"]) {
      const slides = (content as Record<string, unknown[]>)["slides"];
      let updated = false;
      for (const slide of slides) {
        const slideRecord = slide as Record<string, string>;
        if (isBrokenCloudinaryUrl(slideRecord.image)) {
          slideRecord.image = getReplacementImage("hero", Math.floor(Math.random() * REPLACEMENT_IMAGES.hero.length));
          updated = true;
          // eslint-disable-next-line no-console
          console.log(`✅ Fixed hero slide image`);
          totalFixed++;
        } else if (isPartialUnsplashUrl(slideRecord.image)) {
          slideRecord.image = fixPartialUnsplashUrl(slideRecord.image);
          updated = true;
          // eslint-disable-next-line no-console
          console.log(`✅ Fixed partial Unsplash URL in hero slide`);
          totalFixed++;
        } else if (isBareFilename(slideRecord.image)) {
          slideRecord.image = getReplacementImage("hero", Math.floor(Math.random() * REPLACEMENT_IMAGES.hero.length));
          updated = true;
          // eslint-disable-next-line no-console
          console.log(`✅ Fixed bare filename in hero slide`);
          totalFixed++;
        }
      }
      if (updated) {
        await prisma.homepageSection.update({
          where: { id: section.id },
          data: { content: content as never },
        });
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\n✨ Total images fixed: ${totalFixed}`);
  // eslint-disable-next-line no-console
  console.log("🎉 Broken image URLs have been replaced with working Unsplash images");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error("❌ Error fixing images:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
