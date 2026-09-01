/**
 * Returns Page - Mobile-First Customer UI
 *
 * Main page for customers to view and manage their returns.
 * Mobile-first design with accessible navigation.
 */

'use client';

import { PlusCircle, History } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';

import { ReturnRequestWizard } from './components/return-request-wizard';
import { ReturnStatusCard } from './components/return-status-card';
import { ReturnTimeline } from './components/return-timeline';

// TODO: Implement API integration to fetch returns and order items from backend
// Returns should be fetched from /api/v1/orders/:id/returns
// Order items should be fetched from /api/v1/orders/:id
const mockReturns: any[] = [];
const mockOrderItems: any[] = [];

export default function ReturnsPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  if (showWizard) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ReturnRequestWizard
          orderId="order-123"
          orderItems={mockOrderItems}
          onSuccess={() => setShowWizard(false)}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  if (selectedReturn) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Button variant="ghost" onClick={() => setSelectedReturn(null)}>
          ← Back to Returns
        </Button>
        <ReturnTimeline returnRequest={selectedReturn} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Returns</h1>
        <Button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Return
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">
            Active Returns
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {mockReturns
              .filter(
                (r) =>
                  r.status !== 'refund_completed' &&
                  r.status !== 'return_closed',
              )
              .map((returnRequest) => (
                <ReturnStatusCard
                  key={returnRequest.id}
                  returnRequest={returnRequest}
                  onViewDetails={() => setSelectedReturn(returnRequest)}
                />
              ))}
            {mockReturns.filter(
              (r) =>
                r.status !== 'refund_completed' && r.status !== 'return_closed',
            ).length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No active returns</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {mockReturns
              .filter(
                (r) =>
                  r.status === 'refund_completed' ||
                  r.status === 'return_closed',
              )
              .map((returnRequest) => (
                <ReturnStatusCard
                  key={returnRequest.id}
                  returnRequest={returnRequest}
                  onViewDetails={() => setSelectedReturn(returnRequest)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
