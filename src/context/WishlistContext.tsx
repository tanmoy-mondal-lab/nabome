import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
  };

  const removeFromWishlist = (
    id: number
  ) => {
    setWishlist(
      wishlist.filter(
        (item) => item.id !== id
      )
    );
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
