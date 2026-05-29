import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Your Cart</h1>

        {cart.length === 0 && (
          <h3>Your cart is empty</h3>
        )}

        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>{item.name}</h3>

            <p>Price: ₹{item.price}</p>

            <p>Quantity: {item.quantity}</p>

            <p>
              Subtotal: ₹
              {item.price * item.quantity}
            </p>
          </div>
        ))}

        <hr />

        <h2>Total: ₹{total}</h2>
        <Link to="/checkout">
  <button>
    Checkout
  </button>
</Link>
      </div>
    </>
  );
}