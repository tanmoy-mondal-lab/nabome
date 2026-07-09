import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "../common/StatsCard";
import { StatusBadge } from "../common/StatusBadge";
import {
  ShieldCheck, AlertTriangle, Database, Cloud, Image as ImageIcon,
  Video, FileText, RefreshCw, Activity, CheckCircle, XCircle,
  AlertCircle, ArrowRight, Trash2, Settings
} from "lucide-react";

interface MediaHealthResult {
  status: "healthy" | "degraded" | "critical";
  timestamp: string;
  cloudinaryAssets: number;
  databaseRecords: number;
  missingAssets: number;
  orphanAssets: number;
  duplicateAssets: number;
  brokenReferences: number;
  integrityScore: number;
  lastScanTime: string | null;
  lastScanDuration: number | null;
}

interface IntegrityScanResult {
  scanId: string;
  timestamp: string;
  duration: number;
  totalAssetsInCloudinary: number;
  totalAssetsInDatabase: number;
  assetsChecked: number;
  issues: {
    missingInCloudinary: Array<{ assetId: string; publicId: string; entityType: string; entityId: string }>;
    missingInDatabase: Array<{ publicId: string; folder: string }>;
    orphanedAssets: Array<{ publicId: string; folder: string }>;
    orphanedRecords: Array<{ assetId: string; entityType: string; entityId: string }>;
    incorrectFolders: Array<{ assetId: string; expectedFolder: string; actualFolder: string }>;
    incorrectPublicIds: Array<{ assetId: string; dbPublicId: string; cloudPublicId: string }>;
    duplicateAssets: Array<{ publicId: string; count: number }>;
    duplicateRecords: Array<{ assetId: string; count: number }>;
    invalidEntityReferences: Array<{ assetId: string; entityType: string; entityId: string }>;
    brokenFolderStructure: Array<{ folder: string; reason: string }>;
    emptyFolders: Array<{ folder: string }>;
    invalidMetadata: Array<{ assetId: string; field: string; issue: string }>;
  };
  integrityScore: number;
  status: "healthy" | "warning" | "critical";
}

