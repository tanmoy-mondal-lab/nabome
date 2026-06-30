import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters due to foreign keys)
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.relatedProduct.deleteMany();
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
  // Clean transactional/audit tables
  await prisma.notification.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.userActionLog.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.supportTicketReply.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.shippingRate.deleteMany();
  await prisma.shippingZone.deleteMany();

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
        url: `https://placehold.co/600x800/1B2A4A/FFFFFF?text=${encodeURIComponent(pd.name)}`,
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
          url: `https://placehold.co/600x800/F8F7F4/1A1A1A?text=${encodeURIComponent(`${pd.name} View ${j + 1}`)}`,
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
            { image: "https://placehold.co/1920x800/1B2A4A/C9A84C?text=Summer+Essentials", cta: { text: "Shop Now", link: "/collections/summer-essentials" } },
            { image: "https://placehold.co/1920x800/C9A84C/1B2A4A?text=Heritage+Revival", cta: { text: "Explore", link: "/collections/heritage-revival" } },
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
  const headerMenuId = crypto.randomUUID();
  const footerShopId = crypto.randomUUID();
  const footerSupportId = crypto.randomUUID();
  await prisma.navigationMenu.createMany({
    data: [
      {
        id: headerMenuId,
        name: "Main Menu",
        location: "header",
        items: [
          { id: crypto.randomUUID(), type: "dropdown", label: "Men", url: "/products?category=men", link: "/products?category=men", target: "_self", isVisible: true, isHighlighted: false, children: [
            { id: crypto.randomUUID(), type: "link", label: "Shirts", url: "/products?category=men&subcategory=shirts", link: "/products?category=men&subcategory=shirts", target: "_self", isVisible: true, isHighlighted: false },
            { id: crypto.randomUUID(), type: "link", label: "Trousers", url: "/products?category=men&subcategory=trousers", link: "/products?category=men&subcategory=trousers", target: "_self", isVisible: true, isHighlighted: false },
            { id: crypto.randomUUID(), type: "link", label: "Blazers", url: "/products?category=men&subcategory=blazers", link: "/products?category=men&subcategory=blazers", target: "_self", isVisible: true, isHighlighted: false },
            { id: crypto.randomUUID(), type: "link", label: "Kurtas", url: "/products?category=men&subcategory=kurtas", link: "/products?category=men&subcategory=kurtas", target: "_self", isVisible: true, isHighlighted: false },
          ]},
          { id: crypto.randomUUID(), type: "dropdown", label: "Women", url: "/products?category=women", link: "/products?category=women", target: "_self", isVisible: true, isHighlighted: false, children: [
            { id: crypto.randomUUID(), type: "link", label: "Dresses", url: "/products?category=women&subcategory=dresses", link: "/products?category=women&subcategory=dresses", target: "_self", isVisible: true, isHighlighted: false },
            { id: crypto.randomUUID(), type: "link", label: "Sarees", url: "/products?category=women&subcategory=sarees", link: "/products?category=women&subcategory=sarees", target: "_self", isVisible: true, isHighlighted: false },
            { id: crypto.randomUUID(), type: "link", label: "Suits", url: "/products?category=women&subcategory=suits", link: "/products?category=women&subcategory=suits", target: "_self", isVisible: true, isHighlighted: false },
          ]},
          { id: crypto.randomUUID(), type: "dropdown", label: "Accessories", url: "/products?category=accessories", link: "/products?category=accessories", target: "_self", isVisible: true, isHighlighted: false, children: [
            { id: crypto.randomUUID(), type: "link", label: "Bags", url: "/products?category=accessories&subcategory=bags", link: "/products?category=accessories&subcategory=bags", target: "_self", isVisible: true, isHighlighted: false },
            { id: crypto.randomUUID(), type: "link", label: "Watches", url: "/products?category=accessories&subcategory=watches", link: "/products?category=accessories&subcategory=watches", target: "_self", isVisible: true, isHighlighted: false },
            { id: crypto.randomUUID(), type: "link", label: "Jewellery", url: "/products?category=accessories&subcategory=jewellery", link: "/products?category=accessories&subcategory=jewellery", target: "_self", isVisible: true, isHighlighted: false },
          ]},
          { id: crypto.randomUUID(), type: "link", label: "Collections", url: "/products", link: "/products", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "Lookbook", url: "/lookbooks", link: "/lookbooks", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "Our Story", url: "/our-story", link: "/our-story", target: "_self", isVisible: true, isHighlighted: false },
        ],
        isActive: true,
      },
      {
        name: "Footer - Shop",
        location: "footer",
        items: [
          { id: crypto.randomUUID(), type: "link", label: "Men", url: "/products?category=men", link: "/products?category=men", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "Women", url: "/products?category=women", link: "/products?category=women", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "Accessories", url: "/products?category=accessories", link: "/products?category=accessories", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "Collections", url: "/products", link: "/products", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "New Arrivals", url: "/products?sort=newest", link: "/products?sort=newest", target: "_self", isVisible: true, isHighlighted: false },
        ],
        isActive: true,
      },
      {
        name: "Footer - Support",
        location: "footer",
        items: [
          { id: crypto.randomUUID(), type: "link", label: "Contact Us", url: "/contact", link: "/contact", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "Size Guide", url: "/size-guide", link: "/size-guide", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "Shipping & Returns", url: "/shipping-returns", link: "/shipping-returns", target: "_self", isVisible: true, isHighlighted: false },
          { id: crypto.randomUUID(), type: "link", label: "FAQ", url: "/faq", link: "/faq", target: "_self", isVisible: true, isHighlighted: false },
        ],
        isActive: true,
      },
    ],
  });

  // ─── Footer Sections ───
  await prisma.footerSection.createMany({
    data: [
      { column: 1, title: "নবME", contentType: "text", content: { text: "Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design." }, sortOrder: 1 },
      {
        column: 2,
        title: "Shop",
        contentType: "links",
        content: {
          links: [
            { id: crypto.randomUUID(), label: "Men", url: "/products?category=men" },
            { id: crypto.randomUUID(), label: "Women", url: "/products?category=women" },
            { id: crypto.randomUUID(), label: "Accessories", url: "/products?category=accessories" },
            { id: crypto.randomUUID(), label: "Collections", url: "/products" },
            { id: crypto.randomUUID(), label: "New Arrivals", url: "/products?sort=newest" },
          ],
        },
        sortOrder: 2,
      },
      {
        column: 3,
        title: "Support",
        contentType: "links",
        content: {
          links: [
            { id: crypto.randomUUID(), label: "Contact Us", url: "/contact" },
            { id: crypto.randomUUID(), label: "Size Guide", url: "/size-guide" },
            { id: crypto.randomUUID(), label: "Shipping & Returns", url: "/shipping-returns" },
            { id: crypto.randomUUID(), label: "FAQ", url: "/faq" },
          ],
        },
        sortOrder: 3,
      },
      { column: 4, title: "Connect", contentType: "social", content: { description: "Follow us on social media for the latest updates." }, sortOrder: 4 },
    ],
  });

  // ─── Static Pages ───
  await prisma.staticPage.createMany({
    data: [
      {
        title: "Our Story",
        slug: "our-story",
        content: `<h2 class="font-display text-heading-3 text-neutral-900 mt-8">The নবME Story</h2>
<p>Founded in 2020, নবME was created with a singular vision: to bring the finest of Indian craftsmanship to the global stage. Every piece in our collection is a testament to the skill of our artisans and the richness of our heritage.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Our Craft</h2>
<p>From the handloom weavers of Varanasi to the embroiderers of Lucknow, we work directly with artisan communities across India, ensuring fair wages and preserving centuries-old techniques.</p>`,
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: "Our Story — নবME",
        metaDesc: "Discover the story behind নবME — a premium fashion brand celebrating Indian craftsmanship.",
      },
      {
        title: "Privacy Policy",
        slug: "privacy",
        content: `<p>Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our products.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Information We Collect</h2>
<p>We may collect information about you in a variety of ways, including:</p>
<ul class="list-disc pl-6 space-y-2">
<li><strong>Personal Data:</strong> Name, email address, shipping address, billing address, and payment information.</li>
<li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
<li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, and referral sources.</li>
</ul>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul class="list-disc pl-6 space-y-2">
<li>Process and fulfill your orders, including shipping and returns</li>
<li>Send order confirmations, shipping updates, and customer service communications</li>
<li>Improve our website, products, and customer experience</li>
<li>Send marketing communications (with your consent)</li>
<li>Detect and prevent fraud or unauthorized access</li>
</ul>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Information Sharing</h2>
<p>We do not sell your personal information. We may share your data with trusted third parties who assist in operating our website, conducting our business, or servicing your orders, including payment processors, shipping carriers, and analytics providers.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Data Security</h2>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Cookies</h2>
<p>We use cookies and similar tracking technologies to enhance your browsing experience. You can control cookie settings through your browser preferences.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Your Rights</h2>
<p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at privacy@nabome.com.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at privacy@nabome.com.</p>`,
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: "Privacy Policy — নবME",
        metaDesc: "Privacy policy for নবME online fashion store. Learn how we collect, use, and protect your personal information.",
      },
      {
        title: "Terms of Service",
        slug: "terms",
        content: `<p>By accessing or using the নবME website and services, you agree to be bound by these Terms of Service. Please read them carefully before making a purchase.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Products & Orders</h2>
<p>We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products and pricing are subject to change at any time without notice. We reserve the right to discontinue any product at any time.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Pricing & Payment</h2>
<p>All prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We accept major credit/debit cards, UPI, net banking, and Cash on Delivery (COD). Payment must be received in full before order processing.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Shipping</h2>
<p>We aim to process and ship orders within 1-2 business days. Standard shipping takes 3-5 business days. Express shipping is available at checkout for faster delivery. Free shipping is available on orders above ₹999.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Returns & Refunds</h2>
<p>We offer a 14-day return policy on most items. Items must be in their original condition with tags attached. To initiate a return, please contact our customer support team. Refunds are processed within 5-7 business days of receiving the returned item.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Intellectual Property</h2>
<p>All content on this website, including text, graphics, logos, images, and software, is the property of নবME and is protected by Indian and international copyright laws.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Limitation of Liability</h2>
<p>নবME shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or services.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Governing Law</h2>
<p>These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Contact Us</h2>
<p>If you have questions about these Terms, please contact us at support@nabome.com.</p>`,
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: "Terms of Service — নবME",
        metaDesc: "Terms and conditions for using the নবME website and purchasing our products.",
      },
      {
        title: "Shipping & Returns",
        slug: "shipping-returns",
        content: `<p>We want you to love your নবME purchase. If you're not completely satisfied, we're here to help with easy returns and exchanges.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Shipping Policy</h2>
<h3 class="font-display text-heading-4 text-neutral-900 mt-6">Standard Shipping</h3>
<p>Free shipping on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹99 applies. Standard delivery takes 3-5 business days across India.</p>
<h3 class="font-display text-heading-4 text-neutral-900 mt-6">Express Shipping</h3>
<p>Need it faster? Select express shipping at checkout for delivery within 1-2 business days. Express shipping fee is ₹199.</p>
<h3 class="font-display text-heading-4 text-neutral-900 mt-6">Order Processing</h3>
<p>Orders are processed within 1-2 business days. You'll receive a confirmation email with tracking information once your order ships.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Returns & Exchanges</h2>
<h3 class="font-display text-heading-4 text-neutral-900 mt-6">Return Policy</h3>
<p>We accept returns within 14 days of delivery. To be eligible for a return:</p>
<ul class="list-disc pl-6 space-y-2">
<li>Item must be unworn, unwashed, and in original condition</li>
<li>All original tags must be attached</li>
<li>Item must be in its original packaging</li>
<li>Proof of purchase is required</li>
</ul>
<h3 class="font-display text-heading-4 text-neutral-900 mt-6">How to Initiate a Return</h3>
<ol class="list-decimal pl-6 space-y-2">
<li>Contact our customer support at returns@nabome.com or call +91 1800 123 4567</li>
<li>Provide your order number and reason for return</li>
<li>Receive a return authorization and shipping label</li>
<li>Pack the item securely and ship using the provided label</li>
</ol>
<h3 class="font-display text-heading-4 text-neutral-900 mt-6">Exchanges</h3>
<p>Free exchanges on your first size change. Simply contact us within 14 days of delivery and we'll arrange a replacement at no extra cost.</p>
<h3 class="font-display text-heading-4 text-neutral-900 mt-6">Refunds</h3>
<p>Refunds are processed within 5-7 business days of receiving the returned item. The refund will be credited to your original payment method. COD orders will be refunded via bank transfer.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">International Shipping</h2>
<p>We currently ship within India. International shipping is coming soon. Join our newsletter to be notified when we expand.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Need Help?</h2>
<p>Contact our customer support team at support@nabome.com or call +91 1800 123 4567 (Mon-Sat, 10am-7pm IST).</p>`,
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: "Shipping & Returns — নবME",
        metaDesc: "Shipping policy and return procedures for নবME orders. Free shipping on orders above ₹999.",
      },
      {
        title: "Contact Us",
        slug: "contact",
        content: `<p>Need help with an order, return, product question, or collaboration? Our support team is here to help.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Customer Support</h2>
<p>Email us at support@nabome.com with your order number and a short description of the issue. We usually respond within 1 business day.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Returns</h2>
<p>For return requests, sign in to your account, open the order detail page, and choose "Request Return" so the request stays connected to your order record.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Business Enquiries</h2>
<p>For partnerships, press, or wholesale enquiries, email hello@nabome.com.</p>`,
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: "Contact Us — নবME",
        metaDesc: "Contact नवME customer support for orders, returns, product questions, and business enquiries.",
      },
      {
        title: "Size Guide",
        slug: "size-guide",
        content: `<p>Use this guide as a starting point, then check product-specific fit notes before ordering.</p>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">How to Measure</h2>
<ul class="list-disc pl-6 space-y-2">
<li><strong>Chest/Bust:</strong> Measure around the fullest part while keeping the tape level.</li>
<li><strong>Waist:</strong> Measure around the narrowest point of your waist.</li>
<li><strong>Hip:</strong> Measure around the fullest part of your hips.</li>
<li><strong>Inseam:</strong> Measure from the crotch seam to the bottom hem.</li>
</ul>
<h2 class="font-display text-heading-3 text-neutral-900 mt-8">Fit Support</h2>
<p>If you are between sizes, choose the larger size for relaxed fits and the smaller size for tailored fits. Contact support@nabome.com with product details for personalized help.</p>`,
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: "Size Guide — নবME",
        metaDesc: "Find measurement guidance and fit support for নবME apparel.",
      },
    ],
  });

  // ─── FAQ Items ───
  await prisma.fAQ.createMany({
    data: [
      { question: "What payment methods do you accept?", answer: "We accept all major credit/debit cards, UPI, net banking, and Cash on Delivery (COD). All transactions are securely processed through our payment partners.", category: "Payments", sortOrder: 1, isActive: true },
      { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days across India. Express shipping delivers within 1-2 business days. You'll receive tracking information once your order ships.", category: "Shipping", sortOrder: 1, isActive: true },
      { question: "Do you offer free shipping?", answer: "Yes! Free standard shipping is available on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹99 applies.", category: "Shipping", sortOrder: 2, isActive: true },
      { question: "How can I track my order?", answer: "Once your order ships, you'll receive a confirmation email and SMS with a tracking link. You can also track your order from your account dashboard under 'My Orders'.", category: "Shipping", sortOrder: 3, isActive: true },
      { question: "What is your return policy?", answer: "We offer a 14-day return policy. Items must be unworn, unwashed, and in original condition with all tags attached. Free exchanges are available for your first size change.", category: "Returns", sortOrder: 1, isActive: true },
      { question: "How do I initiate a return?", answer: "Contact our customer support at returns@nabome.com or call +91 1800 123 4567 with your order number. We'll provide a return authorization and prepaid shipping label.", category: "Returns", sortOrder: 2, isActive: true },
      { question: "When will I receive my refund?", answer: "Refunds are processed within 5-7 business days of receiving the returned item. The refund will be credited to your original payment method. COD orders are refunded via bank transfer.", category: "Returns", sortOrder: 3, isActive: true },
      { question: "Are your products authentic?", answer: "Absolutely! All নবME products are 100% authentic, designed in-house and manufactured with premium materials. We work directly with skilled artisans across India.", category: "Products", sortOrder: 1, isActive: true },
      { question: "How do I find my size?", answer: "Each product page includes a detailed size guide. If you're unsure, our customer support team can help you find the perfect fit. We also offer free size exchanges.", category: "Products", sortOrder: 2, isActive: true },
      { question: "How do I care for my নবME garments?", answer: "We recommend hand washing or gentle machine wash in cold water with mild detergent. Avoid bleach and tumble drying. Iron on low heat. Specific care instructions are included with each product.", category: "Products", sortOrder: 3, isActive: true },
    ],
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
      coverImageUrl: "https://placehold.co/800x600/1B2A4A/C9A84C?text=Summer+Solstice",
      season: "Summer", year: 2024, layout: "editorial",
      story: { narrative: "Inspired by the golden hour, this collection captures the essence of sun-drenched days and balmy evenings. Each piece is designed to move with you, from morning coffees to sunset soirees." },
      tags: ["summer", "linen", "editorial"], isActive: true, sortOrder: 1,
    },
  });
  await prisma.lookbookItem.createMany({
    data: [
      { lookbookId: summerLookbook.id, imageUrl: "https://placehold.co/600x800/F8F7F4/1A1A1A?text=Linen+Golden+Hour", caption: "Linen in the golden hour", sortOrder: 1 },
      { lookbookId: summerLookbook.id, imageUrl: "https://placehold.co/600x800/F8F7F4/1A1A1A?text=Effortless+Silhouettes", caption: "Effortless silhouettes", sortOrder: 2 },
      { lookbookId: summerLookbook.id, imageUrl: "https://placehold.co/600x800/F8F7F4/1A1A1A?text=Sunset+Hues", caption: "Sunset hues", sortOrder: 3 },
    ],
  });

  const heritageLookbook = await prisma.lookbook.create({
    data: {
      name: "Heritage Revival",
      slug: "heritage-revival",
      description: "A tribute to the master artisans who keep India's textile traditions alive.",
      coverImageUrl: "https://placehold.co/800x600/C9A84C/1B2A4A?text=Heritage+Revival",
      season: "Festive", year: 2024, layout: "masonry",
      story: { narrative: "Each piece in this lookbook tells a story of generations of craftsmanship. From the handloom weavers of Varanasi to the embroiderers of Lucknow, we celebrate the hands that create magic." },
      tags: ["heritage", "craftsmanship", "festive"], isActive: true, sortOrder: 2,
    },
  });
  await prisma.lookbookItem.createMany({
    data: [
      { lookbookId: heritageLookbook.id, imageUrl: "https://placehold.co/600x800/F8F7F4/1A1A1A?text=Banarasi+Elegance", caption: "Banarasi elegance", sortOrder: 1 },
      { lookbookId: heritageLookbook.id, imageUrl: "https://placehold.co/600x800/F8F7F4/1A1A1A?text=Zari+Detailing", caption: "Zari detailing", sortOrder: 2 },
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
      { url: "https://placehold.co/200x200/1B2A4A/C9A84C?text=Logo", type: "image", folder: "logo", tags: ["logo", "brand"] },
      { url: "https://placehold.co/1920x800/1B2A4A/C9A84C?text=Hero+Main", type: "image", folder: "hero", tags: ["hero", "homepage"] },
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
  console.log("   FAQ Items:", await prisma.fAQ.count());
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
