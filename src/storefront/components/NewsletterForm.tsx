import { useState } from "react";
import { api } from "../../lib/api/client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post("/api/contact", { action: "newsletter", email });
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex border-b-2 border-neutral-900 pb-1">
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" required
          className="flex-1 bg-transparent text-sm py-2 placeholder-neutral-400 focus:outline-none"
        />
        <button type="submit" className="text-xs uppercase tracking-widest font-medium hover:text-brand-500 transition-colors">
          Subscribe
        </button>
      </div>
      {status === "success" && <p className="text-xs text-green-600">Thank you for subscribing!</p>}
      {status === "error" && <p className="text-xs text-red-500">Something went wrong. Try again.</p>}
    </form>
  );
}
