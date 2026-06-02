import type { VendorShop, VendorProduct, VendorOrder, VendorOrderStatus, VendorCustomer, VendorReview, InventoryItem, InventoryHistoryEntry, AnalyticsData } from "../types/vendor";

/* ─── SHOP ─── */
export function getMockShop(): VendorShop {
  return {
    id: "shop_1",
    vendorId: "v_1",
    slug: "nabme-originals",
    shopName: "নবME Originals",
    shopLogo: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200",
    shopBanner: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200",
    shopDescription: "Premium Bengali streetwear — crafted for the bold. We fuse traditional Bengali motifs with modern silhouettes to create fashion that tells a story.",
    shopCategory: "Men's Fashion",
    businessName: "নবME Fashions Pvt. Ltd.",
    ownerName: "Tanmoy Mondal",
    phone: "+919163854706",
    email: "vendor@nabme.com",
    address: "123, Kalighat Road, Kolkata, West Bengal 700026",
    status: "approved",
    rating: 4.6,
    totalProducts: 24,
    totalOrders: 156,
    totalCustomers: 89,
    createdAt: "2025-08-15T00:00:00Z",
  };
}

/* ─── PRODUCTS ─── */
const productTemplates = [
  { name: "Oversized Fit Tee — Charcoal", category: "Men's Fashion", subcategory: "T-Shirts", brand: "নবME Originals", price: 1299, discountPrice: 0, material: "Cotton", gender: "Male" },
  { name: "Bengal Tiger Hoodie", category: "Men's Fashion", subcategory: "Hoodies", brand: "নবME Originals", price: 2499, discountPrice: 1999, material: "Cotton Blend", gender: "Male" },
  { name: "Classic Logo Cap", category: "Accessories", subcategory: "Caps", brand: "নবME Originals", price: 899, discountPrice: 0, material: "Cotton", gender: "Unisex" },
  { name: "Gold Chain Necklace", category: "Jewelry", subcategory: "Necklaces", brand: "নবME Accessories", price: 1499, discountPrice: 1199, material: "Metal", gender: "Unisex" },
  { name: "Limited Edition Drop Tee", category: "Men's Fashion", subcategory: "T-Shirts", brand: "নবME Originals", price: 1799, discountPrice: 0, material: "Premium Cotton", gender: "Male" },
  { name: "Floral Summer Dress", category: "Women's Fashion", subcategory: "Dresses", brand: "নবME Women", price: 2199, discountPrice: 1799, material: "Linen", gender: "Female" },
  { name: "Denim Jacket — Vintage Wash", category: "Men's Fashion", subcategory: "Jackets", brand: "নবME Originals", price: 3999, discountPrice: 3299, material: "Denim", gender: "Male" },
  { name: "Silk Scarf — Handwoven", category: "Accessories", subcategory: "Scarves", brand: "নবME Luxe", price: 2499, discountPrice: 0, material: "Silk", gender: "Female" },
  { name: "Cargo Joggers — Olive", category: "Men's Fashion", subcategory: "Pants", brand: "নবME Originals", price: 1899, discountPrice: 1499, material: "Cotton Blend", gender: "Male" },
  { name: "Kurti Set — Printed", category: "Ethnic Wear", subcategory: "Kurtis", brand: "নবME Ethnic", price: 1599, discountPrice: 0, material: "Cotton", gender: "Female" },
  { name: "Sports T-Shirt — Dri-Fit", category: "Sportswear", subcategory: "Active Tees", brand: "নবME Sport", price: 999, discountPrice: 799, material: "Polyester", gender: "Male" },
  { name: "Winter Beanie — Knitted", category: "Winter Wear", subcategory: "Beanies", brand: "নবME Originals", price: 699, discountPrice: 0, material: "Acrylic", gender: "Unisex" },
  { name: "Leather Belt — Brown", category: "Accessories", subcategory: "Belts", brand: "নবME Accessories", price: 1299, discountPrice: 0, material: "Leather", gender: "Male" },
  { name: "Kanjivaram Silk Saree", category: "Ethnic Wear", subcategory: "Sarees", brand: "নবME Ethnic", price: 8999, discountPrice: 6999, material: "Silk", gender: "Female" },
  { name: "Western Crop Top", category: "Women's Fashion", subcategory: "Tops", brand: "নবME Women", price: 1199, discountPrice: 0, material: "Cotton", gender: "Female" },
  { name: "Running Shoes — White", category: "Footwear", subcategory: "Sports Shoes", brand: "নবME Sport", price: 4999, discountPrice: 3999, material: "Mesh", gender: "Male" },
  { name: "Kid's Printed T-Shirt", category: "Kids Fashion", subcategory: "T-Shirts", brand: "নবME Kids", price: 699, discountPrice: 499, material: "Cotton", gender: "Unisex" },
  { name: "Aviator Sunglasses", category: "Accessories", subcategory: "Sunglasses", brand: "নবME Accessories", price: 1999, discountPrice: 0, material: "Metal", gender: "Unisex" },
  { name: "Embroidered Jutti", category: "Footwear", subcategory: "Traditional", brand: "নবME Ethnic", price: 1799, discountPrice: 1499, material: "Leather", gender: "Female" },
  { name: "Track Pants — Grey", category: "Sportswear", subcategory: "Active Bottoms", brand: "নবME Sport", price: 1399, discountPrice: 0, material: "Polyester", gender: "Male" },
  { name: "Baby Romper — Cotton", category: "Kids Fashion", subcategory: "Rompers", brand: "নবME Kids", price: 599, discountPrice: 0, material: "Cotton", gender: "Unisex" },
  { name: "Party Wear Blazer", category: "Men's Fashion", subcategory: "Blazers", brand: "নবME Originals", price: 5999, discountPrice: 4999, material: "Blended Fabric", gender: "Male" },
  { name: "Hoop Earrings — Gold", category: "Jewelry", subcategory: "Earrings", brand: "নবME Accessories", price: 899, discountPrice: 0, material: "Metal", gender: "Female" },
  { name: "Puffer Jacket — Black", category: "Winter Wear", subcategory: "Jackets", brand: "নবME Originals", price: 4499, discountPrice: 0, material: "Nylon", gender: "Male" },
];

