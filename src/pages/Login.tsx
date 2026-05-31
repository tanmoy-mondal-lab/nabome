import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleLogin = () => {
    localStorage.setItem(
      "nabome-user",
      JSON.stringify({
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
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
            background: "#111",
            padding: "40px",
            borderRadius: "24px",
          }}
        >
          <h1
            style={{
              marginBottom: "30px",
            }}
          >
            Login
          </h1>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={inputStyle}
          />

          <button
            onClick={handleLogin}
            style={buttonStyle}
          >
            Login
          </button>

          <p
            style={{
              marginTop: "20px",
            }}
          >
            New user?{" "}
            <Link to="/register">
              Register
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