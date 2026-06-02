import type {
  OrderStatus, OrderItem, OrderAddress, ReturnRequest,
  ReturnReason, InvoiceData, OrderTimelineEntry,
  OrderAnalyticsSummary, OrderNotification, SupportTicket,
  FAQItem, CouponRedemption, PaymentMethod,
} from "../types/order";

const vendorShops = [
  "নবME Originals", "Bengal Streetwear", "Kolkata Collective",
  "Urban Ethnik", "Heritage Threads", "Modern Bengal",
  "Street Culture India", "Ethnic Fusion", "Premium Basics",
];

const productNames = [
  "Signature Oversized Tee", "Bengal Typography Tee", "Urban Essentials Hoodie",
  "Creator Club Tee", "Minimal Logo Sweatshirt", "Essential Joggers",
  "Floral Maxi Dress", "Printed T-Shirt Set", "Premium Sneakers",
  "Premium Dad Cap", "Tote Bag", "Gold Chain Necklace",
  "Banarasi Saree", "Performance Tee", "Puffer Jacket",
];

const image = "/images/products/product1.jpeg";

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }

function uid() { return `ord_${Date.now()}_${rand(100, 999)}`; }
function oid() { return `NAB-${String(Date.now()).slice(-6)}${String(rand(10, 99))}`; }

export function generateOrderItem(vendorId?: string): OrderItem {
  return {
    id: `oi_${uid()}`,
    productId: `prod_${rand(100, 999)}`,
    productName: pick(productNames),
    productImage: image,
    vendorId: vendorId || `v_${rand(100, 999)}`,
    vendorName: pick(["Rahul Sharma", "Ananya Das", "Arjun Roy", "Priya Banerjee"]),
    vendorShop: pick(vendorShops),
    quantity: rand(1, 3),
    price: rand(399, 2999),
    originalPrice: rand(499, 3999),
    size: pick(["S", "M", "L", "XL"]),
    color: pick(["Black", "White", "Navy", "Olive", "Charcoal"]),
    sku: `SKU-${rand(10000, 99999)}`,
  };
}

export function generateOrderItems(vendorIds?: string[], count = rand(1, 4)): OrderItem[] {
  return Array.from({ length: count }, () => generateOrderItem(vendorIds ? pick(vendorIds) : undefined));
}

export function generateAddress(): OrderAddress {
  return {
    name: pick(["Rahul Sharma", "Ananya Das", "Arjun Roy", "Priya Banerjee", "Sneha Roy", "Amit Kumar"]),
    phone: `+9198${rand(10000000, 99999999)}`,
    email: pick(["customer@email.com", "user@domain.com", "buyer@nabome.in"]),
    address: `${rand(1, 999)}, ${pick(["Park Street", "College Road", "MG Road", "Salt Lake Sector V", "Rashbehari Avenue"])}`,
    district: pick(["Kolkata", "North 24 Parganas", "South 24 Parganas", "Howrah"]),
    city: pick(["Kolkata", "Salt Lake", "New Town", "Dumdum"]),
    state: "West Bengal",
    pincode: String(rand(700001, 700160)),
    landmark: pick(["Near City Mall", "Opposite Metro Station", "Beside Park", ""]),
    label: pick(["Home", "Work", "Other"]),
  };
}

export function generateMockOrders(count = 8): ReturnType<typeof generateSingleOrder>[] {
  return Array.from({ length: count }, () => generateSingleOrder());
}

