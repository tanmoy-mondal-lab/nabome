import { useState, useEffect } from "react";
import { api } from "../../lib/api/admin";
import { FEATURE_FLAGS, type FeatureFlag, type FeatureFlagConfig } from "../../../scripts/feature-flags";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({} as any);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/admin/feature-flags")
      .then((res: any) => { setFlags(res.flags || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleFlag(key: FeatureFlag) {
    const newVal = !flags[key];
    setFlags((prev) => ({ ...prev, [key]: newVal }));
    setSaving(true);
    try {
      await api.post("/api/admin/feature-flags", { key, value: newVal });
    } catch {
      setFlags((prev) => ({ ...prev, [key]: !newVal }));
    }
    setSaving(false);
  }

  if (loading) return <div className="p-6"><div className="h-40 bg-neutral-100 animate-pulse rounded" /></div>;

  const groups: Record<string, [FeatureFlag, FeatureFlagConfig][]> = {};
  for (const [key, config] of Object.entries(FEATURE_FLAGS)) {
    const group = config.label.includes("Loyalty") || config.label.includes("Referral") || config.label.includes("Gift") || config.label.includes("Subscription") ? "Business Features"
      : config.label.includes("Currency") || config.label.includes("Language") ? "Market Expansion"
      : config.label.includes("Dark") ? "Theme"
      : "General";
    if (!groups[group]) groups[group] = [];
    groups[group].push([key as FeatureFlag, config]);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Feature Flags</h1>
          <p className="text-sm text-neutral-500 mt-1">Toggle features on/off without deploying</p>
        </div>
        {saving && <span className="text-xs text-neutral-400 animate-pulse">Saving...</span>}
      </div>

      {Object.entries(groups).map(([groupName, groupFlags]) => (
        <div key={groupName} className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">{groupName}</h2>
          <div className="space-y-2">
            {groupFlags.map(([key, config]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded hover:border-neutral-300 transition-colors">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{config.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{config.description}</p>
                </div>
                <button
                  onClick={() => toggleFlag(key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${flags[key] ? "bg-brand-500" : "bg-neutral-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${flags[key] ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
