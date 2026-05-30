import Navbar from "../components/Navbar";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const {
    wishlist,
  } = useWishlist();

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "30px",
        }}
      >
        <h1>
          ❤️ Wishlist
        </h1>

        {wishlist.length === 0 && (
          <h3>
            No saved products
          </h3>
        )}

        {wishlist.map(
          (item: any) => (
            <div
              key={item.id}
            >
              <h3>
                {item.name}
              </h3>

              <p>
                ₹{item.price}
              </p>
            </div>
          )
        )}
      </div>
    </>
  );
}
