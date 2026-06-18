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
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: ["refunded"],
  refunded: [],
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const GENDERS = ["men", "women", "unisex"] as const;
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
