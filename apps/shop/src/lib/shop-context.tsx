import { createContext, useContext, useEffect, useState } from 'react';
export interface ShopContextShop {
  id: string;
  name: string;
  slug: string;
  role: string;
  membershipStatus: string;
}
interface ShopContextValue {
  shops: ShopContextShop[];
  activeShop: ShopContextShop | null;
  activeShopId: string | null;
  setActiveShopId: (id: string) => void;
  loading: boolean;
}
const ShopContext = createContext<ShopContextValue>({
  shops: [],
  activeShop: null,
  activeShopId: null,
  setActiveShopId: () => {},
  loading: true,
});
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [shops, setShops] = useState<ShopContextShop[]>([]);
  const [activeShopId, setActiveShopIdState] = useState<string | null>(() =>
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('activeShopId')
      : null,
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/v1/shops', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        const s = j.shops ?? j.data?.shops ?? [];
        setShops(s);
        if (s.length && !activeShopId) setActiveShopIdState(s[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (activeShopId) localStorage.setItem('activeShopId', activeShopId);
  }, [activeShopId]);
  const setActiveShopId = (id: string) => {
    const found = shops.find((s) => s.id === id);
    if (!found) return;
    setActiveShopIdState(id);
  };
  const activeShop =
    shops.find((s) => s.id === activeShopId) ?? shops[0] ?? null;
  return (
    <ShopContext.Provider
      value={{
        shops,
        activeShop,
        activeShopId: activeShop?.id ?? null,
        setActiveShopId,
        loading,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}
export const useShopContext = () => useContext(ShopContext);