export function generateSingleOrder() {
  const id = uid();
  const orderId = oid();
  const items = generateOrderItems(undefined, rand(1, 3));
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const statuses: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];
  const status = pick(statuses);
  const paymentMethods: PaymentMethod[] = ["cod", "whatsapp", "upi"];
  const paymentMethod = pick(paymentMethods);
  const now = Date.now();
  const createdOffset = rand(1, 30) * 86400000;
  const created = new Date(now - createdOffset).toISOString();
  const estimatedDelivery = new Date(now + rand(2, 7) * 86400000).toISOString();

  return {
    id,
    orderId,
    invoiceNo: `INV-${orderId}`,
    customerId: `cust_${rand(100, 999)}`,
    customerName: pick(["Rahul Sharma", "Ananya Das", "Arjun Roy", "Priya Banerjee", "Sneha Roy", "Amit Kumar", "Ravi Malhotra", "Pooja Singh"]),
    customerPhone: `+9198${rand(10000000, 99999999)}`,
    customerEmail: pick(["customer@email.com", "user@domain.com", "buyer@nabome.in"]),
    items,
    subtotal: total,
    discount: rand(0, 200),
    couponDiscount: 0,
    shipping: total > 999 ? 0 : 99,
    tax: Math.round(total * 0.05),
    total: total + (total > 999 ? 0 : 99) + Math.round(total * 0.05),
    status,
    paymentMethod,
    paymentStatus: pick(["pending", "paid", "failed"]) as "pending" | "paid" | "failed",
    shippingAddress: generateAddress(),
    billingAddress: generateAddress(),
    trackingNumber: status === "shipped" || status === "out_for_delivery" || status === "delivered" ? `NB${rand(100000000, 999999999)}` : undefined,
    courierName: status === "shipped" || status === "out_for_delivery" || status === "delivered" ? pick(["Delhivery", "Blue Dart", "DTDC", "India Post", "Ekart"]) : undefined,
    estimatedDelivery,
    createdAt: created,
    updatedAt: created,
    note: rand(0, 1) ? pick(["Handle with care", "Gift wrap please", "Leave at door if absent", "Ring bell twice"]) : "",
    vendorId: items[0]?.vendorId || "v_1",
    vendorName: items[0]?.vendorName || "Vendor",
    vendorShop: items[0]?.vendorShop || "Shop",
    returnRequest: null as ReturnRequest | null,
    timeline: generateTimeline(status, created),
  };
}

function generateTimeline(status: OrderStatus, createdDate: string): OrderTimelineEntry[] {
  const base = new Date(createdDate).getTime();
  const steps: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];
  const statusIndex = steps.indexOf(status);
  const isCancelled = status === "cancelled";

  const timeline: OrderTimelineEntry[] = [
    { status: "pending", label: "Order Placed", date: createdDate, completed: true },
  ];

  steps.slice(1).forEach((s, i) => {
    const idx = i + 1;
    const completed = !isCancelled && idx <= statusIndex;
    timeline.push({
      status: s,
      label: s === "out_for_delivery" ? "Out for Delivery" : s.charAt(0).toUpperCase() + s.slice(1),
      date: completed ? new Date(base + idx * 86400000).toISOString() : null,
      completed,
    });
  });

  if (isCancelled && statusIndex <= 2) {
    timeline.push({
      status: "cancelled", label: "Cancelled", date: new Date(base + 1 * 86400000).toISOString(), completed: true,
    });
  }

  return timeline;
}

export function generateReturnRequest(orderItemId: string): ReturnRequest {
  const reasons: ReturnReason[] = ["wrong_product", "damaged", "size_issue", "quality_issue", "other"];
  const statuses: ReturnRequest["status"][] = ["requested", "vendor_review", "admin_review", "approved", "rejected", "return_completed", "refund_completed"];
  const now = Date.now();

  return {
    id: `ret_${uid()}`,
    orderId: oid(),
    orderItemId,
    reason: pick(reasons),
    reasonText: "The product did not match my expectations.",
    images: rand(0, 1) ? [image] : [],
    status: pick(statuses),
    requestedAt: new Date(now - rand(1, 7) * 86400000).toISOString(),
    vendorReviewedAt: new Date(now - rand(0, 3) * 86400000).toISOString(),
    adminReviewedAt: new Date(now - rand(0, 1) * 86400000).toISOString(),
    vendorNote: "Return request is under review.",
    adminNote: "Approved for return. Please ship back.",
    vendorDecision: pick(["approve", "reject"]),
    adminDecision: "approve",
    refundAmount: rand(200, 2000),
    refundMethod: "Original Payment Method",
    refundProcessedAt: new Date(now).toISOString(),
  };
}

