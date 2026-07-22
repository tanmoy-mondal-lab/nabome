import { Share2, Facebook, Twitter, Mail, Link } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils/cn";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

export function SocialShare({ url, title, description, className }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || "");

  const shareLinks = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: Twitter,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: Share2,
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
      icon: Mail,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      if (import.meta.env.DEV) console.debug("Clipboard write failed:", err);
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-neutral-400">Share</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            window.open(link.href, link.name, "width=600,height=400");
          }}
          className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-all"
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="w-3.5 h-3.5" />
        </a>
      ))}
      <button
        onClick={copyLink}
        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-all"
        aria-label="Copy link"
      >
        {copied ? (
          <span className="text-[8px] font-medium text-green-600">Copied!</span>
        ) : (
          <Link className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
