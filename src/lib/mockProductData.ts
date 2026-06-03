import type { AdvancedProduct, ProductVariant, ProductImage, ProductReview, RatingDistribution, CompareProduct, SearchSuggestion, InventoryAlert, InventoryHistoryEntry } from "../types/product";

const colorMap: Record<string, string> = {
  Black: "#0a0a0a",
  White: "#f5f5f5",
  Charcoal: "#36454f",
  Olive: "#556b2f",
  Navy: "#000080",
  Red: "#dc143c",
  Blue: "#1e90ff",
  Green: "#228b22",
  Yellow: "#ffd700",
  Pink: "#ff69b4",
  Purple: "#8b008b",
  Brown: "#8b4513",
  Grey: "#808080",
  Maroon: "#800000",
  Gold: "#d4af37",
  Silver: "#c0c0c0",
  Cream: "#fffdd0",
  Sand: "#c2b280",
  Stone: "#bebebe",
  Natural: "#d4c9b0",
};

const gallery = {
  black: "/images/products/product1.jpeg",
  white: "/images/products/product2.jpeg",
  hoodie: "/images/products/product3.jpeg",
  community: "/images/community/community.jpeg",
};

const productImages = [gallery.black, gallery.white, gallery.hoodie, gallery.community];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function uid() { return `prod_${Date.now()}_${rand(100, 999)}`; }

