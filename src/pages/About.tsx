import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <Navbar />

      <div
        style={{
          background: "#fff",
          color: "#111",
          minHeight: "100vh",
        }}
      >
        {/* HERO */}

        <section
          style={{
            padding: "120px 6%",
            textAlign: "center",
            borderBottom:
              "1px solid #e5e5e5",
          }}
        >
          <p
            style={{
              textTransform:
                "uppercase",
              letterSpacing:
                "4px",
              color: "#888",
              fontSize: ".85rem",
            }}
          >
            About NABOME
          </p>

          <h1
            style={{
              fontSize:
                "clamp(4rem,8vw,7rem)",
              fontWeight: 300,
              lineHeight: 1,
              marginTop: "25px",
            }}
          >
            Inspired By
            <br />
            Bengal
          </h1>

          <p
            style={{
              maxWidth: "800px",
              margin: "40px auto 0",
              color: "#666",
              lineHeight: 1.9,
              fontSize: "1.1rem",
            }}
          >
            Contemporary fashion inspired by
            culture, identity and everyday
            expression. NABOME blends
            timeless design with modern
            Bengali influence.
          </p>
        </section>

        {/* STORY */}

        <section
          style={{
            padding: "100px 6%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(450px,1fr))",
              gap: "60px",
              alignItems: "center",
            }}
          >
            <div>
              <img
                src="/images/community/community.jpeg"
                alt="NABOME"
                style={{
                  width: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <div>
              <p
                style={{
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "3px",
                  color: "#888",
                  fontSize: ".85rem",
                }}
              >
                Our Story
              </p>

              <h2
                style={{
                  fontSize:
                    "clamp(3rem,5vw,4.5rem)",
                  fontWeight: 300,
                  marginTop: "20px",
                  lineHeight: 1,
                }}
              >
                Designed For
                <br />
                Today
              </h2>

              <p
                style={{
                  marginTop: "30px",
                  color: "#666",
                  lineHeight: 1.9,
                }}
              >
                NABOME was created with a
                simple vision: fashion should
                be meaningful, timeless and
                personal.
              </p>

              <p
                style={{
                  marginTop: "20px",
                  color: "#666",
                  lineHeight: 1.9,
                }}
              >
                Inspired by Bengali heritage
                and contemporary aesthetics,
                our collections focus on
                premium essentials that fit
                naturally into modern life.
              </p>
            </div>
          </div>
        </section>
                {/* VALUES */}

        <section
          style={{
            background: "#f8f6f2",
            padding: "100px 6%",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "70px",
            }}
          >
            <p
              style={{
                textTransform:
                  "uppercase",
                letterSpacing:
                  "4px",
                color: "#888",
                fontSize: ".85rem",
              }}
            >
              Our Values
            </p>

            <h2
              style={{
                fontSize:
                  "clamp(3rem,6vw,5rem)",
                fontWeight: 300,
                marginTop: "20px",
              }}
            >
              What We
              <br />
              Stand For
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(260px,1fr))",
              gap: "30px",
            }}
          >
            {[
              {
                title:
                  "Premium Quality",
                text:
                  "Carefully selected materials and thoughtful craftsmanship.",
              },
              {
                title:
                  "Cultural Identity",
                text:
                  "Celebrating Bengali heritage through contemporary design.",
              },
              {
                title:
                  "Timeless Design",
                text:
                  "Creating pieces that remain relevant beyond trends.",
              },
              {
                title:
                  "Responsible Production",
                text:
                  "Focused on reducing waste and producing thoughtfully.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background:
                    "#fff",
                  padding:
                    "35px",
                  border:
                    "1px solid #e5e5e5",
                }}
              >
                <h3
                  style={{
                    marginBottom:
                      "15px",
                    fontWeight:
                      600,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color:
                      "#666",
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

        {/* PHILOSOPHY */}

        <section
          style={{
            padding:
              "120px 6%",
            textAlign:
              "center",
          }}
        >
          <p
            style={{
              textTransform:
                "uppercase",
              letterSpacing:
                "4px",
              color:
                "#888",
              fontSize:
                ".85rem",
            }}
          >
            Philosophy
          </p>

          <h2
            style={{
              fontSize:
                "clamp(3rem,6vw,5rem)",
              fontWeight:
                300,
              marginTop:
                "20px",
              lineHeight:
                1,
            }}
          >
            Fashion That
            <br />
            Feels Personal
          </h2>

          <p
            style={{
              maxWidth:
                "800px",
              margin:
                "40px auto 0",
              color:
                "#666",
              lineHeight:
                1.9,
              fontSize:
                "1.05rem",
            }}
          >
            We believe clothing should
            reflect individuality rather
            than follow temporary trends.
            Every collection is designed
            to help people express
            themselves with confidence,
            simplicity and authenticity.
          </p>
        </section>

        {/* STATS */}

        <section
          style={{
            padding:
              "0 6% 120px",
          }}
        >
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "25px",
            }}
          >
            {[
              [
                "10K+",
                "Customers",
              ],
              [
                "500+",
                "Designs",
              ],
              [
                "99%",
                "Satisfaction",
              ],
              [
                "24/7",
                "Support",
              ],
            ].map(
              (
                [
                  number,
                  label,
                ]
              ) => (
                <div
                  key={label}
                  style={{
                    border:
                      "1px solid #e5e5e5",
                    padding:
                      "40px",
                    textAlign:
                      "center",
                  }}
                >
                  <h2
                    style={{
                      fontSize:
                        "3rem",
                      fontWeight:
                        300,
                      marginBottom:
                        "10px",
                    }}
                  >
                    {number}
                  </h2>

                  <p
                    style={{
                      color:
                        "#666",
                    }}
                  >
                    {label}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* CTA */}

        <section
          style={{
            background:
              "#111",
            color:
              "#fff",
            padding:
              "120px 6%",
            textAlign:
              "center",
          }}
        >
          <h2
            style={{
              fontSize:
                "clamp(3rem,6vw,5rem)",
              fontWeight:
                300,
              lineHeight:
                1,
            }}
          >
            Discover
            <br />
            The Collection
          </h2>

          <p
            style={{
              maxWidth:
                "700px",
              margin:
                "30px auto 40px",
              color:
                "#bbb",
              lineHeight:
                1.9,
            }}
          >
            Explore premium essentials,
            timeless silhouettes and
            contemporary fashion inspired
            by Bengal.
          </p>

          <Link
            to="/category"
          >
            <button
              style={{
                padding:
                  "18px 40px",
                border:
                  "none",
                background:
                  "#fff",
                color:
                  "#111",
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              Shop Collection
            </button>
          </Link>
        </section>
      </div>
    </>
  );
}