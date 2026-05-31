import Navbar from "../components/Navbar";
import { useState } from "react";

export default function Contact() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const openWhatsApp = () => {
    const text = `
NABOME CONTACT REQUEST

Name:
${name}

Email:
${email}

Subject:
${subject}

Message:
${message}
`;

    const encoded =
      encodeURIComponent(text);

    window.open(
      `https://wa.me/919163854706?text=${encoded}`,
      "_blank"
    );
  };

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
            padding: "120px 6% 80px",
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
            Contact
          </p>

          <h1
            style={{
              fontSize:
                "clamp(4rem,8vw,7rem)",
              fontWeight: 300,
              lineHeight: 1,
              marginTop: "20px",
            }}
          >
            Let's Talk
          </h1>

          <p
            style={{
              maxWidth: "700px",
              margin: "30px auto 0",
              color: "#666",
              lineHeight: 1.9,
              fontSize: "1.05rem",
            }}
          >
            Questions, support requests,
            collaborations or business
            enquiries — we'd love to hear
            from you.
          </p>
        </section>

        {/* CONTACT SECTION */}

        <section
          style={{
            padding: "80px 6%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(450px,1fr))",
              gap: "60px",
              alignItems: "start",
            }}
          >
            {/* LEFT */}

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
                Contact Information
              </p>

              <h2
                style={{
                  fontSize:
                    "clamp(2.5rem,5vw,4rem)",
                  fontWeight: 300,
                  marginTop: "20px",
                  marginBottom: "40px",
                }}
              >
                We're Here
                <br />
                To Help
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "30px",
                }}
              >
                <div>
                  <h4>
                    WhatsApp
                  </h4>

                  <p
                    style={{
                      color: "#666",
                      marginTop: "8px",
                    }}
                  >
                    +91 9163854706
                  </p>
                </div>

                <div>
                  <h4>Email</h4>

                  <p
                    style={{
                      color: "#666",
                      marginTop: "8px",
                    }}
                  >
                    support@nabome.in
                  </p>
                </div>

                <div>
                  <h4>
                    Business
                  </h4>

                  <p
                    style={{
                      color: "#666",
                      marginTop: "8px",
                    }}
                  >
                    business@nabome.in
                  </p>
                </div>

                <div>
                  <h4>
                    Working Hours
                  </h4>

                  <p
                    style={{
                      color: "#666",
                      marginTop: "8px",
                      lineHeight: 1.8,
                    }}
                  >
                    Monday – Saturday
                    <br />
                    10:00 AM – 8:00 PM
                  </p>
                </div>
              </div>
            </div>
                        {/* RIGHT */}

            <div
              style={{
                border:
                  "1px solid #e5e5e5",
                padding: "40px",
                background: "#fafafa",
              }}
            >
              <h3
                style={{
                  fontSize: "2rem",
                  fontWeight: 300,
                  marginBottom: "30px",
                }}
              >
                Send A Message
              </h3>

              <div
                style={{
                  display: "grid",
                  gap: "18px",
                }}
              >
                <input
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />

                <input
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
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) =>
                    setSubject(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />

                <textarea
                  rows={7}
                  placeholder="Your Message"
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  style={{
                    ...inputStyle,
                    resize: "none",
                  }}
                />

                <button
                  onClick={
                    openWhatsApp
                  }
                  style={{
                    padding: "18px",
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  Send Via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORT SERVICES */}

        <section
          style={{
            background: "#f8f6f2",
            padding: "100px 6%",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "60px",
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
              Support
            </p>

            <h2
              style={{
                fontSize:
                  "clamp(3rem,6vw,5rem)",
                fontWeight: 300,
                marginTop: "20px",
              }}
            >
              How Can We Help?
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
                  "Order Support",
                text:
                  "Track orders and delivery updates.",
              },
              {
                title:
                  "Returns & Exchanges",
                text:
                  "Quick assistance for replacements and returns.",
              },
              {
                title:
                  "Custom Requests",
                text:
                  "Special designs and collaboration enquiries.",
              },
              {
                title:
                  "Business Partnerships",
                text:
                  "Wholesale and partnership opportunities.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background:
                    "#fff",
                  padding: "35px",
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

        {/* CTA */}

        <section
          style={{
            background: "#111",
            color: "#fff",
            padding: "120px 6%",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize:
                "clamp(3rem,6vw,5rem)",
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            Ready To
            <br />
            Connect?
          </h2>

          <p
            style={{
              maxWidth: "650px",
              margin:
                "30px auto 40px",
              color: "#bbb",
              lineHeight: 1.9,
            }}
          >
            Reach out anytime and our
            team will get back to you as
            quickly as possible.
          </p>

          <a
            href="https://wa.me/919163854706"
            target="_blank"
            rel="noreferrer"
            style={{
              display:
                "inline-block",
              padding:
                "18px 40px",
              background:
                "#fff",
              color: "#111",
              textDecoration:
                "none",
              fontWeight:
                600,
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
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  outline: "none",
  fontSize: "1rem",
} as const;