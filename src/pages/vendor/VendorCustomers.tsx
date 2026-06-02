import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, ChevronRight, User, ShoppingBag, IndianRupee, MapPin, Calendar } from "lucide-react";
import { generateMockCustomers } from "../../lib/mockVendorData";
import type { VendorCustomer } from "../../types/vendor";

export default function VendorCustomers() {
  const [customers, setCustomers] = useState<VendorCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VendorCustomer | null>(null);

  useEffect(() => {
    setCustomers(generateMockCustomers());
  }, []);

  const filtered = customers.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setSelected(null)}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: ".85rem" }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back to Customers
        </button>
        <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}>
              <User size={28} style={{ color: "var(--muted)" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{selected.name}</h2>
              <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{selected.phone} · {selected.email}</p>
              <p style={{ color: "var(--muted)", fontSize: ".78rem", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <MapPin size={12} /> {selected.city}
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ textAlign: "center", padding: 16, background: "var(--surface)", borderRadius: "var(--radius)" }}>
              <ShoppingBag size={18} style={{ color: "var(--gold)", marginBottom: 8 }} />
              <p style={{ fontSize: "1.3rem", fontWeight: 300 }}>{selected.orderCount}</p>
              <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>Orders</p>
            </div>
            <div style={{ textAlign: "center", padding: 16, background: "var(--surface)", borderRadius: "var(--radius)" }}>
              <IndianRupee size={18} style={{ color: "var(--gold)", marginBottom: 8 }} />
              <p style={{ fontSize: "1.3rem", fontWeight: 300 }}>₹{selected.totalSpent.toLocaleString("en-IN")}</p>
              <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>Total Spent</p>
            </div>
            <div style={{ textAlign: "center", padding: 16, background: "var(--surface)", borderRadius: "var(--radius)" }}>
              <Calendar size={18} style={{ color: "var(--gold)", marginBottom: 8 }} />
              <p style={{ fontSize: ".85rem", fontWeight: 300 }}>
                {new Date(selected.lastOrderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
              <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>Last Order</p>
            </div>
          </div>
          <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>
            No access to customer passwords or sensitive authentication data.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Users size={22} style={{ color: "var(--gold)" }} /> Customers ({customers.length})
        </h1>
      </div>

      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search by name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((customer, i) => (
          <motion.div key={customer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass" style={{ padding: 16, borderRadius: "var(--radius-lg)", cursor: "pointer" }}
            onClick={() => setSelected(customer)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--gold)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--surface-strong)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <User size={20} style={{ color: "var(--muted)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{customer.name}</p>
                <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{customer.phone} · {customer.email}</p>
              </div>
              <div style={{ display: "flex", gap: 24, alignItems: "center", textAlign: "center" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{customer.orderCount}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>Orders</p>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: ".9rem" }}>₹{customer.totalSpent.toLocaleString("en-IN")}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>Spent</p>
                </div>
                <ChevronRight size={16} style={{ color: "var(--muted)" }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
