export const SITE_NAME = "নবME";
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
export const COMMON_COLORS = [
  { hex: "#000000", name: "Black" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#808080", name: "Grey" },
  { hex: "#8B4513", name: "Brown" },
  { hex: "#0000FF", name: "Blue" },
  { hex: "#FF0000", name: "Red" },
  { hex: "#008000", name: "Green" },
  { hex: "#FFC0CB", name: "Pink" },
  { hex: "#FFA500", name: "Orange" },
  { hex: "#800080", name: "Purple" },
  { hex: "#FFD700", name: "Gold" },
  { hex: "#C0C0C0", name: "Silver" },
  { hex: "#FFFF00", name: "Yellow" },
  { hex: "#00FFFF", name: "Teal" },
  { hex: "#000080", name: "Navy" },
] as const;
export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const REVIEWS_PER_PAGE = 3;
export const RECENTLY_VIEWED_MAX = 20;
export const CACHE_TTL = { short: 60_000, medium: 300_000, long: 600_000, stale: 3_600_000 };
export const PAGINATION = { defaultPageSize: 12, adminPageSize: 25, maxPageSize: 100 };
export const TIMEOUT = { dbQuery: 5_000, apiRequest: 10_000, upload: 30_000 };
export const RETURN_REASONS = [
  { value: "wrong_item", label: "Wrong item received" },
  { value: "damaged_product", label: "Product damaged or defective" },
  { value: "size_issue", label: "Size/fit issue" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed mind / no longer needed" },
  { value: "other", label: "Other" },
] as const;
