import { useAuthStore } from "../../stores/auth-store";

function getUserKey(): string {
  try {
    const user = useAuthStore.getState().user;
    return user?.id ?? "guest";
  } catch {
    return "guest";
  }
}

function userKey(base: string): string {
  return `${base}-${getUserKey()}`;
}

export function getRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(userKey("nabome-recently-viewed")) || "[]");
  } catch {
    return [];
  }
}

export function addRecentlyViewed(slug: string) {
  const items = getRecentlyViewed().filter((s) => s !== slug);
  items.unshift(slug);
  localStorage.setItem(userKey("nabome-recently-viewed"), JSON.stringify(items.slice(0, 20)));
}

export function clearRecentlyViewed() {
  localStorage.removeItem(userKey("nabome-recently-viewed"));
}