function slugify(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

const categories = [
  "Men's Fashion", "Women's Fashion", "Kids Fashion", "Footwear",
  "Accessories", "Jewelry", "Ethnic Wear", "Western Wear",
  "Sportswear", "Winter Wear",
];

const subcategoryMap: Record<string, string[]> = {
  "Men's Fashion": ["T-Shirts", "Shirts", "Hoodies", "Jackets", "Pants", "Jeans", "Blazers", "Suits", "Shorts", "Ethnic"],
  "Women's Fashion": ["Dresses", "Tops", "Kurtis", "Jeans", "Shrugs", "Skirts", "Trousers", "Co-ords"],
  "Kids Fashion": ["T-Shirts", "Shorts", "Dresses", "Rompers", "Jeans", "Shirts", "Ethnic", "Winter"],
  Footwear: ["Sports Shoes", "Casual Shoes", "Formal Shoes", "Sandals", "Slippers", "Boots", "Traditional"],
  Accessories: ["Caps", "Belts", "Watches", "Sunglasses", "Wallets", "Bags", "Scarves", "Socks", "Tote Bags"],
  Jewelry: ["Necklaces", "Earrings", "Bracelets", "Rings", "Anklets", "Chains", "Pendants"],
  "Ethnic Wear": ["Sarees", "Kurtis", "Lehengas", "Sherwanis", "Dhotis", "Salwar Suits", "Kurta Pajama"],
  "Western Wear": ["Dresses", "Tops", "Jeans", "Skirts", "Trousers", "Blazers", "Jumpsuits"],
  Sportswear: ["Active Tees", "Track Pants", "Shorts", "Sports Shoes", "Tracksuits", "Hoodies"],
  "Winter Wear": ["Jackets", "Sweaters", "Hoodies", "Beanies", "Gloves", "Scarves", "Puffer Jackets"],
};

const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
const allColors = ["Black", "White", "Charcoal", "Olive", "Navy", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Brown", "Grey", "Maroon", "Gold", "Silver", "Cream", "Sand", "Stone", "Natural"];
const genders = ["Male", "Female", "Unisex"] as const;
const seasons = ["Summer", "Winter", "Spring", "Autumn", "All Season"] as const;
const collections = ["Signature", "Heritage", "Urban", "Limited", "Essential", "Festive"] as const;
const materials = ["Cotton", "Polyester", "Linen", "Wool", "Silk", "Viscose", "Rayon", "Denim", "Fleece", "Jersey", "Canvas", "Twill", "Oxford", "Satin", "Chiffon", "Georgette", "Crepe", "Knitted", "Terry Cotton", "French Terry", "Brushed Fleece", "Pique", "Oxford Cotton", "Combed Cotton", "Organic Cotton"];

const productNames: Record<string, string[]> = {
  "Men's Fashion": [
    "Signature Oversized Tee", "Bengal Typography Tee", "Urban Essentials Hoodie",
    "Creator Club Tee", "Minimal Logo Sweatshirt", "Essential Joggers",
    "Premium Cargo Pants", "Heritage Bomber Jacket", "Streetwear Drop Tee",
    "Graphic Print Hoodie", "Varsity Jacket", "Classic Fit Chinos",
    "Athletic Mesh Shorts", "Linen Relaxed Shirt", "Denim Trucker Jacket",
  ],
  "Women's Fashion": [
    "Floral Maxi Dress", "Crop Top Set", "Kurti Palazzo Set",
    "Wrap Midi Dress", "Off-Shoulder Top", "High-Waist Trousers",
    "Bohemian Skirt", "Co-ord Set", "Denim Shacket",
    "Tiered Ruffle Dress", "Satin Slip Dress", "Blazer Dress",
  ],
  "Kids Fashion": [
    "Printed T-Shirt Set", "Cargo Joggers", "Dinosaur Hoodie",
    "Cotton Romper", "Denim Dungaree", "Graphic Tee",
  ],
  Footwear: [
    "Premium Sneakers", "Classic Loafers", "Combat Boots",
    "Slip-Ons", "Running Shoes", "Casual Slides",
    "Formal Derbys", "Chunky Sneakers", "Espadrilles",
  ],
  Accessories: [
    "Premium Dad Cap", "Tote Bag", "Crossbody Sling",
    "Leather Belt", "Silk Scarf", "Aviator Sunglasses",
    "Bucket Hat", "Canvas Backpack", "Minimalist Wallet",
  ],
  Jewelry: [
    "Gold Chain Necklace", "Pearl Drop Earrings", "Layered Bracelet Set",
    "Statement Ring", "Anklet", "Pendant Necklace",
  ],
  "Ethnic Wear": [
    "Banarasi Saree", "Designer Lehenga", "Cotton Kurta Set",
    "Sherwani", "Kurta Pajama Set", "Salwar Kameez",
  ],
  "Western Wear": [
    "Little Black Dress", "Tailored Blazer", "Cigarette Trousers",
    "Silk Blouse", "Pencil Skirt", "Jumpsuit",
  ],
  Sportswear: [
    "Performance Tee", "Compression Tights", "Track Jacket",
    "Training Shorts", "Sports Bra", "Windbreaker",
  ],
  "Winter Wear": [
    "Puffer Jacket", "Wool Sweater", "Fleece Hoodie",
    "Cashmere Scarf", "Leather Gloves", "Beanie Hat",
  ],
};

const vendorShops = [
  "নবME Originals", "Bengal Streetwear", "Kolkata Collective",
  "Urban Ethnik", "Heritage Threads", "Modern Bengal",
  "Street Culture India", "Ethnic Fusion", "Premium Basics",
  "Artisan Guild",
];

const vendorNames = [
  "Rahul Sharma", "Ananya Das", "Arjun Roy",
  "Priya Banerjee", "Sayan Mukherjee", "Riya Sen",
  "Tanmoy Ghosh", "Sneha Dasgupta", "Vikram Singh",
];

const reviewerNames = [
  "Amit Kumar", "Sneha Roy", "Ravi Malhotra",
  "Pooja Singh", "Karan Mehta", "Ishita Ghosh",
  "Vikram Patel", "Maya Sen", "Rohan Das",
  "Nisha Agarwal", "Arjun Kapoor", "Tanvi Shah",
  "Kunal Gupta", "Shreya Banerjee", "Aditya Nair",
];

const reviewTexts = [
  "Absolutely love this piece! The fabric quality is outstanding and the fit is perfect.",
  "Great value for money. The material feels premium and the stitching is solid.",
  "This exceeded my expectations. The color is exactly as shown and the sizing is accurate.",
  "Comfortable and stylish. Have been wearing it regularly and it holds up well after washes.",
  "Perfect for daily wear. The breathable fabric makes it ideal for Kolkata weather.",
  "The design is unique and gets compliments everywhere I go. Highly recommend!",
  "Good quality but the sizing runs a bit large. I would suggest sizing down.",
  "Excellent craftsmanship. You can feel the attention to detail in every seam.",
  "Beautiful product! The packaging was premium too. Makes for a great gift.",
  "Really happy with my purchase. The customer service was also very helpful.",
  "The fabric is soft and comfortable. Perfect for casual outings.",
  "I've bought multiple pieces from this brand now. Consistent quality every time.",
  "Looks even better in person. The embroidery work is intricate and beautiful.",
  "Worth every penny. The premium feel justifies the price point.",
  "Decent quality for the price. Would buy again in other colors.",
];

const reviewTitles = [
  "Absolutely stunning!", "Worth every rupee", "Premium quality",
  "Perfect fit!", "Love the design", "Great purchase",
  "Exceeded expectations", "New favorite piece", "Highly recommended",
  "Quality speaks for itself", "Daily essential", "Beautiful craftsmanship",
  "Best purchase this month", "Comfort meets style", "Fits like a dream",
];

function generateVariantImages(variantColor: string, count: number): { id: string; url: string; color: string; isPrimary: boolean }[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `vi_${uid()}`,
    url: productImages[i % productImages.length],
    color: variantColor,
    isPrimary: i === 0,
  }));
}

