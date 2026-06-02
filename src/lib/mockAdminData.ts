import type { AdminVendor, AdminProduct, AdminCategory, AdminCustomer, AdminOrder, AdminReview, AdminCoupon, AdminBanner, AdminNotification, AdminReport, AdminSiteSettings, AdminLog, AdminDashboardStats } from "../types/admin";

/* ─── DASHBOARD ─── */
export function generateAdminDashboardStats(): AdminDashboardStats {
  return {
    totalCustomers: 1248,
    totalVendors: 36,
    pendingVendors: 5,
    totalProducts: 458,
    pendingProducts: 18,
    totalOrders: 2894,
    totalRevenue: 4589200,
    activeUsers: 892,
    customerGrowth: 14.2,
    vendorGrowth: 8.5,
    revenueGrowth: 22.8,
    orderGrowth: 16.3,
    revenueChart: [
      { month: "Jan", revenue: 285000 },
      { month: "Feb", revenue: 312000 },
      { month: "Mar", revenue: 358000 },
      { month: "Apr", revenue: 325000 },
      { month: "May", revenue: 389000 },
      { month: "Jun", revenue: 412000 },
      { month: "Jul", revenue: 398000 },
      { month: "Aug", revenue: 445000 },
      { month: "Sep", revenue: 468000 },
      { month: "Oct", revenue: 482000 },
      { month: "Nov", revenue: 495000 },
      { month: "Dec", revenue: 520000 },
    ],
    orderChart: [
      { month: "Jan", orders: 185 },
      { month: "Feb", orders: 210 },
      { month: "Mar", orders: 235 },
      { month: "Apr", orders: 220 },
      { month: "May", orders: 258 },
      { month: "Jun", orders: 275 },
      { month: "Jul", orders: 268 },
      { month: "Aug", orders: 290 },
      { month: "Sep", orders: 305 },
      { month: "Oct", orders: 318 },
      { month: "Nov", orders: 325 },
      { month: "Dec", orders: 340 },
    ],
    vendorChart: [
      { month: "Jan", vendors: 18 },
      { month: "Feb", vendors: 20 },
      { month: "Mar", vendors: 22 },
      { month: "Apr", vendors: 23 },
      { month: "May", vendors: 25 },
      { month: "Jun", vendors: 26 },
      { month: "Jul", vendors: 28 },
      { month: "Aug", vendors: 29 },
      { month: "Sep", vendors: 31 },
      { month: "Oct", vendors: 33 },
      { month: "Nov", vendors: 34 },
      { month: "Dec", vendors: 36 },
    ],
    categoryDistribution: [
      { category: "Men's Fashion", count: 145 },
      { category: "Women's Fashion", count: 98 },
      { category: "Kids Fashion", count: 42 },
      { category: "Footwear", count: 56 },
      { category: "Accessories", count: 38 },
      { category: "Jewelry", count: 25 },
      { category: "Ethnic Wear", count: 32 },
      { category: "Sportswear", count: 22 },
    ],
    recentActivities: [
      { action: "New vendor registration — নবME Originals", time: "2 min ago", type: "vendor" },
      { action: "Product pending approval — Oversized Tee", time: "15 min ago", type: "product" },
      { action: "Order NB-2894 marked as delivered", time: "1 hour ago", type: "order" },
      { action: "New customer registration — Priya S.", time: "2 hours ago", type: "customer" },
      { action: "Vendor নবME Originals approved", time: "3 hours ago", type: "vendor" },
      { action: "Product rejected — Summer Tank Top", time: "5 hours ago", type: "product" },
      { action: "Banner updated — Summer Collection", time: "1 day ago", type: "admin" },
    ],
  };
}

