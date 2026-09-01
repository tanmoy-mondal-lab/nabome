import { useEffect, useState } from 'react';
import { useShopContext } from '../../../../lib/shop-context.tsx';
export default function TaxShippingPage() {
  const { activeShop } = useShopContext();
  const shopId = activeShop?.id;
  const [taxZones, setTaxZones] = useState<any[]>([]);
  const [shipZones, setShipZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchZones = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const [tz, sz] = await Promise.all([
        fetch(`/api/v1/shops/${shopId}/tax-zones`, {
          credentials: 'include',
        }).then((r) => r.json()),
        fetch(`/api/v1/shops/${shopId}/shipping-zones`, {
          credentials: 'include',
        }).then((r) => r.json()),
      ]);
      setTaxZones(tz.zones ?? tz.data?.zones ?? []);
      setShipZones(sz.zones ?? sz.data?.zones ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchZones();
  }, [shopId]);
  const createTaxZone = async () => {
    const name = prompt('Tax zone name');
    if (!name || !shopId) return;
    const country = prompt('Country 2-letter', 'IN') || 'IN';
    const state = prompt('State code (optional)') || null;
    const res = await fetch(`/api/v1/shops/${shopId}/tax-zones`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, countryCode: country, stateCode: state }),
    });
    const j = await res.json();
    if (!j.success && !j.zone) setError(j.error?.message);
    else fetchZones();
  };
  const createShipZone = async () => {
    const name = prompt('Shipping zone name');
    if (!name || !shopId) return;
    const country = prompt('Country', 'IN') || 'IN';
    const state = prompt('State (optional)') || null;
    const res = await fetch(`/api/v1/shops/${shopId}/shipping-zones`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, countryCode: country, stateCode: state }),
    });
    const j = await res.json();
    if (!j.success && !j.zone) setError(j.error?.message);
    else fetchZones();
  };
  if (!shopId) return <div className="p-6">Select a shop</div>;
  if (loading) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">
        Tax & Shipping Zones — {activeShop?.name}
      </h1>
      {error && <div className="text-red-600">{error}</div>}
      <section>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tax Zones</h2>
          <button
            onClick={createTaxZone}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </div>
        <ul className="border rounded divide-y mt-2">
          {taxZones.length === 0 ? (
            <li className="p-3 text-gray-500">
              No tax zones — uses AppSetting fallback 18%
            </li>
          ) : (
            taxZones.map((z: any) => (
              <li key={z.id} className="p-3 flex justify-between">
                <span>
                  {z.name} ({z.countryCode}
                  {z.stateCode ? '-' + z.stateCode : ''}) priority {z.priority}{' '}
                  {z.isActive ? '' : 'inactive'}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
      <section>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Shipping Zones</h2>
          <button
            onClick={createShipZone}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </div>
        <ul className="border rounded divide-y mt-2">
          {shipZones.length === 0 ? (
            <li className="p-3 text-gray-500">
              No shipping zones — uses AppSetting fallback
            </li>
          ) : (
            shipZones.map((z: any) => (
              <li key={z.id} className="p-3 flex justify-between">
                <span>
                  {z.name} ({z.countryCode}
                  {z.stateCode ? '-' + z.stateCode : ''})
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