function generateVariants(sizes: string[], colors: string[], basePrice: number): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const sizeIdx = sizes.indexOf(pick(sizes));
  const colorIdx = colors.indexOf(pick(colors));

  sizes.forEach((size, si) => {
    colors.forEach((color, ci) => {
      const isDefault = si === sizeIdx && ci === colorIdx;
      const stock = isDefault ? rand(30, 80) : rand(0, 40);
      variants.push({
        id: `pv_${uid()}`,
        sku: `NB-${size}-${color.slice(0, 3).toUpperCase()}-${rand(1000, 9999)}`,
        size: size as ProductVariant["size"],
        color,
        colorSwatch: colorMap[color] || "#ccc",
        price: basePrice + rand(-200, 300),
        originalPrice: basePrice + rand(200, 600),
        stock,
        reservedStock: rand(0, Math.floor(stock * 0.3)),
        images: generateVariantImages(color, 2),
        isActive: true,
      });
    });
  });
  return variants;
}

export function generateAdvancedProduct(vendorId?: string): AdvancedProduct {
  const cat = pick(categories);
  const subcat = pick(subcategoryMap[cat] || ["General"]);
  const nameBase = pick(productNames[cat] || ["Premium Product"]);
  const shop = pick(vendorShops);
  const vendor = pick(vendorNames);
  const sizes = pickN([...allSizes], rand(3, 6));
  const colors = pickN(allColors, rand(2, 5));
  const basePrice = rand(499, 3999);
  const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
  const reviewCount = rand(10, 200);
  const isNew = Math.random() > 0.6;
  const isTrending = Math.random() > 0.75;
  const isBestSeller = Math.random() > 0.8;
  const isFeatured = Math.random() > 0.85;
  const isLimited = Math.random() > 0.85;

  const id = uid();
  const name = `${shop.split(" ")[0]} ${nameBase}`;
  const imageCount = rand(3, 5);

  const genImages: ProductImage[] = Array.from({ length: imageCount }, (_, i) => ({
    id: `pi_${uid()}`,
    url: productImages[i % productImages.length],
    alt: `${name} - View ${i + 1}`,
    isPrimary: i === 0,
    width: 1200,
    height: 1600,
  }));

  const variants = generateVariants(sizes, colors, basePrice);
  const defaultVariant = variants.find((v) => v.stock > 0) || variants[0];

  const ratingDist: RatingDistribution[] = [5, 4, 3, 2, 1].map((stars) => {
    const count = Math.round(reviewCount * (stars === 5 ? 0.5 : stars === 4 ? 0.25 : stars === 3 ? 0.12 : stars === 2 ? 0.08 : 0.05));
    return { stars, count, percentage: Math.round((count / reviewCount) * 100) };
  });

  const now = new Date();
  const created = new Date(now.getTime() - rand(1, 90) * 86400000);

  return {
    id,
    vendorId: vendorId || `v_${rand(100, 999)}`,
    vendorName: vendor,
    vendorShop: shop,
    name,
    slug: `${slugify(name)}-${id.slice(-6)}`,
    shortDescription: `Premium ${subcat.toLowerCase()} crafted from premium materials. Designed for the modern ${pick(["urban", "conscious", "stylish", "trendsetting"])} individual.`,
    fullDescription: `Experience the perfect blend of tradition and contemporary style with this ${subcat.toLowerCase()} from ${shop}. Crafted from ${pick(materials)} with meticulous attention to detail, this piece embodies the spirit of modern Bengal streetwear.\n\nEach piece is thoughtfully designed to transition seamlessly from casual daywear to elevated evening looks. The fabric is pre-washed for optimal comfort, ensuring a broken-in feel from the first wear.\n\n• Premium ${pick(materials)} construction\n• Reinforced stitching at stress points\n• Pre-shrunk fabric\n• Eco-conscious packaging`,
    category: cat,
    subcategory: subcat,
    brand: pick(["নবME", "Bengal Heritage", "Urban Street", "Ethnic Luxe", "Modern Classic"]),
    sku: `NB-${cat.slice(0, 2).toUpperCase()}-${rand(10000, 99999)}`,
    material: pick(materials),
    weight: Math.round((200 + Math.random() * 400) * 10) / 10,
    tags: [subcat.toLowerCase(), cat.toLowerCase().split(" ")[0].toLowerCase(), pick(["premium", "casual", "festival", "streetwear", "heritage", "modern", "bengali", "ethnic", "trending", "limited"]), pick(["cotton", "linen", "comfort", "style", "designer"])],
    gender: pick([...genders]),
    season: pick([...seasons]),
    collection: pick([...collections]),
    status: "published",
    createdAt: created.toISOString(),
    updatedAt: new Date(created.getTime() + rand(1, 30) * 86400000).toISOString(),
    images: genImages,
    variants,
    defaultPrice: defaultVariant?.price || basePrice,
    defaultOriginalPrice: defaultVariant?.originalPrice || basePrice + rand(200, 600),
    defaultStock: variants.reduce((sum, v) => sum + v.stock, 0),
    rating,
    reviewCount,
    ratingDistribution: ratingDist,
    isNew,
    isTrending,
    isBestSeller,
    isFeatured,
    isLimited,
    lowStockThreshold: rand(5, 15),
    soldCount: rand(50, 500),
    shippingInfo: "Free shipping on orders above ₹999. Standard delivery 3-5 business days across India. Express shipping available at ₹99.",
    returnPolicy: "Easy returns within 7 days of delivery. Items must be unworn with tags intact. Full refund or exchange available.",
    careInstructions: "Cold wash inside out with similar colors. Do not bleach. Tumble dry low or hang dry in shade. Iron on medium temperature. Do not dry clean.",
    seoTitle: `${name} | নবME - Premium ${subcat}`,
    seoDescription: `Shop ${name} at নবME. Premium ${subcat.toLowerCase()} crafted from ${pick(materials)}. ✓ Free Shipping ✓ Easy Returns ✓ Premium Quality.`,
    seoKeywords: [name, subcat, cat, "নবME", "premium", "streetwear", "bengal", "fashion"],
  };
}