export function generateMockProducts(vendorId: string): VendorProduct[] {
  const statuses: VendorProduct["status"][] = ["published", "published", "published", "published", "published", "published", "published", "draft", "pending_approval", "rejected", "soft_deleted", "published", "published", "published", "published", "published", "published", "published", "published", "published", "draft", "pending_approval", "published", "published"];
  return productTemplates.map((t, i) => {
    const imgs = [
      `https://images.unsplash.com/photo-${1521572163474 + i}?w=600`,
      `https://images.unsplash.com/photo-${1556821840 + i}?w=600`,
    ];
    return {
      id: `vp_${i + 1}`,
      vendorId,
      ...t,
      shortDescription: `Premium ${t.name.toLowerCase()} — crafted with care.`,
      fullDescription: `Experience the finest quality with our ${t.name}. Designed for those who appreciate style and comfort. Perfect for any occasion, this piece combines traditional craftsmanship with modern aesthetics.`,
      stockQuantity: [45, 12, 80, 25, 60, 30, 15, 50, 35, 20, 0, 70, 40, 8, 55, 22, 65, 18, 28, 42, 90, 10, 38, 5][i],
      sku: `NB-${String(i + 1).padStart(4, "0")}`,
      tags: ["premium", t.gender.toLowerCase(), t.category.toLowerCase().replace(/ /g, "-"), "streetwear"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "White", "Charcoal", "Olive"],
      images: imgs,
      mainImage: imgs[0],
      status: statuses[i],
      createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
      rejectionReason: statuses[i] === "rejected" ? "Product images do not meet quality guidelines. Please upload high-resolution images." : undefined,
    };
  });
}

