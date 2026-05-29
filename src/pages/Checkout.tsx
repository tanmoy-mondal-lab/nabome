import { useState } from "react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { cart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const sendToWhatsapp = () => {
    const productList = cart
      .map(
        (item) =>
          `${item.name} x${item.quantity} = ₹${
            item.price * item.quantity
          }`
      )
      .join("\n");

    const message = `
নবME ORDER

Name: ${name}

Phone: ${phone}

Address:
${address}

Pincode:
${pincode}

Products:
${productList}

Total:
₹${total}
`;

    const encoded = encodeURIComponent(message);

    window.open(
      `https://wa.me/919163854706?text=${encoded}`,
      "_blank"
    );
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Checkout</h1>

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <br />
        <br />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />

        <br />
        <br />

        <input
          placeholder="Address"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
        />

        <br />
        <br />

        <input
          placeholder="Pincode"
          value={pincode}
          onChange={(e) =>
            setPincode(e.target.value)
          }
        />

        <br />
        <br />

        <h2>Total: ₹{total}</h2>

        <button onClick={sendToWhatsapp}>
          Proceed To WhatsApp
        </button>
      </div>
    </>
  );
}