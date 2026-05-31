export default function TrustBadges() {
  const badges = [
    {
      title: "Premium Materials",
      text: "Selected fabrics with exceptional comfort and durability.",
    },
    {
      title: "Secure Checkout",
      text: "Safe ordering experience with trusted payment methods.",
    },
    {
      title: "Easy Returns",
      text: "Simple return and replacement assistance.",
    },
    {
      title: "Fast Delivery",
      text: "Quick shipping across India.",
    },
  ];

  return (
    <section
      style={{
        marginTop: "60px",
        paddingTop: "50px",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        {badges.map((badge) => (
          <div
            key={badge.title}
            style={{
              padding: "25px",
              border: "1px solid #e5e5e5",
              background: "#fff",
            }}
          >
            <h4
              style={{
                color: "#111",
                marginBottom: "12px",
                fontWeight: 600,
              }}
            >
              {badge.title}
            </h4>

            <p
              style={{
                color: "#666",
                lineHeight: 1.8,
                fontSize: ".95rem",
              }}
            >
              {badge.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}