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
      <SEO title="About NABOME | Bengali Streetwear Story" description="Discover NABOME's journey: premium Bengali streetwear inspired by culture, community and modern fashion. Founded in Kolkata, blending heritage with contemporary style." path="/about" />
      <Navbar />
      <main className="page">
        {/* Hero Section */}
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

        {/* Founder Story */}
        <section className="section editorial-band">
          <div className="container editorial-grid">
            <img src="/images/community/community.jpeg" alt="NABOME founder in Kolkata" />
            <div className="glass editorial-copy">
              <p className="eyebrow">Founder's Vision</p>
              <h2 className="heading">From Kolkata Streets to Global Streetwear</h2>
              <p className="lede">
                NABOME was born in the bustling addas of North Kolkata, where founder Tanmoy Mondal observed how Bengalis express identity through subtle details — the way a gamcha is draped, the precision of a kolkata cut, the understated elegance of traditional motifs reimagined for modern life.
              </p>
              <p className="lede" style={{ marginTop: 16 }}>
                Frustrated by streetwear that either appropriated Bengali culture superficially or ignored it entirely, he set out to create something authentic: premium basics that speak to Bengali sensibility without costume or caricature.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Philosophy */}
        <section className="section">
          <div className="container">
            <p className="eyebrow">Brand Philosophy</p>
            <h2 className="heading">Culture Without Costume</h2>
            <p className="lede">
              The design language is intentional: black as a canvas, texture as storytelling, proportion as respect, and a gold accent (sonar kanai) that feels ceremonial without becoming loud. Every piece asks: "What would a Bengali creative wear if they were designing for themselves?"
            </p>
            <p className="lede" style={{ marginTop: 24 }}>
              This isn't about putting traditional motifs on hoodies. It's about understanding the Bengali approach to aesthetics — where less is more, where quality speaks louder than logos, and where everyday clothing carries quiet confidence.
            </p>
          </div>
        </section>

        {/* Craft & Community */}
        <section className="section editorial-band">
          <div className="container editorial-grid">
            <div className="glass editorial-copy">
              <p className="eyebrow">Made With Intention</p>
              <h2 className="heading">From Thread to Finish</h2>
              <p className="lede">
                We source premium cotton from trusted mills, focusing on weight, drape, and longevity. Each garment undergoes careful construction — reinforced seams, balanced proportions, and details that reward closer look.
              </p>
              <p className="lede" style={{ marginTop: 16 }}>
                Production happens in small batches to maintain quality control and reduce waste. We believe in clothes that last, not trends that expire.
              </p>
            </div>
            <img src="/images/community/community.jpeg" alt="NABOME craftsmanship details" />
          </div>
        </section>

        {/* Timeline */}
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

        {/* Kolkata Connection */}
        <section className="section editorial-band">
          <div className="container" style={{ textAlign: "center", maxWidth: 800 }}>
            <p className="eyebrow">বাংলা হেরিটেজ</p>
            <h2 className="heading">Rooted in Bengal's creative soul.</h2>
            <p className="lede" style={{ margin: "24px auto 0" }}>
              From the addas of North Kolkata to the streets of Salt Lake — নবME is a love letter to Bengal's enduring aesthetic sensibility. We draw inspiration from:
            </p>
            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
              <div className="glass" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 12, color: "var(--text)" }}>আড্ডা Culture</h3>
                <p className="lede" style={{ color: "var(--muted)" }}>Where ideas brew over chai and conversation</p>
              </div>
              <div className="glass" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 12, color: "var(--text)" }}>Literary Heritage</h3>
                <p className="lede" style={{ color: "var(--muted)" }}>From Tagore to contemporary Bengali writers</p>
              </div>
              <div className="glass" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 12, color: "var(--text)" }}>Cinematic Influence</h3>
                <p className="lede" style={{ color: "var(--muted)" }}>Ray, Ghatak, and modern Bengali cinema</p>
              </div>
              <div className="glass" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 12, color: "var(--text)" }}>Artisanal Craft</h3>
                <p className="lede" style={{ color: "var(--muted)" }}>Jamdani, kantha, and traditional textiles</p>
              </div>
            </div>
            <div className="cultural-ornament" style={{ marginTop: 32 }}>◈</div>
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
              <span className="bengali-season-badge">শিল্প</span>
              <span className="bengali-season-badge">সাহিত্য</span>
              <span className="bengali-season-badge">ফ্যাশন</span>
            </div>
          </div>
        </section>
        
        {/* Community & Values */}
        <section className="section">
          <div className="container">
            <p className="eyebrow">Our Commitment</p>
            <h2 className="heading">More Than Clothing</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 30, marginTop: 24 }}>
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16, color: "var(--text)" }}>Community First</h3>
                <p className="lede" style={{ color: "var(--muted)" }}>We collaborate with Bengali artists, designers, and storytellers for limited drops that celebrate local creativity.</p>
              </div>
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16, color: "var(--text)" }}>Quality Over Quantity</h3>
                <p className="lede" style={{ color: "var(--muted)" }}>Thoughtfully made pieces designed to be worn and loved for years, not seasons.</p>
              </div>
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16, color: "var(--text)" }}>Bengali Pride</h3>
                <p className="lede" style={{ color: "var(--muted)" }}>Wearing NABOME means carrying a piece of Bengal's creative spirit with you, wherever you go.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer CTA */}
        <section className="section" style={{ background: "var(--surface)", padding: "80px 6%" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 300, marginBottom: 24 }}>Stay Connected</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 24px" }}>
              Join our journey as we build modern classics rooted in Bengali sensibility. New drops, stories, and community collaborations coming soon.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://instagram.com/nabome.online" target="_blank" rel="noreferrer" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 8, 
                padding: "12px 24px", 
                border: "1px solid var(--line)", 
                background: "transparent", 
                color: "var(--text)", 
                fontWeight: 500,
                fontSize: "0.95rem",
                borderRadius: 4
              }}>
                Instagram
              </a>
              <a href="https://wa.me/919163854706" target="_blank" rel="noreferrer" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 8, 
                padding: "12px 24px", 
                background: "var(--gold)", 
                color: "#050505", 
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: 4
              }}>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
