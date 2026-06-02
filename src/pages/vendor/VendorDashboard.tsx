import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import SEO from "../../components/SEO";
import Navbar from "../../components/Navbar";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorLayout from "../../components/vendor/VendorLayout";
import { useAuth } from "../../context/AuthContext";
import { useCustomer } from "../../context/CustomerContext";
import { getMockShop } from "../../lib/mockVendorData";
import type { VendorTab } from "../../types/vendor";

const VendorHome = lazy(() => import("./VendorHome"));
const VendorShopProfile = lazy(() => import("./VendorShopProfile"));
const VendorProducts = lazy(() => import("./VendorProducts"));
const VendorProductForm = lazy(() => import("./VendorProductForm"));
const VendorInventory = lazy(() => import("./VendorInventory"));
const VendorOrders = lazy(() => import("./VendorOrders"));
const VendorCustomers = lazy(() => import("./VendorCustomers"));
const VendorReviews = lazy(() => import("./VendorReviews"));
const VendorAnalytics = lazy(() => import("./VendorAnalytics"));
const VendorTrash = lazy(() => import("./VendorTrash"));

const tabs: VendorTab[] = ["home", "products", "orders", "customers", "reviews", "inventory", "analytics", "shop", "trash"];

export default function VendorDashboard() {
  const { user, logout: authLogout } = useAuth();
  const { logout } = useCustomer();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab") as VendorTab | null;
  const editParam = searchParams.get("edit");
  const activeTab: VendorTab = tabParam && tabs.includes(tabParam) ? tabParam : "home";

  const setTab = (tab: VendorTab) => {
    setSearchParams({ tab }, { replace: true });
  };

  const setEditProduct = (productId: string) => {
    setSearchParams({ tab: "products", edit: productId }, { replace: true });
  };

  const clearEdit = () => {
    setSearchParams({ tab: "products" }, { replace: true });
  };

  const handleLogout = () => {
    authLogout();
    logout();
  };

  const status = user?.vendorStatus || "pending";
  const shop = getMockShop();

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; title: string; message: string }> = {
    pending: { icon: <Clock size={24} />, color: "#f39c12", title: "Application Pending", message: "Your shop application is under review. You'll be notified once approved." },
    approved: { icon: <CheckCircle size={24} />, color: "#2ecc71", title: "Shop Active", message: "Your shop is live. Manage your products, orders, and analytics." },
    rejected: { icon: <XCircle size={24} />, color: "#e74c3c", title: "Application Rejected", message: "Your application was not approved. Contact support." },
    suspended: { icon: <AlertTriangle size={24} />, color: "#e74c3c", title: "Account Suspended", message: "Your vendor account is suspended. Please contact support." },
  };

  const config = statusConfig[status];

  /* If vendor status is NOT approved, show status-only page */
  if (status !== "approved") {
    return (
      <>
        <SEO title="Vendor Dashboard | নবME" description="Manage your vendor shop on নবME." />
        <Navbar />
        <main className="page" style={{ padding: "120px 6%" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <Store size={28} style={{ color: "var(--gold)" }} />
              <h1 style={{ fontSize: "clamp(1.6rem,4vw,2rem)", fontWeight: 300 }}>Vendor Dashboard</h1>
            </div>
            <p style={{ color: "var(--muted)", marginBottom: 40 }}>Welcome, {user?.name || "Vendor"}</p>
            <div className="glass" style={{ padding: 32, borderRadius: "var(--radius-xl)", border: `1px solid ${config.color}40` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ color: config.color }}>{config.icon}</div>
                <div>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 4, color: config.color }}>{config.title}</h2>
                  <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>{config.message}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title="Vendor Dashboard | নবME" description={`${shop.shopName} — Vendor Dashboard`} />
      <Navbar />
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        <section style={{ padding: "80px 6% 20px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Store size={24} style={{ color: "var(--gold)" }} />
            <div>
              <p className="eyebrow">Vendor Dashboard</p>
              <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 300, marginTop: 4 }}>
                {shop.shopName}
              </h1>
            </div>
          </div>
        </section>

        <VendorLayout
          sidebar={<VendorSidebar active={activeTab} onTab={setTab} onLogout={handleLogout} />}
        >
          <Suspense fallback={
            <div style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
            </div>
          }>
            {activeTab === "home" && <VendorHome onTab={setTab} />}
            {activeTab === "shop" && <VendorShopProfile />}
            {activeTab === "inventory" && <VendorInventory />}
            {activeTab === "orders" && <VendorOrders />}
            {activeTab === "customers" && <VendorCustomers />}
            {activeTab === "reviews" && <VendorReviews />}
            {activeTab === "analytics" && <VendorAnalytics />}
            {activeTab === "trash" && <VendorTrash />}
            {activeTab === "products" && !editParam && <VendorProducts onTab={setTab} onEditProduct={setEditProduct} />}
            {activeTab === "products" && editParam && (
              <VendorProductForm
                productId={editParam === "new" ? null : editParam}
                vendorId={user?.id || ""}
                onBack={clearEdit}
                onSave={() => {}} // TODO: persist
              />
            )}
          </Suspense>
        </VendorLayout>
      </div>
    </>
  );
}
