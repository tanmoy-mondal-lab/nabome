export const SITE_NAME = "NABOME";
export const SITE_DESCRIPTION = "Premium Fashion Destination";
export const CURRENCY = "INR";
export const DEFAULT_COUNTRY = "India";
export const ITEMS_PER_PAGE = 12;
export const ITEMS_PER_PAGE_ADMIN = 25;
export const FREE_SHIPPING_THRESHOLD = 999;
export const ORDER_PREFIX = "NB";

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: ["refunded"],
  refunded: [],
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  packed: "bg-cyan-100 text-cyan-800",
  shipped: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-rose-100 text-rose-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
  partially_refunded: "bg-orange-100 text-orange-800",
};

export const GENDERS = ["men", "women", "unisex"] as const;
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
