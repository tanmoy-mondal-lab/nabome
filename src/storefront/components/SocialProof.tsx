import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { api } from "../../lib/api/client";

interface ProofItem {
  product: string;
  city: string;
  timestamp: string;
}

const NAMES = ["Priya S.", "Arun K.", "Meera R.", "Vikram J.", "Ananya P.", "Rohan M.", "Isha T.", "Kabir S."];

function getRandomName(): string {
  return NAMES[Math.floor(Math.random() * NAMES.length)];
}

export function SocialProof() {
  const [visible, setVisible] = useState(true);
  const [name, setName] = useState(getRandomName());
  const [proofData, setProofData] = useState<ProofItem[]>([]);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    api.get<{ proof: ProofItem[] }>("/api/cms/social-proof")
      .then((res) => {
        if (res.proof && res.proof.length > 0) {
          setProofData(res.proof);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (proofData.length === 0) return;

    const show = () => {
      const item = proofData[currentIndexRef.current % proofData.length];
      setName(getRandomName());
      setProduct(item.product);
      setCity(item.city);
      setVisible(true);
      currentIndexRef.current++;
      setTimeout(() => setVisible(false), 4500);
    };

    show();
    const interval = setInterval(show, 20000 + Math.random() * 15000);
    return () => clearInterval(interval);
  }, [proofData]);

  const [product, setProduct] = useState("an item");
  const [city, setCity] = useState("India");

  if (proofData.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, x: -16 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 8, x: -16 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 bg-white/95 backdrop-blur-md shadow-elevated border border-neutral-100 rounded-lg px-4 py-3 max-w-xs"
          aria-live="polite"
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
              <ShoppingBag className="w-4 h-4 text-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-600 leading-relaxed">
                <span className="font-semibold text-neutral-900">{name}</span> from{" "}
                <span className="font-medium text-neutral-800">{city}</span> just purchased{" "}
                <span className="font-semibold text-neutral-900">{product}</span>
              </p>
              <p className="text-[10px] text-accent-gold mt-1 font-medium">from নবME</p>
            </div>
            <button onClick={() => setVisible(false)} className="p-1 text-neutral-300 hover:text-neutral-500 transition-colors shrink-0" aria-label="Dismiss">
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
