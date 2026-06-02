import { lazy, Suspense } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import AccountSidebar, { type AccountTab } from "../components/AccountSidebar";
import AccountLayout from "../components/AccountLayout";
import { useCustomer } from "../context/CustomerContext";
import { useAuth } from "../context/AuthContext";

const AccountDashboard = lazy(() => import("./AccountDashboard"));
const AccountOrders = lazy(() => import("./AccountOrders"));
const AccountOrderDetail = lazy(() => import("./AccountOrderDetail"));
const AccountWishlist = lazy(() => import("./AccountWishlist"));
const AccountAddresses = lazy(() => import("./AccountAddresses"));
const AccountNotifications = lazy(() => import("./AccountNotifications"));
const AccountProfile = lazy(() => import("./AccountProfile"));
const AccountSettings = lazy(() => import("./AccountSettings"));

const tabs: AccountTab[] = ["dashboard", "orders", "wishlist", "addresses", "notifications", "profile", "settings"];

export default function Account() {
  const { customer, logout } = useCustomer();
  const { logout: authLogout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab") as AccountTab | null;
  const orderParam = searchParams.get("order");
  const activeTab: AccountTab = tabParam && tabs.includes(tabParam) ? tabParam : "dashboard";

  const setTab = (tab: AccountTab) => {
    setSearchParams({ tab }, { replace: true });
  };

  const setOrder = (orderId: string) => {
    setSearchParams({ tab: "orders", order: orderId }, { replace: true });
  };

  const clearOrder = () => {
    setSearchParams({ tab: "orders" }, { replace: true });
  };

  const handleLogout = () => {
    authLogout();
    logout();
  };

  if (!customer) {
    return (
      <>
        <SEO title="My Account | নবME" description="Your নবME account dashboard." path="/account" />
        <Navbar />
        <main className="page" style={{ display: "grid", minHeight: "70vh", placeItems: "center" }}>
          <div className="glass" style={{ padding: 48, textAlign: "center", maxWidth: 480 }}>
            <h1 className="heading" style={{ marginBottom: 16 }}>Not Logged In</h1>
            <p className="lede" style={{ marginBottom: 24 }}>
              Log in to access your dashboard.
            </p>
            <Link to="/login" className="premium-button" style={{ display: "inline-flex", padding: "0 28px", alignItems: "center" }}>
              Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title="My Account | নবME" description={`Welcome, ${customer.name}. Manage your orders, addresses and more.`} path="/account" />
      <Navbar />
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        <section style={{ padding: "80px 6% 20px", borderBottom: "1px solid var(--line)" }}>
          <p className="eyebrow">My Account</p>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, marginTop: 8 }}>
            Hello, {customer.name}
          </h1>
        </section>

        <AccountLayout
          sidebar={
            <AccountSidebar active={activeTab} onTab={setTab} onLogout={handleLogout} unreadNotifications={3} />
          }
        >
          <Suspense fallback={
            <div style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
            </div>
          }>
            {activeTab === "dashboard" && <AccountDashboard onTab={setTab} />}
            {activeTab === "orders" && !orderParam && <AccountOrders onViewOrder={setOrder} />}
            {activeTab === "orders" && orderParam && <AccountOrderDetail orderId={orderParam} onBack={clearOrder} />}
            {activeTab === "wishlist" && <AccountWishlist />}
            {activeTab === "addresses" && <AccountAddresses />}
            {activeTab === "notifications" && <AccountNotifications />}
            {activeTab === "profile" && <AccountProfile />}
            {activeTab === "settings" && <AccountSettings />}
          </Suspense>
        </AccountLayout>
      </div>
    </>
  );
}
