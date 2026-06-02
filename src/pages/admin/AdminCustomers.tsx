import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, AlertTriangle, Trash2, ShoppingBag, IndianRupee, ChevronRight, User, Calendar } from "lucide-react";
import { useToast } from "../../components/Toast";
import { getCustomers, suspendUser, type Customer } from "../../lib/api/customers";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

export default function AdminCustomers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  }, []);

  const handleSuspend = async (id: string) => {
    const c = customers.find((c) => c.id === id);
    const newStatus = c?.isActive === false;
    await suspendUser(id, newStatus);
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, isActive: newStatus } : c));
    showToast(`Customer ${newStatus ? "reactivated" : "suspended"}.`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this customer? This action cannot be undone.")) return;
    const { neon, isNeonConnected } = await import("../../lib/neon");
    if (await isNeonConnected()) {
      await neon.delete("users", { id });
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast("Customer deleted.");
  };

  const filtered = customers.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );
  const pag = usePagination(filtered, 15);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading...</div>;
  }

  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: ".85rem" }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back to Customers
        </button>
        <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}><User size={24} style={{ color: "var(--muted)" }} /></div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{selected.name || "Unknown"}</h2>
              <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{selected.email}</p>
            </div>
            <span style={{
              marginLeft: "auto", padding: "4px 12px", borderRadius: 10, fontSize: ".75rem", fontWeight: 600,
              background: selected.isActive ? "#2ecc7118" : "#e74c3c18",
              color: selected.isActive ? "#2ecc71" : "#e74c3c",
              border: `1px solid ${selected.isActive ? "#2ecc7130" : "#e74c3c30"}`,
            }}>{selected.isActive ? "Active" : "Suspended"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ textAlign: "center", padding: 16, background: "var(--surface)", borderRadius: "var(--radius)" }}>
              <ShoppingBag size={18} style={{ color: "var(--gold)", marginBottom: 8 }} />
              <p style={{ fontSize: "1.2rem", fontWeight: 300 }}>{selected.totalOrders ?? 0}</p><p style={{ color: "var(--muted)", fontSize: ".75rem" }}>Orders</p>
            </div>
            <div style={{ textAlign: "center", padding: 16, background: "var(--surface)", borderRadius: "var(--radius)" }}>
              <IndianRupee size={18} style={{ color: "var(--gold)", marginBottom: 8 }} />
              <p style={{ fontSize: "1.2rem", fontWeight: 300 }}>₹{(selected.totalSpent ?? 0).toLocaleString("en-IN")}</p><p style={{ color: "var(--muted)", fontSize: ".75rem" }}>Total Spent</p>
            </div>
            <div style={{ textAlign: "center", padding: 16, background: "var(--surface)", borderRadius: "var(--radius)" }}>
              <Calendar size={18} style={{ color: "var(--gold)", marginBottom: 8 }} />
              <p style={{ fontSize: ".82rem", fontWeight: 300 }}>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}</p><p style={{ color: "var(--muted)", fontSize: ".75rem" }}>Joined</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => handleSuspend(selected.id)} className="premium-button" style={{ padding: "0 20px", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={14} /> {selected.isActive ? "Suspend" : "Reactivate"}
            </button>
            <button onClick={() => handleDelete(selected.id)} style={{ padding: "0 20px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Users size={22} style={{ color: "var(--gold)" }} /> Customers ({customers.length})
      </h1>
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>Customer</th>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px 14px", textAlign: "center" }}>Orders</th>
              <th style={{ padding: "12px 14px", textAlign: "center" }}>Spent</th>
              <th style={{ padding: "12px 14px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pag.data.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                style={{ borderBottom: "1px solid var(--line)", verticalAlign: "middle", cursor: "pointer" }}
                onClick={() => setSelected(c)}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface-strong)", display: "grid", placeItems: "center" }}><User size={16} style={{ color: "var(--muted)" }} /></div>
                    <span style={{ fontWeight: 500, fontSize: ".85rem" }}>{c.name || c.email}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", fontSize: ".82rem", color: "var(--muted)" }}>{c.email}</td>
                <td style={{ padding: "12px 14px", textAlign: "center", fontSize: ".85rem" }}>{c.totalOrders ?? 0}</td>
                <td style={{ padding: "12px 14px", textAlign: "center", fontSize: ".85rem", color: "var(--gold)", fontWeight: 600 }}>₹{(c.totalSpent ?? 0).toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 10, fontSize: ".72rem", fontWeight: 600,
                    background: c.isActive ? "#2ecc7118" : "#e74c3c18",
                    color: c.isActive ? "#2ecc71" : "#e74c3c",
                  }}>{c.isActive ? "Active" : "Suspended"}</span>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right" }}>
                  <ChevronRight size={14} style={{ color: "var(--muted)" }} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={pag.page} totalPages={pag.totalPages} total={pag.total} from={pag.from} to={pag.to} onPageChange={pag.goToPage} />
    </motion.div>
  );
}
