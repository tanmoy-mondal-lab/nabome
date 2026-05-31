import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import type { CartItem } from "../context/CartContext";

interface Bill {
  billNo: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: CartItem[];
  shipping: number;
  taxLabel: string;
  total: number;
}

export default function OrderSuccess() {
  const bill = useMemo<Bill | null>(() => {
    const saved =
      localStorage.getItem("nabome-last-bill");

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved) as Bill;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem(
      "nabome-cart"
    );
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#111",
        padding: "56px 6%",
      }}
    >
      <div
        className="order-success-actions"
        style={{
          maxWidth: "980px",
          margin: "0 auto 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 28px",
            border: "2px solid #111",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "2rem",
            fontWeight: 600,
          }}
        >
          ✓
        </div>

        <p
          style={{
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: "#888",
            fontSize: ".85rem",
          }}
        >
          Order Received
        </p>

        <h1
          style={{
            fontSize:
              "clamp(2.8rem,7vw,5rem)",
            fontWeight: 300,
            marginTop: "20px",
            lineHeight: 1,
          }}
        >
          Thank You
          <br />
          For Your Order
        </h1>

        <p
          style={{
            color: "#666",
            lineHeight: 1.9,
            marginTop: "26px",
            maxWidth: "560px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Your order request has been
          submitted successfully. You
          can print the bill or save it
          as a PDF for your records.
        </p>

        <div
          style={{
            marginTop: "36px",
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          {bill && (
            <button
              onClick={() => window.print()}
              style={primaryButtonStyle}
            >
              Print / Save PDF
            </button>
          )}

          <Link to="/">
            <button style={secondaryButtonStyle}>
              Continue Shopping
            </button>
          </Link>

          <Link to="/category">
            <button style={secondaryButtonStyle}>
              Browse Collection
            </button>
          </Link>
        </div>
      </div>

      {bill ? (
        <BillPreview bill={bill} />
      ) : (
        <div
          className="order-success-actions"
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            border: "1px solid #e5e5e5",
            padding: "32px",
            textAlign: "center",
            color: "#666",
            lineHeight: 1.7,
          }}
        >
          Bill details are not available
          for this session. Please place
          a new order to generate a bill.
        </div>
      )}
    </div>
  );
}

function BillPreview({
  bill,
}: {
  bill: Bill;
}) {
  return (
    <section
      className="nabome-bill"
      style={{
        maxWidth: "980px",
        margin: "0 auto",
        border: "1px solid #d8d8d8",
        background: "#fff",
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "24px",
          padding: "36px",
          borderBottom: "1px solid #e5e5e5",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "#777",
              fontSize: ".78rem",
              marginBottom: "10px",
            }}
          >
            Tax Invoice
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 500,
            }}
          >
            নবME
          </h2>

          <p
            style={{
              color: "#666",
              marginTop: "8px",
            }}
          >
            Fashion and lifestyle order
          </p>
        </div>

        <div
          style={{
            minWidth: "220px",
            lineHeight: 1.8,
          }}
        >
          <p>
            <strong>Bill No:</strong>{" "}
            {bill.billNo}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {bill.date}
          </p>
          <p>
            <strong>Payment:</strong>{" "}
            WhatsApp Order
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(240px,1fr))",
          gap: "28px",
          padding: "32px 36px",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <div>
          <h3 style={sectionTitleStyle}>
            Bill To
          </h3>
          <p style={detailLineStyle}>
            {bill.customer.name}
          </p>
          <p style={detailLineStyle}>
            {bill.customer.phone}
          </p>
          <p style={detailLineStyle}>
            {bill.customer.email}
          </p>
        </div>

        <div>
          <h3 style={sectionTitleStyle}>
            Shipping Address
          </h3>
          <p style={detailLineStyle}>
            {bill.customer.address}
          </p>
          <p style={detailLineStyle}>
            {bill.customer.city},{" "}
            {bill.customer.state}
          </p>
          <p style={detailLineStyle}>
            PIN: {bill.customer.pincode}
          </p>
        </div>
      </div>

      <div
        style={{
          padding: "32px 36px",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "680px",
          }}
        >
          <thead>
            <tr>
              {[
                "Item",
                "Size",
                "Colour",
                "Qty",
                "Price",
                "Subtotal",
              ].map((heading) => (
                <th
                  key={heading}
                  style={tableHeadStyle}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {bill.items.map((item, index) => (
              <tr
                key={`${item.id}-${index}`}
                style={{
                  borderBottom:
                    "1px solid #ececec",
                }}
              >
                <td style={tableCellStyle}>
                  {item.name}
                </td>
                <td style={tableCellStyle}>
                  {item.selectedSize || "N/A"}
                </td>
                <td style={tableCellStyle}>
                  {item.selectedColor || "N/A"}
                </td>
                <td style={tableCellStyle}>
                  {item.quantity}
                </td>
                <td style={tableCellStyle}>
                  ₹{item.price}
                </td>
                <td style={tableCellStyle}>
                  ₹{item.price * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 36px 36px",
        }}
      >
        <div
          style={{
            width: "min(100%, 360px)",
            borderTop: "1px solid #ddd",
            paddingTop: "18px",
            lineHeight: 2,
          }}
        >
          <div style={totalRowStyle}>
            <span>Shipping</span>
            <span>
              {bill.shipping === 0
                ? "Free"
                : `₹${bill.shipping}`}
            </span>
          </div>

          <div style={totalRowStyle}>
            <span>Taxes</span>
            <span>{bill.taxLabel}</span>
          </div>

          <div
            style={{
              ...totalRowStyle,
              borderTop: "1px solid #ddd",
              marginTop: "10px",
              paddingTop: "14px",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#111",
            }}
          >
            <span>Total</span>
            <span>₹{bill.total}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const primaryButtonStyle = {
  padding: "16px 30px",
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
} as const;

const secondaryButtonStyle = {
  padding: "16px 30px",
  border: "1px solid #111",
  background: "#fff",
  color: "#111",
  cursor: "pointer",
  fontWeight: 600,
} as const;

const sectionTitleStyle = {
  margin: "0 0 12px",
  fontSize: ".85rem",
  textTransform: "uppercase",
  letterSpacing: "2px",
  color: "#777",
} as const;

const detailLineStyle = {
  color: "#333",
  lineHeight: 1.8,
} as const;

const tableHeadStyle = {
  padding: "12px",
  borderBottom: "1px solid #111",
  color: "#555",
  fontSize: ".82rem",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "1px",
} as const;

const tableCellStyle = {
  padding: "14px 12px",
  color: "#222",
  verticalAlign: "top",
} as const;

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  color: "#555",
} as const;