/* ─── ORDERS ─── */
let ordId = 0;
export function generateMockOrders(_vendorId?: string): VendorOrder[] {
  const statuses: VendorOrderStatus[] = ["new", "processing", "processing", "packed", "shipped", "delivered", "delivered", "delivered", "cancelled", "cancelled", "new", "processing", "packed", "shipped", "delivered"];
  const names = ["Arun Sharma", "Priya Patel", "Rahul Verma", "Sneha Gupta", "Vikram Singh", "Ananya Das", "Rohit Mehta", "Kavita Nair", "Amit Joshi", "Deepa Iyer", "Manish Kumar", "Neha Agarwal", "Sunil Rao", "Pooja Reddy", "Akash Malhotra"];
  return statuses.map((st, i) => {
    ordId++;
    const items = [
      { productId: `vp_${(i % 12) + 1}`, productName: productTemplates[i % productTemplates.length].name, productImage: `https://images.unsplash.com/photo-${1521572163474 + (i % 12)}?w=200`, price: [1299, 2499, 899, 1499][i % 4], quantity: (i % 3) + 1, size: ["M", "L", "S", "XL"][i % 4], color: ["Black", "White", "Charcoal"][i % 3] },
    ];
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
    return {
      id: `vord_${ordId}`,
      orderId: `NB-${String(1000 + ordId)}`,
      customerId: `cust_${i + 1}`,
      customerName: names[i],
      customerPhone: `+919${String(Math.floor(100000000 + Math.random() * 899999999)).slice(0, 9)}`,
      customerEmail: names[i].toLowerCase().replace(/ /g, ".") + "@gmail.com",
      items,
      total,
      status: st,
      trackingNumber: st === "shipped" || st === "delivered" ? `TRK${String(100000 + ordId)}` : "",
      shippingAddress: { name: names[i], phone: `+919${String(Math.floor(100000000 + Math.random() * 899999999)).slice(0, 9)}`, address: `${100 + i}, Main Street`, city: ["Kolkata", "Mumbai", "Delhi", "Bangalore", "Chennai"][i % 5], state: "West Bengal", pincode: "7000" + String(10 + i).slice(0, 2) },
      paymentMethod: ["UPI", "COD", "Card", "Net Banking"][i % 4],
      createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
      note: i === 0 ? "Please deliver before 6 PM" : "",
    };
  });
}

/* ─── CUSTOMERS ─── */
export function generateMockCustomers(): VendorCustomer[] {
  return [
    { id: "cust_1", name: "Arun Sharma", phone: "+919876543210", email: "arun.s@gmail.com", avatar: "", orderCount: 5, totalSpent: 12499, lastOrderDate: new Date(Date.now() - 2 * 86400000).toISOString(), city: "Kolkata" },
    { id: "cust_2", name: "Priya Patel", phone: "+919876543211", email: "priya.p@gmail.com", avatar: "", orderCount: 3, totalSpent: 8999, lastOrderDate: new Date(Date.now() - 5 * 86400000).toISOString(), city: "Mumbai" },
    { id: "cust_3", name: "Rahul Verma", phone: "+919876543212", email: "rahul.v@gmail.com", avatar: "", orderCount: 8, totalSpent: 24500, lastOrderDate: new Date(Date.now() - 1 * 86400000).toISOString(), city: "Delhi" },
    { id: "cust_4", name: "Sneha Gupta", phone: "+919876543213", email: "sneha.g@gmail.com", avatar: "", orderCount: 2, totalSpent: 3599, lastOrderDate: new Date(Date.now() - 12 * 86400000).toISOString(), city: "Bangalore" },
    { id: "cust_5", name: "Vikram Singh", phone: "+919876543214", email: "vikram.s@gmail.com", avatar: "", orderCount: 6, totalSpent: 18799, lastOrderDate: new Date(Date.now() - 3 * 86400000).toISOString(), city: "Chennai" },
    { id: "cust_6", name: "Ananya Das", phone: "+919876543215", email: "ananya.d@gmail.com", avatar: "", orderCount: 4, totalSpent: 9999, lastOrderDate: new Date(Date.now() - 8 * 86400000).toISOString(), city: "Kolkata" },
    { id: "cust_7", name: "Rohit Mehta", phone: "+919876543216", email: "rohit.m@gmail.com", avatar: "", orderCount: 1, totalSpent: 1299, lastOrderDate: new Date(Date.now() - 20 * 86400000).toISOString(), city: "Mumbai" },
    { id: "cust_8", name: "Kavita Nair", phone: "+919876543217", email: "kavita.n@gmail.com", avatar: "", orderCount: 7, totalSpent: 21500, lastOrderDate: new Date(Date.now() - 4 * 86400000).toISOString(), city: "Delhi" },
  ];
}

