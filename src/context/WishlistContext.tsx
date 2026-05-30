import {
  createContext,
  useContext,
  useState,
} from "react";

const WishlistContext =
  createContext<any>(null);

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlist, setWishlist] =
    useState<any[]>([]);

  const addToWishlist = (
    product: any
  ) => {
    const exists =
      wishlist.find(
        (item) =>
          item.id === product.id
      );

    if (!exists) {
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

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(
    WishlistContext
  );
};
