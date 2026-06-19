import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { PhoneInput } from "../../components/PhoneInput";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const emptyForm = {
  label: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["customer", "addresses"],
    queryFn: () => customerApi.getAddresses(),
  });

  const addresses = ((data as unknown as { addresses: Address[] })?.addresses ?? []) as Address[];

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => customerApi.createAddress(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<typeof form> }) => customerApi.updateAddress(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerApi.deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] }),
  });

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(address: Address) {
    setForm({
      label: address.label || "",
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit() {
    if (editingId) {
      updateMutation.mutate({ id: editingId, body: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const mutationPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">My Addresses</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">{addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}</p>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus className="w-3 h-3" /> Add Address
            </button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map((i) => <div key={i} className="h-36 bg-neutral-100 animate-pulse rounded" />)}
            </div>
          ) : addresses.length === 0 ? (
            <div className="premium-card p-12 text-center shadow-subtle">
              <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-neutral-900 mb-2">No addresses saved</h3>
              <p className="text-xs text-neutral-500 mb-4">Add a shipping address to make checkout faster.</p>
              <button onClick={openCreate} className="btn-primary">
                Add Address
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className={`premium-card p-5 shadow-subtle relative ${addr.isDefault ? "border-neutral-900" : ""}`}>
                  {addr.isDefault && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Default
                    </span>
                  )}
                  {addr.label && <p className="text-xs uppercase tracking-wider text-neutral-400 mb-2">{addr.label}</p>}
                  <p className="text-sm font-medium text-neutral-900">{addr.fullName}</p>
                  <p className="text-sm text-neutral-600">{addr.line1}</p>
                  {addr.line2 && <p className="text-sm text-neutral-600">{addr.line2}</p>}
                  <p className="text-sm text-neutral-600">{addr.city}, {addr.state} {addr.pincode}</p>
                  <p className="text-sm text-neutral-600">{addr.phone}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                    <button onClick={() => openEdit(addr)} className="btn-ghost flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => { if (window.confirm("Delete this address?")) deleteMutation.mutate(addr.id); }}
                      className="btn-outline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <div className="bg-white w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-widest font-medium">{editingId ? "Edit Address" : "Add Address"}</h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-900 text-lg leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-neutral-500 mb-1 block">Label (e.g. Home, Office)</label>
                  <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input-field w-full" placeholder="Home" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Full Name *</label>
                  <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Phone *</label>
                  <PhoneInput value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-500 mb-1 block">Address Line 1 *</label>
                  <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="input-field w-full" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-500 mb-1 block">Address Line 2</label>
                  <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">City *</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">State *</label>
                  <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Pincode *</label>
                  <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field w-full" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-neutral-900" />
                  <label htmlFor="isDefault" className="text-xs text-neutral-700">Set as default address</label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={closeModal} className="btn-ghost">Cancel</button>
              <button onClick={handleSubmit} disabled={mutationPending || !form.fullName || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode} className="btn-primary">
                {mutationPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
