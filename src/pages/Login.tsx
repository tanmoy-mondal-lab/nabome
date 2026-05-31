import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert(
        "Please enter email and password."
      );
      return;
    }

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
          background: "#fff",
          minHeight: "100vh",
          color: "#111",
        }}
      >
        {/* HERO */}

        <section
          style={{
            padding: "100px 6% 60px",
            textAlign: "center",
            borderBottom:
              "1px solid #e5e5e5",
          }}
        >
          <p
            style={{
              textTransform:
                "uppercase",
              letterSpacing: "4px",
              color: "#888",
              fontSize: ".85rem",
            }}
          >
            Account
          </p>

          <h1
            style={{
              fontSize:
                "clamp(3rem,6vw,5rem)",
              fontWeight: 300,
              marginTop: "15px",
            }}
          >
            Welcome Back
          </h1>
        </section>

        {/* FORM */}

        <section
          style={{
            padding: "80px 6%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              border:
                "1px solid #e5e5e5",
              padding: "40px",
              background: "#fafafa",
            }}
          >
            <h2
              style={{
                marginBottom: "30px",
                fontWeight: 400,
              }}
            >
              Login To Your Account
            </h2>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                style={inputStyle}
              />

              <button
                onClick={
                  handleLogin
                }
                style={{
                  padding: "18px",
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "1rem",
                  marginTop: "10px",
                }}
              >
                Login
              </button>
            </div>

            <p
              style={{
                marginTop: "25px",
                color: "#666",
                textAlign: "center",
              }}
            >
              New to নবME?{" "}
              <Link
                to="/register"
                style={{
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                Create Account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px",
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  outline: "none",
  fontSize: "1rem",
} as const;