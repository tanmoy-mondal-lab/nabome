import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { api } from "../../../lib/api/client";
import { Gift, Plus, CreditCard } from "lucide-react";

export default function GiftCardsPage() {
  const [showPurchase, setShowPurchase] = useState(false);
  const [amount, setAmount] = useState(500);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["gift-cards", "my-cards"],
    queryFn: () => api.get("/api/gift-cards/my-cards"),
  });

  const purchaseMutation = useMutation({
    mutationFn: (body: { amount: number; recipientEmail?: string; recipientName?: string; message?: string }) =>
      api.post("/api/gift-cards/purchase", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gift-cards"] });
      setShowPurchase(false);
      setAmount(500);
      setRecipientEmail("");
      setRecipientName("");
      setMessage("");
    },
  });

  const giftCards = (data as { giftCards?: { id: string; isActive: boolean; currentBalance: number | string; code?: string; expiresAt?: string }[] })?.giftCards ?? [];

  return (
    <div className="container-page py-8">
      <Helmet><title>Gift Cards — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-display text-neutral-900 tracking-fashion">Gift Cards</h1>
        <button onClick={() => setShowPurchase(!showPurchase)} className="btn-primary flex items-center gap-2">
          <Plus className="w-3 h-3" /> Purchase
        </button>
      </div>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-6">
          {showPurchase && (
            <div className="premium-card p-6 shadow-subtle">
              <h3 className="text-sm font-medium text-neutral-900 mb-4 uppercase tracking-wide">Purchase Gift Card</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Amount (₹)</label>
                  <div className="flex gap-2">
                    {[500, 1000, 2000, 5000].map((val) => (
                      <button key={val} onClick={() => setAmount(val)} className={`px-4 py-2 text-sm border ${amount === val ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-400"} transition-colors`}>
                        ₹{val}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Recipient Name</label>
                    <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="input-field w-full" placeholder="Friend's name" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Recipient Email</label>
                    <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="input-field w-full" placeholder="friend@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Message (optional)</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input-field w-full h-20" placeholder="Write a personal message..." />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowPurchase(false)} className="btn-ghost">Cancel</button>
                  <button onClick={() => purchaseMutation.mutate({ amount, recipientName, recipientEmail, message })} disabled={purchaseMutation.isPending || !amount} className="btn-primary">
                    {purchaseMutation.isPending ? "Processing..." : "Purchase ₹" + amount}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="h-40 bg-neutral-100 animate-pulse rounded" />
          ) : giftCards.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {giftCards.map((card) => (
                <div key={card.id} className="premium-card p-5 shadow-subtle border border-brand-100 bg-gradient-to-br from-white to-brand-50">
                  <div className="flex items-center justify-between mb-4">
                    <Gift className="w-6 h-6 text-brand-500" />
                    <span className={`text-xs uppercase ${card.isActive ? "text-green-600" : "text-neutral-400"}`}>
                      {card.isActive ? "Active" : "Used"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-1">Balance</p>
                  <p className="text-2xl font-display text-neutral-900">₹{Number(card.currentBalance).toFixed(2)}</p>
                  <div className="mt-3 pt-3 border-t border-brand-100">
                    <p className="text-xs text-neutral-400">
                      Code: <span className="font-mono">{card.code}</span>
                    </p>
                    {card.expiresAt && (
                      <p className="text-xs text-neutral-400 mt-0.5">Expires: {new Date(card.expiresAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="premium-card p-12 text-center shadow-subtle">
              <CreditCard className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-display text-neutral-900 mb-2">No Gift Cards</h3>
              <p className="text-sm text-neutral-500">Purchase a gift card for yourself or a loved one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
