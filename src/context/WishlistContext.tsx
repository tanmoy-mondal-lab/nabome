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

function getUserId(): string | null {
  try {
    const raw = localStorage.getItem("nabome-current-user");
    if (raw) return JSON.parse(raw).id || null;
    return null;
  } catch {
    return null;
  }
}

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

  useEffect(() => {
    localStorage.setItem(
      "nabome-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

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

    const userId = getUserId();
    if (userId && supabase) {
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

    const userId = getUserId();
    if (userId && supabase) {
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
