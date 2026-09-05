import { Mail } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { appConfig } from '@/lib/config';

const API_BASE = `${appConfig.PUBLIC_API_URL}/api/v1`;

export function Footer(): ReactNode {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    const throttleKey = 'newsletter_last_subscribe';
    const last = localStorage.getItem(throttleKey);
    if (last && Date.now() - Number(last) < 60000) {
      setErrorMsg('Please wait a minute before subscribing again');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (data as any).error || (data as any).message || 'Subscription failed',
        );
      localStorage.setItem(throttleKey, String(Date.now()));
      setIsSubscribed(true);
      setEmail('');
    } catch (error: any) {
      setErrorMsg(error.message || 'Subscription failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-(--border-default) bg-(--bg-surface)">
      <div className="mx-auto w-full max-w-(--container-default) px-4 py-12">
        <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-4">
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-(--text-primary)">
              নবME
            </h3>
            <p className="text-sm text-(--text-secondary)">
              Your premium destination for curated fashion and lifestyle
              products.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-(--text-tertiary) transition-colors hover:text-(--text-brand)"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-(--text-primary)">
              Customer Service
            </h4>
            <nav className="flex flex-col gap-2" aria-label="Customer service">
              <Link
                to="/help/contact"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Contact Us
              </Link>
              <Link
                to="/help/shipping"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Shipping & Delivery
              </Link>
              <Link
                to="/help/returns"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Returns & Exchanges
              </Link>
              <Link
                to="/help/faq"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                FAQ
              </Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-(--text-primary)">Company</h4>
            <nav className="flex flex-col gap-2" aria-label="Company">
              <Link
                to="/about"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                About Us
              </Link>
              <Link
                to="/careers"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Careers
              </Link>
              <Link
                to="/press"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Press
              </Link>
              <Link
                to="/sustainability"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Sustainability
              </Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-(--text-primary)">Legal</h4>
            <nav className="flex flex-col gap-2" aria-label="Legal">
              <Link
                to="/legal/terms"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Terms of Service
              </Link>
              <Link
                to="/legal/privacy"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Privacy Policy
              </Link>
              <Link
                to="/legal/cookies"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Cookie Policy
              </Link>
              <Link
                to="/legal/refunds"
                className="text-sm text-(--text-secondary) transition-colors hover:text-(--text-brand)"
              >
                Refund Policy
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-12 border-t border-(--border-subtle) pt-8">
          <div className="mx-auto max-w-md">
            <h4 className="mb-2 font-medium text-(--text-primary)">
              Subscribe to our newsletter
            </h4>
            <p className="mb-4 text-sm text-(--text-secondary)">
              Get the latest updates on new products and upcoming sales.
            </p>
            {isSubscribed ? (
              <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                Thank you for subscribing!
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col gap-2"
              >
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 rounded-md border border-(--border-default) bg-(--bg-surface) px-4 py-2 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none focus:ring-2 focus:ring-(--border-focus)"
                    aria-label="Email address"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-(--bg-brand) px-4 py-2 text-sm font-medium text-(--text-on-brand) transition-colors hover:bg-(--bg-brand-hover) disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
              </form>
            )}
          </div>
        </div>
        <div className="mt-12 border-t border-(--border-subtle) pt-8 text-center text-sm text-(--text-tertiary) tablet:text-left">
          <p>© {currentYear} নবME (Nabome). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
