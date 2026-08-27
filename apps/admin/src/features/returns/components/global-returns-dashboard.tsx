/**
 * Global Returns Dashboard - Admin Dashboard
 *
 * Displays global returns statistics and management for admins.
 * Mobile-first design with accessible data visualization.
 *
 * NOTE: This dashboard currently shows placeholder data.
 * Backend aggregation endpoints for returns statistics need to be implemented
 * to provide real operational data. The individual returns queue is available
 * via the backend service layer (getReturnsQueue, getDisputes, getFraudReview).
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
  Package,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

export function GlobalReturnsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Global Returns Overview</h2>
        <Badge variant="outline" className="text-xs">
          <Info className="w-3 h-3 mr-1" />
          Placeholder - Awaiting Backend Aggregation
        </Badge>
      </div>

      {/* Placeholder Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Dashboard Statistics Not Yet Available
              </p>
              <p className="text-xs text-blue-700 mt-1">
                This dashboard requires backend aggregation endpoints to compute
                global returns statistics. Individual return requests can be
                viewed in the Returns Queue. The backend service layer provides
                getReturnsQueue(), getDisputes(), and getFraudReview() for
                detailed return data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="opacity-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold">—</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting data</p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">—</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <Badge variant="outline" className="mt-2">
              No data
            </Badge>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold">—</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting data</p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Return Rate</p>
                <p className="text-2xl font-bold">—</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting data</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="opacity-50 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Escalated Disputes
                </p>
                <p className="text-2xl font-bold text-yellow-900">—</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              Use Disputes tab for details
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Fraud Alerts</p>
                <p className="text-2xl font-bold text-red-900">—</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-xs text-red-700 mt-2">
              Use Fraud Review tab for details
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Processing Metrics */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>Processing Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Avg. Processing Time
              </p>
              <p className="text-xl font-bold">—</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">In Progress</p>
              <p className="text-xl font-bold">—</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-xl font-bold">—</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Completion Rate
              </p>
              <p className="text-xl font-bold">—</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