export function generateInvoice(orderId: string): InvoiceData {
  const items = generateOrderItems(undefined, rand(1, 3));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const taxRate = 5;
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + shipping + tax;

  return {
    invoiceNo: `INV-${orderId}`,
    orderNo: orderId,
    orderDate: new Date(Date.now() - rand(1, 30) * 86400000).toISOString(),
    invoiceDate: new Date().toISOString(),
    customer: generateAddress(),
    vendor: {
      name: pick(["Rahul Sharma", "Ananya Das", "Arjun Roy"]),
      shop: pick(vendorShops),
      address: "123, Fashion Street, Kolkata - 700001",
      phone: "+919831456789",
      email: pick(["vendor@nabome.in", "shop@streetwear.in"]),
    },
    items,
    subtotal,
    discount: rand(0, 200),
    couponDiscount: 0,
    shipping,
    tax,
    taxRate,
    total,
    paymentMethod: pick(["UPI", "Cash on Delivery", "WhatsApp Order"]),
    paymentStatus: pick(["Paid", "Pending"]),
    estimatedDelivery: new Date(Date.now() + rand(2, 7) * 86400000).toISOString(),
    notes: "Thank you for shopping with নবME!",
  };
}

export function generateOrderAnalyticsSummary(): OrderAnalyticsSummary {
  const totalOrders = rand(150, 500);
  const totalRevenue = rand(50000, 500000);
  const statuses: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped", "delivered", "cancelled", "returned", "refunded"];

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue: Math.round(totalRevenue / totalOrders),
    pendingOrders: rand(5, 20),
    processingOrders: rand(10, 30),
    shippedOrders: rand(15, 40),
    deliveredOrders: rand(50, 200),
    cancelledOrders: rand(2, 15),
    returnedOrders: rand(1, 10),
    refundedOrders: rand(1, 8),
    revenueChart: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, i, 1).toISOString().slice(0, 7),
      revenue: rand(10000, 80000),
      orders: rand(10, 50),
    })),
    statusBreakdown: statuses.map((s) => ({
      status: s,
      count: rand(5, 100),
    })),
    topProducts: Array.from({ length: 5 }, (_, i) => ({
      name: productNames[i] || pick(productNames),
      orders: rand(20, 100),
      revenue: rand(10000, 80000),
    })),
    dailyOrders: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
      orders: rand(2, 20),
    })),
  };
}

export function generateMockNotifications(count = 8): OrderNotification[] {
  const types: OrderNotification["type"][] = [
    "order_placed", "order_confirmed", "order_shipped", "order_delivered",
    "order_cancelled", "return_requested", "return_approved", "return_rejected", "refund_completed",
  ];
  return Array.from({ length: count }, () => {
    const type = pick(types);
    return {
      id: `notif_${uid()}`,
      type,
      title: type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      message: `Your order ${oid()} has been ${type.replace("_", " ")}.`,
      orderId: oid(),
      customerId: `cust_${rand(100, 999)}`,
      vendorId: `v_${rand(100, 999)}`,
      read: Math.random() > 0.5,
      createdAt: new Date(Date.now() - rand(0, 48) * 3600000).toISOString(),
    };
  });
}

export function generateMockTickets(count = 4): SupportTicket[] {
  const subjects = [
    "Order not delivered yet",
    "Wrong size received",
    "Payment issue",
    "Return not processed",
    "Product quality concern",
    "Vendor not responding",
    "Shipping address change",
    "Invoice required",
  ];
  return Array.from({ length: count }, () => ({
    id: `ticket_${uid()}`,
    customerId: `cust_${rand(100, 999)}`,
    customerName: pick(["Rahul Sharma", "Ananya Das", "Arjun Roy", "Priya Banerjee"]),
    customerEmail: pick(["customer@email.com", "user@domain.com"]),
    orderId: rand(0, 1) ? oid() : undefined,
    subject: pick(subjects),
    message: "I need assistance with my recent order. Please help me resolve this issue as soon as possible.",
    status: pick(["open", "in_progress", "resolved", "closed"]) as SupportTicket["status"],
    priority: pick(["low", "medium", "high", "urgent"]) as SupportTicket["priority"],
    category: pick(["order", "payment", "return", "product", "vendor", "other"]) as SupportTicket["category"],
    attachments: rand(0, 1) ? [image] : [],
    createdAt: new Date(Date.now() - rand(1, 14) * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - rand(0, 2) * 86400000).toISOString(),
    responses: rand(0, 1) ? [
      {
        id: `resp_${uid()}`,
        author: "Support Team",
        authorRole: "admin",
        message: "Thank you for reaching out. We are looking into your issue and will get back to you shortly.",
        createdAt: new Date(Date.now() - rand(0, 1) * 86400000).toISOString(),
      },
    ] : [],
  }));
}

