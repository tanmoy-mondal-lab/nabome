import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api/client";
import { TurnstileWidget } from "../../components/TurnstileWidget";
import { turnstileEnabled, turnstileSiteKey } from "../../lib/config";

interface NewsletterFormProps {
  layout?: "stacked" | "inline";
}

export function NewsletterForm({ layout = "stacked" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const isInline = layout === "inline";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    if (turnstileEnabled && !turnstileToken) {
      setStatus("error");
      setTurnstileError("Please complete the verification challenge");
      return;
    }

    let shouldResetTurnstile = turnstileEnabled && !!turnstileToken;
    setStatus("loading");
    try {
      await api.post("/api/contact", { action: "newsletter", email, turnstileToken: turnstileToken || undefined });
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    } finally {
      if (shouldResetTurnstile) {
        setTurnstileToken("");
        setTurnstileNonce((value) => value + 1);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={isInline ? "flex w-full max-w-md flex-col gap-3" : "space-y-3"}>
      <div className="flex border-b border-white/20 pb-1">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setTurnstileError("");
          }}
          placeholder="Enter your email"
          required
          className="flex-1 bg-transparent text-sm py-2 text-white placeholder-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={(turnstileEnabled && !turnstileToken) || status === "loading"}
          className="text-xs uppercase tracking-widest font-medium text-accent-gold hover:text-accent-goldLight transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed px-4 flex items-center gap-2"
        >
          {status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {turnstileEnabled && (
        <TurnstileWidget
          key={turnstileNonce}
          siteKey={turnstileSiteKey}
          onTokenChange={(token) => {
            setTurnstileToken(token);
            if (token) setTurnstileError("");
          }}
          onError={setTurnstileError}
          size={isInline ? "compact" : "normal"}
          className={isInline ? "self-start" : ""}
        />
      )}
      {status === "success" && <p className="text-xs text-green-600">Thank you for subscribing!</p>}
      {(status === "error" || turnstileError) && <p className="text-xs text-red-500">{turnstileError || "Something went wrong. Try again."}</p>}
    </form>
  );
}
