import { useEffect } from 'react';

import { setDocumentMeta } from '@/lib/seo';

import { useAuthStore } from '@/stores/auth-store';

import { AddressBook } from '../components/AddressBook';

export default function AddressBookPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Addresses — নবME' });
  }, []);

  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  if (!userId) {
    return <div>Please log in to view your addresses.</div>;
  }

  return <AddressBook userId={userId} />;
}
