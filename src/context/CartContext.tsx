import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

function getUserId(): string | null {
  try {
    const raw = localStorage.getItem("nabome-current-user");
    if (raw) return JSON.parse(raw).id || null;
    return null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("nabome-cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("nabome-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product | CartInput) => {
    const variantId = "variantId" in product ? product.variantId : undefined;
    const selectedSize = "selectedSize" in product ? product.selectedSize : undefined;
    const selectedColor = "selectedColor" in product ? product.selectedColor : undefined;

    const existing = cart.find(
      (item) => item.id === product.id && (variantId ? item.variantId === variantId : item.selectedSize === selectedSize && item.selectedColor === selectedColor)
    );

    if (existing) {
      setCart(cart.map((item) => (item === existing ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...product, variantId, selectedSize, selectedColor, quantity: 1 }]);
    }

    analytics.addToCart(product.id, product.name, product.price, 1);

    const userId = getUserId();
    if (userId && supabase) {
      cartApi.addToCart(userId, String(product.id), variantId || "", 1).catch(() => {});
    }
  };

  const removeItem = (id: number, variantId?: string) => {
    const item = cart.find((i) => i.id === id && (variantId ? i.variantId === variantId : true));
    if (item) {
      analytics.removeFromCart(id, item.name, item.price);
    }
    setCart(cart.filter((c) => !(c.id === id && (variantId ? c.variantId === variantId : true))));

    const userId = getUserId();
    if (userId && supabase) {
      const cartItem = cart.find((i) => i.id === id);
      if (cartItem) {
        cartApi.removeFromCart(String(cartItem.id)).catch(() => {});
      }
    }
  };

  const increaseQuantity = (id: number, variantId?: string) => {
    setCart(
      cart.map((item) =>
        item.id === id && (variantId ? item.variantId === variantId : true)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
    const userId = getUserId();
    if (userId && supabase) {
      const item = cart.find((i) => i.id === id);
      if (item) {
        cartApi.addToCart(userId, String(id), variantId || "", 1).catch(() => {});
      }
    }
  };

  const decreaseQuantity = (id: number, variantId?: string) => {
    const item = cart.find((i) => i.id === id && (variantId ? i.variantId === variantId : true));
    if (item && item.quantity <= 1) {
      analytics.removeFromCart(id, item.name, item.price);
    }
    setCart(
      cart
        .map((item) =>
          item.id === id && (variantId ? item.variantId === variantId : true)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    const userId = getUserId();
    if (userId && supabase) {
      cartApi.clearCart(userId).catch(() => {});
    }
  };

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
