import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "30px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1>Your Cart</h1>

        {cart.length === 0 && (
          <h3>Your cart is empty</h3>
        )}

        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "12px",
              background: "#fff",
              alignItems: "center",
            }}
          >
            <img
              src={(item as any).image}
              alt={item.name}
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />

            <div style={{ flex: 1 }}>
              <h3>{item.name}</h3>

              <p>
                <strong>Size:</strong>{" "}
                {(item as any).selectedSize ||
                  "Not Selected"}
              </p>

              <p>
                <strong>Color:</strong>{" "}
                {(item as any).selectedColor ||
                  "Not Selected"}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={() =>
                    decreaseQuantity(item.id)
                  }
                  style={{
                    width: "35px",
                    height: "35px",
                    cursor: "pointer",
                  }}
                >
                  -
                </button>

                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    increaseQuantity(item.id)
                  }
                  style={{
                    width: "35px",
                    height: "35px",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>

              <p>
                <strong>Price:</strong> ₹
                {item.price}
              </p>

              <p>
                <strong>Subtotal:</strong> ₹
                {item.price * item.quantity}
              </p>

              <button
                onClick={() =>
                  removeItem(item.id)
                }
                style={{
                  marginTop: "10px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Remove Item
              </button>
            </div>
          </div>
        ))}

        <hr />

        <h2>Total: ₹{total}</h2>

        <Link to="/checkout">
          <button
            style={{
              padding: "12px 24px",
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "15px",
            }}
          >
            Proceed To Checkout
          </button>
        </Link>
      </div>
    </>
  );
}
