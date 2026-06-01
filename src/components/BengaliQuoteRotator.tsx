import { useEffect, useState } from "react";
import { getSiteQuotes, seedDefaultQuotesIfEmpty, type SiteQuote } from "../lib/db";

const FALLBACK_QUOTES: SiteQuote[] = [
  { id: "f1", text: "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি", attribution: "Rabindranath Tagore", is_active: true, sort_order: 0 },
  { id: "f2", text: "বাঙ্গালীর সর্বস্ব তব, মা যে তোর নয়নামৃত ধারা", attribution: "Kazi Nazrul Islam", is_active: true, sort_order: 1 },
  { id: "f3", text: "চলো যাই, চলো যাই, যেখানে আলোর উৎসব", attribution: "Jibanananda Das", is_active: true, sort_order: 2 },
  { id: "f4", text: "আমি বাংলায় গান গাই, আমি বাংলার গান গাই", attribution: "বাংলা সংস্কৃতি", is_active: true, sort_order: 3 },
  { id: "f5", text: "একটি শিল্পী কখনো তার সংস্কৃতি হারায় না", attribution: "নবME Philosophy", is_active: true, sort_order: 4 },
];

export default function BengaliQuoteRotator() {
  const [index, setIndex] = useState(0);
  const [quotes, setQuotes] = useState<SiteQuote[]>(FALLBACK_QUOTES);

  useEffect(() => {
    let mounted = true;
    async function load() {
      await seedDefaultQuotesIfEmpty();
      const dbQuotes = await getSiteQuotes();
      if (mounted && dbQuotes.length > 0) {
        setQuotes(dbQuotes);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (quotes.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  if (quotes.length === 0) return null;

  return (
    <div className="bengali-quote-rotator">
      {quotes.map((quote, i) => (
        <div key={quote.id} className={`bengali-quote ${i === index ? "active" : ""}`}>
          <div className="bengali-quote-text">{quote.text}</div>
          <div className="bengali-quote-attribution">{quote.attribution}</div>
        </div>
      ))}
    </div>
  );
}
