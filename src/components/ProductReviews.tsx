export default function ProductReviews() {
  const reviews = [
    ["Rahul Sharma", "Kolkata", 5, "The fabric feels substantial, the fit is clean, and the black looks genuinely premium."],
    ["Ananya Das", "Bengaluru", 5, "Loved the cultural details without it feeling loud. Packaging and support were excellent."],
    ["Arjun Roy", "Mumbai", 4, "Minimal, comfortable and well finished. The oversized tee has become a weekly staple."],
  ] as const;

  return (
    <section className="section">
      <div className="split-intro" style={{ marginBottom: 34 }}>
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="heading">Customer notes</h2>
        </div>
      </div>
      <div className="card-grid">
        {reviews.map(([name, city, rating, review]) => (
          <article className="glass" key={name} style={{ padding: 30 }}>
            <div style={{ color: "var(--gold)", marginBottom: 18 }}>{"★".repeat(rating)}</div>
            <p className="lede" style={{ fontSize: ".98rem" }}>
              {review}
            </p>
            <h4 style={{ marginTop: 24 }}>{name}</h4>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>{city}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
