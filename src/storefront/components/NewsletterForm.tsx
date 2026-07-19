import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
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

    const shouldResetTurnstile = turnstileEnabled && !!turnstileToken;
    setStatus("loading");
    try {
      await api.post("/api/contact", { action: "newsletter", email, turnstileToken: turnstileToken || undefined });
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error("Newsletter subscription failed:", err);
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
          aria-label="Email address"
          aria-invalid={status === "error"}
        />
        <button
          type="submit"
          disabled={(turnstileEnabled && !turnstileToken) || status === "loading"}
          className="text-xs uppercase tracking-widest font-medium text-accent-gold hover:text-accent-goldLight transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed px-4 flex items-center gap-2"
          aria-label={status === "loading" ? "Subscribing to newsletter" : "Subscribe to newsletter"}
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
      {status === "success" && (
        <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Thank you for subscribing!</span>
        </div>
      )}
      {(status === "error" || turnstileError) && (
        <div className="flex items-center gap-2 text-red-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">{turnstileError || "Something went wrong. Try again."}</span>
        </div>
      )}
    </form>
  );
}
