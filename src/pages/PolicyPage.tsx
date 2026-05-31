import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

const content = {
  shipping: {
    title: "Shipping Policy",
    description: "NABOME dispatches orders across India with WhatsApp-assisted updates and delivery preparation for 3-7 business days.",
    points: ["Orders are prepared after WhatsApp confirmation.", "Standard delivery estimate is 3-7 business days depending on location.", "Free shipping applies above ₹999.", "Tracking details are shared once the order is dispatched."],
  },
  returns: {
    title: "Return Policy",
    description: "NABOME supports easy returns and exchanges for eligible unused products with original packaging.",
    points: ["Raise return requests within 7 days of delivery.", "Products must be unused, unwashed and in original packaging.", "Size exchanges depend on inventory availability.", "Final sale and limited drop items may have restricted returns."],
  },
  privacy: {
    title: "Privacy Policy",
    description: "NABOME stores only the information required for shopping, communication, checkout and customer support.",
    points: ["Cart, wishlist and profile preferences are stored locally in your browser.", "Checkout details are used to prepare your WhatsApp order.", "Newsletter emails are used only for NABOME updates.", "We do not sell customer data."],
  },
  terms: {
    title: "Terms & Conditions",
    description: "By using NABOME you agree to product, ordering, payment, return and communication terms for the storefront.",
    points: ["Product colors may vary slightly by display.", "Prices and availability can change before order confirmation.", "WhatsApp checkout requires final review before submission.", "NABOME may update policies as operations scale."],
  },
};

export default function PolicyPage({ type }: { type: keyof typeof content }) {
  const page = content[type];

  return (
    <>
      <SEO title={`${page.title} | NABOME`} description={page.description} path={`/${type === "returns" ? "return-policy" : type === "terms" ? "terms" : `${type}-policy`}`} />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container glass" style={{ padding: "clamp(30px, 7vw, 72px)" }}>
            <p className="eyebrow">NABOME Care</p>
            <h1 className="display">{page.title}</h1>
            <p className="lede" style={{ marginTop: 24 }}>
              {page.description}
            </p>
            <div className="policy-list" style={{ marginTop: 40 }}>
              {page.points.map((point) => (
                <p key={point}>• {point}</p>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
