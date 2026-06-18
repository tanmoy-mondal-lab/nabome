export function getRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem("nabome-recently-viewed") || "[]");
  } catch {
    return [];
  }
}

export function addRecentlyViewed(slug: string) {
  const items = getRecentlyViewed().filter((s) => s !== slug);
  items.unshift(slug);
  localStorage.setItem("nabome-recently-viewed", JSON.stringify(items.slice(0, 20)));
}

export function clearRecentlyViewed() {
  localStorage.removeItem("nabome-recently-viewed");
}
