import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

export default function About() {
  const timeline = [
    ["২০২৪", "The idea begins with Bengali identity, everyday utility and a desire for cleaner streetwear."],
    ["২০২৫", "First silhouettes are refined around oversized cotton, restrained branding and accessible premium pricing."],
    ["২০২৬", "নবME becomes a production-ready digital storefront for community-led drops."],
  ];

  return (
    <>
      <SEO title="About নবME | Bengali Streetwear Story" description="Discover নবME's journey: premium Bengali streetwear inspired by culture, community and modern fashion." path="/about" />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">About নবME</p>
              <h1 className="display">Designed in Bengal. Built for everywhere.</h1>
            </div>
            <p className="lede">
              নবME blends Bengali cultural memory with elevated everyday silhouettes: quiet graphics, premium fabrics and a community-first streetwear attitude.
            </p>
          </div>
        </section>

        <section className="section editorial-band">
          <div className="container editorial-grid">
            <img src="/images/community/community.jpeg" alt="নবME community in Bengal" />
            <div className="glass editorial-copy">
              <p className="eyebrow">Brand Story</p>
              <h2 className="heading">Culture without costume.</h2>
              <p className="lede">
                The design language is intentional: black, texture, proportion and a gold accent that feels ceremonial without becoming loud.
              </p>
              <div className="cultural-ornament" style={{ marginTop: 24 }}>◈</div>
              <p className="lede" style={{ marginTop: 18 }}>
                Every stitch carries the quiet confidence of a Bengali creative — rooted in tradition, looking forward.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">Journey</p>
            <h2 className="heading">From idea to drop.</h2>
            <div className="timeline">
              {timeline.map(([year, text]) => (
                <article className="glass" key={year}>
                  <strong>{year}</strong>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section editorial-band">
          <div className="container" style={{ textAlign: "center", maxWidth: 800 }}>
            <p className="eyebrow">বাংলা হেরিটেজ</p>
            <h2 className="heading">Rooted in Bengal's creative soul.</h2>
            <p className="lede" style={{ margin: "24px auto 0" }}>
              From the addas of North Kolkata to the streets of Salt Lake — নবME is a love letter to Bengal's enduring aesthetic sensibility.
            </p>
            <div className="cultural-ornament" style={{ marginTop: 32 }}>◈</div>
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
              <span className="bengali-season-badge">শিল্প</span>
              <span className="bengali-season-badge">সাহিত্য</span>
              <span className="bengali-season-badge">ফ্যাশন</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
