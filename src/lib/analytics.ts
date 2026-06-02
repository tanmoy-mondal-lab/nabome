const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const isEnabled = typeof window !== "undefined" && !!GA_ID;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventParams = Record<string, any>;

function send(eventName: string, params?: EventParams) {
  if (!isEnabled) return;
  try {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, params);
    }
  } catch {
    /* analytics silently fail */
  }
}

export const analytics = {
  pageView(path: string, title?: string) {
    send("page_view", { page_path: path, page_title: title });
  },

  viewProduct(productId: string | number, productName: string, category?: string, price?: number) {
    send("view_item", {
      currency: "INR",
      value: price,
      items: [{ item_id: String(productId), item_name: productName, item_category: category, price }],
    });
  },

  viewCategory(categoryName: string) {
    send("view_item_list", { item_list_name: categoryName, item_category: categoryName });
  },

  addToCart(productId: string | number, productName: string, price: number, quantity: number) {
    send("add_to_cart", {
      currency: "INR",
      value: price * quantity,
      items: [{ item_id: String(productId), item_name: productName, price, quantity }],
    });
  },

  removeFromCart(productId: string | number, productName: string, price: number) {
    send("remove_from_cart", {
      currency: "INR",
      value: price,
      items: [{ item_id: String(productId), item_name: productName, price }],
    });
  },

  addToWishlist(productId: string | number, productName: string) {
    send("add_to_wishlist", {
      currency: "INR",
      value: 0,
      items: [{ item_id: String(productId), item_name: productName }],
    });
  },

  beginCheckout(cartValue: number, items: { id: string | number; name: string; price: number; quantity: number }[]) {
    send("begin_checkout", {
      currency: "INR",
      value: cartValue,
      items: items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity })),
    });
  },

  purchase(orderId: string, revenue: number, items: { id: string | number; name: string; price: number; quantity: number }[]) {
    send("purchase", {
      transaction_id: orderId,
      currency: "INR",
      value: revenue,
      items: items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity })),
    });
  },

  register(method: "customer" | "vendor") {
    send("sign_up", { method });
  },

  login(method: "email" | "phone") {
    send("login", { method });
  },

  search(searchTerm: string, resultsCount: number) {
    send("search", { search_term: searchTerm, results_count: resultsCount });
  },

  share(contentType: string, contentId: string | number) {
    send("share", { content_type: contentType, item_id: String(contentId) });
  },

  exception(description: string, fatal = false) {
    send("exception", { description, fatal });
  },

  event(name: string, params?: EventParams) {
    send(name, params);
  },
};