export function generateMockFAQs(): FAQItem[] {
  return [
    { id: "faq_1", category: "Orders", question: "How do I place an order?", answer: "Browse our collection, add items to your cart, and proceed to checkout. Fill in your delivery details and choose a payment method to complete your order.", order: 1 },
    { id: "faq_2", category: "Orders", question: "Can I modify or cancel my order after placing it?", answer: "Orders can be modified or cancelled within 2 hours of placement, provided they haven't been processed yet. Contact our support team immediately for assistance.", order: 2 },
    { id: "faq_3", category: "Orders", question: "How do I track my order?", answer: "You can track your order from the 'Order Tracking' page using your order number and email address. We also send tracking updates via WhatsApp and email.", order: 3 },
    { id: "faq_4", category: "Shipping", question: "What are your shipping charges?", answer: "We offer free shipping on all orders above ₹999. For orders below ₹999, a flat ₹99 shipping charge applies.", order: 4 },
    { id: "faq_5", category: "Shipping", question: "How long does delivery take?", answer: "Standard delivery takes 3-5 business days across India. Express shipping (₹99) delivers within 1-2 business days.", order: 5 },
    { id: "faq_6", category: "Shipping", question: "Do you ship internationally?", answer: "Currently, we ship only within India. We plan to expand internationally soon. Stay tuned!", order: 6 },
    { id: "faq_7", category: "Returns", question: "What is your return policy?", answer: "We accept returns and exchanges within 7 days of delivery. Items must be unworn, unwashed, and with all tags intact. Initiate a return from your account dashboard.", order: 7 },
    { id: "faq_8", category: "Returns", question: "How do I initiate a return?", answer: "Go to your Orders page, find the order you want to return, click 'Return', select a reason, and submit. Our team will review and guide you through the process.", order: 8 },
    { id: "faq_9", category: "Returns", question: "How long does the refund take?", answer: "Refunds are processed within 5-7 business days after we receive the returned item. The amount is credited back to your original payment method.", order: 9 },
    { id: "faq_10", category: "Payments", question: "What payment methods do you accept?", answer: "We accept Cash on Delivery (COD), UPI (GPay, PhonePe, Paytm), and WhatsApp Order. Card payments and Net Banking coming soon!", order: 10 },
    { id: "faq_11", category: "Payments", question: "Is it safe to pay online?", answer: "Yes! Our payment system uses 256-bit SSL encryption. Your payment details are secure and never stored on our servers.", order: 11 },
    { id: "faq_12", category: "Products", question: "How do I find the right size?", answer: "Check our Size Guide on each product page. We provide detailed measurements for every size. You can also contact our support team for personalized size advice.", order: 12 },
    { id: "faq_13", category: "Products", question: "Are your products genuine?", answer: "All products on নবME are sourced directly from verified vendors. We ensure premium quality and authenticity for every item.", order: 13 },
    { id: "faq_14", category: "Vendor", question: "How do I become a vendor?", answer: "Click on 'Become a Vendor' on our website, fill in your business details, and submit your application. Our team will review and approve within 2-3 business days.", order: 14 },
    { id: "faq_15", category: "Account", question: "How do I reset my password?", answer: "Go to the Login page and click 'Forgot Password'. Enter your registered email or phone number, and we'll send you instructions to reset your password.", order: 15 },
  ];
}

