import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Shield } from "lucide-react";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminLayout from "../components/admin/AdminLayout";
import { useAuth } from "../context/AuthContext";
import { useCustomer } from "../context/CustomerContext";
import type { AdminTab } from "../types/admin";

const AdminHome = lazy(() => import("./admin/AdminHome"));
const AdminVendors = lazy(() => import("./admin/AdminVendors"));
const AdminProducts = lazy(() => import("./admin/AdminProducts"));
const AdminCategories = lazy(() => import("./admin/AdminCategories"));
const AdminCustomers = lazy(() => import("./admin/AdminCustomers"));
const AdminOrders = lazy(() => import("./admin/AdminOrders"));
const AdminReviews = lazy(() => import("./admin/AdminReviews"));
const AdminCoupons = lazy(() => import("./admin/AdminCoupons"));
const AdminBanners = lazy(() => import("./admin/AdminBanners"));
const AdminNotifications = lazy(() => import("./admin/AdminNotifications"));
const AdminReports = lazy(() => import("./admin/AdminReports"));
const AdminSettings = lazy(() => import("./admin/AdminSettings"));
const AdminLogs = lazy(() => import("./admin/AdminLogs"));

const tabs: AdminTab[] = ["home", "vendors", "products", "categories", "customers", "orders", "reviews", "coupons", "banners", "notifications", "reports", "settings", "logs"];

export default function Admin() {
  const { user, logout: authLogout } = useAuth();
  const { logout } = useCustomer();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab") as AdminTab | null;
  const activeTab: AdminTab = tabParam && tabs.includes(tabParam) ? tabParam : "home";

  const setTab = (tab: AdminTab) => {
    setSearchParams({ tab }, { replace: true });
  };

  const handleLogout = () => {
    authLogout();
    logout();
  };

  return (
    <>
      <SEO title="Admin Panel | নবME" description="নবME Super Admin Panel — Manage your marketplace." />
      <Navbar />
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        <section style={{ padding: "80px 6% 20px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ maxWidth: 1480, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Shield size={24} style={{ color: "var(--gold)" }} />
            <div>
              <p className="eyebrow">Super Admin</p>
              <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 300, marginTop: 4 }}>
                Admin Panel
              </h1>
              <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 2 }}>
                Welcome, {user?.email || "Admin"} · Full marketplace control
              </p>
            </div>
          </div>
        </section>

        <AdminLayout
          sidebar={<AdminSidebar active={activeTab} onTab={setTab} onLogout={handleLogout} />}
        >
          <Suspense fallback={
            <div style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
            </div>
          }>
            {activeTab === "home" && <AdminHome />}
            {activeTab === "vendors" && <AdminVendors />}
            {activeTab === "products" && <AdminProducts />}
            {activeTab === "categories" && <AdminCategories />}
            {activeTab === "customers" && <AdminCustomers />}
            {activeTab === "orders" && <AdminOrders />}
            {activeTab === "reviews" && <AdminReviews />}
            {activeTab === "coupons" && <AdminCoupons />}
            {activeTab === "banners" && <AdminBanners />}
            {activeTab === "notifications" && <AdminNotifications />}
            {activeTab === "reports" && <AdminReports />}
            {activeTab === "settings" && <AdminSettings />}
            {activeTab === "logs" && <AdminLogs />}
          </Suspense>
        </AdminLayout>
      </div>
    </>
  );
}