/* ─── VENDORS ─── */
export function generateMockAdminVendors(): AdminVendor[] {
  const vendors: AdminVendor[] = [
    { id: "v_1", shopName: "নবME Originals", ownerName: "Tanmoy Mondal", businessName: "নবME Fashions Pvt. Ltd.", email: "tanmoy@nabme.com", phone: "+919163854706", address: "123, Kalighat Road, Kolkata 700026", category: "Men's Fashion", status: "approved", registrationDate: "2025-08-15", productCount: 24, orderCount: 156, revenue: 458000, rating: 4.6, logo: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=100" },
    { id: "v_2", shopName: "Bengal Bazaar", ownerName: "Ravi Sharma", businessName: "Bengal Bazaar Pvt. Ltd.", email: "ravi@bengalbazaar.com", phone: "+919876543210", address: "45, Park Street, Kolkata 700016", category: "Ethnic Wear", status: "approved", registrationDate: "2025-09-20", productCount: 18, orderCount: 89, revenue: 234000, rating: 4.2, logo: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=100" },
    { id: "v_3", shopName: "Street Culture", ownerName: "Amit Verma", businessName: "Street Culture India", email: "amit@streetculture.in", phone: "+919876543211", address: "78, MG Road, Mumbai 400001", category: "Western Wear", status: "pending", registrationDate: "2026-05-28", productCount: 0, orderCount: 0, revenue: 0, rating: 0, logo: "" },
    { id: "v_4", shopName: "Desi Threads", ownerName: "Priya Patel", businessName: "Desi Threads Export", email: "priya@desithreads.com", phone: "+919876543212", address: "12, Connaught Place, Delhi 110001", category: "Women's Fashion", status: "pending", registrationDate: "2026-05-25", productCount: 0, orderCount: 0, revenue: 0, rating: 0, logo: "" },
    { id: "v_5", shopName: "Kolkata Kouture", ownerName: "Sneha Das", businessName: "Kolkata Kouture", email: "sneha@kolkatakouture.com", phone: "+919876543213", address: "56, Rashbehari Avenue, Kolkata 700029", category: "Accessories", status: "approved", registrationDate: "2025-10-10", productCount: 12, orderCount: 45, revenue: 98000, rating: 4.4, logo: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=100" },
    { id: "v_6", shopName: "Urban Sole", ownerName: "Vikram Singh", businessName: "Urban Sole Footwear", email: "vikram@urbansole.in", phone: "+919876543214", address: "200, Brigade Road, Bangalore 560001", category: "Footwear", status: "suspended", registrationDate: "2025-11-05", productCount: 8, orderCount: 32, revenue: 156000, rating: 3.8, logo: "https://images.unsplash.com/photo-1608236415054-3a5e3b0f5f5c?w=100" },
    { id: "v_7", shopName: "Jewel House", ownerName: "Ananya Gupta", businessName: "Jewel House India", email: "ananya@jewelhouse.in", phone: "+919876543215", address: "88, Marine Drive, Mumbai 400002", category: "Jewelry", status: "approved", registrationDate: "2025-12-01", productCount: 15, orderCount: 78, revenue: 345000, rating: 4.8, logo: "https://images.unsplash.com/photo-1603975217912-1c8f3e63bb89?w=100" },
    { id: "v_8", shopName: "Sportify Wear", ownerName: "Rahul Mehta", businessName: "Sportify Activewear", email: "rahul@sportify.in", phone: "+919876543216", address: "34, Andheri West, Mumbai 400053", category: "Sportswear", status: "rejected", registrationDate: "2026-04-15", productCount: 0, orderCount: 0, revenue: 0, rating: 0, logo: "" },
    { id: "v_9", shopName: "Winter Vibes", ownerName: "Neha Kapoor", businessName: "Winter Vibes Collection", email: "neha@wintervibes.com", phone: "+919876543217", address: "15, Sector 18, Noida 201301", category: "Winter Wear", status: "pending", registrationDate: "2026-06-01", productCount: 0, orderCount: 0, revenue: 0, rating: 0, logo: "" },
    { id: "v_10", shopName: "Tiny Tots", ownerName: "Kavita Nair", businessName: "Tiny Tots Kids Wear", email: "kavita@tinytots.in", phone: "+919876543218", address: "67, Jayanagar, Bangalore 560011", category: "Kids Fashion", status: "approved", registrationDate: "2026-01-20", productCount: 22, orderCount: 112, revenue: 289000, rating: 4.5, logo: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=100" },
  ];
  return vendors;
}

/* ─── PRODUCTS ─── */
export function generateMockAdminProducts(): AdminProduct[] {
  const statuses: AdminProduct["status"][] = ["published", "published", "published", "pending_approval", "pending_approval", "rejected", "published", "published", "draft", "pending_approval", "published", "soft_deleted", "published", "published", "pending_approval", "rejected", "published", "soft_deleted"];
  const names = [
    "Oversized Fit Tee — Charcoal", "Bengal Tiger Hoodie", "Classic Logo Cap", "Summer Tank Top",
    "Floral Summer Dress", "Denim Jacket — Vintage", "Gold Chain Necklace", "Cargo Joggers",
    "Kurti Set — Printed", "Premium Leather Belt", "Running Shoes — White", "Old Collection Tee",
    "Silk Scarf — Handwoven", "Embroidered Jutti", "Party Wear Blazer", "Sports T-Shirt — Dri-Fit",
    "Aviator Sunglasses", "Winter Beanie — Knitted",
  ];
  const vendors = ["নবME Originals", "Bengal Bazaar", "Kolkata Kouture", "Jewel House", "Tiny Tots", "Urban Sole"];
  const categories = ["Men's Fashion", "Men's Fashion", "Accessories", "Men's Fashion", "Women's Fashion", "Men's Fashion", "Jewelry", "Men's Fashion", "Ethnic Wear", "Accessories", "Footwear", "Men's Fashion", "Accessories", "Footwear", "Men's Fashion", "Sportswear", "Accessories", "Winter Wear"];
  return names.map((name, i) => ({
    id: `ap_${i + 1}`,
    vendorId: `v_${(i % 6) + 1}`,
    vendorName: vendors[i % vendors.length],
    vendorShop: vendors[i % vendors.length],
    name,
    category: categories[i],
    price: [1299, 2499, 899, 799, 2199, 3999, 1499, 1899, 1599, 1299, 4999, 999, 2499, 1799, 5999, 999, 1999, 699][i],
    stock: [45, 12, 80, 0, 30, 15, 25, 35, 20, 40, 22, 0, 8, 18, 10, 55, 38, 70][i],
    status: statuses[i],
    createdAt: new Date(Date.now() - i * 86400000 * 4).toISOString(),
    image: `https://images.unsplash.com/photo-${1521572163474 + i}?w=200`,
    rejectionReason: statuses[i] === "rejected" ? "Images do not meet quality standards. Please re-upload with higher resolution." : undefined,
  }));
}

/* ─── CATEGORIES ─── */
export function generateMockAdminCategories(): AdminCategory[] {
  return [
    { id: "cat_1", name: "Men's Fashion", slug: "mens-fashion", description: "T-shirts, shirts, hoodies, jackets, pants and more for men.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200", subcategories: [{ id: "sub_1", name: "T-Shirts", slug: "t-shirts", productCount: 45 }, { id: "sub_2", name: "Hoodies", slug: "hoodies", productCount: 22 }, { id: "sub_3", name: "Jackets", slug: "jackets", productCount: 15 }, { id: "sub_4", name: "Pants", slug: "pants", productCount: 28 }, { id: "sub_5", name: "Shorts", slug: "shorts", productCount: 12 }], productCount: 145, isActive: true },
    { id: "cat_2", name: "Women's Fashion", slug: "womens-fashion", description: "Dresses, tops, kurtis, jeans and more for women.", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200", subcategories: [{ id: "sub_6", name: "Dresses", slug: "dresses", productCount: 32 }, { id: "sub_7", name: "Tops", slug: "tops", productCount: 28 }, { id: "sub_8", name: "Kurtis", slug: "kurtis", productCount: 18 }, { id: "sub_9", name: "Jeans", slug: "jeans", productCount: 20 }], productCount: 98, isActive: true },
    { id: "cat_3", name: "Kids Fashion", slug: "kids-fashion", description: "Adorable clothing for kids of all ages.", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=200", subcategories: [{ id: "sub_10", name: "T-Shirts", slug: "kids-t-shirts", productCount: 15 }, { id: "sub_11", name: "Dresses", slug: "kids-dresses", productCount: 10 }, { id: "sub_12", name: "Rompers", slug: "rompers", productCount: 8 }], productCount: 42, isActive: true },
    { id: "cat_4", name: "Footwear", slug: "footwear", description: "Shoes, sandals, slippers and boots.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200", subcategories: [{ id: "sub_13", name: "Sports Shoes", slug: "sports-shoes", productCount: 20 }, { id: "sub_14", name: "Casual Shoes", slug: "casual-shoes", productCount: 18 }, { id: "sub_15", name: "Sandals", slug: "sandals", productCount: 10 }], productCount: 56, isActive: true },
    { id: "cat_5", name: "Accessories", slug: "accessories", description: "Caps, belts, watches, sunglasses and more.", image: "https://images.unsplash.com/photo-1603975217912-1c8f3e63bb89?w=200", subcategories: [{ id: "sub_16", name: "Caps", slug: "caps", productCount: 12 }, { id: "sub_17", name: "Belts", slug: "belts", productCount: 8 }, { id: "sub_18", name: "Sunglasses", slug: "sunglasses", productCount: 10 }], productCount: 38, isActive: true },
    { id: "cat_6", name: "Jewelry", slug: "jewelry", description: "Necklaces, earrings, rings and more.", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200", subcategories: [{ id: "sub_19", name: "Necklaces", slug: "necklaces", productCount: 8 }, { id: "sub_20", name: "Earrings", slug: "earrings", productCount: 10 }, { id: "sub_21", name: "Rings", slug: "rings", productCount: 7 }], productCount: 25, isActive: true },
    { id: "cat_7", name: "Ethnic Wear", slug: "ethnic-wear", description: "Traditional and cultural Indian attire.", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200", subcategories: [{ id: "sub_22", name: "Sarees", slug: "sarees", productCount: 12 }, { id: "sub_23", name: "Kurtas", slug: "kurtas", productCount: 10 }, { id: "sub_24", name: "Lehengas", slug: "lehengas", productCount: 6 }], productCount: 32, isActive: true },
    { id: "cat_8", name: "Sportswear", slug: "sportswear", description: "Activewear for workouts and sports.", image: "https://images.unsplash.com/photo-1576566588028?w=200", subcategories: [{ id: "sub_25", name: "Active Tees", slug: "active-tees", productCount: 8 }, { id: "sub_26", name: "Track Pants", slug: "track-pants", productCount: 8 }, { id: "sub_27", name: "Shorts", slug: "sport-shorts", productCount: 6 }], productCount: 22, isActive: true },
  ];
}

/* ─── CUSTOMERS ─── */
export function generateMockAdminCustomers(): AdminCustomer[] {
  return [
    { id: "c_1", name: "Arun Sharma", phone: "+919876543210", email: "arun.s@gmail.com", gender: "Male", city: "Kolkata", orderCount: 5, totalSpent: 12499, status: "active", registeredAt: "2026-01-15", lastActive: "2026-06-01" },
    { id: "c_2", name: "Priya Patel", phone: "+919876543211", email: "priya.p@gmail.com", gender: "Female", city: "Mumbai", orderCount: 3, totalSpent: 8999, status: "active", registeredAt: "2026-02-20", lastActive: "2026-05-28" },
    { id: "c_3", name: "Rahul Verma", phone: "+919876543212", email: "rahul.v@gmail.com", gender: "Male", city: "Delhi", orderCount: 8, totalSpent: 24500, status: "active", registeredAt: "2025-11-10", lastActive: "2026-06-02" },
    { id: "c_4", name: "Sneha Gupta", phone: "+919876543213", email: "sneha.g@gmail.com", gender: "Female", city: "Bangalore", orderCount: 2, totalSpent: 3599, status: "suspended", registeredAt: "2026-03-05", lastActive: "2026-04-15" },
    { id: "c_5", name: "Vikram Singh", phone: "+919876543214", email: "vikram.s@gmail.com", gender: "Male", city: "Chennai", orderCount: 6, totalSpent: 18799, status: "active", registeredAt: "2025-12-01", lastActive: "2026-05-30" },
    { id: "c_6", name: "Ananya Das", phone: "+919876543215", email: "ananya.d@gmail.com", gender: "Female", city: "Kolkata", orderCount: 4, totalSpent: 9999, status: "active", registeredAt: "2026-01-25", lastActive: "2026-05-25" },
    { id: "c_7", name: "Rohit Mehta", phone: "+919876543216", email: "rohit.m@gmail.com", gender: "Male", city: "Mumbai", orderCount: 1, totalSpent: 1299, status: "suspended", registeredAt: "2026-04-10", lastActive: "2026-04-10" },
    { id: "c_8", name: "Kavita Nair", phone: "+919876543217", email: "kavita.n@gmail.com", gender: "Female", city: "Delhi", orderCount: 7, totalSpent: 21500, status: "active", registeredAt: "2025-10-15", lastActive: "2026-06-01" },
  ];
}

/* ─── ORDERS ─── */
export function generateMockAdminOrders(): AdminOrder[] {
  return [
    { id: "ao_1", orderId: "NB-2894", customerName: "Arun Sharma", customerPhone: "+919876543210", customerEmail: "arun.s@gmail.com", vendorName: "নবME Originals", items: [{ name: "Oversized Fit Tee", quantity: 1, price: 1299 }], total: 1299, status: "delivered", paymentMethod: "UPI", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), shippingAddress: "123, Kalighat Road, Kolkata 700026", note: "" },
    { id: "ao_2", orderId: "NB-2893", customerName: "Priya Patel", customerPhone: "+919876543211", customerEmail: "priya.p@gmail.com", vendorName: "Bengal Bazaar", items: [{ name: "Silk Saree", quantity: 1, price: 8999 }], total: 8999, status: "shipped", paymentMethod: "COD", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), shippingAddress: "45, Park Street, Kolkata 700016", note: "Handle with care" },
    { id: "ao_3", orderId: "NB-2892", customerName: "Rahul Verma", customerPhone: "+919876543212", customerEmail: "rahul.v@gmail.com", vendorName: "Jewel House", items: [{ name: "Gold Chain", quantity: 2, price: 1499 }, { name: "Hoop Earrings", quantity: 1, price: 899 }], total: 3897, status: "confirmed", paymentMethod: "Card", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), shippingAddress: "12, Connaught Place, Delhi 110001", note: "" },
    { id: "ao_4", orderId: "NB-2891", customerName: "Sneha Gupta", customerPhone: "+919876543213", customerEmail: "sneha.g@gmail.com", vendorName: "Tiny Tots", items: [{ name: "Kid's T-Shirt", quantity: 3, price: 699 }], total: 2097, status: "packed", paymentMethod: "UPI", createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), shippingAddress: "56, Rashbehari Avenue, Kolkata 700029", note: "Gift wrap please" },
    { id: "ao_5", orderId: "NB-2890", customerName: "Vikram Singh", customerPhone: "+919876543214", customerEmail: "vikram.s@gmail.com", vendorName: "Urban Sole", items: [{ name: "Running Shoes", quantity: 1, price: 4999 }], total: 4999, status: "pending", paymentMethod: "COD", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), shippingAddress: "200, Brigade Road, Bangalore 560001", note: "" },
    { id: "ao_6", orderId: "NB-2889", customerName: "Ananya Das", customerPhone: "+919876543215", customerEmail: "ananya.d@gmail.com", vendorName: "Kolkata Kouture", items: [{ name: "Leather Belt", quantity: 1, price: 1299 }], total: 1299, status: "cancelled", paymentMethod: "UPI", createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), shippingAddress: "88, Marine Drive, Mumbai 400002", note: "Changed mind" },
    { id: "ao_7", orderId: "NB-2888", customerName: "Kavita Nair", customerPhone: "+919876543217", customerEmail: "kavita.n@gmail.com", vendorName: "নবME Originals", items: [{ name: "Bengal Tiger Hoodie", quantity: 1, price: 2499 }, { name: "Classic Cap", quantity: 2, price: 899 }], total: 4297, status: "shipped", paymentMethod: "Card", createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), shippingAddress: "67, Jayanagar, Bangalore 560011", note: "" },
    { id: "ao_8", orderId: "NB-2887", customerName: "Rohit Mehta", customerPhone: "+919876543216", customerEmail: "rohit.m@gmail.com", vendorName: "Bengal Bazaar", items: [{ name: "Embroidered Jutti", quantity: 1, price: 1799 }], total: 1799, status: "pending", paymentMethod: "WhatsApp", createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), shippingAddress: "15, Sector 18, Noida 201301", note: "" },
  ];
}