/* ─── REVIEWS ─── */
export function generateMockReviews(): VendorReview[] {
  const comments = [
    { rating: 5, comment: "Absolutely love this! The fabric quality is outstanding and the fit is perfect. Worth every penny!" },
    { rating: 4, comment: "Great product overall. Slightly smaller than expected but the quality makes up for it." },
    { rating: 5, comment: "Best purchase this month! The design is unique and really turns heads." },
    { rating: 3, comment: "Decent product for the price. Could improve the stitching quality." },
    { rating: 4, comment: "Nice color and finish. Shipping was fast. Would recommend." },
    { rating: 2, comment: "Not as described. The material feels different from what was shown." },
    { rating: 5, comment: "Exceeded my expectations! The gold accents are stunning." },
    { rating: 4, comment: "Good quality, comfortable fit. My second purchase from this shop." },
  ];
  const names = ["Arun Sharma", "Priya Patel", "Rahul Verma", "Sneha Gupta", "Vikram Singh", "Ananya Das", "Rohit Mehta", "Kavita Nair"];
  return comments.map((c, i) => ({
    id: `rev_${i + 1}`,
    productId: `vp_${(i % 12) + 1}`,
    productName: productTemplates[i % productTemplates.length].name,
    productImage: `https://images.unsplash.com/photo-${1521572163474 + (i % 12)}?w=100`,
    customerId: `cust_${i + 1}`,
    customerName: names[i],
    customerAvatar: "",
    ...c,
    reply: i % 3 === 0 ? "Thank you for your kind words! We're glad you loved it. 🙌" : "",
    createdAt: new Date(Date.now() - i * 86400000 * 4).toISOString(),
    reported: false,
  }));
}

