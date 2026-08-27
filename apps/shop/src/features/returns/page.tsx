/**
 * Shop Owner Returns Dashboard
 *
 * Main dashboard for shop owners to manage returns, inspections, and refunds.
 * Mobile-first design with accessible navigation.
 */

'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { ReturnsQueue } from './components/returns-queue';
import { InspectionQueue } from './components/inspection-queue';
import { RefundApprovalQueue } from './components/refund-approval-queue';
import { ReturnsAnalytics } from './components/returns-analytics';
import { Package, ClipboardCheck, CreditCard, BarChart3 } from 'lucide-react';

export default function ShopReturnsPage() {
  const shopId = 'shop-123'; // In production, this would come from auth context

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Returns Management</h1>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="queue" className="flex-1">
            <Package className="w-4 h-4 mr-2" />
            Returns Queue
          </TabsTrigger>
          <TabsTrigger value="inspection" className="flex-1">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Inspections
          </TabsTrigger>
          <TabsTrigger value="refunds" className="flex-1">
            <CreditCard className="w-4 h-4 mr-2" />
            Refunds
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <ReturnsQueue shopId={shopId} />
        </TabsContent>

        <TabsContent value="inspection">
          <InspectionQueue shopId={shopId} />
        </TabsContent>

        <TabsContent value="refunds">
          <RefundApprovalQueue shopId={shopId} />
        </TabsContent>

        <TabsContent value="analytics">
          <ReturnsAnalytics shopId={shopId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
