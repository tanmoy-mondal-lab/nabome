// Mock data for customer dashboard — swap with DB calls later.

export type Notification = {
  id: string;
  type: "order" | "offer" | "wishlist" | "vendor" | "account";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type OrderTimeline = {
  status: string;
  label: string;
  date: string;
  completed: boolean;
};

export const ORDER_TIMELINE_MAP: Record<string, OrderTimeline[]> = {
  pending: [
    { status: "pending", label: "Order Placed", date: "", completed: true },
    { status: "confirmed", label: "Confirmed", date: "", completed: false },
    { status: "packed", label: "Packed", date: "", completed: false },
    { status: "shipped", label: "Shipped", date: "", completed: false },
    { status: "delivered", label: "Delivered", date: "", completed: false },
  ],
  confirmed: [
    { status: "pending", label: "Order Placed", date: "", completed: true },
    { status: "confirmed", label: "Confirmed", date: "", completed: true },
    { status: "packed", label: "Packed", date: "", completed: false },
    { status: "shipped", label: "Shipped", date: "", completed: false },
    { status: "delivered", label: "Delivered", date: "", completed: false },
  ],
  packed: [
    { status: "pending", label: "Order Placed", date: "", completed: true },
    { status: "confirmed", label: "Confirmed", date: "", completed: true },
    { status: "packed", label: "Packed", date: "", completed: true },
    { status: "shipped", label: "Shipped", date: "", completed: false },
    { status: "delivered", label: "Delivered", date: "", completed: false },
  ],
  shipped: [
    { status: "pending", label: "Order Placed", date: "", completed: true },
    { status: "confirmed", label: "Confirmed", date: "", completed: true },
    { status: "packed", label: "Packed", date: "", completed: true },
    { status: "shipped", label: "Shipped", date: "", completed: true },
    { status: "delivered", label: "Delivered", date: "", completed: false },
  ],
  delivered: [
    { status: "pending", label: "Order Placed", date: "", completed: true },
    { status: "confirmed", label: "Confirmed", date: "", completed: true },
    { status: "packed", label: "Packed", date: "", completed: true },
    { status: "shipped", label: "Shipped", date: "", completed: true },
    { status: "delivered", label: "Delivered", date: "", completed: true },
  ],
  cancelled: [
    { status: "pending", label: "Order Placed", date: "", completed: true },
    { status: "cancelled", label: "Cancelled", date: "", completed: true },
  ],
};

let notifId = 0;
export function generateMockNotifications(n = 8): Notification[] {
  const types: Notification["type"][] = ["order", "offer", "wishlist", "account", "vendor"];
  const templates: Record<Notification["type"], { title: string; message: string }[]> = {
    order: [
      { title: "Order Confirmed", message: "Your order #NB-2024-001 has been confirmed and is being processed." },
      { title: "Order Shipped", message: "Your package is on its way! Track your delivery in real-time." },
      { title: "Delivered", message: "Your order has been delivered. Rate your experience!" },
    ],
    offer: [
      { title: "Flash Sale", message: "24-hour flash sale — up to 40% off on select premium tees." },
      { title: "New Drop Alert", message: "The summer collection just landed. Be the first to style it." },
    ],
    wishlist: [
      { title: "Back in Stock", message: "An item in your wishlist is back in stock. Grab it before it sells out!" },
      { title: "Price Drop", message: "A wishlist item just got a price drop. Check it out now." },
    ],
    vendor: [
      { title: "Vendor Update", message: "Your favourite vendor just added new products to their store." },
    ],
    account: [
      { title: "Login Alert", message: "New login to your account from an unrecognized device." },
      { title: "Profile Updated", message: "Your profile information was successfully updated." },
    ],
  };

  const result: Notification[] = [];
  for (let i = 0; i < n; i++) {
    const type = types[i % types.length];
    const tmpl = templates[type][i % templates[type].length];
    notifId++;
    const daysAgo = Math.floor(Math.random() * 14);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    result.push({
      id: `notif_${notifId}`,
      type,
      title: tmpl.title,
      message: tmpl.message,
      read: i > 3,
      createdAt: d.toISOString(),
    });
  }
  return result;
}

export interface AccountOrder {
  id: string;
  billNo: string;
  date: string;
  status: string;
  paymentMethod: string;
  total: number;
  items: { name: string; image: string; price: number; quantity: number; vendor: string }[];
  shippingAddress: {
    name: string; phone: string; address: string; city: string; state: string; pincode: string;
  };
}

export function generateMockOrders(): AccountOrder[] {
  return [
    {
      id: "ord_1", billNo: "NB-2026-001",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: "shipped", paymentMethod: "UPI", total: 2598,
      items: [
        { name: "Oversized Fit Tee — Charcoal", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", price: 1299, quantity: 1, vendor: "নবME Originals" },
        { name: "Bengal Tiger Hoodie", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", price: 1299, quantity: 1, vendor: "নবME Originals" },
      ],
      shippingAddress: { name: "Tanmoy Mondal", phone: "+919163854706", address: "123, Kalighat Road", city: "Kolkata", state: "West Bengal", pincode: "700026" },
    },
    {
      id: "ord_2", billNo: "NB-2026-002",
      date: new Date(Date.now() - 10 * 86400000).toISOString(),
      status: "delivered", paymentMethod: "WhatsApp", total: 1799,
      items: [
        { name: "Classic Logo Cap", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400", price: 899, quantity: 1, vendor: "নবME Originals" },
        { name: "Gold Chain Necklace", image: "https://images.unsplash.com/photo-1603975217912-1c8f3e63bb89?w=400", price: 900, quantity: 1, vendor: "নবME Accessories" },
      ],
      shippingAddress: { name: "Tanmoy Mondal", phone: "+919163854706", address: "123, Kalighat Road", city: "Kolkata", state: "West Bengal", pincode: "700026" },
    },
    {
      id: "ord_3", billNo: "NB-2026-003",
      date: new Date(Date.now() - 25 * 86400000).toISOString(),
      status: "cancelled", paymentMethod: "UPI", total: 1299,
      items: [
        { name: "Limited Edition Drop Tee", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400", price: 1299, quantity: 1, vendor: "নবME Originals" },
      ],
      shippingAddress: { name: "Tanmoy Mondal", phone: "+919163854706", address: "123, Kalighat Road", city: "Kolkata", state: "West Bengal", pincode: "700026" },
    },
  ];
}
