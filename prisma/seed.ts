import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.inventoryMovement.deleteMany();
  await prisma.relatedProduct.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.productLabelOnProduct.deleteMany();
  await prisma.productTagOnProduct.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.lookbookItem.deleteMany();
  await prisma.lookbook.deleteMany();
  await prisma.pageTemplate.deleteMany();
  await prisma.footerSection.deleteMany();
  await prisma.navigationMenu.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.announcementBar.deleteMany();
  await prisma.brandStory.deleteMany();
  await prisma.staticPage.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.socialMediaLink.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productLabel.deleteMany();
  await prisma.sizeGuide.deleteMany();
  await prisma.brand.deleteMany();

  // ─── Categories ───
  const menCategory = await prisma.category.create({
    data: {
      name: "Men",
      slug: "men",
      description: "Premium menswear collection",
      sortOrder: 1,
      isActive: true,
    },
  });

  const womenCategory = await prisma.category.create({
    data: {
      name: "Women",
      slug: "women",
      description: "Elegant womenswear collection",
      sortOrder: 2,
      isActive: true,
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Signature accessories",
      sortOrder: 3,
      isActive: true,
    },
  });

  // ─── Subcategories ───
  const subcategories = await Promise.all([
    prisma.subcategory.create({ data: { name: "Shirts", slug: "shirts", categoryId: menCategory.id, sortOrder: 1 } }),
    prisma.subcategory.create({ data: { name: "Trousers", slug: "trousers", categoryId: menCategory.id, sortOrder: 2 } }),
    prisma.subcategory.create({ data: { name: "Blazers", slug: "blazers", categoryId: menCategory.id, sortOrder: 3 } }),
    prisma.subcategory.create({ data: { name: "Kurtas", slug: "kurtas", categoryId: menCategory.id, sortOrder: 4 } }),
    prisma.subcategory.create({ data: { name: "Dresses", slug: "dresses", categoryId: womenCategory.id, sortOrder: 1 } }),
    prisma.subcategory.create({ data: { name: "Sarees", slug: "sarees", categoryId: womenCategory.id, sortOrder: 2 } }),
    prisma.subcategory.create({ data: { name: "Suits", slug: "suits", categoryId: womenCategory.id, sortOrder: 3 } }),
    prisma.subcategory.create({ data: { name: "Bags", slug: "bags", categoryId: accessoriesCategory.id, sortOrder: 1 } }),
    prisma.subcategory.create({ data: { name: "Watches", slug: "watches", categoryId: accessoriesCategory.id, sortOrder: 2 } }),
    prisma.subcategory.create({ data: { name: "Jewellery", slug: "jewellery", categoryId: accessoriesCategory.id, sortOrder: 3 } }),
  ]);

  // ─── Collections ───
  const summerCollection = await prisma.collection.create({
    data: { name: "Summer Essentials", slug: "summer-essentials", description: "Lightweight linen and cotton for the warmer months", isFeatured: true, sortOrder: 1 },
  });
  const heritageCollection = await prisma.collection.create({
    data: { name: "Heritage Revival", slug: "heritage-revival", description: "Traditional craftsmanship reimagined", isFeatured: true, sortOrder: 2 },
  });
  const eveningCollection = await prisma.collection.create({
    data: { name: "Evening Edit", slug: "evening-edit", description: "Curated pieces for your most memorable nights", isFeatured: true, sortOrder: 3 },
  });

  // ─── Product Tags ───
  const tags = await Promise.all([
    prisma.productTag.create({ data: { name: "Linen", slug: "linen" } }),
    prisma.productTag.create({ data: { name: "Cotton", slug: "cotton" } }),
    prisma.productTag.create({ data: { name: "Silk", slug: "silk" } }),
    prisma.productTag.create({ data: { name: "Handloom", slug: "handloom" } }),
    prisma.productTag.create({ data: { name: "Sustainable", slug: "sustainable" } }),
    prisma.productTag.create({ data: { name: "Festival", slug: "festival" } }),
    prisma.productTag.create({ data: { name: "Formal", slug: "formal" } }),
    prisma.productTag.create({ data: { name: "Casual", slug: "casual" } }),
  ]);

  // ─── Product Labels ───
  const labels = await Promise.all([
    prisma.productLabel.create({ data: { name: "New Arrival", slug: "new-arrival", color: "#c9a84c" } }),
    prisma.productLabel.create({ data: { name: "Best Seller", slug: "best-seller", color: "#8b6940" } }),
    prisma.productLabel.create({ data: { name: "Limited Edition", slug: "limited-edition", color: "#c65f5f" } }),
    prisma.productLabel.create({ data: { name: "Sustainable", slug: "sustainable", color: "#8a9a7b" } }),
  ]);

  // ─── Products ───
  const productData = [
    {
      name: "Pure Linen Shirt",
      description: "Crafted from premium European linen, this shirt offers unparalleled breathability and a relaxed silhouette. Features a classic spread collar and mother-of-pearl buttons.",
      shortDescription: "European linen shirt with spread collar",
      categoryId: menCategory.id, subcategoryId: subcategories[0].id, collectionId: summerCollection.id,
      basePrice: 8900, compareAtPrice: 11900, gender: "men" as const, isNew: true, isFeatured: true,
      material: "100% European Linen", careInstructions: "Dry clean recommended. Iron on medium heat.",
      variants: [
        { sku: "MLS-S-WHT", size: "S", color: "White", colorHex: "#FFFFFF", stock: 25 },
        { sku: "MLS-M-WHT", size: "M", color: "White", colorHex: "#FFFFFF", stock: 40 },
        { sku: "MLS-L-WHT", size: "L", color: "White", colorHex: "#FFFFFF", stock: 35 },
        { sku: "MLS-XL-WHT", size: "XL", color: "White", colorHex: "#FFFFFF", stock: 20 },
        { sku: "MLS-S-NVY", size: "S", color: "Navy", colorHex: "#1B2A4A", stock: 20 },
        { sku: "MLS-M-NVY", size: "M", color: "Navy", colorHex: "#1B2A4A", stock: 35 },
        { sku: "MLS-L-NVY", size: "L", color: "Navy", colorHex: "#1B2A4A", stock: 30 },
        { sku: "MLS-XL-NVY", size: "XL", color: "Navy", colorHex: "#1B2A4A", stock: 15 },
      ],
      tags: [0, 4], labels: [0],
    },
    {
      name: "Handloom Cotton Kurta",
      description: "Handwoven by master artisans, this kurta celebrates traditional Indian textile heritage. The lightweight cotton construction ensures comfort through every season.",
      shortDescription: "Artisan handloom cotton kurta",
      categoryId: menCategory.id, subcategoryId: subcategories[3].id, collectionId: heritageCollection.id,
      basePrice: 6500, compareAtPrice: null, gender: "men" as const, isNew: false, isFeatured: true,
      material: "Handloom Cotton", careInstructions: "Gentle hand wash with mild detergent.",
      variants: [
        { sku: "MHK-M-IVY", size: "M", color: "Ivory", colorHex: "#FFFFF0", stock: 15 },
        { sku: "MHK-L-IVY", size: "L", color: "Ivory", colorHex: "#FFFFF0", stock: 25 },
        { sku: "MHK-XL-IVY", size: "XL", color: "Ivory", colorHex: "#FFFFF0", stock: 20 },
        { sku: "MHK-M-IND", size: "M", color: "Indigo", colorHex: "#3F51B5", stock: 12 },
        { sku: "MHK-L-IND", size: "L", color: "Indigo", colorHex: "#3F51B5", stock: 20 },
        { sku: "MHK-XL-IND", size: "XL", color: "Indigo", colorHex: "#3F51B5", stock: 15 },
      ],
      tags: [3, 4, 5], labels: [1, 3],
    },
    {
      name: "Silk Evening Gown",
      description: "An exquisite silk evening gown with a sweeping silhouette. Features intricate hand-embroidery along the neckline and a concealed back zip.",
      shortDescription: "Hand-embroidered silk evening gown",
      categoryId: womenCategory.id, subcategoryId: subcategories[4].id, collectionId: eveningCollection.id,
      basePrice: 28500, compareAtPrice: 35000, gender: "women" as const, isNew: true, isFeatured: true,
      material: "Pure Mulberry Silk", careInstructions: "Professional dry clean only.",
      variants: [
        { sku: "WSE-6-BLK", size: "6", color: "Black", colorHex: "#000000", stock: 5 },
        { sku: "WSE-8-BLK", size: "8", color: "Black", colorHex: "#000000", stock: 8 },
        { sku: "WSE-10-BLK", size: "10", color: "Black", colorHex: "#000000", stock: 10 },
        { sku: "WSE-12-BLK", size: "12", color: "Black", colorHex: "#000000", stock: 6 },
        { sku: "WSE-6-BRG", size: "6", color: "Burgundy", colorHex: "#800020", stock: 4 },
        { sku: "WSE-8-BRG", size: "8", color: "Burgundy", colorHex: "#800020", stock: 7 },
        { sku: "WSE-10-BRG", size: "10", color: "Burgundy", colorHex: "#800020", stock: 8 },
      ],
      tags: [2, 6], labels: [0, 2],
    },
    {
      name: "Banarasi Silk Saree",
      description: "Handwoven in Varanasi, this pure silk saree features intricate zari work inspired by Mughal floral motifs. A timeless piece for celebrations.",
      shortDescription: "Handwoven Banarasi silk with zari work",
      categoryId: womenCategory.id, subcategoryId: subcategories[5].id, collectionId: heritageCollection.id,
      basePrice: 45000, compareAtPrice: 55000, gender: "women" as const, isNew: false, isFeatured: true,
      material: "Pure Banarasi Silk", careInstructions: "Dry clean only. Store in muslin cloth.",
      variants: [
        { sku: "WBS-ON-GLD", size: "One Size", color: "Gold", colorHex: "#C9A84C", stock: 3 },
        { sku: "WBS-ON-RED", size: "One Size", color: "Ruby Red", colorHex: "#9B111E", stock: 5 },
        { sku: "WBS-ON-GRN", size: "One Size", color: "Emerald", colorHex: "#046307", stock: 4 },
        { sku: "WBS-ON-BLU", size: "One Size", color: "Sapphire", colorHex: "#0F52BA", stock: 3 },
      ],
      tags: [2, 3, 5], labels: [1, 2],
    },
    {
      name: "Premium Leather Tote",
      description: "Handcrafted from full-grain Italian leather, this tote bag combines timeless elegance with practical design. Features multiple compartments and a detachable shoulder strap.",
      shortDescription: "Italian full-grain leather tote",
      categoryId: accessoriesCategory.id, subcategoryId: subcategories[7].id, collectionId: summerCollection.id,
      basePrice: 18500, compareAtPrice: 22000, gender: "women" as const, isNew: true, isFeatured: false,
      material: "Italian Full-Grain Leather", careInstructions: "Wipe with damp cloth. Use leather conditioner monthly.",
      variants: [
        { sku: "ABT-ST-TAN", size: "Standard", color: "Tan", colorHex: "#D2B48C", stock: 10 },
        { sku: "ABT-ST-BLK", size: "Standard", color: "Black", colorHex: "#000000", stock: 15 },
        { sku: "ABT-ST-BRN", size: "Standard", color: "Brown", colorHex: "#8B4513", stock: 12 },
        { sku: "ABT-LG-TAN", size: "Large", color: "Tan", colorHex: "#D2B48C", stock: 8 },
        { sku: "ABT-LG-BLK", size: "Large", color: "Black", colorHex: "#000000", stock: 10 },
      ],
      tags: [4], labels: [0],
    },
    {
      name: "Automatic Skeleton Watch",
      description: "A masterpiece of horology featuring a Swiss automatic movement visible through the skeleton dial. Sapphire crystal case back and genuine alligator strap.",
      shortDescription: "Swiss automatic skeleton timepiece",
      categoryId: accessoriesCategory.id, subcategoryId: subcategories[8].id, collectionId: eveningCollection.id,
      basePrice: 75000, compareAtPrice: null, gender: "men" as const, isNew: false, isFeatured: false,
      material: "Stainless Steel / Sapphire Crystal", careInstructions: "Avoid water exposure. Service every 3-5 years.",
      variants: [
        { sku: "AWS-GD-GLD", size: "Standard", color: "Gold", colorHex: "#C9A84C", stock: 5 },
        { sku: "AWS-GD-SLV", size: "Standard", color: "Silver", colorHex: "#C0C0C0", stock: 8 },
        { sku: "AWS-GD-BLK", size: "Standard", color: "Black", colorHex: "#000000", stock: 6 },
      ],
      tags: [6], labels: [2, 3],
    },
    {
      name: "Wool Blend Blazer",
      description: "Tailored from an Italian wool blend with a hint of silk for a subtle sheen. Features a classic two-button closure, notch lapels, and interior pockets.",
      shortDescription: "Italian wool blend tailored blazer",
      categoryId: menCategory.id, subcategoryId: subcategories[2].id, collectionId: eveningCollection.id,
      basePrice: 22000, compareAtPrice: 28000, gender: "men" as const, isNew: true, isFeatured: false,
      material: "70% Wool / 30% Silk", careInstructions: "Dry clean only. Use wooden hanger.",
      variants: [
        { sku: "MWB-38-CHA", size: "38", color: "Charcoal", colorHex: "#36454F", stock: 8 },
        { sku: "MWB-40-CHA", size: "40", color: "Charcoal", colorHex: "#36454F", stock: 15 },
        { sku: "MWB-42-CHA", size: "42", color: "Charcoal", colorHex: "#36454F", stock: 20 },
        { sku: "MWB-44-CHA", size: "44", color: "Charcoal", colorHex: "#36454F", stock: 12 },
        { sku: "MWB-38-NVY", size: "38", color: "Navy", colorHex: "#1B2A4A", stock: 10 },
        { sku: "MWB-40-NVY", size: "40", color: "Navy", colorHex: "#1B2A4A", stock: 18 },
        { sku: "MWB-42-NVY", size: "42", color: "Navy", colorHex: "#1B2A4A", stock: 22 },
      ],
      tags: [6], labels: [0],
    },
    {
      name: "Handcrafted Pearl Necklace",
      description: "Each freshwater pearl is hand-selected and individually knotted on silk thread. Finished with a 14-karat gold vermeil clasp.",
      shortDescription: "Freshwater pearl strand with gold clasp",
      categoryId: accessoriesCategory.id, subcategoryId: subcategories[9].id, collectionId: heritageCollection.id,
      basePrice: 12500, compareAtPrice: 16000, gender: "women" as const, isNew: false, isFeatured: false,
      material: "Freshwater Pearl / 14K Gold Vermeil", careInstructions: "Wipe after wearing. Avoid perfumes and lotions.",
      variants: [
        { sku: "AHN-16-PRL", size: "16 inch", color: "White Pearl", colorHex: "#EEE8AA", stock: 8 },
        { sku: "AHN-18-PRL", size: "18 inch", color: "White Pearl", colorHex: "#EEE8AA", stock: 12 },
        { sku: "AHN-20-PRL", size: "20 inch", color: "White Pearl", colorHex: "#EEE8AA", stock: 6 },
      ],
      tags: [2, 5], labels: [1],
    },
    {
      name: "Linen Straight Trousers",
      description: "Effortless elegance meets comfort. These high-waisted linen trousers feature a relaxed straight leg and side pockets.",
      shortDescription: "High-waisted linen straight trousers",
      categoryId: womenCategory.id, subcategoryId: subcategories[1].id, collectionId: summerCollection.id,
      basePrice: 7500, compareAtPrice: null, gender: "women" as const, isNew: true, isFeatured: false,
      material: "100% Linen", careInstructions: "Machine wash gentle. Hang to dry.",
      variants: [
        { sku: "WLT-6-BGE", size: "6", color: "Beige", colorHex: "#F5F5DC", stock: 15 },
        { sku: "WLT-8-BGE", size: "8", color: "Beige", colorHex: "#F5F5DC", stock: 25 },
        { sku: "WLT-10-BGE", size: "10", color: "Beige", colorHex: "#F5F5DC", stock: 30 },
        { sku: "WLT-12-BGE", size: "12", color: "Beige", colorHex: "#F5F5DC", stock: 20 },
        { sku: "WLT-6-OLV", size: "6", color: "Olive", colorHex: "#556B2F", stock: 12 },
        { sku: "WLT-8-OLV", size: "8", color: "Olive", colorHex: "#556B2F", stock: 20 },
      ],
      tags: [0, 7], labels: [0],
    },
    {
      name: "Embroidered Lehenga Set",
      description: "A three-piece ensemble featuring a heavily embroidered lehenga skirt, matching blouse, and flowing dupatta. Finished with intricate mirror work.",
      shortDescription: "Festival lehenga with mirror embroidery",
      categoryId: womenCategory.id, subcategoryId: subcategories[6].id, collectionId: heritageCollection.id,
      basePrice: 55000, compareAtPrice: 68000, gender: "women" as const, isNew: false, isFeatured: true,
      material: "Raw Silk / Zari Embroidery", careInstructions: "Dry clean only. Store flat.",
      variants: [
        { sku: "WLS-FS-RED", size: "Free Size", color: "Crimson", colorHex: "#DC143C", stock: 4 },
        { sku: "WLS-FS-PNK", size: "Free Size", color: "Rose Pink", colorHex: "#FF66A3", stock: 3 },
        { sku: "WLS-FS-PPL", size: "Free Size", color: "Royal Purple", colorHex: "#7851A9", stock: 3 },
      ],
      tags: [2, 3, 5], labels: [1, 2],
    },
  ];

  // Create products with variants, images, tags, and labels
  for (let i = 0; i < productData.length; i++) {
    const pd = productData[i];

    const product = await prisma.product.create({
      data: {
        name: pd.name,
        slug: pd.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
        description: pd.description,
        shortDescription: pd.shortDescription,
        categoryId: pd.categoryId,
        subcategoryId: pd.subcategoryId ?? null,
        collectionId: pd.collectionId ?? null,
        basePrice: pd.basePrice,
        compareAtPrice: pd.compareAtPrice ?? null,
        gender: pd.gender,
        isNew: pd.isNew,
        isFeatured: pd.isFeatured,
        material: pd.material,
        careInstructions: pd.careInstructions,
        isActive: true,
        publishedAt: new Date(),
      },
    });

    // Create variants
    for (const v of pd.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex ?? null,
          stock: v.stock,
          isActive: true,
        },
      });
    }

    // Create a primary image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `https://res.cloudinary.com/dewwv3uzt/image/upload/v1/products/product${(i % 3) + 1}`,
        altText: pd.shortDescription,
        sortOrder: 0,
        isPrimary: true,
      },
    });

    // Create additional images
    for (let j = 1; j <= 3; j++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://res.cloudinary.com/dewwv3uzt/image/upload/v1/products/product${(i % 3) + 1}_${j}`,
          altText: `${pd.name} - View ${j + 1}`,
          sortOrder: j,
          isPrimary: false,
        },
      });
    }

    // Add tags
    if (pd.tags && pd.tags.length > 0) {
      for (const tagIndex of pd.tags) {
        await prisma.productTagOnProduct.create({
          data: { productId: product.id, tagId: tags[tagIndex].id },
        });
      }
    }

    // Add labels
    if (pd.labels && pd.labels.length > 0) {
      for (const labelIndex of pd.labels) {
        await prisma.productLabelOnProduct.create({
          data: { productId: product.id, labelId: labels[labelIndex].id },
        });
      }
    }

    // Add some attributes
    await prisma.productAttribute.createMany({
      data: [
        { productId: product.id, name: "Fit", value: "Regular" },
        { productId: product.id, name: "Season", value: "All Season" },
        { productId: product.id, name: "Occasion", value: pd.variants.length > 3 ? "Formal" : "Festive" },
      ],
    });
  }

  // ─── Homepage Sections ───
  await prisma.homepageSection.createMany({
    data: [
      {
        sectionType: "hero_slider",
        title: "Summer Essentials 2024",
        subtitle: "Lightweight linen and cotton for the warmer months",
        content: {
          slides: [
            { image: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/hero/slide1", cta: { text: "Shop Now", link: "/collections/summer-essentials" } },
            { image: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/hero/slide2", cta: { text: "Explore", link: "/collections/heritage-revival" } },
          ],
        },
        sortOrder: 1,
        isActive: true,
      },
      {
        sectionType: "featured_collections",
        title: "Curated Collections",
        subtitle: "Discover our handpicked edits",
        content: null,
        sortOrder: 2,
        isActive: true,
      },
      {
        sectionType: "new_arrivals",
        title: "New Arrivals",
        subtitle: "The latest additions to our collection",
        content: null,
        sortOrder: 3,
        isActive: true,
      },
      {
        sectionType: "brand_story",
        title: "Our Heritage",
        subtitle: "Crafted with passion since 2020",
        content: { body: "নবME was born from a vision to blend traditional Indian craftsmanship with contemporary design. Every piece tells a story of heritage, artistry, and timeless elegance." },
        sortOrder: 4,
        isActive: true,
      },
      {
        sectionType: "newsletter",
        title: "Join the Inner Circle",
        subtitle: "Be the first to know about new collections, exclusive offers, and events.",
        content: { placeholder: "Enter your email", buttonText: "Subscribe" },
        sortOrder: 5,
        isActive: true,
      },
    ],
  });

  // ─── Navigation Menus ───
  await prisma.navigationMenu.createMany({
    data: [
      {
        name: "Main Menu",
        location: "header",
        items: [
          { label: "Men", link: "/products?category=men", children: [
            { label: "Shirts", link: "/products?category=men&subcategory=shirts" },
            { label: "Trousers", link: "/products?category=men&subcategory=trousers" },
            { label: "Blazers", link: "/products?category=men&subcategory=blazers" },
            { label: "Kurtas", link: "/products?category=men&subcategory=kurtas" },
          ]},
          { label: "Women", link: "/products?category=women", children: [
            { label: "Dresses", link: "/products?category=women&subcategory=dresses" },
            { label: "Sarees", link: "/products?category=women&subcategory=sarees" },
            { label: "Suits", link: "/products?category=women&subcategory=suits" },
          ]},
          { label: "Accessories", link: "/products?category=accessories", children: [
            { label: "Bags", link: "/products?category=accessories&subcategory=bags" },
            { label: "Watches", link: "/products?category=accessories&subcategory=watches" },
            { label: "Jewellery", link: "/products?category=accessories&subcategory=jewellery" },
          ]},
          { label: "Collections", link: "/products" },
          { label: "Lookbook", link: "/lookbooks" },
          { label: "Our Story", link: "/pages/our-story" },
        ],
        isActive: true,
      },
      {
        name: "Footer - Shop",
        location: "footer",
        items: [
          { label: "Men", link: "/products?category=men" },
          { label: "Women", link: "/products?category=women" },
          { label: "Accessories", link: "/products?category=accessories" },
          { label: "Collections", link: "/products" },
          { label: "New Arrivals", link: "/products?sort=newest" },
        ],
        isActive: true,
      },
      {
        name: "Footer - Support",
        location: "footer",
        items: [
          { label: "Contact Us", link: "/contact" },
          { label: "Size Guide", link: "/size-guide" },
          { label: "Shipping & Returns", link: "/pages/shipping-returns" },
          { label: "FAQ", link: "/faq" },
        ],
        isActive: true,
      },
    ],
  });

  // ─── Footer Sections ───
  await prisma.footerSection.createMany({
    data: [
      { column: 1, title: "নবME", contentType: "text", content: { text: "Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design." }, sortOrder: 1 },
      { column: 2, title: "Shop", contentType: "menu", content: { menuSlug: "Footer - Shop" }, sortOrder: 2 },
      { column: 3, title: "Support", contentType: "menu", content: { menuSlug: "Footer - Support" }, sortOrder: 3 },
      { column: 4, title: "Connect", contentType: "social", content: { description: "Follow us on social media for the latest updates." }, sortOrder: 4 },
    ],
  });

  // ─── Static Pages ───
  await prisma.staticPage.createMany({
    data: [
      {
        title: "Our Story",
        slug: "our-story",
        content: {
          blocks: [
            { type: "heading", content: "The নবME Story" },
            { type: "text", content: "Founded in 2020, নবME was created with a singular vision: to bring the finest of Indian craftsmanship to the global stage. Every piece in our collection is a testament to the skill of our artisans and the richness of our heritage." },
            { type: "image", url: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/about/workshop" },
            { type: "heading", content: "Our Craft" },
            { type: "text", content: "From the handloom weavers of Varanasi to the embroiderers of Lucknow, we work directly with artisan communities across India, ensuring fair wages and preserving centuries-old techniques." },
          ],
        },
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: "Our Story — নবME",
        metaDesc: "Discover the story behind নবME — a premium fashion brand celebrating Indian craftsmanship.",
      },
      {
        title: "Shipping & Returns",
        slug: "shipping-returns",
        content: {
          blocks: [
            { type: "heading", content: "Shipping Policy" },
            { type: "text", content: "We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days. Express shipping is available at checkout." },
            { type: "heading", content: "Returns & Exchanges" },
            { type: "text", content: "We accept returns within 14 days of delivery. Items must be unworn with tags attached. Free exchanges on first size change." },
          ],
        },
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });

  // ─── Brand Story ───
  await prisma.brandStory.create({
    data: {
      title: "Our Heritage",
      subtitle: "Where tradition meets modernity",
      heroImageUrl: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/about/hero",
      content: { blocks: [
        { type: "text", content: "নবME represents the confluence of India's rich textile heritage and contemporary design sensibility. Each creation is a narrative woven with threads of tradition and innovation." },
      ]},
      mission: "To preserve and promote Indian craftsmanship while creating timeless pieces for the modern wardrobe.",
      vision: "To be the global ambassador of Indian luxury fashion, known for uncompromising quality and authentic craftsmanship.",
      values: { values: ["Craftsmanship", "Sustainability", "Heritage", "Innovation", "Quality"] },
    },
  });

  // ─── Coupons ───
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", description: "10% off your first order", discountType: "percentage", discountValue: 10, minOrderValue: 1000, maxDiscount: 2000, usageLimit: 500, usedCount: 0, perUserLimit: 1, isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
      { code: "SUMMER50", description: "₹500 off on orders above ₹2999", discountType: "fixed", discountValue: 500, minOrderValue: 2999, usageLimit: 200, usedCount: 15, perUserLimit: 1, isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      { code: "FREESHIP", description: "Free shipping on all orders", discountType: "fixed", discountValue: 0, minOrderValue: null, isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    ],
  });

  // ─── Announcement ───
  await prisma.announcementBar.create({
    data: {
      text: "Free shipping on orders above ₹999 • Use code SUMMER50 for extra ₹500 off",
      linkUrl: "/collections/summer-essentials",
      linkText: "Shop Now",
      bgColor: "#1B2A4A",
      textColor: "#FFFFFF",
      position: "top",
      isActive: true,
    },
  });

  // ─── Social Media Links ───
  await prisma.socialMediaLink.createMany({
    data: [
      { platform: "instagram", url: "https://instagram.com/nabome", label: "Instagram", isActive: true, sortOrder: 1 },
      { platform: "youtube", url: "https://youtube.com/@nabome", label: "YouTube", isActive: true, sortOrder: 2 },
      { platform: "pinterest", url: "https://pinterest.com/nabome", label: "Pinterest", isActive: true, sortOrder: 3 },
    ],
  });

  // ─── Lookbooks ───
  const summerLookbook = await prisma.lookbook.create({
    data: {
      name: "Summer Solstice 2024",
      slug: "summer-solstice-2024",
      description: "Embrace the warmth with our curated summer edit — where lightweight fabrics meet effortless elegance.",
      coverImageUrl: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/lookbooks/summer-cover",
      season: "Summer", year: 2024, layout: "editorial",
      story: { narrative: "Inspired by the golden hour, this collection captures the essence of sun-drenched days and balmy evenings. Each piece is designed to move with you, from morning coffees to sunset soirees." },
      tags: ["summer", "linen", "editorial"], isActive: true, sortOrder: 1,
    },
  });
  await prisma.lookbookItem.createMany({
    data: [
      { lookbookId: summerLookbook.id, imageUrl: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/lookbooks/summer-1", caption: "Linen in the golden hour", sortOrder: 1 },
      { lookbookId: summerLookbook.id, imageUrl: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/lookbooks/summer-2", caption: "Effortless silhouettes", sortOrder: 2 },
      { lookbookId: summerLookbook.id, imageUrl: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/lookbooks/summer-3", caption: "Sunset hues", sortOrder: 3 },
    ],
  });

  const heritageLookbook = await prisma.lookbook.create({
    data: {
      name: "Heritage Revival",
      slug: "heritage-revival",
      description: "A tribute to the master artisans who keep India's textile traditions alive.",
      coverImageUrl: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/lookbooks/heritage-cover",
      season: "Festive", year: 2024, layout: "masonry",
      story: { narrative: "Each piece in this lookbook tells a story of generations of craftsmanship. From the handloom weavers of Varanasi to the embroiderers of Lucknow, we celebrate the hands that create magic." },
      tags: ["heritage", "craftsmanship", "festive"], isActive: true, sortOrder: 2,
    },
  });
  await prisma.lookbookItem.createMany({
    data: [
      { lookbookId: heritageLookbook.id, imageUrl: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/lookbooks/heritage-1", caption: "Banarasi elegance", sortOrder: 1 },
      { lookbookId: heritageLookbook.id, imageUrl: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/lookbooks/heritage-2", caption: "Zari detailing", sortOrder: 2 },
    ],
  });

  // ─── Page Templates ───
  await prisma.pageTemplate.createMany({
    data: [
      {
        name: "Standard Landing Page", slug: "standard-landing",
        description: "A balanced layout with hero banner, featured sections, and newsletter signup.",
        category: "landing", thumbnail: null,
        sections: [
          { id: "section-1", type: "hero_banner", config: { heading: "Welcome", subheading: "Discover our collection", ctaText: "Shop Now", ctaUrl: "/shop" }, styles: {} },
          { id: "section-2", type: "product_grid", config: { title: "Featured Products", columns: 4, limit: 8 }, styles: {} },
          { id: "section-3", type: "newsletter", config: { heading: "Stay Connected", buttonText: "Subscribe" }, styles: {} },
        ],
        metadata: { description: "Best for brand homepages and campaign landing pages." },
        isActive: true,
      },
      {
        name: "Brand Story Page", slug: "brand-story",
        description: "Tells your brand narrative with hero image, text blocks, and values section.",
        category: "content", thumbnail: null,
        sections: [
          { id: "section-1", type: "hero_banner", config: { heading: "Our Story", subheading: "The journey of craftsmanship" }, styles: {} },
          { id: "section-2", type: "text_block", config: { heading: "Our Heritage", content: "<p>Founded with a vision...</p>" }, styles: {} },
          { id: "section-3", type: "image_block", config: { image: "" }, styles: {} },
          { id: "section-4", type: "testimonial", config: { title: "What Our Customers Say", testimonials: [] }, styles: {} },
        ],
        metadata: { description: "Perfect for About Us and brand narrative pages." },
        isActive: true,
      },
      {
        name: "Lookbook Layout", slug: "lookbook-layout",
        description: "Visual-first layout with full-width images and shop-the-look integrations.",
        category: "editorial", thumbnail: null,
        sections: [
          { id: "section-1", type: "hero_banner", config: { heading: "Collection Name", subheading: "Season Year" }, styles: {} },
          { id: "section-2", type: "image_block", config: { image: "", fullWidth: true }, styles: {} },
          { id: "section-3", type: "rich_text", config: { heading: "The Inspiration", content: "<p>...</p>" }, styles: {} },
          { id: "section-4", type: "product_grid", config: { title: "Shop the Look", columns: 3, limit: 6 }, styles: {} },
        ],
        metadata: { description: "Ideal for product launches and editorial content." },
        isActive: true,
      },
    ],
  });

  // ─── Site Settings with Theme ───
  await prisma.siteSetting.create({
    data: {
      siteName: "নবME",
      tagline: "Premium Fashion Destination",
      currency: "INR",
      taxRate: 5,
      freeShippingThreshold: 999,
      shippingInfo: { standard: "3-5 business days", express: "1-2 business days" },
      returnPolicy: { days: 14, condition: "Unworn with tags" },
      contactEmail: "hello@nabome.com",
      contactPhone: "+91-1800-নবME",
      address: "নবME House, Mumbai, Maharashtra, India",
      theme: {
        branding: {
          logoLight: null, logoDark: null, logoMobile: null, favicon: null,
          siteName: "নবME", tagline: "Premium Fashion Destination",
          description: "Premium fashion destination celebrating traditional craftsmanship.",
        },
        colors: {
          primary: "#1B2A4A", primaryLight: "#2C4270", primaryDark: "#0F1B30",
          accent: "#C9A84C", accentLight: "#DCC47A", accentDark: "#A8882E",
          background: "#FFFFFF", surface: "#F8F7F4", surfaceHover: "#EEEDE8",
          text: "#1A1A1A", textSecondary: "#6B6B6B", textOnPrimary: "#FFFFFF",
          border: "#E5E4DF", divider: "#F0EFEB", error: "#DC2626", success: "#16A34A", warning: "#D97706",
          productCardBg: "#FFFFFF", productCardBorder: "#F0EFEB", saleBadge: "#DC2626", newBadge: "#16A34A",
        },
        typography: {
          displayFont: "Playfair Display", displaySizes: { sm: "2rem", md: "3rem", lg: "4rem", xl: "5rem" },
          headingFont: "Inter", headingWeights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
          bodyFont: "Inter", bodySize: "0.9375rem", lineHeight: 1.6,
          monoFont: "JetBrains Mono", letterSpacing: { tight: "-0.01em", normal: "0", wide: "0.02em", wider: "0.05em" },
        },
        buttons: {
          primary: { bg: "#1B2A4A", text: "#FFFFFF", border: "#1B2A4A", radius: "0", paddingX: "1.75rem", paddingY: "0.75rem", hoverBg: "#2C4270", hoverText: "#FFFFFF", hoverBorder: "#2C4270" },
          secondary: { bg: "transparent", text: "#1B2A4A", border: "#1B2A4A", radius: "0", paddingX: "1.75rem", paddingY: "0.75rem", hoverBg: "#1B2A4A", hoverText: "#FFFFFF", hoverBorder: "#1B2A4A" },
          outline: { bg: "transparent", text: "#1A1A1A", border: "#E5E4DF", radius: "0", paddingX: "1.75rem", paddingY: "0.75rem", hoverBg: "#F8F7F4", hoverText: "#1A1A1A", hoverBorder: "#1A1A1A" },
        },
        layout: { containerMaxWidth: "1440px", maxWidth: "1280px", headerStyle: "classic", footerStyle: "classic", productCardLayout: "vertical", mobileMenuStyle: "drawer" },
        header: { style: "classic", sticky: true, transparent: false, menuLocation: "header_main", showIcons: true, searchType: "overlay", cartType: "drawer" },
        footer: { style: "classic", columns: 4, showNewsletter: true, showSocial: true, showContact: true, showPaymentIcons: true },
      },
    },
  });

  // ─── Media Assets (placeholder) ───
  await prisma.mediaAsset.createMany({
    data: [
      { url: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/logo/logo", type: "image", folder: "logo", tags: ["logo", "brand"] },
      { url: "https://res.cloudinary.com/dewwv3uzt/image/upload/v1/hero/main", type: "image", folder: "hero", tags: ["hero", "homepage"] },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("   Categories:", await prisma.category.count());
  console.log("   Subcategories:", await prisma.subcategory.count());
  console.log("   Collections:", await prisma.collection.count());
  console.log("   Products:", await prisma.product.count());
  console.log("   Product Variants:", await prisma.productVariant.count());
  console.log("   Product Images:", await prisma.productImage.count());
  console.log("   Homepage Sections:", await prisma.homepageSection.count());
  console.log("   Navigation Menus:", await prisma.navigationMenu.count());
  console.log("   Static Pages:", await prisma.staticPage.count());
  console.log("   Coupons:", await prisma.coupon.count());
  console.log("   Announcements:", await prisma.announcementBar.count());
  console.log("   Social Links:", await prisma.socialMediaLink.count());
  console.log("   Lookbooks:", await prisma.lookbook.count());
  console.log("   Page Templates:", await prisma.pageTemplate.count());
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