export function validateCoupon(
  code: string,
  subtotal: number,
  vendorId?: string,
): CouponRedemption {
  const mockCoupons: Record<string, { type: "flat" | "percentage" | "free_shipping"; value: number; minOrder: number; maxDiscount?: number; vendorId?: string }> = {
    WELCOME10: { type: "percentage", value: 10, minOrder: 499, maxDiscount: 500 },
    NABOME50: { type: "flat", value: 50, minOrder: 299 },
    FREESHIP: { type: "free_shipping", value: 0, minOrder: 0 },
    SAVE20: { type: "percentage", value: 20, minOrder: 999, maxDiscount: 1000 },
    FLAT200: { type: "flat", value: 200, minOrder: 999 },
    VENDOR10: { type: "percentage", value: 10, minOrder: 0, maxDiscount: 300, vendorId: "v_1" },
  };

  const coupon = mockCoupons[code.toUpperCase()];
  if (!coupon) {
    return { code, type: "flat", value: 0, discount: 0, minOrder: 0, isValid: false, error: "Invalid coupon code" };
  }

  if (subtotal < coupon.minOrder) {
    return { code, type: coupon.type, value: coupon.value, discount: 0, minOrder: coupon.minOrder, isValid: false, error: `Minimum order ₹${coupon.minOrder} required` };
  }

  if (coupon.vendorId && vendorId && coupon.vendorId !== vendorId) {
    return { code, type: coupon.type, value: coupon.value, discount: 0, minOrder: coupon.minOrder, isValid: false, error: "Coupon not valid for this vendor" };
  }

  let discount = 0;
  if (coupon.type === "flat") {
    discount = coupon.value;
  } else if (coupon.type === "percentage") {
    discount = Math.round(subtotal * (coupon.value / 100));
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }

  return {
    code: code.toUpperCase(),
    type: coupon.type,
    value: coupon.value,
    discount,
    minOrder: coupon.minOrder,
    maxDiscount: coupon.maxDiscount,
    isValid: true,
  };
}

export const ORDER_TIMELINE_MAP: Record<string, { status: string; label: string; completed: boolean; date?: string }[]> = {
  pending: [
    { status: "pending", label: "Order Placed", completed: true },
    { status: "confirmed", label: "Confirmed", completed: false },
    { status: "packed", label: "Packed", completed: false },
    { status: "shipped", label: "Shipped", completed: false },
    { status: "delivered", label: "Delivered", completed: false },
  ],
  confirmed: [
    { status: "pending", label: "Order Placed", completed: true, date: "12 May" },
    { status: "confirmed", label: "Confirmed", completed: true, date: "12 May" },
    { status: "packed", label: "Packed", completed: false },
    { status: "shipped", label: "Shipped", completed: false },
    { status: "delivered", label: "Delivered", completed: false },
  ],
  delivered: [
    { status: "pending", label: "Order Placed", completed: true, date: "10 May" },
    { status: "confirmed", label: "Confirmed", completed: true, date: "10 May" },
    { status: "packed", label: "Packed", completed: true, date: "11 May" },
    { status: "shipped", label: "Shipped", completed: true, date: "12 May" },
    { status: "delivered", label: "Delivered", completed: true, date: "14 May" },
  ],
  cancelled: [
    { status: "pending", label: "Order Placed", completed: true, date: "10 May" },
    { status: "cancelled", label: "Cancelled", completed: true, date: "10 May" },
  ],
  returned: [
    { status: "pending", label: "Order Placed", completed: true },
    { status: "confirmed", label: "Confirmed", completed: true },
    { status: "shipped", label: "Shipped", completed: true },
    { status: "delivered", label: "Delivered", completed: true },
    { status: "returned", label: "Return Initiated", completed: true },
  ],
  refunded: [
    { status: "pending", label: "Order Placed", completed: true },
    { status: "confirmed", label: "Confirmed", completed: true },
    { status: "shipped", label: "Shipped", completed: true },
    { status: "delivered", label: "Delivered", completed: true },
    { status: "returned", label: "Return Initiated", completed: true },
    { status: "refunded", label: "Refund Completed", completed: true },
  ],
};
