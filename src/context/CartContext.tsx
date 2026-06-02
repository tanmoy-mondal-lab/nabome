import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import type { Product } from "../data/products";
import { analytics } from "../lib/analytics";
import { supabase } from "../lib/supabase";
import * as cartApi from "../lib/api/cart";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  variantId?: string;
}

type CartInput = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  selectedSize?: string;
  selectedColor?: string;
  variantId?: string;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product | CartInput) => void;
  removeItem: (id: number, variantId?: string) => void;
  increaseQuantity: (id: number, variantId?: string) => void;
  decreaseQuantity: (id: number, variantId?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function itemKey(a: CartItem, b: { id: number; variantId?: string; selectedSize?: string; selectedColor?: string }) {
  return a.id === b.id && (b.variantId ? a.variantId === b.variantId : a.selectedSize === b.selectedSize && a.selectedColor === b.selectedColor);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
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
        cartApi.getCart(uid).then((items) => {
          if (isMounted.current) setCart(items);
        }).catch(() => {
          if (isMounted.current) cartApi.getCart().then((items) => setCart(items));
        });
      } else {
        cartApi.getCart().then((items) => {
          if (isMounted.current) setCart(items);
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      const prev = userId;
      if (uid && !prev) {
        cartApi.getCart().then((local) => {
          cartApi.mergeCart(uid, local).then(() => {
            cartApi.getCart(uid).then((items) => {
              if (isMounted.current) setCart(items);
            });
          });
        });
      } else if (!uid && prev) {
        cartApi.getCart().then((items) => {
          if (isMounted.current) setCart(items);
        });
      }
      setUserId(uid);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const addToCart = useCallback((product: Product | CartInput) => {
    const variantId = "variantId" in product ? product.variantId : undefined;
    const selectedSize = "selectedSize" in product ? product.selectedSize : undefined;
    const selectedColor = "selectedColor" in product ? product.selectedColor : undefined;

    setCart((prev) => {
      const existing = prev.find((item) => itemKey(item, { id: product.id, variantId, selectedSize, selectedColor }));
      let next: CartItem[];
      if (existing) {
        next = prev.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        next = [...prev, { ...product, variantId, selectedSize, selectedColor, quantity: 1 }];
      }
      cartApi.setCart(userId, next);
      return next;
    });

    analytics.addToCart(product.id, product.name, product.price, 1);
  }, [userId]);

  const removeItem = useCallback((id: number, variantId?: string) => {
    setCart((prev) => {
      const next = prev.filter((c) => !(c.id === id && (variantId ? c.variantId === variantId : true)));
      cartApi.removeFromCart(userId, id, variantId);
      return next;
    });
  }, [userId]);

  const increaseQuantity = useCallback((id: number, variantId?: string) => {
    setCart((prev) => {
      const next = prev.map((item) =>
        item.id === id && (variantId ? item.variantId === variantId : true)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      cartApi.setCart(userId, next);
      return next;
    });
  }, [userId]);

  const decreaseQuantity = useCallback((id: number, variantId?: string) => {
    setCart((prev) => {
      const next = prev
        .map((item) =>
          item.id === id && (variantId ? item.variantId === variantId : true)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
      cartApi.setCart(userId, next);
      return next;
    });
  }, [userId]);

  const clearCart = useCallback(() => {
    setCart([]);
    cartApi.clearCart(userId);
  }, [userId]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeItem, increaseQuantity, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
