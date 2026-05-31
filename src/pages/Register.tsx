import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const register = () => {
    if (!name || !email) {
      alert(
        "Please complete all fields."
      );
      return;
    }

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
            Create Account
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
              maxWidth: "520px",
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
              Join নবME
            </h2>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                style={inputStyle}
              />

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

              <button
                onClick={register}
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
                Create Account
              </button>
            </div>

            <p
                style={{
                  marginTop: "25px",
                  textAlign: "center",
                  color: "var(--muted)",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                  style={{
                    color: "var(--gold)",
                    fontWeight: 600,
                }}
              >
                Login
              </Link>
            </p>
          </div>
        </section>

        {/* BENEFITS */}

        <section
          style={{
            background: "var(--surface)",
            padding: "100px 6%",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "50px",
            }}
          >
            <h2
              style={{
                fontSize:
                  "clamp(2.5rem,5vw,4rem)",
                fontWeight: 300,
              }}
            >
              Why Create An Account?
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "25px",
            }}
          >
            {[
              {
                title:
                  "Faster Checkout",
                text:
                  "Save time during future purchases.",
              },
              {
                title:
                  "Wishlist Access",
                text:
                  "Save your favorite products.",
              },
              {
                title:
                  "Order Tracking",
                text:
                  "Future-ready account management.",
              },
              {
                title:
                  "Exclusive Updates",
                text:
                  "Receive collection announcements and offers.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background:
                    "var(--surface)",
                  border:
                    "1px solid var(--line)",
                  padding:
                    "35px",
                }}
              >
                <h3
                  style={{
                    marginBottom:
                      "15px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                  color:
                    "var(--muted)",
                  lineHeight:
                      1.8,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
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