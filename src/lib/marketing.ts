import { supabase } from "./supabase";
import { neon, isNeonConnected } from "./neon";

export type CampaignType = "seasonal" | "promotional" | "referral" | "welcome" | "abandoned_cart" | "reorder";

export type Campaign = {
  id: string;
  name: string;
  type: CampaignType;
  startsAt: string;
  endsAt?: string;
  discountPercent?: number;
  discountFlat?: number;
  minOrderValue?: number;
  couponCode?: string;
  bannerImage?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
};

export type Referral = {
  id: string;
  referrerId: string;
  refereeId?: string;
  refereePhone?: string;
  code: string;
  status: "pending" | "converted" | "rewarded";
  discountAmount?: number;
  createdAt: string;
  convertedAt?: string;
};

const STORAGE_KEY = "nabome-marketing";

// ── Newsletter ──

export async function subscribeToNewsletter(email: string, name?: string, source?: string) {
  if (await isNeonConnected()) {
    try {
      const existing = await neon.select("newsletter_subscribers", { email });
      if (!existing.data || existing.data.length === 0) {
        await neon.insert("newsletter_subscribers", { email, name: name || null, source: source || "website" });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Subscription failed" };
    }
  }

  if (supabase) {
    try {
      const { error } = await supabase.from("newsletter_subscribers").upsert(
        { email, name: name || null, source: source || "website" },
        { onConflict: "email" }
      );
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Subscription failed" };
    }
  }

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!existing.find((s: any) => s.email === email)) {
      existing.push({ email, name, source, subscribedAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save subscription" };
  }
}

// ── Referral ──

export function generateReferralCode(userId: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const short = userId.slice(-4).toUpperCase();
  let code = `NAB${short}`;
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getReferralLink(code: string): string {
  return `https://www.nabome.online/register?ref=${code}`;
}

export async function createReferral(referral: Omit<Referral, "id" | "createdAt" | "status">) {
  if (await isNeonConnected()) {
    try {
      const result = await neon.insert("referrals", referral);
      return result.data?.[0] || null;
    } catch {
      return null;
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from("referrals").insert(referral).select().single();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  }

  const newRef: Referral = {
    ...referral,
    id: `mock_${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  try {
    const existing = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-referrals`) || "[]");
    existing.push(newRef);
    localStorage.setItem(`${STORAGE_KEY}-referrals`, JSON.stringify(existing));
  } catch {
    /* silently fail */
  }
  return newRef;
}

// ── Campaign / Banner helpers ──

export type PromoBanner = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  link?: string;
  active: boolean;
  priority: number;
};

export function getActiveCampaignBanners(campaigns: Campaign[], banners: PromoBanner[]): PromoBanner[] {
  const now = new Date().toISOString();
  const activeCampaignIds = new Set(
    campaigns
      .filter((c) => c.isActive && c.startsAt <= now && (!c.endsAt || c.endsAt >= now))
      .map((c) => c.id)
  );
  return banners
    .filter((b) => b.active && (activeCampaignIds.has(b.id) || true))
    .sort((a, b) => b.priority - a.priority);
}
