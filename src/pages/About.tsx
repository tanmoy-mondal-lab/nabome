import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

export default function About() {
  const timeline = [
    ["2024", "The idea begins with Bengali identity, everyday utility and a desire for cleaner streetwear."],
    ["2025", "First silhouettes are refined around oversized cotton, restrained branding and accessible premium pricing."],
    ["2026", "NABOME becomes a production-ready digital storefront for community-led drops."],
  ];

  return (
    <>
      <SEO title="About NABOME | Bengali Streetwear Story" description="Discover NABOME's journey: premium Bengali streetwear inspired by culture, community and modern fashion." path="/about" />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">About NABOME</p>
              <h1 className="display">Designed in Bengal. Built for everywhere.</h1>
            </div>
            <p className="lede">
              NABOME blends Bengali cultural memory with elevated everyday silhouettes: quiet graphics, premium fabrics and a community-first streetwear attitude.
            </p>
          </div>
        </section>

        <section className="section editorial-band">
          <div className="container editorial-grid">
            <img src="/images/community/community.jpeg" alt="NABOME community in Bengal" />
            <div className="glass editorial-copy">
              <p className="eyebrow">Brand Story</p>
              <h2 className="heading">Culture without costume.</h2>
              <p className="lede">
                The design language is intentional: black, texture, proportion and a gold accent that feels ceremonial without becoming loud.
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
      </main>
    </>
  );
}
