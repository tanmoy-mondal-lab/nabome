import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { MapPin, Search, Eye } from "lucide-react";

interface Address {
  id: string;
  profileId: string;
  label: string | null;
  street: string;
  city: string;
  district: string | null;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Pagination {
  totalPages: number;
  page: number;
  limit: number;
  total: number;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileId, setProfileId] = useState("");
  const [detailItem, setDetailItem] = useState<Address | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 20 };
      if (searchQuery) params.q = searchQuery;
      if (profileId) params.profileId = profileId;
      const res = await adminApi.getAddresses(params);
      setAddresses((res.addresses as Address[]) ?? []);
      const pag = res.pagination as Pagination | undefined;
      setTotalPages(pag?.totalPages ?? 1);
    } catch {
      /* non-critical: failed to fetch addresses */
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, profileId]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, profileId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const inputClass =
    "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Addresses</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {addresses.length} address{addresses.length !== 1 ? "es" : ""} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search street, city, or customer…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Filter by Profile ID"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 w-48"
          />
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={MapPin} title="No addresses found" />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Label</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Street</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">City</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">District</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">State</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Country</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Default</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((a) => (
                <tr key={a.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">
                      {a.profile.firstName} {a.profile.lastName}
                    </p>
                    <p className="text-xs text-neutral-400">{a.profile.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {a.label ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{a.street}</td>
                  <td className="px-4 py-3 text-neutral-700">{a.city}</td>
                  <td className="px-4 py-3 text-neutral-700">{a.district ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{a.state}</td>
                  <td className="px-4 py-3 text-neutral-700">{a.country}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={String(a.isDefault)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDetailItem(a)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="Address Details"
        size="md"
      >
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Customer</label>
                <p className="text-sm text-neutral-900">
                  {detailItem.profile.firstName} {detailItem.profile.lastName}
                </p>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Email</label>
                <p className="text-sm text-neutral-900">{detailItem.profile.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Profile ID</label>
              <p className="text-sm text-neutral-900">{detailItem.profileId}</p>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Label</label>
              <p className="text-sm text-neutral-900">{detailItem.label ?? "—"}</p>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Street</label>
              <p className="text-sm text-neutral-900">{detailItem.street}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">City</label>
                <p className="text-sm text-neutral-900">{detailItem.city}</p>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">District</label>
                <p className="text-sm text-neutral-900">{detailItem.district ?? "—"}</p>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">State</label>
                <p className="text-sm text-neutral-900">{detailItem.state}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Postal Code</label>
                <p className="text-sm text-neutral-900">{detailItem.postalCode}</p>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Country</label>
                <p className="text-sm text-neutral-900">{detailItem.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="block text-xs text-neutral-500">Default</label>
              <StatusBadge status={String(detailItem.isDefault)} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Created</label>
              <p className="text-sm text-neutral-900">
                {new Date(detailItem.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
