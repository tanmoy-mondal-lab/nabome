import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { analytics } from "../lib/analytics";
import { supabase } from "../lib/supabase";
import * as wishlistApi from "../lib/api/wishlist";

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (
    product: WishlistItem
  ) => void;
  removeFromWishlist: (
    id: number
  ) => void;
  isInWishlist: (
    id: number
  ) => boolean;
}

const WishlistContext =
  createContext<WishlistContextType | null>(
    null
  );

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wishlist, setWishlist] =
    useState<WishlistItem[]>(() => {
      const saved =
        localStorage.getItem(
          "nabome-wishlist"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "nabome-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const addToWishlist = (
    product: WishlistItem
  ) => {
    if (
      !wishlist.find(
        (item) =>
          item.id === product.id
      )
    ) {
      setWishlist([
        ...wishlist,
        product,
      ]);
    }
    analytics.addToWishlist(product.id, product.name);

    if (userId) {
      wishlistApi.addToWishlist(userId, String(product.id)).catch(() => {});
    }
  };

  const removeFromWishlist = (
    id: number
  ) => {
    setWishlist(
      wishlist.filter(
        (item) => item.id !== id
      )
    );

    if (userId) {
      wishlistApi.removeFromWishlist(userId, String(id)).catch(() => {});
    }
  };

  const isInWishlist = (
    id: number
  ) => {
    return wishlist.some(
      (item) => item.id === id
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context =
    useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}