/* ─── REVIEWS ─── */
export function generateMockAdminReviews(): AdminReview[] {
  return [
    { id: "ar_1", productName: "Oversized Fit Tee", customerName: "Arun Sharma", customerAvatar: "", rating: 5, comment: "Absolutely love this tee! The quality and fit are exceptional.", reply: "Thank you, Arun! 🙌", status: "visible", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "ar_2", productName: "Bengal Tiger Hoodie", customerName: "Priya Patel", customerAvatar: "", rating: 4, comment: "Great hoodie, warm and stylish. Slightly oversized which I like!", reply: "", status: "visible", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: "ar_3", productName: "Gold Chain Necklace", customerName: "Rahul Verma", customerAvatar: "", rating: 5, comment: "Stunning piece! The gold finish is premium. Got many compliments.", reply: "We're thrilled you loved it! 💛", status: "visible", createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
    { id: "ar_4", productName: "Silk Scarf", customerName: "Sneha Gupta", customerAvatar: "", rating: 2, comment: "The color was different from the picture. Not happy with the purchase.", reply: "", status: "reported", createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
    { id: "ar_5", productName: "Running Shoes", customerName: "Vikram Singh", customerAvatar: "", rating: 4, comment: "Comfortable shoes for daily running. Good value for money.", reply: "", status: "visible", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
    { id: "ar_6", productName: "Denim Jacket", customerName: "Ananya Das", customerAvatar: "", rating: 3, comment: "Decent jacket but the stitching could be better.", reply: "", status: "visible", createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
    { id: "ar_7", productName: "Classic Logo Cap", customerName: "Rohit Mehta", customerAvatar: "", rating: 5, comment: "Best cap I've bought online! Perfect fit and great material.", reply: "Thank you so much! 🔥", status: "visible", createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
    { id: "ar_8", productName: "Kurti Set", customerName: "Kavita Nair", customerAvatar: "", rating: 1, comment: "Very poor quality. The fabric tore after first wash. Avoid!", reply: "", status: "hidden", createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  ];
}

/* ─── COUPONS ─── */
export function generateMockAdminCoupons(): AdminCoupon[] {
  return [
    { id: "cup_1", code: "WELCOME20", type: "percentage", value: 20, minOrder: 999, maxUses: 500, usedCount: 342, expiresAt: "2026-12-31", isActive: true, description: "20% off for new customers" },
    { id: "cup_2", code: "FREESHIP", type: "free_shipping", value: 0, minOrder: 1499, maxUses: 1000, usedCount: 456, expiresAt: "2026-12-31", isActive: true, description: "Free shipping on orders above ₹1,499" },
    { id: "cup_3", code: "NABOME50", type: "flat", value: 500, minOrder: 2499, maxUses: 200, usedCount: 89, expiresAt: "2026-08-31", isActive: true, description: "₹500 off on orders above ₹2,499" },
    { id: "cup_4", code: "FESTIVE15", type: "percentage", value: 15, minOrder: 1999, maxUses: 300, usedCount: 156, expiresAt: "2026-07-15", isActive: true, description: "15% off festive special" },
    { id: "cup_5", code: "SUMMER100", type: "flat", value: 100, minOrder: 499, maxUses: 500, usedCount: 22, expiresAt: "2026-06-30", isActive: false, description: "₹100 off summer collection" },
  ];
}

/* ─── BANNERS ─── */
export function generateMockAdminBanners(): AdminBanner[] {
  return [
    { id: "ban_1", title: "Summer Collection 2026", subtitle: "Explore the latest drops — light fabrics, bold colors.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800", link: "/category?summer", position: "hero", isActive: true, createdAt: "2026-05-01" },
    { id: "ban_2", title: "Flash Sale — Up to 40% Off", subtitle: "Limited time offer on premium streetwear.", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800", link: "/category?sale", position: "promo", isActive: true, createdAt: "2026-05-15" },
    { id: "ban_3", title: "New Vendor Spotlight", subtitle: "Discover handpicked collections from our newest vendors.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800", link: "/category?new", position: "featured", isActive: true, createdAt: "2026-05-20" },
    { id: "ban_4", title: "Monsoon Ready", subtitle: "Stay stylish this rainy season.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800", link: "/category?monsoon", position: "hero", isActive: false, createdAt: "2026-04-01" },
  ];
}

/* ─── NOTIFICATIONS ─── */
export function generateMockAdminNotifications(): AdminNotification[] {
  return [
    { id: "an_1", title: "System Update", message: "Platform maintenance completed successfully. All services are running normally.", type: "system", audience: "all_vendors", sentAt: new Date(Date.now() - 1 * 86400000).toISOString(), readCount: 28 },
    { id: "an_2", title: "Flash Sale Alert!", message: "Get ready for the summer flash sale starting tomorrow with up to 40% off!", type: "offer", audience: "all_customers", sentAt: new Date(Date.now() - 2 * 86400000).toISOString(), readCount: 892 },
    { id: "an_3", title: "Vendor Approved", message: "Your shop has been approved and is now live on নবME.", type: "system", audience: "single_vendor", recipientName: "Desi Threads", sentAt: new Date(Date.now() - 3 * 86400000).toISOString(), readCount: 1 },
    { id: "an_4", title: "New Order Received", message: "You have a new order NB-2890. Please process it at the earliest.", type: "order", audience: "single_vendor", recipientName: "Urban Sole", sentAt: new Date(Date.now() - 5 * 86400000).toISOString(), readCount: 1 },
    { id: "an_5", title: "Account Alert", message: "Your account password was changed successfully on 28 May 2026.", type: "alert", audience: "single_customer", recipientName: "Arun Sharma", sentAt: new Date(Date.now() - 7 * 86400000).toISOString(), readCount: 1 },
  ];
}

/* ─── REPORTS ─── */
export function generateMockAdminReports(): AdminReport[] {
  return [
    { id: "r_1", type: "revenue", title: "Revenue Report", period: "Last 12 months", data: [{ label: "Jan", value: 285000 }, { label: "Feb", value: 312000 }, { label: "Mar", value: 358000 }, { label: "Apr", value: 325000 }, { label: "May", value: 389000 }, { label: "Jun", value: 412000 }, { label: "Jul", value: 398000 }, { label: "Aug", value: 445000 }, { label: "Sep", value: 468000 }, { label: "Oct", value: 482000 }, { label: "Nov", value: 495000 }, { label: "Dec", value: 520000 }], total: 4589200, growth: 22.8 },
    { id: "r_2", type: "orders", title: "Order Report", period: "Last 12 months", data: [{ label: "Jan", value: 185 }, { label: "Feb", value: 210 }, { label: "Mar", value: 235 }, { label: "Apr", value: 220 }, { label: "May", value: 258 }, { label: "Jun", value: 275 }, { label: "Jul", value: 268 }, { label: "Aug", value: 290 }, { label: "Sep", value: 305 }, { label: "Oct", value: 318 }, { label: "Nov", value: 325 }, { label: "Dec", value: 340 }], total: 2894, growth: 16.3 },
    { id: "r_3", type: "vendors", title: "Vendor Report", period: "Last 12 months", data: [{ label: "Jan", value: 18 }, { label: "Feb", value: 20 }, { label: "Mar", value: 22 }, { label: "Apr", value: 23 }, { label: "May", value: 25 }, { label: "Jun", value: 26 }, { label: "Jul", value: 28 }, { label: "Aug", value: 29 }, { label: "Sep", value: 31 }, { label: "Oct", value: 33 }, { label: "Nov", value: 34 }, { label: "Dec", value: 36 }], total: 36, growth: 8.5 },
    { id: "r_4", type: "customers", title: "Customer Report", period: "Last 12 months", data: [{ label: "Jan", value: 520 }, { label: "Feb", value: 580 }, { label: "Mar", value: 620 }, { label: "Apr", value: 680 }, { label: "May", value: 720 }, { label: "Jun", value: 780 }, { label: "Jul", value: 820 }, { label: "Aug", value: 880 }, { label: "Sep", value: 950 }, { label: "Oct", value: 1020 }, { label: "Nov", value: 1120 }, { label: "Dec", value: 1248 }], total: 1248, growth: 14.2 },
    { id: "r_5", type: "products", title: "Product Report", period: "Current", data: [{ label: "Published", value: 320 }, { label: "Pending", value: 18 }, { label: "Draft", value: 65 }, { label: "Rejected", value: 28 }, { label: "Deleted", value: 27 }], total: 458, growth: 0 },
  ];
}

/* ─── SETTINGS ─── */
export function generateMockSiteSettings(): AdminSiteSettings {
  return {
    brandName: "নবME",
    logo: "",
    favicon: "",
    contactEmail: "hello@nabme.online",
    contactPhone: "+919163854706",
    supportEmail: "support@nabme.online",
    address: "123, Kalighat Road, Kolkata, West Bengal 700026",
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/nabme.online" },
      { platform: "Facebook", url: "https://facebook.com/nabme.online" },
      { platform: "Twitter", url: "https://twitter.com/nabme_online" },
    ],
    footerText: "© 2026 নবME. All rights reserved.",
    footerDescription: "Premium streetwear inspired by Bengali heritage.",
    seoTitle: "নবME — Premium Streetwear Inspired by Bengali Heritage",
    seoDescription: "Discover premium streetwear that fuses traditional Bengali motifs with modern silhouettes. Shop the latest drops at নবME.",
    seoKeywords: "streetwear, bengali fashion, premium clothing, india streetwear, nabme",
    currency: "INR",
    taxRate: 18,
    shippingCharge: 99,
    freeShippingAbove: 1499,
  };
}

/* ─── LOGS ─── */
export function generateMockAdminLogs(): AdminLog[] {
  return [
    { id: "log_1", action: "Vendor Approved", type: "vendor_approval", performedBy: "Super Admin", targetName: "Street Culture", details: "Shop application approved after document verification.", createdAt: new Date(Date.now() - 0.5 * 86400000).toISOString() },
    { id: "log_2", action: "Product Approved", type: "product_approval", performedBy: "Super Admin", targetName: "Oversized Fit Tee", details: "Product published on marketplace.", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "log_3", action: "Order Status Updated", type: "order_update", performedBy: "System", targetName: "NB-2890", details: "Order status changed from pending to confirmed.", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "log_4", action: "Vendor Rejected", type: "vendor_rejection", performedBy: "Super Admin", targetName: "Sportify Wear", details: "Application rejected — insufficient documentation provided.", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: "log_5", action: "Product Rejected", type: "product_rejection", performedBy: "Super Admin", targetName: "Summer Tank Top", details: "Product images do not meet quality standards.", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: "log_6", action: "Banner Updated", type: "admin_action", performedBy: "Super Admin", targetName: "Summer Collection", details: "Hero banner updated with new creative.", createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: "log_7", action: "Customer Suspended", type: "customer_action", performedBy: "Super Admin", targetName: "Sneha Gupta", details: "Account suspended due to fraudulent activity.", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: "log_8", action: "Coupon Created", type: "admin_action", performedBy: "Super Admin", targetName: "FESTIVE15", details: "New coupon code created: FESTIVE15 (15% off).", createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: "log_9", action: "Product Restored", type: "product_approval", performedBy: "Super Admin", targetName: "Old Collection Tee", details: "Product restored from trash.", createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
    { id: "log_10", action: "Permanent Delete", type: "admin_action", performedBy: "Super Admin", targetName: "Sample Product", details: "Product permanently deleted after vendor request.", createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  ];
}
