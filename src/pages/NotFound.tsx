import { Link } from "react-router-dom";

export default function NotFound() {
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
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "8rem",
          color: "#D4AF37",
          marginBottom: "10px",
        }}
      >
        404
      </h1>

      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          color: "#999",
          marginBottom: "30px",
        }}
      >
        The page you're looking for doesn't exist.
      </p>

      <Link to="/">
        <button
          style={{
            padding: "16px 32px",
            border: "none",
            borderRadius: "14px",
            cursor: "pointer",
            fontWeight: 700,
            background:
              "linear-gradient(135deg,#FFD700,#D4AF37)",
          }}
        >
          Back To Home
        </button>
      </Link>
    </div>
  );
}