/* ─── INVENTORY ─── */
export function generateMockInventory(): InventoryItem[] {
  return [
    { productId: "vp_1", productName: "Oversized Fit Tee — Charcoal", productImage: "https://images.unsplash.com/photo-1521572163474?w=100", currentStock: 45, lowStockThreshold: 10, soldToday: 3, soldThisMonth: 28, lastRestocked: new Date(Date.now() - 7 * 86400000).toISOString(), status: "in_stock" },
    { productId: "vp_2", productName: "Bengal Tiger Hoodie", productImage: "https://images.unsplash.com/photo-1556821840?w=100", currentStock: 12, lowStockThreshold: 15, soldToday: 2, soldThisMonth: 18, lastRestocked: new Date(Date.now() - 14 * 86400000).toISOString(), status: "low_stock" },
    { productId: "vp_5", productName: "Limited Edition Drop Tee", productImage: "https://images.unsplash.com/photo-1576566588028?w=100", currentStock: 0, lowStockThreshold: 10, soldToday: 0, soldThisMonth: 35, lastRestocked: new Date(Date.now() - 30 * 86400000).toISOString(), status: "out_of_stock" },
    { productId: "vp_6", productName: "Floral Summer Dress", productImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100", currentStock: 30, lowStockThreshold: 10, soldToday: 1, soldThisMonth: 15, lastRestocked: new Date(Date.now() - 5 * 86400000).toISOString(), status: "in_stock" },
    { productId: "vp_8", productName: "Silk Scarf — Handwoven", productImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100", currentStock: 8, lowStockThreshold: 10, soldToday: 0, soldThisMonth: 6, lastRestocked: new Date(Date.now() - 20 * 86400000).toISOString(), status: "low_stock" },
    { productId: "vp_12", productName: "Winter Beanie — Knitted", productImage: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=100", currentStock: 70, lowStockThreshold: 15, soldToday: 0, soldThisMonth: 4, lastRestocked: new Date(Date.now() - 10 * 86400000).toISOString(), status: "in_stock" },
    { productId: "vp_14", productName: "Kanjivaram Silk Saree", productImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100", currentStock: 8, lowStockThreshold: 5, soldToday: 1, soldThisMonth: 7, lastRestocked: new Date(Date.now() - 15 * 86400000).toISOString(), status: "low_stock" },
    { productId: "vp_16", productName: "Running Shoes — White", productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100", currentStock: 22, lowStockThreshold: 8, soldToday: 0, soldThisMonth: 9, lastRestocked: new Date(Date.now() - 12 * 86400000).toISOString(), status: "in_stock" },
  ];
}

export function generateMockInventoryHistory(): InventoryHistoryEntry[] {
  return [
    { id: "ih_1", productId: "vp_1", productName: "Oversized Fit Tee — Charcoal", type: "restock", quantity: 30, date: new Date(Date.now() - 7 * 86400000).toISOString(), note: "Bulk restock from supplier" },
    { id: "ih_2", productId: "vp_2", productName: "Bengal Tiger Hoodie", type: "sale", quantity: -2, date: new Date(Date.now() - 1 * 86400000).toISOString(), note: "Order NB-1001" },
    { id: "ih_3", productId: "vp_5", productName: "Limited Edition Drop Tee", type: "sale", quantity: -1, date: new Date(Date.now() - 2 * 86400000).toISOString(), note: "Order NB-1002" },
    { id: "ih_4", productId: "vp_6", productName: "Floral Summer Dress", type: "adjustment", quantity: 5, date: new Date(Date.now() - 3 * 86400000).toISOString(), note: "Inventory count adjustment" },
    { id: "ih_5", productId: "vp_1", productName: "Oversized Fit Tee — Charcoal", type: "sale", quantity: -3, date: new Date(Date.now() - 1 * 86400000).toISOString(), note: "Orders NB-1003, NB-1004" },
    { id: "ih_6", productId: "vp_8", productName: "Silk Scarf — Handwoven", type: "return", quantity: 1, date: new Date(Date.now() - 4 * 86400000).toISOString(), note: "Return from customer" },
    { id: "ih_7", productId: "vp_2", productName: "Bengal Tiger Hoodie", type: "restock", quantity: 15, date: new Date(Date.now() - 14 * 86400000).toISOString(), note: "Pre-order restock" },
  ];
}

/* ─── ANALYTICS ─── */
export function generateMockAnalytics(): AnalyticsData {
  return {
    todayRevenue: 12499,
    monthlyRevenue: 189450,
    totalOrders: 156,
    pendingOrders: 12,
    productsCount: 24,
    lowStockAlerts: 3,
    customerCount: 89,
    recentReviews: 8,
    revenueChart: [
      { month: "Jan", revenue: 85000 },
      { month: "Feb", revenue: 92000 },
      { month: "Mar", revenue: 105000 },
      { month: "Apr", revenue: 98000 },
      { month: "May", revenue: 120000 },
      { month: "Jun", revenue: 142000 },
      { month: "Jul", revenue: 135000 },
      { month: "Aug", revenue: 158000 },
      { month: "Sep", revenue: 165000 },
      { month: "Oct", revenue: 172000 },
      { month: "Nov", revenue: 182000 },
      { month: "Dec", revenue: 189450 },
    ],
    orderChart: [
      { month: "Jan", orders: 45 },
      { month: "Feb", orders: 52 },
      { month: "Mar", orders: 58 },
      { month: "Apr", orders: 55 },
      { month: "May", orders: 68 },
      { month: "Jun", orders: 72 },
      { month: "Jul", orders: 70 },
      { month: "Aug", orders: 78 },
      { month: "Sep", orders: 82 },
      { month: "Oct", orders: 88 },
      { month: "Nov", orders: 92 },
      { month: "Dec", orders: 95 },
    ],
    bestSellingProducts: [
      { name: "Oversized Fit Tee — Charcoal", sales: 128, revenue: 166272, image: "https://images.unsplash.com/photo-1521572163474?w=100" },
      { name: "Bengal Tiger Hoodie", sales: 96, revenue: 191904, image: "https://images.unsplash.com/photo-1556821840?w=100" },
      { name: "Gold Chain Necklace", sales: 85, revenue: 101915, image: "https://images.unsplash.com/photo-1603975217912?w=100" },
      { name: "Limited Edition Drop Tee", sales: 72, revenue: 129528, image: "https://images.unsplash.com/photo-1576566588028?w=100" },
      { name: "Floral Summer Dress", sales: 54, revenue: 96606, image: "https://images.unsplash.com/photo-1595777457583?w=100" },
    ],
    topCategories: [
      { category: "Men's Fashion", count: 85, revenue: 212500 },
      { category: "Women's Fashion", count: 32, revenue: 96000 },
      { category: "Accessories", count: 28, revenue: 42000 },
      { category: "Ethnic Wear", count: 15, revenue: 75000 },
      { category: "Footwear", count: 10, revenue: 45000 },
    ],
    monthlyGrowth: 12.5,
    customerGrowth: 18.2,
    orderStatusBreakdown: [
      { status: "new", count: 8 },
      { status: "processing", count: 12 },
      { status: "packed", count: 6 },
      { status: "shipped", count: 10 },
      { status: "delivered", count: 98 },
      { status: "cancelled", count: 22 },
    ],
  };
}

/* ─── TRASH ─── */
export function generateMockTrash(vendorId: string): VendorProduct[] {
  return [
    {
      id: "trash_1", vendorId, name: "Old Collection Tee", shortDescription: "Discontinued design", fullDescription: "From our first drop — now archived.", category: "Men's Fashion", subcategory: "T-Shirts", brand: "নবME Originals", price: 999, discountPrice: 0, stockQuantity: 0, sku: "NB-ARCH-001", tags: ["archive"], gender: "Male", material: "Cotton", sizes: ["S", "M", "L"], colors: ["Black"], images: ["https://images.unsplash.com/photo-1521572163474?w=600"], mainImage: "https://images.unsplash.com/photo-1521572163474?w=600", status: "soft_deleted", createdAt: "2025-06-01T00:00:00Z", updatedAt: "2025-12-20T00:00:00Z",
    },
    {
      id: "trash_2", vendorId, name: "Summer Drop 2024 — Tank Top", shortDescription: "Previous season", fullDescription: "Summer 2024 collection tank top. Limited stock remaining.", category: "Men's Fashion", subcategory: "Tank Tops", brand: "নবME Originals", price: 799, discountPrice: 499, stockQuantity: 3, sku: "NB-ARCH-002", tags: ["archive", "summer"], gender: "Male", material: "Cotton", sizes: ["M", "L"], colors: ["White", "Navy"], images: ["https://images.unsplash.com/photo-1576566588028?w=600"], mainImage: "https://images.unsplash.com/photo-1576566588028?w=600", status: "soft_deleted", createdAt: "2024-04-15T00:00:00Z", updatedAt: "2025-11-30T00:00:00Z",
    },
  ];
}
