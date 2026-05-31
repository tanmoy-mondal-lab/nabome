export default function ProductReviews() {
  const reviews = [
    {
      name: "Rahul",
      rating: 5,
      review:
        "Excellent quality. The fabric feels premium and the fit is perfect.",
    },
    {
      name: "Ananya",
      rating: 5,
      review:
        "Packaging, delivery and quality exceeded expectations.",
    },
    {
      name: "Arjun",
      rating: 4,
      review:
        "Very comfortable and stylish. Will order again.",
    },
  ];

  return (
    <section
      style={{
        marginTop: "120px",
      }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          marginBottom: "40px",
          color: "#fff",
        }}
      >
        Customer Reviews
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: "25px",
        }}
      >
        {reviews.map((review, index) => (
          <div
            key={index}
            style={{
              background: "#111",
              padding: "30px",
              borderRadius: "24px",
              border:
                "1px solid rgba(212,175,55,.08)",
            }}
          >
            <p
              style={{
                color: "#D4AF37",
                marginBottom: "15px",
              }}
            >
              {"★".repeat(review.rating)}
            </p>

            <p
              style={{
                color: "#ccc",
                lineHeight: 1.8,
                marginBottom: "20px",
              }}
            >
              {review.review}
            </p>

            <strong
              style={{
                color: "#fff",
              }}
            >
              {review.name}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}