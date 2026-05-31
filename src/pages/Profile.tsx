import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [user, setUser] = useState<{ name?: string; email?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (session?.user) {
          const meta = session.user.user_metadata;
          setUser({
            name: (meta?.name as string) || session.user.email?.split("@")[0] || "Customer",
            email: session.user.email || "Not Provided",
          });
          localStorage.setItem("nabome-user", JSON.stringify({
            name: (meta?.name as string) || session.user.email?.split("@")[0] || "Customer",
            email: session.user.email || "",
          }));
          setLoading(false);
          return;
        }
      }

      const local = JSON.parse(localStorage.getItem("nabome-user") || "{}");
      setUser(local);
      setLoading(false);
    }

    loadUser();
  }, []);

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    localStorage.removeItem("nabome-user");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
        }}
      >
        <section
          style={{
            padding: "100px 6% 60px",
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
            My Profile
          </h1>
        </section>

        <section
          style={{
            padding: "80px 6%",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                border: "1px solid var(--line)",
                padding: "50px",
                background: "var(--surface)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "25px",
                  flexWrap: "wrap",
                  marginBottom: "40px",
                }}
              >
                <div
                  style={{
                    width: "90px",
                    height: "90px",
                    background: "#111",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: 600,
                  }}
                >
                  {(user.name || "C").charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2
                    style={{
                      fontWeight: 400,
                      marginBottom: "8px",
                    }}
                  >
                    {user.name || "Customer"}
                  </h2>

                  <p
                    style={{
                      marginTop: "8px",
                      color: "var(--muted)",
                    }}
                  >
                    {user.email || "Not Provided"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                  gap: "20px",
                }}
              >
                <div style={cardStyle}>
                  <h4>Name</h4>
                  <p>{user.name || "Customer"}</p>
                </div>

                <div style={cardStyle}>
                  <h4>Email</h4>
                  <p>{user.email || "Not Provided"}</p>
                </div>

                <div style={cardStyle}>
                  <h4>Wishlist</h4>
                  <Link to="/wishlist" style={{ color: "var(--gold)" }}>
                    View Saved Products
                  </Link>
                </div>

                <div style={cardStyle}>
                  <h4>Shopping</h4>
                  <Link to="/cart" style={{ color: "var(--gold)" }}>
                    View Cart
                  </Link>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginTop: "40px",
                }}
              >
                <Link to="/category">
                  <button
                    style={{
                      padding: "16px 30px",
                      border: "none",
                      background: "var(--gold)",
                      color: "#050505",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Shop Collection
                  </button>
                </Link>

                <button
                  onClick={logout}
                  style={{
                    padding: "16px 30px",
                    border: "1px solid var(--line)",
                    background: "transparent",
                    color: "var(--text)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

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
                fontSize: "clamp(2.5rem,5vw,4rem)",
                fontWeight: 300,
              }}
            >
              Member Benefits
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
              gap: "25px",
            }}
          >
            {[
              { title: "Wishlist", text: "Save your favourite products." },
              { title: "Fast Checkout", text: "Complete future orders quickly." },
              { title: "Exclusive Updates", text: "Stay informed about new collections." },
              { title: "Future Order Tracking", text: "Track orders when available." },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  padding: "35px",
                }}
              >
                <h3 style={{ marginBottom: "15px" }}>{item.title}</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  padding: "25px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
} as const;
