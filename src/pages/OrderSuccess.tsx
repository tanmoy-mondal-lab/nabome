import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <h1
        style={{
          color: "#D4AF37",
          fontSize: "5rem",
          marginBottom: "20px",
        }}
      >
        ✓
      </h1>

      <h2>
        Order Request Sent
      </h2>

      <p
        style={{
          color: "#999",
          marginTop: "15px",
          marginBottom: "30px",
        }}
      >
        Thank you for shopping with
        NABOME.
      </p>

      <Link to="/">
        <button
          style={{
            padding: "16px 30px",
            border: "none",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg,#FFD700,#D4AF37)",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Continue Shopping
        </button>
      </Link>
    </div>
  );
}