export function generateAdvancedProducts(count = 24, vendorId?: string): AdvancedProduct[] {
  return Array.from({ length: count }, () => generateAdvancedProduct(vendorId));
}

export function generateMockReviews(productId: string, count = rand(5, 12)): ProductReview[] {
  return Array.from({ length: count }, () => {
    const rating = Math.min(5, Math.max(1, Math.round(2.5 + Math.random() * 2.5)));
    const hasReply = Math.random() > 0.5;
    const createdAt = new Date(Date.now() - rand(1, 60) * 86400000).toISOString();
    return {
      id: `rev_${uid()}`,
      productId,
      customerId: `cust_${rand(100, 999)}`,
      customerName: pick(reviewerNames),
      customerAvatar: "",
      rating,
      title: pick(reviewTitles),
      comment: pick(reviewTexts),
      images: Math.random() > 0.7 ? [{ id: `ri_${uid()}`, url: pick(productImages) }] : [],
      createdAt,
      updatedAt: createdAt,
      status: Math.random() > 0.9 ? "reported" : Math.random() > 0.85 ? "hidden" : "visible",
      reactions: {
        likes: rand(0, 20),
        dislikes: rand(0, 5),
        currentUserLiked: false,
        currentUserDisliked: false,
      },
      vendorReply: hasReply ? pick(["Thank you for your wonderful review! We're glad you loved it.", "Appreciate your feedback! We'll strive to do better.", "Thanks for sharing your experience. Happy styling!"]) : null,
      vendorRepliedAt: hasReply ? new Date(Date.now() - rand(1, 10) * 86400000).toISOString() : null,
    };
  });
}

