import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { getUserRole, seedAdminRole } from "../lib/db";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          alert(error.message);
          setLoading(false);
          return;
        }

        localStorage.setItem(
          "nabome-user",
          JSON.stringify({ email })
        );

        if (data?.session?.user?.id) {
          await seedAdminRole(data.session.user.id, email);
        }

        const role = await getUserRole();
        navigate(role === "admin" ? "/admin" : "/profile");
      } else {
        localStorage.setItem(
          "nabome-user",
          JSON.stringify({ email })
        );

        navigate("/profile");
      }
    } catch (err) {
      alert("Connection error. Check your Supabase config in .env");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <>
      <SEO title="Login | নবME" description="Log in to your নবME account." path="/login" />
      <Navbar />

      <div
        style={{
          background: "var(--bg)",
          minHeight: "100vh",
          color: "var(--text)",
        }}
      >
        <section
          style={{
            padding: "100px 6% 60px",
            textAlign: "center",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "4px",
              color: "var(--muted)",
              fontSize: ".85rem",
            }}
          >
            Account
          </p>

          <h1
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              fontWeight: 300,
              marginTop: "15px",
            }}
          >
            Welcome Back
          </h1>
        </section>

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
              border: "1px solid var(--line)",
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
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />

              <p style={{ textAlign: "right", marginTop: "-10px" }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.85rem",
                    textDecoration: "underline",
                  }}
                >
                  Forgot password?
                </Link>
              </p>

              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  padding: "18px",
                  border: "none",
                  background: loading ? "var(--surface-strong)" : "var(--gold)",
                  color: loading ? "var(--muted)" : "#050505",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "1rem",
                  marginTop: "10px",
                }}
              >
                {loading ? "Logging in..." : "Login"}
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
