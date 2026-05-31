import { useEffect, useState } from "react";

const quotes = [
  {
    text: "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি",
    attribution: "Rabindranath Tagore",
  },
  {
    text: "বাঙ্গালীর সর্বস্ব তব, মা যে তোর নয়নামৃত ধারা",
    attribution: "Kazi Nazrul Islam",
  },
  {
    text: "চলো যাই, চলো যাই, যেখানে আলোর উৎসব",
    attribution: "Jibanananda Das",
  },
  {
    text: "আমি বাংলায় গান গাই, আমি বাংলার গান গাই",
    attribution: "বাংলা সংস্কৃতি",
  },
  {
    text: "একটি শিল্পী কখনো তার সংস্কৃতি হারায় না",
    attribution: "নবME Philosophy",
  },
];

export default function BengaliQuoteRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bengali-quote-rotator">
      {quotes.map((quote, i) => (
        <div key={i} className={`bengali-quote ${i === index ? "active" : ""}`}>
          <div className="bengali-quote-text">{quote.text}</div>
          <div className="bengali-quote-attribution">{quote.attribution}</div>
        </div>
      ))}
    </div>
  );
}
