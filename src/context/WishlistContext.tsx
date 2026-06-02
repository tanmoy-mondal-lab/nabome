import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
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
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id || null;
      setUserId(uid);
      if (uid) {
        wishlistApi.getWishlist(uid).then((items) => {
          if (isMounted.current) setWishlist(items);
        }).catch(() => {
          if (isMounted.current) wishlistApi.getWishlist().then((items) => setWishlist(items));
        });
      } else {
        wishlistApi.getWishlist().then((items) => {
          if (isMounted.current) setWishlist(items);
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      const prev = userId;
      if (uid && !prev) {
        wishlistApi.getWishlist().then((local) => {
          wishlistApi.mergeWishlist(uid, local).then(() => {
            wishlistApi.getWishlist(uid).then((items) => {
              if (isMounted.current) setWishlist(items);
            });
          });
        });
      } else if (!uid && prev) {
        wishlistApi.getWishlist().then((items) => {
          if (isMounted.current) setWishlist(items);
        });
      }
      setUserId(uid);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const addToWishlist = useCallback((product: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      const next = [...prev, product];
      wishlistApi.addToWishlist(userId, product);
      return next;
    });
    analytics.addToWishlist(product.id, product.name);
  }, [userId]);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlist((prev) => {
      const next = prev.filter((item) => item.id !== id);
      wishlistApi.removeFromWishlist(userId, id);
      return next;
    });
  }, [userId]);

  const isInWishlist = useCallback((id: number): boolean => {
    return wishlist.some((item) => item.id === id);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
