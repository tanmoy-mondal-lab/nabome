/**
 * Reviews Integration Component (Preparation)
 *
 * Preparation component for Reviews Engine integration.
 * Displays placeholder for product reviews, seller reviews, review history, and pending reviews.
 *
 * This component prepares the integration points for the Reviews Engine.
 * The actual Reviews Engine implementation is not included in this scope.
 *
 * Source: REVIEWS_ARCHITECTURE.md (future binding)
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 */

import { Star, MessageSquare, Clock, Lock, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@nabome/ui';

interface ReviewsIntegrationProps {
  userId: string;
}

export function ReviewsIntegration({ userId }: ReviewsIntegrationProps) {
  const [activeTab, setActiveTab] = useState<
    'product' | 'seller' | 'history' | 'pending'
  >('product');

  // TODO: Integrate with @nabome/reviews package when available
  // const { productReviews, sellerReviews, reviewHistory, pendingReviews } = useReviews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <Lock className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700">Coming Soon</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('product')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'product'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Product Reviews
        </button>
        <button
          onClick={() => setActiveTab('seller')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'seller'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Seller Reviews
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Review History
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Reviews
        </button>
      </div>

      {/* Product Reviews Tab */}
      {activeTab === 'product' && (
        <div className="space-y-4">
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No product reviews yet</p>
            <p className="text-sm text-gray-500">
              Review products you've purchased to help others
            </p>
          </div>
        </div>
      )}

      {/* Seller Reviews Tab */}
      {activeTab === 'seller' && (
        <div className="space-y-4">
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No seller reviews yet</p>
            <p className="text-sm text-gray-500">
              Rate sellers based on your shopping experience
            </p>
          </div>
        </div>
      )}

      {/* Review History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No review history</p>
            <p className="text-sm text-gray-500">
              Your past reviews will appear here
            </p>
          </div>
        </div>
      )}

      {/* Pending Reviews Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <ThumbsUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No pending reviews</p>
            <p className="text-sm text-gray-500">
              Items eligible for review will appear here
            </p>
          </div>
        </div>
      )}

      {/* Integration Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Integration Note:</strong> This component prepares the
          integration points for the Reviews Engine. The actual Reviews Engine
          implementation will provide product reviews, seller reviews, review
          history, and pending reviews.
        </p>
      </div>
    </div>
  );
}
