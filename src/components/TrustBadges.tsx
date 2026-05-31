export default function TrustBadges() {
  const badges = [
    ["Premium Materials", "Selected fabrics with strong handfeel, comfort and long-term durability."],
    ["Secure Ordering", "WhatsApp checkout keeps every size, color and address detail reviewable."],
    ["Easy Returns", "Exchange and return support is ready through customer care."],
    ["India Shipping", "Fast dispatch preparation for major Indian cities and towns."],
  ];

  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="card-grid">
        {badges.map(([title, text]) => (
          <article className="glass" key={title} style={{ padding: 24 }}>
            <h3>{title}</h3>
            <p className="lede" style={{ marginTop: 10, fontSize: ".95rem" }}>
              {text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
