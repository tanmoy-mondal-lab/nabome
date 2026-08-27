/**
 * Refund Monitoring - Admin Dashboard
 *
 * Monitors refund processing across all shops.
 * Mobile-first design with accessible refund tracking.
 *
 * NOTE: This component currently shows placeholder data.
 * Backend aggregation endpoints for refund statistics need to be implemented
 * to provide real operational data. Individual refund data is available
 * via the backend service layer (getRefunds).
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
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Info,
} from 'lucide-react';

export function RefundMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Refund Monitoring</h2>
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
                Refund Statistics Not Yet Available
              </p>
              <p className="text-xs text-blue-700 mt-1">
                This monitoring view requires backend aggregation endpoints to
                compute refund statistics. Individual refund records can be
                viewed in the Finance section. The backend service layer
                provides getRefunds() for detailed refund data.
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
                <p className="text-sm text-muted-foreground">Total Refunds</p>
                <p className="text-2xl font-bold">—</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">—</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">—</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">—</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <Badge variant="outline" className="mt-2">
              No data
            </Badge>
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
                Total Refunded
              </p>
              <p className="text-xl font-bold">—</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Avg. Refund Time
              </p>
              <p className="text-xl font-bold">—</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
              <p className="text-xl font-bold">—</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-xl font-bold">—</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Recent Refunds */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>Recent Refunds</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use Finance section to view individual refund records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
