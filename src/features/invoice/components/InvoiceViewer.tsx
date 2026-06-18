import { useState } from "react";
import { Download, Printer, FileText } from "lucide-react";
import { cn } from "../../../lib/utils/cn";

interface InvoiceViewerProps {
  orderId: string;
  invoiceHtml?: string;
  onDownload?: () => void;
  onPrint?: () => void;
  className?: string;
}

export function InvoiceViewer({ orderId, invoiceHtml, onDownload, onPrint, className }: InvoiceViewerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      onDownload?.();
      // In production, this would generate and download PDF
      if (invoiceHtml) {
        const blob = new Blob([invoiceHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    onPrint?.();
    if (invoiceHtml) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className={cn("border p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-neutral-500" />
          <h3 className="text-sm font-medium text-neutral-900">Order Invoice</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {isLoading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      {invoiceHtml ? (
        <div
          className="border p-4 bg-white text-xs"
          dangerouslySetInnerHTML={{ __html: invoiceHtml }}
        />
      ) : (
        <div className="text-center py-8 text-neutral-400">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Invoice not generated yet</p>
        </div>
      )}
    </div>
  );
}
