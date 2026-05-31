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
          background: "var(--bg)",
          minHeight: "100vh",
          color: "var(--text)",
        }}
      >
        {/* HERO */}

        <section
          style={{
            padding: "100px 6% 60px",
            textAlign: "center",
            borderBottom:
              "1px solid var(--line)",
          }}
        >
          <p
            style={{
              textTransform:
                "uppercase",
              letterSpacing: "4px",
              color: "var(--muted)",
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
                "1px solid var(--line)",
              padding: "40px",
              background: "var(--surface)",
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
                onClick={handleLogin}
                style={{
                  padding: "18px",
                  border: "none",
                  background: "var(--gold)",
                  color: "#050505",
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
                  color: "var(--muted)",
                textAlign: "center",
              }}
            >
              New to নবME?{" "}
              <Link
                to="/register"
                  style={{
                    color: "var(--gold)",
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
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.06)",
  color: "var(--text)",
  outline: "none",
  fontSize: "1rem",
} as const;