import { useEffect } from 'react';

import { setDocumentMeta } from '@/lib/seo';

import { useAuthStore } from '@/stores/auth-store';

import { CustomerDashboard } from '../components/CustomerDashboard';

export default function AccountDashboardPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'My account — নবME' });
  }, []);

  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  if (!userId) {
    return <div>Please log in to view your account.</div>;
  }

  return <CustomerDashboard userId={userId} />;
}
