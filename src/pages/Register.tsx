import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const register = () => {
    localStorage.setItem(
      "nabome-user",
      JSON.stringify({
        name,
        email,
      })
    );

    navigate("/profile");
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            background: "#111",
            padding: "40px",
            borderRadius: "24px",
          }}
        >
          <h1
            style={{
              color: "#fff",
              marginBottom: "25px",
            }}
          >
            Create Account
          </h1>

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={inputStyle}
          />

          <button
            onClick={register}
            style={buttonStyle}
          >
            Create Account
          </button>

          <p
            style={{
              marginTop: "20px",
              color: "#fff",
            }}
          >
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px",
  marginBottom: "15px",
  borderRadius: "12px",
  border: "1px solid #333",
  background: "#050505",
  color: "#fff",
} as const;

const buttonStyle = {
  width: "100%",
  padding: "16px",
  border: "none",
  borderRadius: "12px",
  background:
    "linear-gradient(135deg,#FFD700,#D4AF37)",
  fontWeight: 700,
  cursor: "pointer",
} as const;