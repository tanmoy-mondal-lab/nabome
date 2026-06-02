import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "./Toast";
import { RETURN_REASON_LABEL } from "../types/order";
import type { ReturnReason, ReturnRequest } from "../types/order";

type Props = {
  orderItemId: string;
  onSubmit: (data: { reason: ReturnReason; reasonText?: string; images: string[] }) => void;
  existing?: ReturnRequest | null;
};

const reasons: ReturnReason[] = ["wrong_product", "damaged", "size_issue", "quality_issue", "other"];

export default function ReturnForm({ onSubmit, existing }: Props) {
  const { showToast } = useToast();
  const [reason, setReason] = useState<ReturnReason | "">(existing?.reason || "");
  const [reasonText, setReasonText] = useState(existing?.reasonText || "");
  const [images, setImages] = useState<string[]>(existing?.images || []);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (images.length < 5) setImages((prev) => [...prev, ev.target?.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!reason) { showToast("Please select a return reason"); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onSubmit({ reason: reason as ReturnReason, reasonText: reasonText.trim() || undefined, images });
    showToast("Return request submitted!");
    setSubmitting(false);
  };

  if (existing) {
    return (
      <div className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <RotateCcw size={18} style={{ color: "var(--gold)" }} />
          <h3 style={{ fontWeight: 600, fontSize: ".95rem" }}>Return Requested</h3>
        </div>
        <p style={{ fontSize: ".85rem", color: "var(--muted)" }}>
          Reason: {RETURN_REASON_LABEL[existing.reason]}
        </p>
        <p style={{ fontSize: ".82rem", color: "var(--gold)", marginTop: 4 }}>
          Status: {existing.status.replace("_", " ")}
        </p>
        {existing.vendorNote && (
          <p style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: 8, fontStyle: "italic" }}>
            Vendor: {existing.vendorNote}
          </p>
        )}
      </div>
    );
  }

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1px solid var(--line)",
    background: "var(--surface)", color: "var(--text)", fontSize: ".9rem",
    outline: "none", borderRadius: "var(--radius)",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <RotateCcw size={20} style={{ color: "var(--gold)" }} />
        <h3 style={{ fontWeight: 600, fontSize: "1rem" }}>Initiate Return</h3>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 8, display: "block" }}>Reason for Return *</label>
        <div style={{ display: "grid", gap: 8 }}>
          {reasons.map((r) => (
            <button key={r} type="button" onClick={() => setReason(r)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                border: `1px solid ${reason === r ? "var(--gold)" : "var(--line)"}`,
                background: reason === r ? "var(--gold-soft)" : "transparent",
                color: reason === r ? "var(--gold)" : "var(--text)", cursor: "pointer",
                borderRadius: "var(--radius)", fontSize: ".85rem", textAlign: "left",
                fontWeight: reason === r ? 600 : 400,
              }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${reason === r ? "var(--gold)" : "var(--line)"}`, display: "grid", placeItems: "center" }}>
                {reason === r && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold)" }} />}
              </span>
              {RETURN_REASON_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {reason === "other" && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Describe the issue</label>
          <textarea rows={3} value={reasonText} onChange={(e) => setReasonText(e.target.value)} style={{ ...fieldS, resize: "vertical" }} placeholder="Please describe your issue in detail..." />
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 8, display: "block" }}>Upload Images (optional, max 5)</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative", width: 64, height: 64, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--surface-strong)" }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 10 }}>
                <X size={10} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label style={{ width: 64, height: 64, border: "1px dashed var(--line)", borderRadius: "var(--radius)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--muted)" }}>
              <Upload size={18} />
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            </label>
          )}
        </div>
      </div>

      {!reason && (
        <p style={{ color: "var(--muted)", fontSize: ".8rem", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <AlertCircle size={14} /> Please select a reason to continue
        </p>
      )}

      <button onClick={handleSubmit} disabled={!reason || submitting} className="premium-button"
        style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, justifyContent: "center", width: "100%", opacity: !reason ? 0.5 : 1, cursor: !reason ? "not-allowed" : "pointer" }}>
        {submitting ? <Loader2 size={16} className="spin" /> : <RotateCcw size={16} />}
        {submitting ? "Submitting..." : existing ? "Update Return Request" : "Submit Return Request"}
      </button>
    </motion.div>
  );
}
