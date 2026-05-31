export default function ProductReviews() {
  const reviews = [
    {
      name: "Rahul Sharma",
      city: "Kolkata",
      rating: 5,
      review:
        "Excellent quality and fit. The fabric feels premium and the finishing is outstanding.",
    },
    {
      name: "Ananya Das",
      city: "Bengaluru",
      rating: 5,
      review:
        "Beautiful packaging and excellent customer experience. Definitely purchasing again.",
    },
    {
      name: "Arjun Roy",
      city: "Mumbai",
      rating: 4,
      review:
        "Minimal design, comfortable fit and premium construction. Very satisfied.",
    },
  ];

  return (
    <section
      style={{
        marginTop: "120px",
        paddingTop: "80px",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          marginBottom: "60px",
        }}
      >
        <span
          style={{
            textTransform: "uppercase",
            letterSpacing: "3px",
            color: "#888",
            fontSize: ".85rem",
          }}
        >
          Reviews
        </span>

        <h2
          style={{
            fontSize: "clamp(2.5rem,5vw,4rem)",
            fontWeight: 300,
            color: "#111",
            marginTop: "15px",
          }}
        >
          Customer Experiences
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(320px,1fr))",
          gap: "25px",
        }}
      >
        {reviews.map((review, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #e5e5e5",
              padding: "35px",
              background: "#fff",
            }}
          >
            <div
              style={{
                color: "#111",
                marginBottom: "20px",
                fontSize: "1rem",
              }}
            >
              {"★".repeat(review.rating)}
            </div>

            <p
              style={{
                color: "#666",
                lineHeight: 1.9,
                marginBottom: "30px",
              }}
            >
              {review.review}
            </p>

            <h4
              style={{
                color: "#111",
                marginBottom: "5px",
                fontWeight: 600,
              }}
            >
              {review.name}
            </h4>

            <p
              style={{
                color: "#999",
                fontSize: ".9rem",
              }}
            >
              {review.city}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}