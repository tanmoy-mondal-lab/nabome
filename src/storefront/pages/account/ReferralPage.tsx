import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { api } from "../../../lib/api/client";
import { Share2, Copy, Check, Users, Gift } from "lucide-react";

interface ReferralData {
  referralCode: { code: string; totalReferrals: number; totalRewards: string };
  referrals: { id: string; referredEmail: string; status: string; createdAt: string; rewardAmount: string | null }[];
}

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ["referral", "my-referrals"],
    queryFn: () => api.get("/api/referral/my-referrals"),
  });

  const code = data?.referralCode?.code;
  const referralLink = code ? `${window.location.origin}/register?ref=${code}` : "";

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareReferral() {
    if (!referralLink) return;
    if (navigator.share) {
      navigator.share({ title: "Join নবME", text: "Use my referral code for exclusive benefits!", url: referralLink });
    } else {
      copyLink();
    }
  }

  return (
    <div className="container-page py-8">
      <Helmet><title>Refer a Friend — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">Refer a Friend</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="h-40 bg-neutral-100 animate-pulse rounded" />
          ) : code ? (
            <>
              <div className="premium-card p-8 shadow-subtle">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Your Referral Code</p>
                    <p className="text-3xl font-display tracking-widest text-brand-500 mb-4">{code}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={copyLink} className="btn-primary flex items-center gap-2 text-xs">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <button onClick={shareReferral} className="btn-outline flex items-center gap-2 text-xs">
                        <Share2 className="w-3 h-3" /> Share
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                      <p className="text-2xl font-display text-neutral-900">{data.referralCode.totalReferrals}</p>
                      <p className="text-xs text-neutral-500">Referrals</p>
                    </div>
                    <div className="text-center">
                      <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-display text-neutral-900">₹{Number(data.referralCode.totalRewards).toFixed(0)}</p>
                      <p className="text-xs text-neutral-500">Earned</p>
                    </div>
                  </div>
                </div>
              </div>

              {data.referrals && data.referrals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-4 uppercase tracking-wide">Referral History</h3>
                  <div className="space-y-2">
                    {data.referrals.map((ref) => (
                      <div key={ref.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded">
                        <div>
                          <p className="text-sm text-neutral-900">{ref.referredEmail}</p>
                          <p className="text-xs text-neutral-400">{new Date(ref.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs font-medium uppercase ${ref.status === "completed" ? "text-green-600" : ref.status === "pending" ? "text-amber-500" : "text-neutral-400"}`}>
                          {ref.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="premium-card p-12 text-center shadow-subtle">
              <Share2 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-display text-neutral-900 mb-2">Refer & Earn</h3>
              <p className="text-sm text-neutral-500 mb-4">Invite friends and earn rewards for each successful referral.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
