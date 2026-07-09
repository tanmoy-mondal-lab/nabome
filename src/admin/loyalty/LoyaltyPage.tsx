import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api/admin";

export default function LoyaltyAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "loyalty"],
    queryFn: () => api.get("/api/admin/loyalty"),
  });

  const adjustMutation = useMutation({
    mutationFn: (body: { profileId: string; points: number; reason: string }) =>
      api.post("/api/admin/loyalty/adjust", body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "loyalty"] }),
  });

  const accounts = (data as { loyaltyAccounts?: { id: string; profile?: { email: string }; profileId: string; points: number; tier: string }[] })?.loyaltyAccounts ?? [];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Loyalty Program</h1>
      {isLoading ? (
        <div className="h-40 bg-neutral-100 animate-pulse rounded" />
      ) : (
        <div className="bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-600">Customer</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Points</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Tier</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {accounts.map((acc: { id: string; profile?: { email: string }; profileId: string; points: number; tier: string }) => (
                <tr key={acc.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">{acc.profile?.email || "N/A"}</td>
                  <td className="px-4 py-3 font-medium">{acc.points}</td>
                  <td className="px-4 py-3 capitalize">{acc.tier}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const pts = prompt("Points to adjust:");
                        if (pts) adjustMutation.mutate({ profileId: acc.profileId, points: parseInt(pts), reason: "Admin adjustment" });
                      }}
                      className="text-xs text-brand-500 hover:underline"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No loyalty accounts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
