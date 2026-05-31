import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { products } from "../data/products";

export default function Home() {
  const newArrivals = products.filter(
    (product) => product.isNew
  );

  const bestSellers = products.filter(
    (product) => product.isBestSeller
  );

  return (
    <>
      <Navbar />

      {/* ANNOUNCEMENT BAR */}
      <div
        style={{
          background: "#111",
          color: "#fff",
          textAlign: "center",
          padding: "12px",
          fontSize: ".85rem",
          letterSpacing: "2px",
          borderBottom: "1px solid #222",
        }}
      >
        FREE SHIPPING ON ORDERS ABOVE ₹999
      </div>

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(400px,1fr))",
          background: "#faf8f5",
          color: "#111",
        }}
      >
        <div
          style={{
            padding: "120px 8%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "4px",
              fontSize: ".8rem",
              color: "#666",
            }}
          >
            Spring / Summer 2026
          </span>

          <h1
            style={{
              fontSize: "clamp(4rem,8vw,8rem)",
              lineHeight: ".9",
              fontWeight: 300,
              marginTop: "20px",
              color: "#111",
            }}
          >
            Modern
            <br />
            Bengali
            <br />
            Fashion
          </h1>

          <p
            style={{
              maxWidth: "550px",
              marginTop: "30px",
              color: "#555",
              lineHeight: 1.8,
              fontSize: "1.05rem",
            }}
          >
            Contemporary fashion inspired by
            Bengali culture, crafted for everyday
            elegance and timeless expression.
          </p>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "40px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/category">
              <button
                style={{
                  padding: "18px 40px",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Explore Collection
              </button>
            </Link>

            <Link to="/about">
              <button
                style={{
                  padding: "18px 40px",
                  background: "transparent",
                  color: "#111",
                  border: "1px solid #111",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Brand Story
              </button>
            </Link>
          </div>
        </div>

        <div>
          <img
            src="/images/home/hero-main.jpg"
            alt="NABOME"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section
        style={{
          padding: "120px 8%",
          background: "#fff",
          color: "#111",
        }}
      >
        <div
          style={{
            marginBottom: "60px",
          }}
        >
          <span
            style={{
              color: "#777",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Categories
          </span>

          <h2
            style={{
              fontSize: "3rem",
              marginTop: "15px",
              fontWeight: 400,
            }}
          >
            Explore The Collection
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(300px,1fr))",
            gap: "25px",
          }}
        >
          {[
            {
              title: "Men",
              image:
                "/images/home/category-men.jpg",
            },
            {
              title: "Women",
              image:
                "/images/home/category-women.jpg",
            },
            {
              title: "Accessories",
              image:
                "/images/home/category-accessories.jpg",
            },
            {
              title: "New Arrivals",
              image:
                "/images/home/category-new.jpg",
            },
          ].map((item) => (
            <Link
              key={item.title}
              to="/category"
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "500px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(transparent,rgba(0,0,0,.55))",
                  }}
                />

                <h3
                  style={{
                    position: "absolute",
                    bottom: "30px",
                    left: "30px",
                    color: "#fff",
                    fontSize: "2rem",
                    fontWeight: 400,
                  }}
                >
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section
        style={{
          padding: "120px 8%",
          background: "#faf8f5",
          color: "#111",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "70px",
          }}
        >
          <span
            style={{
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#777",
            }}
          >
            New Arrivals
          </span>

          <h2
            style={{
              fontSize: "3.5rem",
              marginTop: "15px",
              fontWeight: 400,
            }}
          >
            Latest Pieces
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "30px",
          }}
        >
          {newArrivals.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{
                color: "#111",
              }}
            >
              <div>
                <div
                  style={{
                    overflow: "hidden",
                    background: "#f2f2f2",
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "420px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <p
                    style={{
                      color: "#888",
                      fontSize: ".85rem",
                      marginBottom: "10px",
                    }}
                  >
                    {product.category}
                  </p>

                  <h3
                    style={{
                      fontWeight: 500,
                      marginBottom: "10px",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    ₹{product.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(450px,1fr))",
          background: "#fff",
          color: "#111",
        }}
      >
        <div>
          <img
            src="/images/home/editorial-1.jpg"
            alt="Editorial"
            style={{
              width: "100%",
              height: "700px",
              objectFit: "cover",
            }}
          />
        </div>

        <div
          style={{
            padding: "100px 8%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "4px",
              color: "#888",
              fontSize: ".85rem",
            }}
          >
            Editorial
          </span>

          <h2
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              fontWeight: 300,
              lineHeight: 1,
              marginTop: "20px",
            }}
          >
            Crafted For
            <br />
            Everyday
            <br />
            Elegance
          </h2>

          <p
            style={{
              marginTop: "30px",
              color: "#666",
              lineHeight: 1.9,
              maxWidth: "550px",
            }}
          >
            Designed with attention to detail,
            premium fabrics, and timeless
            silhouettes. Every piece reflects a
            balance between contemporary fashion
            and cultural inspiration.
          </p>

          <Link
            to="/category"
            style={{
              marginTop: "40px",
            }}
          >
            <button
              style={{
                padding: "18px 40px",
                background: "#111",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Shop Now
            </button>
          </Link>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section
        style={{
          padding: "120px 8%",
          background: "#faf8f5",
          color: "#111",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "70px",
          }}
        >
          <span
            style={{
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#777",
            }}
          >
            Best Sellers
          </span>

          <h2
            style={{
              fontSize: "3.5rem",
              fontWeight: 400,
              marginTop: "15px",
            }}
          >
            Most Loved
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "30px",
          }}
        >
          {bestSellers.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{
                color: "#111",
              }}
            >
              <div>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "420px",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <p
                    style={{
                      color: "#888",
                      marginBottom: "8px",
                    }}
                  >
                    {product.category}
                  </p>

                  <h3
                    style={{
                      fontWeight: 500,
                      marginBottom: "10px",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    ₹{product.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BRAND STORY */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(450px,1fr))",
          background: "#f5f3ef",
          color: "#111",
        }}
      >
        <div
          style={{
            padding: "100px 8%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <span
            style={{
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#888",
            }}
          >
            Our Story
          </span>

          <h2
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              fontWeight: 300,
              marginTop: "20px",
            }}
          >
            Inspired By
            <br />
            Bengal
          </h2>

          <p
            style={{
              marginTop: "30px",
              color: "#666",
              lineHeight: 1.9,
              maxWidth: "600px",
            }}
          >
            NABOME was created to bring together
            Bengali heritage and modern fashion.
            Our collections are built around
            simplicity, identity, and timeless
            design that speaks beyond trends.
          </p>

          <Link
            to="/about"
            style={{
              marginTop: "40px",
            }}
          >
            <button
              style={{
                padding: "18px 40px",
                border: "1px solid #111",
                background: "transparent",
                color: "#111",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Learn More
            </button>
          </Link>
        </div>

        <div>
          <img
            src="/images/home/story.jpg"
            alt="Story"
            style={{
              width: "100%",
              height: "700px",
              objectFit: "cover",
            }}
          />
        </div>
      </section>

      {/* NEWSLETTER */}
      <section
        style={{
          padding: "120px 8%",
          background: "#fff",
          color: "#111",
          textAlign: "center",
        }}
      >
        <span
          style={{
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#888",
          }}
        >
          Newsletter
        </span>

        <h2
          style={{
            fontSize: "clamp(3rem,5vw,4.5rem)",
            fontWeight: 300,
            marginTop: "20px",
          }}
        >
          Stay Updated
        </h2>

        <p
          style={{
            maxWidth: "600px",
            margin: "25px auto",
            color: "#666",
            lineHeight: 1.8,
          }}
        >
          Be the first to know about new
          collections, limited releases, and
          exclusive offers.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "30px",
          }}
        >
          <input
            type="email"
            placeholder="Your email address"
            style={{
              padding: "18px",
              minWidth: "320px",
              border: "1px solid #ddd",
              outline: "none",
            }}
          />

          <button
            style={{
              padding: "18px 40px",
              background: "#111",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Subscribe
          </button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          padding: "160px 8%",
          background: "#111",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(3rem,6vw,6rem)",
            fontWeight: 300,
            lineHeight: 1,
            marginBottom: "30px",
          }}
        >
          Discover
          <br />
          The Collection
        </h2>

        <p
          style={{
            color: "#bbb",
            maxWidth: "700px",
            margin: "0 auto 40px",
            lineHeight: 1.8,
          }}
        >
          Modern silhouettes, premium materials,
          and timeless design inspired by culture.
        </p>

        <Link to="/category">
          <button
            style={{
              padding: "20px 50px",
              background: "#fff",
              color: "#111",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            Shop Collection
          </button>
        </Link>
      </section>
    </>
  );
}
