/**
 * Returns Analytics - Shop Owner Dashboard
 *
 * Displays return statistics and analytics for shop owners.
 * Mobile-first design with accessible data visualization.
 */

'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface ReturnsAnalyticsProps {
  shopId: string;
}

// Mock data - in production, this would come from API
const mockAnalytics = {
  totalReturns: 156,
  pendingReturns: 12,
  approvedReturns: 89,
  rejectedReturns: 55,
  totalRefundAmount: 245000,
  averageRefundAmount: 1570,
  averageProcessingTime: 4.5, // days
  returnRate: 3.2, // percentage
  topReturnReasons: [
    { reason: 'damaged', count: 45, percentage: 28.8 },
    { reason: 'wrong_item', count: 38, percentage: 24.4 },
    { reason: 'not_as_described', count: 32, percentage: 20.5 },
    { reason: 'no_longer_needed', count: 25, percentage: 16.0 },
    { reason: 'other', count: 16, percentage: 10.3 },
  ],
  monthlyReturns: [
    { month: 'Aug', count: 18 },
    { month: 'Sep', count: 24 },
    { month: 'Oct', count: 22 },
    { month: 'Nov', count: 35 },
    { month: 'Dec', count: 42 },
    { month: 'Jan', count: 15 },
  ],
};

export function ReturnsAnalytics({ shopId }: ReturnsAnalyticsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Returns Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold">
                  {mockAnalytics.totalReturns}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {mockAnalytics.pendingReturns}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <Badge variant="secondary" className="mt-2">
              Needs attention
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold">
                  ₹{(mockAnalytics.totalRefundAmount / 1000).toFixed(0)}k
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 text-xs">
              <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">-5%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Return Rate</p>
                <p className="text-2xl font-bold">
                  {mockAnalytics.returnRate}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Industry avg: 4.5%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Return Reasons */}
      <Card>
        <CardHeader>
          <CardTitle>Top Return Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.topReturnReasons.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">
                    {item.reason.replace('_', ' ')}
                  </span>
                  <span className="text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Returns Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {mockAnalytics.monthlyReturns.map((item, index) => {
              const maxCount = Math.max(
                ...mockAnalytics.monthlyReturns.map((m) => m.count),
              );
              const height = (item.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.month}
                  </p>
                  <p className="text-xs font-medium">{item.count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Processing Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Avg. Processing Time
              </p>
              <p className="text-xl font-bold">
                {mockAnalytics.averageProcessingTime} days
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Avg. Refund Amount
              </p>
              <p className="text-xl font-bold">
                ₹{mockAnalytics.averageRefundAmount}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Approval Rate
              </p>
              <p className="text-xl font-bold">
                {(
                  (mockAnalytics.approvedReturns / mockAnalytics.totalReturns) *
                  100
                ).toFixed(0)}
                %
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Rejection Rate
              </p>
              <p className="text-xl font-bold">
                {(
                  (mockAnalytics.rejectedReturns / mockAnalytics.totalReturns) *
                  100
                ).toFixed(0)}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
