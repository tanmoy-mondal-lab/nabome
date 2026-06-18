import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

const NAMES = ["Priya S.", "Arun K.", "Meera R.", "Vikram J.", "Ananya P.", "Rohan M.", "Isha T.", "Kabir S."];
const PRODUCTS = ["Linen Shirt", "Silk Dress", "Leather Tote", "Cashmere Sweater", "Wool Blazer", "Denim Jacket"];
const LOCATIONS = ["Mumbai", "Delhi", "Bengaluru", "Kolkata", "Jaipur", "Hyderabad", "Chennai", "Pune"];

export function SocialProof() {
  const [visible, setVisible] = useState(true);
  const [name, setName] = useState(NAMES[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);

  useEffect(() => {
    const show = () => {
      setName(NAMES[Math.floor(Math.random() * NAMES.length)]);
      setProduct(PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]);
      setLocation(LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]);
      setVisible(true);
      setTimeout(() => setVisible(false), 4500);
    };
    show();
    const interval = setInterval(show, 20000 + Math.random() * 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, x: -16 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 8, x: -16 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 bg-white/95 backdrop-blur-md shadow-elevated border border-neutral-100 rounded-lg px-4 py-3 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
              <ShoppingBag className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                <span className="font-semibold text-neutral-900">{name}</span> from{" "}
                <span className="font-medium text-neutral-800">{location}</span> just purchased{" "}
                <span className="font-semibold text-neutral-900">{product}</span>
              </p>
              <p className="text-[10px] text-accent-gold mt-1 font-medium">from নবME</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
