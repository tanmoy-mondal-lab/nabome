import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { api } from "../../../lib/api/client";
import { Gift, TrendingUp, Award } from "lucide-react";

interface LoyaltyData {
  points: { points: number; tier: string; lifetimePoints: number };
  transactions: { id: string; points: number; type: string; description: string; createdAt: string }[];
  tiers: { name: string; minPoints: number; discountPercent: number; badgeColor: string }[];
  nextTier: { name: string; minPoints: number } | null;
}

export default function LoyaltyPage() {
  const { data, isLoading } = useQuery<LoyaltyData>({
    queryKey: ["loyalty", "points"],
    queryFn: () => api.get("/api/loyalty/points"),
  });

  const pts = data?.points;
  const nextTier = data?.nextTier;
  const progress = pts && nextTier ? (pts.points / nextTier.minPoints) * 100 : 0;

  return (
    <div className="container-page py-8">
      <Helmet><title>Loyalty Points — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">Loyalty Program</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="h-40 bg-neutral-100 animate-pulse rounded" />
          ) : pts ? (
            <>
              <div className="premium-card p-8 shadow-subtle">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Your Points</p>
                    <p className="text-4xl font-display text-neutral-900">{pts.points}</p>
                    <p className="text-sm text-neutral-500 mt-1 font-editorial">Lifetime: {pts.lifetimePoints} points</p>
                  </div>
                  <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center">
                    <Gift className="w-8 h-8 text-brand-500" />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
                      {pts.tier.charAt(0).toUpperCase() + pts.tier.slice(1)}
                    </span>
                    {nextTier && (
                      <span className="text-xs text-neutral-400">{nextTier.name} — {nextTier.minPoints - pts.points} points away</span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              </div>

              {data.tiers && data.tiers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-4 uppercase tracking-wide">Tier Benefits</h3>
                  <div className="grid md:grid-cols-4 gap-3">
                    {data.tiers.map((tier) => (
                      <div key={tier.name} className="premium-card p-4 shadow-subtle text-center">
                        <Award className="w-8 h-8 mx-auto mb-2" style={{ color: tier.badgeColor || "#8b6940" }} />
                        <p className="text-sm font-medium text-neutral-900">{tier.name.charAt(0).toUpperCase() + tier.name.slice(1)}</p>
                        <p className="text-xs text-neutral-500 mt-1">{tier.discountPercent}% off</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.transactions && data.transactions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-4 uppercase tracking-wide">Recent Points History</h3>
                  <div className="space-y-2">
                    {data.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded">
                        <div>
                          <p className="text-sm text-neutral-900">{tx.description || tx.type}</p>
                          <p className="text-xs text-neutral-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-sm font-medium ${tx.points > 0 ? "text-green-600" : "text-red-500"}`}>
                          {tx.points > 0 ? "+" : ""}{tx.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="premium-card p-12 text-center shadow-subtle">
              <TrendingUp className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-display text-neutral-900 mb-2">Earn Points</h3>
              <p className="text-sm text-neutral-500">Start earning loyalty points with every purchase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
