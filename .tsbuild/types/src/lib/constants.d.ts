export declare const SITE_NAME = "\u09A8\u09ACME";
export declare const SITE_DESCRIPTION = "Premium Fashion Destination";
export declare const CURRENCY = "INR";
export declare const DEFAULT_COUNTRY = "India";
export declare const ITEMS_PER_PAGE = 12;
export declare const ITEMS_PER_PAGE_ADMIN = 25;
export declare const FREE_SHIPPING_THRESHOLD = 999;
export declare const ORDER_PREFIX = "NB";
export declare const ORDER_STATUS_FLOW: Record<string, string[]>;
export declare const ORDER_STATUS_COLORS: Record<string, string>;
export declare const PAYMENT_STATUS_COLORS: Record<string, string>;
export declare const GENDERS: readonly ["men", "women", "unisex"];
export declare const SIZES: readonly ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
export declare const COMMON_COLORS: readonly [{
    readonly hex: "#000000";
    readonly name: "Black";
}, {
    readonly hex: "#FFFFFF";
    readonly name: "White";
}, {
    readonly hex: "#808080";
    readonly name: "Grey";
}, {
    readonly hex: "#8B4513";
    readonly name: "Brown";
}, {
    readonly hex: "#0000FF";
    readonly name: "Blue";
}, {
    readonly hex: "#FF0000";
    readonly name: "Red";
}, {
    readonly hex: "#008000";
    readonly name: "Green";
}, {
    readonly hex: "#FFC0CB";
    readonly name: "Pink";
}, {
    readonly hex: "#FFA500";
    readonly name: "Orange";
}, {
    readonly hex: "#800080";
    readonly name: "Purple";
}, {
    readonly hex: "#FFD700";
    readonly name: "Gold";
}, {
    readonly hex: "#C0C0C0";
    readonly name: "Silver";
}, {
    readonly hex: "#FFFF00";
    readonly name: "Yellow";
}, {
    readonly hex: "#00FFFF";
    readonly name: "Teal";
}, {
    readonly hex: "#000080";
    readonly name: "Navy";
}];
export declare const UPLOAD_MAX_SIZE: number;
export declare const ALLOWED_IMAGE_TYPES: string[];
export declare const REVIEWS_PER_PAGE = 3;
export declare const RECENTLY_VIEWED_MAX = 20;
export declare const CACHE_TTL: {
    short: number;
    medium: number;
    long: number;
    stale: number;
};
export declare const PAGINATION: {
    defaultPageSize: number;
    adminPageSize: number;
    maxPageSize: number;
};
export declare const TIMEOUT: {
    dbQuery: number;
    apiRequest: number;
    upload: number;
};
export declare const RETURN_REASONS: readonly [{
    readonly value: "wrong_item";
    readonly label: "Wrong item received";
}, {
    readonly value: "damaged_product";
    readonly label: "Product damaged or defective";
}, {
    readonly value: "size_issue";
    readonly label: "Size/fit issue";
}, {
    readonly value: "quality_issue";
    readonly label: "Quality issue";
}, {
    readonly value: "not_as_described";
    readonly label: "Not as described";
}, {
    readonly value: "changed_mind";
    readonly label: "Changed mind / no longer needed";
}, {
    readonly value: "other";
    readonly label: "Other";
}];
