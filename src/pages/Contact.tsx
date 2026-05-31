import { useState } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useToast } from "../components/Toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const { showToast } = useToast();

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const openWhatsApp = () => {
    if (!form.name || !form.message) {
      showToast("Add your name and message first");
      return;
    }
    const text = `NABOME CONTACT REQUEST\n\nName: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\nMessage: ${form.message}`;
    window.open(`https://wa.me/919163854706?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <>
      <SEO title="Contact NABOME | WhatsApp Support" description="Contact NABOME for support, collaborations, orders and Bengali streetwear customer care." path="/contact" />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Contact</p>
              <h1 className="display">Let’s talk.</h1>
            </div>
            <p className="lede">Support, collaborations, sizing help or order questions: NABOME is built around direct customer care.</p>
          </div>

          <div className="container contact-grid">
            <div className="glass" style={{ padding: 32 }}>
              <p className="eyebrow">Details</p>
              <div className="policy-list" style={{ marginTop: 24 }}>
                <p>WhatsApp: +91 9163854706</p>
                <p>Email: support@nabome.in</p>
                <p>Business: business@nabome.in</p>
                <p>Hours: Monday to Saturday, 10 AM to 8 PM</p>
                <p>Location: Kolkata, West Bengal, India</p>
              </div>
            </div>
            <div className="glass contact-form">
              <input className="field" placeholder="Your name" value={form.name} onChange={(event) => update("name", event.target.value)} />
              <input className="field" placeholder="Email address" value={form.email} onChange={(event) => update("email", event.target.value)} />
              <input className="field" placeholder="Subject" value={form.subject} onChange={(event) => update("subject", event.target.value)} />
              <textarea className="field" rows={7} placeholder="Message" value={form.message} onChange={(event) => update("message", event.target.value)} />
              <button className="premium-button" onClick={openWhatsApp}>
                Send on WhatsApp
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
