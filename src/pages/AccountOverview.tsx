import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";
import { formatDate } from "../lib/utils/format";

export default function AccountOverview() {
  const { user } = useAuthStore();

  if (!user) return null;

  const stats = user._count ?? { orders: 0, addresses: 0, wishlistItems: 0, reviews: 0 };

  return (
    <div className="space-y-8">
      {/* Profile summary */}
      <div className="premium-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl text-neutral-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">{user.email}</p>
            {user.phone && <p className="text-sm text-neutral-500">{user.phone}</p>}
            <p className="text-xs text-neutral-400 mt-2">
              Member since {formatDate(user.createdAt ?? null)}
            </p>
          </div>
          <Link to="/account/settings" className="btn-ghost text-sm">
            Edit
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/account/orders" className="premium-card p-6 text-center hover:shadow-md transition-shadow">
          <p className="font-display text-3xl text-brand-500">{stats.orders}</p>
          <p className="text-sm text-neutral-500 mt-1">Orders</p>
        </Link>
        <Link to="/account/addresses" className="premium-card p-6 text-center hover:shadow-md transition-shadow">
          <p className="font-display text-3xl text-brand-500">{stats.addresses}</p>
          <p className="text-sm text-neutral-500 mt-1">Addresses</p>
        </Link>
        <Link to="/account/wishlist" className="premium-card p-6 text-center hover:shadow-md transition-shadow">
          <p className="font-display text-3xl text-brand-500">{stats.wishlistItems}</p>
          <p className="text-sm text-neutral-500 mt-1">Wishlist</p>
        </Link>
        <div className="premium-card p-6 text-center">
          <p className="font-display text-3xl text-brand-500">{stats.reviews}</p>
          <p className="text-sm text-neutral-500 mt-1">Reviews</p>
        </div>
      </div>

      {/* Security summary */}
      <div className="premium-card p-6">
        <h3 className="font-display text-lg text-neutral-900 mb-4">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <div>
              <p className="text-sm text-neutral-700">Password</p>
              <p className="text-xs text-neutral-400">Last changed recently</p>
            </div>
            <Link to="/account/settings" className="text-sm text-brand-500 hover:text-brand-600">
              Change
            </Link>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <div>
              <p className="text-sm text-neutral-700">Email verified</p>
              <p className="text-xs text-neutral-400">{user.emailVerified ? "Verified" : "Not verified"}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${user.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {user.emailVerified ? "Verified" : "Pending"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-neutral-700">Active sessions</p>
            </div>
            <span className="text-xs text-neutral-400">Manage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
