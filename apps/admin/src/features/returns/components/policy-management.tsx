/**
 * Policy Management - Admin Dashboard
 *
 * Allows admins to manage return policies across all shops.
 * Mobile-first design with accessible policy configuration.
 *
 * NOTE: This component currently shows placeholder data.
 * Backend endpoints for return policy management need to be implemented
 * to provide real policy data. Shop-level return policies are not yet
 * part of the current V1 feature set.
 */

'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Settings, Info } from 'lucide-react';

export function PolicyManagement() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Return Policies</h2>
        <Badge variant="outline" className="text-xs">
          <Info className="w-3 h-3 mr-1" />
          Not Implemented - V1 Feature
        </Badge>
      </div>

      {/* Placeholder Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Return Policy Management Not Yet Available
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Shop-level return policy management is not part of the current
                V1 feature set. Returns are processed using platform-wide
                policies. This feature may be implemented in a future version to
                allow shops to configure custom return windows, restocking fees,
                and approval requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Content */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>Platform Return Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Return Window</p>
                <p className="font-medium">—</p>
              </div>
              <div>
                <p className="text-muted-foreground">Requires Approval</p>
                <p className="font-medium">—</p>
              </div>
              <div>
                <p className="text-muted-foreground">Customer Pays Shipping</p>
                <p className="font-medium">—</p>
              </div>
              <div>
                <p className="text-muted-foreground">Restocking Fee</p>
                <p className="font-medium">—</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform-wide return policy configuration is managed in Settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
