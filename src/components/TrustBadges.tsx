export default function TrustBadges() {
  const badges = [
    {
      title: "Premium Quality",
      text: "Carefully selected materials",
    },
    {
      title: "Secure Checkout",
      text: "Safe order processing",
    },
    {
      title: "Easy Returns",
      text: "Customer-first support",
    },
    {
      title: "Fast Delivery",
      text: "Quick nationwide shipping",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(180px,1fr))",
        gap: "15px",
        marginTop: "40px",
      }}
    >
      {badges.map((badge) => (
        <div
          key={badge.title}
          style={{
            background: "#111",
            padding: "20px",
            borderRadius: "16px",
            textAlign: "center",
            border:
              "1px solid rgba(212,175,55,.08)",
          }}
        >
          <h4
            style={{
              color: "#D4AF37",
              marginBottom: "8px",
            }}
          >
            {badge.title}
          </h4>

          <p
            style={{
              color: "#999",
              fontSize: ".9rem",
            }}
          >
            {badge.text}
          </p>
        </div>
      ))}
    </div>
  );
}