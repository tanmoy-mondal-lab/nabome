import { motion } from "framer-motion";
import { CheckCircle, Clock, Package, Truck, XCircle, RotateCcw } from "lucide-react";

type TimelineStep = {
  status: string;
  label: string;
  date: string | null;
  completed: boolean;
  note?: string;
};

type Props = {
  steps: TimelineStep[];
  cancelled?: boolean;
};

const iconMap: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  confirmed: <CheckCircle size={14} />,
  processing: <Package size={14} />,
  packed: <Package size={14} />,
  shipped: <Truck size={14} />,
  out_for_delivery: <Truck size={14} />,
  delivered: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
  returned: <RotateCcw size={14} />,
  refunded: <RotateCcw size={14} />,
};

export default function OrderTimeline({ steps, cancelled }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const icon = iconMap[step.status] || <Clock size={14} />;
        const isCancelledStep = step.status === "cancelled";

        return (
          <motion.div
            key={step.status}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            style={{ display: "flex", gap: 14, position: "relative", paddingBottom: isLast ? 0 : 24 }}
          >
            {/* Connector Line */}
            {!isLast && (
              <div style={{
                position: "absolute", left: 13, top: 30,
                width: 2, height: "calc(100% - 6px)",
                background: step.completed && !cancelled ? "var(--gold)" : "var(--surface-strong)",
              }} />
            )}

            {/* Dot */}
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0, zIndex: 1,
              display: "grid", placeItems: "center",
              background: step.completed
                ? isCancelledStep ? "rgba(231,76,60,0.15)" : "var(--gold)"
                : "var(--surface-strong)",
              border: `2px solid ${
                step.completed
                  ? isCancelledStep ? "#e74c3c" : "var(--gold)"
                  : "var(--line)"
              }`,
              color: step.completed
                ? isCancelledStep ? "#e74c3c" : "#050505"
                : "var(--muted)",
              transition: "all 0.3s",
            }}>
              {step.completed ? icon : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--line)" }} />}
            </div>

            {/* Content */}
            <div style={{ paddingTop: 4 }}>
              <p style={{
                fontWeight: step.completed ? 600 : 400,
                fontSize: ".9rem",
                color: step.completed
                  ? isCancelledStep ? "#e74c3c" : "var(--text)"
                  : "var(--muted)",
              }}>
                {step.label}
              </p>
              {step.date && (
                <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>
                  {new Date(step.date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
              {step.note && (
                <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2, fontStyle: "italic" }}>
                  {step.note}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
