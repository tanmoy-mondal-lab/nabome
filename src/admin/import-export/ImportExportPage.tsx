import { useState } from "react";
import { adminApi } from "../../lib/api/admin";
import { Download, Upload, FileSpreadsheet, RefreshCw } from "lucide-react";

export default function ImportExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = async (type: "products" | "orders") => {
    setExporting(type);
    try {
      const res = type === "products"
        ? await adminApi.exportProducts("csv")
        : await adminApi.exportOrders("csv");
      const { csv, filename } = res as { csv: string; filename: string };
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.replace(".csv", `-${new Date().toISOString().split("T")[0]}.csv`);
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* non-critical: failed to export data */ } finally {
      setExporting(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await adminApi.importProducts(formData);
      setImportResult(res);
    } catch { /* non-critical: failed to import products from CSV */ } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Import / Export</h1>
        <p className="text-sm text-neutral-500 mt-1">Export product or order data, import product data from CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="premium-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download size={20} className="text-neutral-400" />
            <h2 className="font-medium text-sm text-neutral-900">Export</h2>
          </div>
          <p className="text-xs text-neutral-500 mb-4">Download your data as CSV for analysis or backup.</p>
          <div className="space-y-3">
            <button onClick={() => handleExport("products")} disabled={exporting !== null}
              className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded text-sm hover:bg-neutral-50 disabled:opacity-50">
              <span className="font-medium text-neutral-700">Export Products</span>
              {exporting === "products" ? (
                <RefreshCw size={14} className="animate-spin text-neutral-400" />
              ) : (
                <Download size={14} className="text-neutral-400" />
              )}
            </button>
            <button onClick={() => handleExport("orders")} disabled={exporting !== null}
              className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded text-sm hover:bg-neutral-50 disabled:opacity-50">
              <span className="font-medium text-neutral-700">Export Orders</span>
              {exporting === "orders" ? (
                <RefreshCw size={14} className="animate-spin text-neutral-400" />
              ) : (
                <Download size={14} className="text-neutral-400" />
              )}
            </button>
          </div>
        </section>

        <section className="premium-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload size={20} className="text-neutral-400" />
            <h2 className="font-medium text-sm text-neutral-900">Import</h2>
          </div>
          <p className="text-xs text-neutral-500 mb-4">Import products from a CSV file. The file must match the export format.</p>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded p-8 cursor-pointer hover:bg-neutral-50 transition-colors ${importing ? "opacity-50 pointer-events-none" : "border-neutral-300"}`}>
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" disabled={importing} />
            {importing ? (
              <>
                <RefreshCw size={24} className="animate-spin text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-500">Importing…</span>
              </>
            ) : (
              <>
                <Upload size={24} className="text-neutral-300 mb-2" />
                <span className="text-sm font-medium text-neutral-600">Click to upload CSV</span>
                <span className="text-xs text-neutral-400 mt-1">Products CSV file</span>
              </>
            )}
          </label>
          {importResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              <p className="font-medium">Import complete</p>
              <p>{importResult.imported} imported, {importResult.skipped} skipped</p>
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-red-600">Errors:</p>
                  <ul className="list-disc list-inside text-xs text-red-600">
                    {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