export function getAdvancedProductById(id: string): AdvancedProduct | undefined {
  return generateAdvancedProducts(48).find((p) => p.id === id);
}

export function searchAdvancedProducts(query: string): AdvancedProduct[] {
  const products = generateAdvancedProducts(48);
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.brand.toLowerCase().includes(q) ||
      p.vendorShop.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q)
  );
}

export function getSearchSuggestions(query: string): SearchSuggestion[] {
  const products = generateAdvancedProducts(20);
  const q = query.toLowerCase();
  const suggestions: SearchSuggestion[] = [];

  const matched = products.filter((p) => p.name.toLowerCase().includes(q));
  matched.slice(0, 5).forEach((p) => {
    suggestions.push({ type: "product", label: p.name, value: p.id, image: p.images[0]?.url });
  });

  const cats = [...new Set(products.filter((p) => p.category.toLowerCase().includes(q)).map((p) => p.category))];
  cats.slice(0, 3).forEach((c) => {
    suggestions.push({ type: "category", label: `Category: ${c}`, value: c });
  });

  const vendors = [...new Set(products.filter((p) => p.vendorShop.toLowerCase().includes(q)).map((p) => p.vendorShop))];
  vendors.slice(0, 3).forEach((v) => {
    suggestions.push({ type: "vendor", label: `Shop: ${v}`, value: v });
  });

  return suggestions;
}

export function getTrendingSearches(): string[] {
  return ["Oversized Tee", "Hoodie", "Saree", "Sneakers", "Kurta", "Tote Bag", "Joggers", "Lehenga"];
}

export function getRecentlyViewed(): AdvancedProduct[] {
  try {
    const stored = JSON.parse(localStorage.getItem("nabome-rv") || "[]") as string[];
    const all = generateAdvancedProducts(48);
    return stored.map((id) => all.find((p) => p.id === id)).filter(Boolean) as AdvancedProduct[];
  } catch {
    return [];
  }
}

export function addToRecentlyViewed(productId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem("nabome-rv") || "[]") as string[];
    const updated = [productId, ...stored.filter((id) => id !== productId)].slice(0, 12);
    localStorage.setItem("nabome-rv", JSON.stringify(updated));
  } catch { /* ignore */ }
}

export function clearRecentlyViewed() {
  localStorage.removeItem("nabome-rv");
}

export function removeFromRecentlyViewed(productId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem("nabome-rv") || "[]") as string[];
    localStorage.setItem("nabome-rv", JSON.stringify(stored.filter((id) => id !== productId)));
  } catch { /* ignore */ }
}

const compareStoreKey = "nabome-compare";

export function getCompareList(): CompareProduct[] {
  try {
    return JSON.parse(localStorage.getItem(compareStoreKey) || "[]");
  } catch { return []; }
}

