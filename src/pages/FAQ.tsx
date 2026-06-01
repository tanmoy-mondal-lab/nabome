import { useState } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Add items to your bag, proceed to checkout, enter your delivery details, and choose WhatsApp or UPI payment. Your order will be confirmed after review.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI payments (GPay, PhonePe, Paytm) and WhatsApp order requests. UPI payments are processed instantly, and WhatsApp orders are reviewed before dispatch.",
  },
  {
    q: "Do I need an account to order?",
    a: "No account is required. However, creating a profile lets you save your address book, view order history, and speed up future checkouts.",
  },
  {
    q: "How is login handled?",
    a: "Simply enter your phone number or email address. If you already have a profile, you'll be logged in instantly — no password or OTP needed.",
  },
  {
    q: "What is the delivery timeline?",
    a: "Orders are dispatched within 1-3 business days. Standard delivery takes 3-7 business days across India, depending on your location.",
  },
  {
    q: "Do you offer free shipping?",
    a: "Yes, free shipping is available on all orders above ₹999. A flat ₹99 shipping charge applies for orders below that.",
  },
  {
    q: "Can I track my order?",
    a: "Yes, use the Order Tracking page on our website with your order number. WhatsApp updates are also sent once your order is dispatched.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery. Items must be unused, unwashed, and in original packaging. Initiate a return by contacting our support team.",
  },
  {
    q: "How do I cancel an order?",
    a: "Orders can be cancelled within 2 hours of placement free of charge. After that but before dispatch, a 5% processing fee may apply. Shipped orders cannot be cancelled.",
  },
  {
    q: "How do I contact customer support?",
    a: "You can reach us via WhatsApp at +91 9163854706 or email. Our team typically responds within a few hours during business hours.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently, we ship only within India. International shipping will be available in future phases.",
  },
  {
    q: "Can I change or modify my order after placing it?",
    a: "Modifications are possible before dispatch. Contact us via WhatsApp with your order number and the changes you need.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <SEO title="FAQ | নবME" description="Frequently asked questions about ordering, shipping, returns, payments and more at নবME." path="/faq" structuredData={structuredData} />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Help</p>
              <h1 className="display">Frequently Asked Questions</h1>
            </div>
            <p className="lede">
              Everything you need to know about ordering, shipping, returns, payments and more at নবME.
            </p>
          </div>

          <div className="container" style={{ maxWidth: 760 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px 0",
                    border: "none",
                    background: "transparent",
                    color: "var(--text)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "1rem",
                    fontWeight: 500,
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{
                    fontSize: "1.2rem",
                    color: "var(--gold)",
                    transition: "transform 0.3s",
                    transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
                    flexShrink: 0,
                  }}>
                    +
                  </span>
                </button>
                {openIndex === i && (
                  <div style={{
                    padding: "0 0 20px",
                    color: "var(--muted)",
                    fontSize: ".95rem",
                    lineHeight: 1.7,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
