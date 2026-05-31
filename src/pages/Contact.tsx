import Navbar from "../components/Navbar";

export default function Contact() {
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
            padding: "120px 8% 80px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "#D4AF37",
              textTransform: "uppercase",
              letterSpacing: "4px",
              fontSize: ".85rem",
            }}
          >
            Get In Touch
          </span>

          <h1
            style={{
              fontSize: "clamp(4rem,8vw,7rem)",
              fontWeight: 900,
              marginTop: "20px",
              lineHeight: ".95",
            }}
          >
            LET'S TALK.
          </h1>

          <p
            style={{
              color: "#999",
              maxWidth: "700px",
              margin: "30px auto 0",
              lineHeight: 1.8,
              fontSize: "1.1rem",
            }}
          >
            Have questions, custom requests, business
            inquiries, or need support? Our team is
            always ready to help.
          </p>
        </section>

        {/* CONTACT SECTION */}
        <section
          style={{
            padding: "0 8% 120px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(350px,1fr))",
              gap: "40px",
            }}
          >
            {/* LEFT */}
            <div
              style={{
                background:
                  "linear-gradient(180deg,#111,#0b0b0b)",
                border:
                  "1px solid rgba(212,175,55,.08)",
                borderRadius: "30px",
                padding: "40px",
              }}
            >
              <h2
                style={{
                  marginBottom: "30px",
                }}
              >
                Contact Information
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "25px",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#D4AF37",
                      marginBottom: "5px",
                    }}
                  >
                    WhatsApp
                  </p>

                  <h3>+91 9163854706</h3>
                </div>

                <div>
                  <p
                    style={{
                      color: "#D4AF37",
                      marginBottom: "5px",
                    }}
                  >
                    Email
                  </p>

                  <h3>
                    support@nabome.in
                  </h3>
                </div>

                <div>
                  <p
                    style={{
                      color: "#D4AF37",
                      marginBottom: "5px",
                    }}
                  >
                    Business
                  </p>

                  <h3>
                    business@nabome.in
                  </h3>
                </div>

                <div>
                  <p
                    style={{
                      color: "#D4AF37",
                      marginBottom: "5px",
                    }}
                  >
                    Working Hours
                  </p>

                  <h3>
                    Monday - Saturday
                    <br />
                    10:00 AM - 8:00 PM
                  </h3>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div
              style={{
                background:
                  "linear-gradient(180deg,#111,#0b0b0b)",
                border:
                  "1px solid rgba(212,175,55,.08)",
                borderRadius: "30px",
                padding: "40px",
              }}
            >
              <h2
                style={{
                  marginBottom: "30px",
                }}
              >
                Send Message
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  window.open(
                    "https://wa.me/919163854706",
                    "_blank"
                  );
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                  }}
                >
                  <input
                    placeholder="Your Name"
                    style={inputStyle}
                  />

                  <input
                    placeholder="Email Address"
                    style={inputStyle}
                  />

                  <input
                    placeholder="Subject"
                    style={inputStyle}
                  />

                  <textarea
                    placeholder="Your Message"
                    rows={6}
                    style={{
                      ...inputStyle,
                      resize: "none",
                    }}
                  />

                  <button
                    type="submit"
                    style={{
                      padding: "18px",
                      border: "none",
                      borderRadius: "14px",
                      cursor: "pointer",
                      fontWeight: 800,
                      fontSize: "1rem",
                      background:
                        "linear-gradient(135deg,#FFD700,#D4AF37)",
                      color: "#000",
                    }}
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* SUPPORT CARDS */}
        <section
          style={{
            padding: "0 8% 120px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "3rem",
              marginBottom: "50px",
            }}
          >
            We're Here To Help
          </h2>

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
                title: "Order Support",
                text: "Track orders and delivery updates.",
              },
              {
                title: "Returns",
                text: "Easy replacement and return assistance.",
              },
              {
                title: "Custom Orders",
                text: "Special requests and collaborations.",
              },
              {
                title: "Business Enquiries",
                text: "Partnership and wholesale opportunities.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#111",
                  padding: "35px",
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

        {/* CTA */}
        <section
          style={{
            padding: "0 8% 120px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              marginBottom: "20px",
            }}
          >
            Ready To Connect?
          </h2>

          <p
            style={{
              color: "#999",
              marginBottom: "40px",
            }}
          >
            Reach out and we'll get back to you
            as soon as possible.
          </p>

          <a
            href="https://wa.me/919163854706"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "18px 40px",
              borderRadius: "14px",
              textDecoration: "none",
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#25D366,#128C7E)",
              color: "#fff",
            }}
          >
            Chat On WhatsApp
          </a>
        </section>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid #222",
  background: "#0a0a0a",
  color: "#fff",
  outline: "none",
  fontSize: "1rem",
} as const;