export function addToCompare(product: AdvancedProduct): boolean {
  const list = getCompareList();
  if (list.length >= 4) return false;
  if (list.some((p) => p.id === product.id)) return false;
  const cp: CompareProduct = {
    id: product.id,
    name: product.name,
    image: product.images[0]?.url || "",
    price: product.defaultPrice,
    originalPrice: product.defaultOriginalPrice,
    rating: product.rating,
    reviewCount: product.reviewCount,
    brand: product.brand,
    material: product.material,
    sizes: product.variants.filter((v, i, a) => a.findIndex((x) => x.size === v.size) === i).map((v) => v.size),
    colors: product.variants.filter((v, i, a) => a.findIndex((x) => x.color === v.color) === i).map((v) => v.color),
    vendor: product.vendorShop,
    category: product.category,
    availability: product.defaultStock > 0,
  };
  localStorage.setItem(compareStoreKey, JSON.stringify([...list, cp]));
  return true;
}

export function removeFromCompare(productId: string) {
  const list = getCompareList();
  localStorage.setItem(compareStoreKey, JSON.stringify(list.filter((p) => p.id !== productId)));
}

export function clearCompare() {
  localStorage.removeItem(compareStoreKey);
}

export function filterProducts(products: AdvancedProduct[], filters: Partial<{
  category: string[];
  subcategory: string[];
  priceRange: [number, number];
  brands: string[];
  rating: number | null;
  sizes: string[];
  colors: string[];
  gender: string[];
  availability: string;
  discount: number | null;
  search: string;
  sort: string;
}>): AdvancedProduct[] {
  let result = [...products];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.category?.length) {
    result = result.filter((p) => filters.category!.includes(p.category));
  }

  if (filters.subcategory?.length) {
    result = result.filter((p) => filters.subcategory!.includes(p.subcategory));
  }

  if (filters.priceRange) {
    result = result.filter((p) => p.defaultPrice >= filters.priceRange![0] && p.defaultPrice <= filters.priceRange![1]);
  }

  if (filters.brands?.length) {
    result = result.filter((p) => filters.brands!.includes(p.brand));
  }

  if (filters.rating) {
    result = result.filter((p) => p.rating >= filters.rating!);
  }

  if (filters.sizes?.length) {
    result = result.filter((p) => p.variants.some((v) => filters.sizes!.includes(v.size)));
  }

  if (filters.colors?.length) {
    result = result.filter((p) => p.variants.some((v) => filters.colors!.includes(v.color)));
  }

  if (filters.gender?.length) {
    result = result.filter((p) => filters.gender!.includes(p.gender));
  }

  if (filters.availability === "in_stock") {
    result = result.filter((p) => p.defaultStock > 0);
  } else if (filters.availability === "out_of_stock") {
    result = result.filter((p) => p.defaultStock === 0);
  }

  if (filters.discount) {
    result = result.filter((p) => {
      const disc = Math.round(((p.defaultOriginalPrice - p.defaultPrice) / p.defaultOriginalPrice) * 100);
      return disc >= filters.discount!;
    });
  }

  if (filters.sort) {
    switch (filters.sort) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "price_low_high": result.sort((a, b) => a.defaultPrice - b.defaultPrice); break;
      case "price_high_low": result.sort((a, b) => b.defaultPrice - a.defaultPrice); break;
      case "popular": result.sort((a, b) => b.soldCount - a.soldCount); break;
      case "best_selling": result.sort((a, b) => b.soldCount - a.soldCount); break;
      case "highest_rated": result.sort((a, b) => b.rating - a.rating); break;
      case "most_reviewed": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }
  }

  return result;
}

export function generateInventoryAlerts(products: AdvancedProduct[]): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];
  products.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.stock === 0) {
        alerts.push({
          id: `alert_${uid()}`,
          productId: p.id,
          variantId: v.id,
          type: "out_of_stock",
          message: `${p.name} (${v.size}/${v.color}) is out of stock`,
          createdAt: new Date(Date.now() - rand(0, 24) * 3600000).toISOString(),
          read: false,
        });
      } else if (v.stock <= p.lowStockThreshold) {
        alerts.push({
          id: `alert_${uid()}`,
          productId: p.id,
          variantId: v.id,
          type: "low_stock",
          message: `${p.name} (${v.size}/${v.color}) has only ${v.stock} units left`,
          createdAt: new Date(Date.now() - rand(0, 48) * 3600000).toISOString(),
          read: Math.random() > 0.5,
        });
      }
    });
  });
  return alerts;
}

