import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw, CheckCircle, Upload, X } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { formatPrice } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { SafeImage } from "../../components/SafeImage";

const returnReasons = [
  { value: "wrong_item", label: "Wrong item received" },
  { value: "damaged_product", label: "Product damaged or defective" },
  { value: "size_issue", label: "Size/fit issue" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed mind / no longer needed" },
  { value: "other", label: "Other" },
];

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export default function ReturnRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { data } = useQuery({
    queryKey: ["customer", "order", id],
    queryFn: () => customerApi.getOrder(id!),
    enabled: !!id,
  });

  const order = (data as unknown as { order: { items: OrderItem[]; orderNumber: string } })?.order ?? { items: [], orderNumber: "" };

  const submitMutation = useMutation({
    mutationFn: () => customerApi.createReturn({
      orderId: id!,
      reason,
      reasonDetail: details,
      evidenceImages: evidenceImages.length > 0 ? evidenceImages : undefined,
    }),
    onSuccess: () => setSubmitted(true),
  });

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") {
          setEvidenceImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return selectedItems.length > 0;
      case 2: return !!reason;
      default: return true;
    }
  }

  if (submitted) {
    return (
      <div className="container-page py-8">
        <div className="max-w-lg mx-auto text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-xl font-display text-neutral-900 mb-3">Return Request Submitted</h1>
          <p className="text-sm text-neutral-500 mb-6">
            Your return request for order {order.orderNumber} has been received. We'll review it and get back to you within 2-3 business days.
          </p>
          <Link to={`/account/orders/${id}`} className="text-xs text-brand-600 hover:underline">Back to Order</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-8">
          <Link to={`/account/orders/${id}`} className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Order
          </Link>

          <div>
            <h1 className="text-lg md:text-xl font-display text-neutral-900">Return / Exchange</h1>
            <p className="text-sm text-neutral-500 mt-1">Order {order.orderNumber}</p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", step >= s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400")}>{s}</div>
                <span className={cn("text-xs tracking-fashion", step >= s ? "text-neutral-900 font-medium" : "text-neutral-400")}>
                  {s === 1 ? "Items" : s === 2 ? "Reason" : s === 3 ? "Details" : "Photos"}
                </span>
                {s < 4 && <div className={cn("w-8 h-px", step > s ? "bg-neutral-900" : "bg-neutral-200")} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-900">Select items to return</h3>
              {(order.items || []).map((item: OrderItem) => (
                <label key={item.id} className={cn(
                  "flex items-center gap-4 premium-card p-4 cursor-pointer transition-all shadow-subtle",
                  selectedItems.includes(item.id) ? "border-neutral-900 bg-neutral-50 shadow-card" : "hover:shadow-card"
                )}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => {
                      setSelectedItems((prev) =>
                        prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                      );
                    }}
                    className="accent-neutral-900"
                  />
                  <SafeImage src={item.image || "/placeholder.svg"} alt={item.name} className="w-14 h-18 object-cover bg-neutral-100 shrink-0 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                    {item.size && <p className="text-xs text-neutral-400">Size: {item.size}</p>}
                    <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-900">Reason for return</h3>
              <div className="space-y-2">
                {returnReasons.map((r) => (
                  <label key={r.value} className={cn(
                    "flex items-center gap-3 premium-card p-4 cursor-pointer transition-all shadow-subtle",
                    reason === r.value ? "border-neutral-900 bg-neutral-50 shadow-card" : "hover:shadow-card"
                  )}>
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="accent-neutral-900"
                    />
                    <span className="text-sm text-neutral-700">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-900">Additional details</h3>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                className="textarea-field w-full"
                placeholder="Please describe the issue in detail. Include any relevant information that might help us process your return..."
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-900">Upload evidence images (optional)</h3>
              <p className="text-xs text-neutral-400">Photos of the product or issue help us process your return faster.</p>
              <div className="grid grid-cols-4 gap-3">
                {evidenceImages.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-neutral-100 border rounded">
                    <SafeImage src={img} alt="" className="w-full h-full object-cover rounded" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-neutral-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-neutral-900 transition-colors bg-neutral-50">
                  <Upload className="w-5 h-5 text-neutral-400" />
                  <span className="text-[10px] text-neutral-400 mt-1 tracking-fashion">Upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className={cn("btn-ghost flex items-center gap-2", step === 1 && "opacity-0 pointer-events-none")}
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="btn-primary"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                <RotateCcw className="w-3 h-3" /> {submitMutation.isPending ? "Submitting..." : "Submit Return Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
