import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import AddressManager from "../components/AddressManager";

export default function AccountAddresses() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <MapPin size={22} style={{ color: "var(--gold)" }} /> Addresses
      </h1>
      <AddressManager mode="manage" />
    </motion.div>
  );
}
