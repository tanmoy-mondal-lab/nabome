/**
 * Dispute Resolution - Admin Dashboard
 *
 * Allows admins to resolve escalated disputes.
 * Mobile-first design with accessible dispute management.
 *
 * NOTE: This component currently shows placeholder data.
 * Backend endpoints for dispute resolution need to be implemented
 * to provide real dispute data. The backend service layer provides
 * getDisputes() for disputed return requests.
 */

'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function DisputeResolution() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Escalated Disputes</h2>
        <Badge variant="outline" className="text-xs">
          <Info className="w-3 h-3 mr-1" />
          Placeholder - Use Returns Queue
        </Badge>
      </div>

      {/* Placeholder Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Dispute Resolution Not Yet Available
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Disputed return requests can be viewed in the Returns Queue tab.
                The backend service layer provides getDisputes() for detailed
                dispute data. Full dispute resolution workflow with messaging
                and resolution options requires additional backend
                implementation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Content */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>No Disputes</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Use the Returns Queue tab to view and manage disputed return
            requests.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
