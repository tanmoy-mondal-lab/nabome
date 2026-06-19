import { useState } from "react";
import { useAddresses } from "../hooks/useAddresses";
import type { AddressInput } from "../lib/api/addresses";
import { PhoneInput } from "../components/PhoneInput";

export default function AccountAddressesPage() {
  const { addresses, defaultAddress, isLoading, create, update, remove } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    label: "Home",
    isDefault: false,
  });

  const resetForm = () => {
    setForm({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", label: "Home", isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address: typeof addresses[0]) => {
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      label: address.label,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update(editingId, form);
      } else {
        await create(form);
      }
      resetForm();
    } catch {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this address?")) {
      await remove(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-neutral-900">Saved Addresses</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm !px-4 !py-2">
          + Add Address
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-12 premium-card">
          <p className="text-neutral-500">No addresses saved yet</p>
        </div>
      )}

      {/* Address list */}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="premium-card p-5 relative">
            {addr.isDefault && (
              <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
            <p className="text-xs uppercase tracking-wider text-neutral-400 mb-2">{addr.label}</p>
            <p className="text-sm font-medium text-neutral-900">{addr.fullName}</p>
            <p className="text-sm text-neutral-600">{addr.line1}</p>
            {addr.line2 && <p className="text-sm text-neutral-600">{addr.line2}</p>}
            <p className="text-sm text-neutral-600">{addr.city}, {addr.state} — {addr.pincode}</p>
            <p className="text-sm text-neutral-600">{addr.phone}</p>
            <div className="flex gap-4 mt-3 pt-3 border-t border-neutral-100">
              <button onClick={() => handleEdit(addr)} className="text-xs text-brand-500 hover:text-brand-600">
                Edit
              </button>
              <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-500 hover:text-red-600">
                Delete
              </button>
              {!addr.isDefault && (
                <button onClick={() => update(addr.id, { isDefault: true })} className="text-xs text-neutral-400 hover:text-neutral-600">
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="premium-card p-6">
          <h3 className="font-display text-lg text-neutral-900 mb-4">
            {editingId ? "Edit Address" : "New Address"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Label</label>
              <select value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="input-field">
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-700 mb-1">Full Name *</label>
                <input required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">Phone *</label>
                <PhoneInput value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Address Line 1 *</label>
              <input required value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Address Line 2</label>
              <input value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} className="input-field" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-neutral-700 mb-1">City *</label>
                <input required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">State *</label>
                <input required value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">Pincode *</label>
                <input required value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} className="input-field" />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4" />
              <span className="text-sm text-neutral-700">Set as default address</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary text-sm !px-6 !py-2">
                {editingId ? "Update" : "Save"}
              </button>
              <button type="button" onClick={resetForm} className="btn-ghost text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
