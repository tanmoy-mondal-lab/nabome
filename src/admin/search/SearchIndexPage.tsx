import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Search, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export default function SearchIndexPage() {
  const [status, setStatus] = useState<{ indexed: boolean; count: number; lastIndexed: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<{ indexed: number; types: Record<string, number> } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ results: unknown[]; total: number } | null>(null);
  const [searching, setSearching] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSearchIndexStatus();
      setStatus(res);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleRebuild = async () => {
    setBuilding(true);
    setBuildResult(null);
    try {
      const res = await adminApi.buildSearchIndex();
      setBuildResult(res);
      fetchStatus();
    } catch { /* ignore */ } finally {
      setBuilding(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await adminApi.searchIndex(searchQuery);
      setSearchResults(res);
    } catch { /* ignore */ } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Search Index</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage the site search index</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-neutral-200 rounded p-4">
          <p className="text-xs text-neutral-500 mb-1">Status</p>
          <div className="flex items-center gap-2">
            {status?.indexed ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <AlertCircle size={16} className="text-yellow-500" />
            )}
            <span className="text-sm font-medium text-neutral-900">
              {status?.indexed ? "Indexed" : "Not Indexed"}
            </span>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-4">
          <p className="text-xs text-neutral-500 mb-1">Indexed Items</p>
          <p className="text-sm font-medium text-neutral-900">{status?.count ?? 0}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-4">
          <p className="text-xs text-neutral-500 mb-1">Last Indexed</p>
          <p className="text-sm font-medium text-neutral-900">
            {status?.lastIndexed ? new Date(status.lastIndexed).toLocaleString() : "Never"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-sm text-neutral-900">Rebuild Index</h2>
          <button onClick={handleRebuild} disabled={building}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
            <RefreshCw size={14} className={building ? "animate-spin" : ""} />
            {building ? "Building…" : "Rebuild Index"}
          </button>
        </div>
        {buildResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            <p className="font-medium">Index rebuilt successfully</p>
            <p>{buildResult.indexed} items indexed</p>
            {Object.entries(buildResult.types).length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {Object.entries(buildResult.types).map(([type, count]) => (
                  <span key={type} className="text-xs bg-green-100 px-2 py-0.5 rounded capitalize">{type}: {count}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-neutral-200 rounded p-6">
        <h2 className="font-medium text-sm text-neutral-900 mb-4">Test Search</h2>
        <div className="flex gap-2 mb-4">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search products, pages…"
            className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          <button onClick={handleSearch} disabled={searching}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
            <Search size={14} /> Search
          </button>
        </div>
        {searchResults && (
          <div>
            <p className="text-xs text-neutral-500 mb-2">{searchResults.total} result{searchResults.total !== 1 ? "s" : ""}</p>
            {searchResults.results.length === 0 ? (
              <p className="text-sm text-neutral-400">No results found</p>
            ) : (
              <div className="space-y-2">
                {(searchResults.results as Array<Record<string, unknown>>).map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded text-sm">
                    <div>
                      <p className="font-medium text-neutral-900">{r.title as string ?? r.name as string ?? "—"}</p>
                      <p className="text-xs text-neutral-400 capitalize">{(r.type as string) ?? ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
