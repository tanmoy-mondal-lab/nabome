import { useEffect } from 'react';

import { setDocumentMeta } from '@/lib/seo';

import { Checkout } from '../components/Checkout';

export default function CheckoutPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Checkout — নবME' });
  }, []);

  return <Checkout />;
}
