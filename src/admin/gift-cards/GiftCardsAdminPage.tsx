import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api/admin";

export default function GiftCardsAdminPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [amount, setAmount] = useState(500);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "gift-cards"],
    queryFn: () => api.get("/api/admin/gift-cards"),
  });

  const createMutation = useMutation({
    mutationFn: (body: { amount: number; recipientName: string; recipientEmail: string }) => api.post("/api/admin/gift-cards", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "gift-cards"] });
      setShowCreate(false);
    },
  });

  const cards = (data as { giftCards?: { id: string; code: string; currentBalance: number; isActive: boolean; createdAt: string }[] })?.giftCards ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Gift Cards</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-brand-500 text-white text-sm rounded hover:bg-brand-600">
          Create Gift Card
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-neutral-500 block mb-1">Amount (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value) || 0)} className="input-field w-full" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1">Recipient Name</label>
              <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1">Recipient Email</label>
              <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="input-field w-full" />
            </div>
          </div>
          <button onClick={() => createMutation.mutate({ amount, recipientName, recipientEmail })} className="px-4 py-2 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-800">
            Create
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="h-40 bg-neutral-100 animate-pulse rounded" />
      ) : (
        <div className="bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-600">Code</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Balance</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {cards.map((card: { id: string; code: string; currentBalance: number; isActive: boolean; createdAt: string }) => (
                <tr key={card.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs">{card.code}</td>
                  <td className="px-4 py-3">₹{Number(card.currentBalance).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${card.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                      {card.isActive ? "Active" : "Used"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{new Date(card.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No gift cards yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
