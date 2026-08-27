import { useEffect } from 'react';

import { setDocumentMeta } from '@/lib/seo';

import { ProductGrid } from '../components/ProductGrid';
import {
  useFeaturedProducts,
  useNewArrivals,
  useTrendingProducts,
} from '../hooks/use-products';

export default function HomePage() {
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts(8);
  const { data: newProducts, isLoading: newLoading } = useNewArrivals(8);
  const { data: trending, isLoading: trendingLoading } = useTrendingProducts(8);

  useEffect(() => {
    setDocumentMeta({ title: 'নবME — Handcrafted jewelry & décor' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight animate-fade-in-up">
            Welcome to নবME
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 md:mb-12 font-light animate-fade-in-up animation-delay-200">
            Handcrafted jewelry & décor
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            <a
              href="/shop"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Shop Now
            </a>
            <a
              href="/about"
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium handcrafted items
          </p>
        </div>
        <ProductGrid
          products={featured?.products || []}
          isLoading={featuredLoading}
        />
      </section>

      {/* New Arrivals */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              New Arrivals
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fresh additions to our collection
            </p>
          </div>
          <ProductGrid
            products={newProducts?.products || []}
            isLoading={newLoading}
          />
        </div>
      </section>

      {/* Trending Products */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trending Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            What's popular right now
          </p>
        </div>
        <ProductGrid
          products={trending?.products || []}
          isLoading={trendingLoading}
        />
      </section>

      {/* Trust Badges */}
      <section className="bg-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Handcrafted</h3>
              <p className="text-gray-600 text-sm">
                Every piece made with care by skilled artisans
              </p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-gray-600 text-sm">
                On orders over ₹999 across India
              </p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Quality Assured
              </h3>
              <p className="text-gray-600 text-sm">
                Premium materials and craftsmanship guaranteed
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
