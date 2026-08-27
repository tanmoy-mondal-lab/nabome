import { useEffect } from 'react';
import { useParams } from 'react-router';

import { setDocumentMeta } from '@/lib/seo';

import { ProductGrid } from '../components/ProductGrid';
import { useProducts } from '../hooks/use-products';

export default function ShopPage() {
  const { category } = useParams<{ category?: string }>();
  const { data: productsData, isLoading } = useProducts(
    { category: category },
    true,
  );

  useEffect(() => {
    setDocumentMeta({
      title: category ? `${category} — নবME` : 'Shop — নবME',
    });
  }, [category]);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {category || 'All Products'}
      </h1>
      <ProductGrid
        products={productsData?.products || []}
        isLoading={isLoading}
      />
    </div>
  );
}
