import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />

      <div
        style={{
          background: "#050505",
          color: "#fff",
          minHeight: "100vh",
        }}
      >
        {/* HERO */}
        <section
          style={{
            padding: "120px 8%",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "#D4AF37",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontSize: ".85rem",
            }}
          >
            About Nabome
          </span>

          <h1
            style={{
              fontSize: "clamp(4rem,8vw,7rem)",
              fontWeight: 900,
              marginTop: "20px",
              lineHeight: ".95",
            }}
          >
            WE DON'T SELL
            <br />
            CLOTHES.
          </h1>

          <h2
            style={{
              fontSize: "clamp(2rem,4vw,3rem)",
              color: "#D4AF37",
              marginTop: "20px",
            }}
          >
            We Build Identity.
          </h2>

          <p
            style={{
              maxWidth: "850px",
              margin: "40px auto 0",
              color: "#999",
              lineHeight: 1.9,
              fontSize: "1.15rem",
            }}
          >
            Nabome is a premium Bengali streetwear
            and lifestyle brand created for people
            who want to express who they are.
            Every design is crafted to tell a story,
            celebrate culture, and inspire confidence.
          </p>
        </section>

        {/* STORY */}
        <section
          style={{
            padding: "100px 8%",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(350px,1fr))",
            gap: "60px",
            alignItems: "center",
          }}
        >
          <div>
            <img
              src="/images/community/community.jpeg"
              alt="Nabome Story"
              style={{
                width: "100%",
                borderRadius: "30px",
                objectFit: "cover",
                border:
                  "1px solid rgba(212,175,55,.12)",
              }}
            />
          </div>

          <div>
            <span
              style={{
                color: "#D4AF37",
                textTransform: "uppercase",
                letterSpacing: "3px",
              }}
            >
              Our Story
            </span>

            <h2
              style={{
                fontSize: "3rem",
                marginTop: "15px",
                marginBottom: "25px",
              }}
            >
              Born From Culture.
              <br />
              Designed For Today.
            </h2>

            <p
              style={{
                color: "#999",
                lineHeight: 1.9,
                marginBottom: "20px",
              }}
            >
              Nabome was founded with a simple
              belief: fashion should be more than
              trends. It should represent your
              story, your culture, and your
              ambition.
            </p>

            <p
              style={{
                color: "#999",
                lineHeight: 1.9,
              }}
            >
              Inspired by Bengali heritage and
              modern streetwear culture, our
              collections blend tradition,
              minimalism, and contemporary design.
            </p>
          </div>
        </section>

        {/* VALUES */}
        <section
          style={{
            padding: "100px 8%",
            background: "#0a0a0a",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "3rem",
              marginBottom: "60px",
            }}
          >
            What We Stand For
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "30px",
            }}
          >
            {[
              {
                title: "Premium Quality",
                text: "Carefully selected materials and exceptional finishing.",
              },
              {
                title: "Bengali Identity",
                text: "Celebrating culture through modern design.",
              },
              {
                title: "Sustainable Thinking",
                text: "Print-on-demand production with less waste.",
              },
              {
                title: "Authentic Expression",
                text: "Fashion created for individuality.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#111",
                  padding: "40px",
                  borderRadius: "24px",
                  border:
                    "1px solid rgba(212,175,55,.08)",
                }}
              >
                <h3
                  style={{
                    color: "#D4AF37",
                    marginBottom: "15px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: "#999",
                    lineHeight: 1.8,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section
          style={{
            padding: "100px 8%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "30px",
            }}
          >
            {[
              ["10K+", "Customers"],
              ["500+", "Designs"],
              ["99%", "Customer Satisfaction"],
              ["24/7", "Support"],
            ].map(([number, text]) => (
              <div
                key={text}
                style={{
                  background: "#111",
                  padding: "40px",
                  borderRadius: "24px",
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    color: "#D4AF37",
                    fontSize: "3rem",
                    marginBottom: "10px",
                  }}
                >
                  {number}
                </h2>

                <p style={{ color: "#999" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            padding: "120px 8%",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              marginBottom: "20px",
            }}
          >
            Wear Your Story.
          </h2>

          <p
            style={{
              color: "#999",
              maxWidth: "700px",
              margin: "0 auto 40px",
              lineHeight: 1.8,
            }}
          >
            Join thousands who choose fashion
            that reflects who they are.
          </p>

          <a
            href="/category"
            style={{
              display: "inline-block",
              padding: "18px 40px",
              borderRadius: "14px",
              textDecoration: "none",
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#FFD700,#D4AF37)",
              color: "#000",
            }}
          >
            Explore Collection
          </a>
        </section>
      </div>
    </>
  );
}