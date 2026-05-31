import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeItem: (
  id: number,
  selectedSize?: string,
  selectedColor?: string
) => void;

increaseQuantity: (
  id: number,
  selectedSize?: string,
  selectedColor?: string
) => void;

decreaseQuantity: (
  id: number,
  selectedSize?: string,
  selectedColor?: string
) => void;
  clearCart: () => void;
}

const CartContext =
  createContext<CartContextType | null>(
    null
  );

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>(
    () => {
      const saved =
        localStorage.getItem("nabome-cart");

      return saved
        ? JSON.parse(saved)
        : [];
    }
  );

  useEffect(() => {
    localStorage.setItem(
      "nabome-cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  const addToCart = (product: any) => {
    const existing = cart.find(
      (item) =>
        item.id === product.id &&
        item.selectedSize ===
          product.selectedSize &&
        item.selectedColor ===
          product.selectedColor
    );

    if (existing) {
      setCart(
        cart.map((item) =>
          item === existing
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }
  };

  const removeItem = (
  id: number,
  selectedSize?: string,
  selectedColor?: string
) => {
  setCart(
    cart.filter(
      (item) =>
        !(
          item.id === id &&
          item.selectedSize ===
            selectedSize &&
          item.selectedColor ===
            selectedColor
        )
    )
  );
};

  const increaseQuantity = (
  id: number,
  selectedSize?: string,
  selectedColor?: string
) => {
  setCart(
    cart.map((item) =>
      item.id === id &&
      item.selectedSize ===
        selectedSize &&
      item.selectedColor ===
        selectedColor
        ? {
            ...item,
            quantity:
              item.quantity + 1,
          }
        : item
    )
  );
};

  const decreaseQuantity = (
  id: number,
  selectedSize?: string,
  selectedColor?: string
) => {
  setCart(
    cart
      .map((item) =>
        item.id === id &&
        item.selectedSize ===
          selectedSize &&
        item.selectedColor ===
          selectedColor
          ? {
              ...item,
              quantity:
                item.quantity - 1,
            }
          : item
      )
      .filter(
        (item) => item.quantity > 0
      )
  );
};

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}