import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { api } from "../../../lib/api/client";
import { Zap, Check, CreditCard } from "lucide-react";
import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  trialPeriodDays: number;
}

export default function SubscriptionPage() {
  const [showCancel, setShowCancel] = useState(false);
  const queryClient = useQueryClient();

  const { data: plansData } = useQuery({
    queryKey: ["subscriptions", "plans"],
    queryFn: () => api.get("/api/subscriptions/plans"),
  });

  const { data: mySubData } = useQuery({
    queryKey: ["subscriptions", "my"],
    queryFn: () => api.get("/api/subscriptions/my"),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["subscriptions", "invoices"],
    queryFn: () => api.get("/api/subscriptions/invoices"),
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => api.post("/api/subscriptions/create", { planId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["subscriptions"] }); },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post("/api/subscriptions/cancel", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setShowCancel(false);
    },
  });

  const plans = (plansData as any)?.plans ?? [];
  const mySub = (mySubData as any)?.subscription;
  const invoices = (invoicesData as any)?.invoices ?? [];

  return (
    <div className="container-page py-8">
      <Helmet><title>Subscriptions — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">Subscriptions</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-8">
          {mySub && (
            <div className="premium-card p-6 shadow-subtle border border-green-100 bg-green-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-green-600 mb-1">Active Plan</p>
                  <p className="text-xl font-display text-neutral-900">{mySub.plan?.name || "Subscription"}</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {mySub.currentPeriodEnd && `Next billing: ${new Date(mySub.currentPeriodEnd).toLocaleDateString()}`}
                  </p>
                </div>
                <button onClick={() => setShowCancel(!showCancel)} className="btn-outline text-xs">
                  Cancel
                </button>
              </div>
              {showCancel && (
                <div className="mt-4 pt-4 border-t border-green-200 flex items-center gap-3">
                  <p className="text-sm text-neutral-600">Are you sure?</p>
                  <button onClick={() => cancelMutation.mutate()} className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50">
                    Confirm Cancel
                  </button>
                  <button onClick={() => setShowCancel(false)} className="text-xs text-neutral-400 hover:text-neutral-600">
                    Keep
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan: Plan) => (
              <div key={plan.id} className="premium-card p-6 shadow-subtle flex flex-col">
                <Zap className="w-8 h-8 text-brand-500 mb-4" />
                <h3 className="text-lg font-display text-neutral-900">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-display text-neutral-900">₹{plan.price}</span>
                  <span className="text-sm text-neutral-400">/{plan.interval === "yearly" ? "year" : "month"}</span>
                </div>
                {plan.trialPeriodDays > 0 && (
                  <p className="text-xs text-green-600 mb-3">{plan.trialPeriodDays}-day free trial</p>
                )}
                <p className="text-sm text-neutral-500 mb-4">{plan.description}</p>
                {plan.features && Array.isArray(plan.features) && (
                  <div className="space-y-2 mb-6 flex-1">
                    {(plan.features as string[]).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" /> {feat}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => subscribeMutation.mutate(plan.id)}
                  disabled={subscribeMutation.isPending}
                  className="btn-primary w-full text-center"
                >
                  {subscribeMutation.isPending ? "Processing..." : mySub ? "Switch Plan" : "Subscribe"}
                </button>
              </div>
            ))}
          </div>

          {invoices.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-4 uppercase tracking-wide">Billing History</h3>
              <div className="space-y-2">
                {invoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded">
                    <div>
                      <p className="text-sm text-neutral-900">₹{Number(inv.amount).toFixed(2)}</p>
                      <p className="text-xs text-neutral-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs uppercase ${inv.status === "paid" ? "text-green-600" : "text-amber-500"}`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!mySub && plans.length === 0 && (
            <div className="premium-card p-12 text-center shadow-subtle">
              <CreditCard className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-display text-neutral-900 mb-2">No Plans Available</h3>
              <p className="text-sm text-neutral-500">Subscription plans will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
