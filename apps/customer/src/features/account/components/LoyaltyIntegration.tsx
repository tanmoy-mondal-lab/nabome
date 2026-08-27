/**
 * Loyalty Integration Component (Preparation)
 *
 * Preparation component for Loyalty Engine integration.
 * Displays placeholder for points, rewards, membership tiers, coupons, and benefits.
 *
 * This component prepares the integration points for the Loyalty Engine.
 * The actual Loyalty Engine implementation is not included in this scope.
 *
 * Source: LOYALTY_ENGINE_ARCHITECTURE.md (future binding)
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 */

import { Star, Gift, Award, Ticket, TrendingUp, Lock } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@nabome/ui';

interface LoyaltyIntegrationProps {
  userId: string;
}

export function LoyaltyIntegration({ userId }: LoyaltyIntegrationProps) {
  const [activeTab, setActiveTab] = useState<
    'points' | 'rewards' | 'coupons' | 'benefits'
  >('points');

  // TODO: Integrate with @nabome/loyalty package when available
  // const { loyaltyPoints, rewards, coupons, benefits } = useLoyalty();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Loyalty Program</h2>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <Lock className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700">Coming Soon</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('points')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'points'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Points
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'rewards'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Rewards
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'coupons'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Coupons
        </button>
        <button
          onClick={() => setActiveTab('benefits')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'benefits'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Benefits
        </button>
      </div>

      {/* Points Tab */}
      {activeTab === 'points' && (
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Points</p>
                <p className="text-4xl font-bold">0</p>
                <p className="text-sm opacity-90 mt-1">
                  Points expire in 12 months
                </p>
              </div>
              <Star className="w-16 h-16 opacity-50" />
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Points History</h3>
            <p className="text-sm text-gray-500">
              No points history available yet.
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Membership Tier</h3>
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">Bronze</p>
                <p className="text-sm text-gray-500">
                  Spend ₹5,000 to reach Silver
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: '20%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">2,000 / 5,000 points</p>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Rewards coming soon</p>
            <p className="text-sm text-gray-500">
              Earn points to unlock exclusive rewards
            </p>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <Ticket className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No coupons available</p>
            <p className="text-sm text-gray-500">
              Check back later for exclusive offers
            </p>
          </div>
        </div>
      )}

      {/* Benefits Tab */}
      {activeTab === 'benefits' && (
        <div className="space-y-4">
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Benefits coming soon</p>
            <p className="text-sm text-gray-500">
              Unlock premium benefits as you earn points
            </p>
          </div>
        </div>
      )}

      {/* Integration Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Integration Note:</strong> This component prepares the
          integration points for the Loyalty Engine. The actual Loyalty Engine
          implementation will provide points, rewards, membership tiers,
          coupons, and benefits.
        </p>
      </div>
    </div>
  );
}