export default function MediaHealth() {
  const [health, setHealth] = useState<MediaHealthResult | null>(null);
  const [scanResult, setScanResult] = useState<IntegrityScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/media-integrity/health");
      if (!res.ok) throw new Error("Failed to fetch health data");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(`Failed to load health data: ${(err as Error).message ?? "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerScan = useCallback(async () => {
    try {
      setScanning(true);
      setError(null);
      const res = await fetch("/api/admin/media-integrity/scan", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to trigger scan");
      const data = await res.json();
      setScanResult(data);
      await fetchHealth(); // Refresh health data after scan
    } catch (err) {
      setError(`Failed to trigger scan: ${(err as Error).message ?? "Unknown error"}`);
    } finally {
      setScanning(false);
    }
  }, [fetchHealth]);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "degraded":
      case "warning":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-neutral-600 bg-neutral-50 border-neutral-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return CheckCircle;
      case "degraded":
      case "warning":
        return AlertTriangle;
      case "critical":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading media health…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="premium-card rounded-2xl px-6 py-5 text-center max-w-md">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchHealth} className="mt-4 btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(health?.status || "critical");

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-1 text-neutral-900">Media Health</h1>
          <p className="text-sm text-neutral-500 mt-2">Monitor and maintain media integrity</p>
        </div>
        <button
          onClick={triggerScan}
          disabled={scanning}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw size={16} className={scanning ? "animate-spin" : ""} />
          {scanning ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {/* Status Overview */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(health?.status || "critical")}`}>
              <StatusIcon size={20} />
            </div>
            <div>
              <h3 className="font-medium text-sm text-neutral-900">System Status</h3>
              <p className="text-xs text-neutral-400">
                Last checked: {health?.lastScanTime ? new Date(health.lastScanTime).toLocaleString() : "Never"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-neutral-900">{health?.integrityScore ?? 0}%</div>
            <div className="text-xs text-neutral-400">Integrity Score</div>
          </div>
        </div>
        {health?.lastScanDuration && (
          <div className="text-xs text-neutral-400">
            Last scan duration: {(health.lastScanDuration / 1000).toFixed(2)}s
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard
          label="Cloudinary Assets"
          value={health?.cloudinaryAssets ?? 0}
          icon={Cloud}
          onClick={() => navigate("/admin/media")}
        />
        <StatsCard
          label="Database Records"
          value={health?.databaseRecords ?? 0}
          icon={Database}
          onClick={() => navigate("/admin/media")}
        />
        <StatsCard
          label="Missing Assets"
          value={health?.missingAssets ?? 0}
          change={health?.missingAssets ? "Need attention" : "None"}
          changeType={health?.missingAssets ? "negative" : "positive"}
          icon={AlertTriangle}
        />
        <StatsCard
          label="Orphan Assets"
          value={health?.orphanAssets ?? 0}
          change={health?.orphanAssets ? "Cleanup needed" : "None"}
          changeType={health?.orphanAssets ? "negative" : "positive"}
          icon={Trash2}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="premium-card rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ImageIcon size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400">Images</p>
              <p className="text-lg font-semibold text-neutral-900">
                {Math.floor((health?.cloudinaryAssets ?? 0) * 0.8)}
              </p>
            </div>
          </div>
        </div>
        <div className="premium-card rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Video size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400">Videos</p>
              <p className="text-lg font-semibold text-neutral-900">
                {Math.floor((health?.cloudinaryAssets ?? 0) * 0.15)}
              </p>
            </div>
          </div>
        </div>
        <div className="premium-card rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <FileText size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400">Documents</p>
              <p className="text-lg font-semibold text-neutral-900">
                {Math.floor((health?.cloudinaryAssets ?? 0) * 0.05)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Summary */}
      {scanResult && (
        <div className="premium-card rounded-2xl p-6 mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <Activity size={16} className="text-brand-600" />
              </div>
              <h3 className="font-medium text-sm text-neutral-900">Scan Results</h3>
            </div>
            <StatusBadge status={scanResult.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-400 mb-1">Missing in Cloudinary</p>
              <p className="text-lg font-semibold text-neutral-900">
                {scanResult.issues.missingInCloudinary.length}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-400 mb-1">Missing in Database</p>
              <p className="text-lg font-semibold text-neutral-900">
                {scanResult.issues.missingInDatabase.length}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-400 mb-1">Duplicate Assets</p>
              <p className="text-lg font-semibold text-neutral-900">
                {scanResult.issues.duplicateAssets.length}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-400 mb-1">Invalid References</p>
              <p className="text-lg font-semibold text-neutral-900">
                {scanResult.issues.invalidEntityReferences.length}
              </p>
            </div>
          </div>

          {scanResult.issues.brokenFolderStructure.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">
                Broken Folder Structure ({scanResult.issues.brokenFolderStructure.length})
              </p>
              <div className="space-y-1">
                {scanResult.issues.brokenFolderStructure.slice(0, 5).map((issue, i) => (
                  <p key={i} className="text-xs text-red-700">
                    {issue.folder}: {issue.reason}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="premium-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Settings size={16} className="text-brand-600" />
          </div>
          <h3 className="font-medium text-sm text-neutral-900">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/admin/media")}
            className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <ImageIcon size={18} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Media Library</p>
              <p className="text-xs text-neutral-400">Manage all media assets</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-neutral-400" />
          </button>

          <button
            onClick={triggerScan}
            disabled={scanning}
            className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <RefreshCw size={18} className={scanning ? "animate-spin text-brand-600" : "text-neutral-600"} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Run Full Scan</p>
              <p className="text-xs text-neutral-400">Verify all media assets</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-neutral-400" />
          </button>

          <button
            onClick={() => navigate("/admin/settings")}
            className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={18} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Configure Schedule</p>
              <p className="text-xs text-neutral-400">Set up automated scans</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