export function generateMockInventoryHistory(limit = 10): InventoryHistoryEntry[] {
  return Array.from({ length: limit }, () => {
    const qty = rand(1, 50);
    const prev = rand(10, 100);
    const types: InventoryHistoryEntry["type"][] = ["restock", "sale", "adjustment", "return", "reservation"];
    const type = pick(types);
    return {
      id: `ih_${uid()}`,
      variantId: `pv_${uid()}`,
      type,
      quantity: type === "restock" || type === "return" ? qty : -qty,
      previousStock: prev,
      newStock: type === "restock" || type === "return" ? prev + qty : prev - qty,
      note: type === "restock" ? "Supplier restock" : type === "sale" ? "Customer order" : type === "adjustment" ? "Inventory adjustment" : type === "return" ? "Customer return" : "Order reservation",
      createdAt: new Date(Date.now() - rand(0, limit) * 86400000).toISOString(),
    };
  });
}

export const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "price_high_low", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "best_selling", label: "Best Selling" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "most_reviewed", label: "Most Reviewed" },
];

export const priceRanges = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 - ₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000 - ₹5,000", min: 2000, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: 50000 },
];

export function getBadgesForAdvanced(product: AdvancedProduct) {
  const badges: { type: string; label: string; color: string; bg: string }[] = [];

  if (product.isNew) badges.push({ type: "new_arrival", label: "New", color: "#2ecc71", bg: "#2ecc7118" });
  if (product.isTrending) badges.push({ type: "trending", label: "Trending", color: "#e74c3c", bg: "#e74c3c18" });
  if (product.isBestSeller) badges.push({ type: "best_seller", label: "Best Seller", color: "#f39c12", bg: "#f39c1218" });
  if (product.isFeatured) badges.push({ type: "featured", label: "Featured", color: "#9b59b6", bg: "#9b59b618" });
  if (product.isLimited) badges.push({ type: "limited_stock", label: "Limited Edition", color: "#e74c3c", bg: "#e74c3c18" });

  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  if (totalStock === 0) badges.push({ type: "out_of_stock", label: "Out of Stock", color: "#95a5a6", bg: "#95a5a618" });
  else if (totalStock <= product.lowStockThreshold * 2) badges.push({ type: "limited_stock", label: "Limited Stock", color: "#e67e22", bg: "#e67e2218" });

  const discount = Math.round(((product.defaultOriginalPrice - product.defaultPrice) / product.defaultOriginalPrice) * 100);
  if (discount > 0) badges.push({ type: "discount", label: `${discount}% Off`, color: "#e74c3c", bg: "#e74c3c18" });

  return badges;
}

export function getRelatedProducts(product: AdvancedProduct, all: AdvancedProduct[], count = 4): AdvancedProduct[] {
  return all
    .filter((p) => p.id !== product.id)
    .filter((p) => p.category === product.category || p.tags.some((t) => product.tags.includes(t)))
    .slice(0, count);
}

export function getFrequentlyBoughtTogether(product: AdvancedProduct, all: AdvancedProduct[], count = 3): AdvancedProduct[] {
  return all
    .filter((p) => p.id !== product.id && p.category !== product.category)
    .slice(0, count);
}

export function getTrendingProducts(products: AdvancedProduct[], count = 4): AdvancedProduct[] {
  return [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, count);
}

export function getBestSellers(products: AdvancedProduct[], count = 4): AdvancedProduct[] {
  return [...products].sort((a, b) => (b.rating * b.soldCount) - (a.rating * a.soldCount)).slice(0, count);
}

export function getNewArrivals(products: AdvancedProduct[], count = 4): AdvancedProduct[] {
  return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, count);
}
