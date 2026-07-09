import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/admin";

interface Referral {
  id: string;
  referrerCode?: {
    profile?: {
      email?: string;
    };
  };
  referredEmail: string;
  status: string;
  createdAt: string;
}

interface ReferralsResponse {
  referrals: Referral[];
}

export default function ReferralsAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "referrals"],
    queryFn: () => api.get("/api/admin/referrals"),
  });

  const referrals = (data as ReferralsResponse)?.referrals ?? [];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Referrals</h1>
      {isLoading ? (
        <div className="h-40 bg-neutral-100 animate-pulse rounded" />
      ) : (
        <div className="bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-600">Referrer</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Referred Email</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {referrals.map((ref: Referral) => (
                <tr key={ref.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">{ref.referrerCode?.profile?.email || "N/A"}</td>
                  <td className="px-4 py-3">{ref.referredEmail}</td>
                  <td className="px-4 py-3 capitalize">{ref.status}</td>
                  <td className="px-4 py-3 text-neutral-400">{new Date(ref.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {referrals.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No referrals yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
