import Navbar from "../components/Navbar";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";

export default function Category() {
  const { addToCart } = useCart();

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Shop Collection</h1>

        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h2>{product.name}</h2>

            <p>₹{product.price}</p>

            <button onClick={() => addToCart(product)}>
  Add To Cart
</button>
          </div>
        ))}
      </div>
    </>
  );
}