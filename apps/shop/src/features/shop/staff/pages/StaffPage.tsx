import { useEffect, useState } from 'react';
export default function StaffPage({ shopId }: { shopId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'staff' | 'manager'>('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/shops/${shopId}/staff`, {
        credentials: 'include',
      });
      const j = await r.json();
      if (j.success) setMembers(j.data?.members ?? j.members ?? []);
      else setError(j.error?.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (shopId) fetchStaff();
  }, [shopId]);
  const invite = async () => {
    setError(null);
    const r = await fetch(`/api/v1/shops/${shopId}/staff/invitations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, role }),
    });
    const j = await r.json();
    if (!j.success) setError(j.error?.message);
    else {
      setEmail('');
      fetchStaff();
    }
  };
  if (loading) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Staff</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="border px-3 py-2 rounded flex-1"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="border px-3 py-2 rounded"
        >
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
        </select>
        <button
          onClick={invite}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Invite
        </button>
      </div>
      <ul className="divide-y border rounded">
        {members.length === 0 ? (
          <li className="p-4 text-gray-500">No staff</li>
        ) : (
          members.map((m: any) => (
            <li key={m.id} className="p-4 flex justify-between">
              <span>
                {m.user?.email ?? m.userId} — {m.role} ({m.status})
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
